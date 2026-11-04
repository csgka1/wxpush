import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import type { Env } from "../types";
import { getBeijingTime } from "../util";

const wxSendSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    appid: z.string().optional(),
    secret: z.string().optional(),
    userid: z.string().optional(),
    template_id: z.string().optional(),
    base_url: z.string().optional()
});

type WeChatApiResponse = {
    errcode?: number;
    errmsg?: string;
    access_token?: string;
};

type WxUrlParam = {
    message: string,
    date: string,
    title: string,
};

async function getStableToken(appid: string, secret: string): Promise<string> {
    const response = await fetch("https://api.weixin.qq.com/cgi-bin/stable_token", {
        method: "POST",
        headers: { "Content-Type": "application/json;charset=utf-8" },
        body: JSON.stringify({
            grant_type: "client_credential",
            appid,
            secret,
            force_refresh: false
        })
    });

    const data = (await response.json()) as WeChatApiResponse;
    if (!response.ok || !data.access_token) {
        throw new Error(
            `Failed to get WeChat access token: ${data.errmsg ?? response.statusText}`
        );
    }

    return data.access_token;
}


async function sendWxMessage(
    accessToken: string,
    userid: string,
    templateId: string,
    baseUrl: string,
    title: string,
    content: string
): Promise<WeChatApiResponse> {
    let messageUrl = (() => {
        try {
            return new URL('/skin', baseUrl);
        } catch (err) {
            return;
        }
    })();
    if (!messageUrl) {
        throw new Error('cannot assemble Url');
    }
    const params = {
        message: content,
        date: getBeijingTime(),
        title: title
    } satisfies WxUrlParam;

    for (const [key, value] of Object.entries(params)) {
        messageUrl.searchParams.set(key, value)
    }   
    

    const response = await fetch(
        `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${encodeURIComponent(accessToken)}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json;charset=utf-8" },
            body: JSON.stringify({
                touser: userid,
                template_id: templateId,
                url: messageUrl,
                data: {
                    title: { value: title },
                    content: { value: content }
                }
            })
        }
    );

    if (!response.ok) {
        throw new Error(`WeChat message request failed: ${response.statusText}`);
    }

    return (await response.json()) as WeChatApiResponse;
}

export const wxsend = new Hono<Env>()
    .post(
        "/",
        zValidator("json", wxSendSchema),
        async (c) => {
            const params = c.req.valid("json");
            const { title, content } = params;
            const appid = params.appid || c.env.WX_APPID;
            const secret = params.secret || c.env.WX_SECRET;
            const userIds = (params.userid || c.env.WX_USERID)
                .split("|")
                .map((userid) => userid.trim())
                .filter(Boolean);
            const templateId = params.template_id || c.env.WX_TEMPLATE_ID;
            const baseUrl = params.base_url || c.env.WX_BASE_URL || "";

            if (!appid || !secret || !userIds.length || !templateId) {
                return c.json(
                    {
                        msg: "Missing required configuration: WX_APPID, WX_SECRET, WX_USERID, WX_TEMPLATE_ID"
                    },
                    500
                );
            }

            try {
                const accessToken = await getStableToken(appid, secret);
                const results = await Promise.all(
                    userIds.map((userid) =>
                        sendWxMessage(accessToken, userid, templateId, baseUrl, title, content)
                    )
                );
                const successfulCount = results.filter(
                    (result) => result.errcode === 0 || result.errmsg === "ok"
                ).length;

                if (successfulCount > 0) {
                    return c.json({
                        msg: `Successfully sent messages to ${successfulCount} user(s).`
                    });
                }

                const firstError = results[0]?.errmsg ?? "Unknown error";
                return c.json(
                    { msg: `Failed to send messages. First error: ${firstError}` },
                    502
                );
            } catch (error) {
                console.error("[wxsend] Failed to send WeChat message:", error);
                const message = error instanceof Error ? error.message : "Unknown error";
                return c.json({ msg: `Failed to send WeChat message: ${message}` }, 502);
            }
        }
    );