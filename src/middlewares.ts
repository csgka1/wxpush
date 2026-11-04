import { MiddlewareHandler } from "hono";

import { timingSafeEqual } from 'hono/utils/buffer';

import type { Env } from "./types";
import { HTTPException } from "hono/http-exception";
import { bearerAuth } from "hono/bearer-auth";


export const auth_token: MiddlewareHandler<Env> = async(c, next) => {
    const authQuery = c.req.query('token');
    // Validate query if query is sent, otherwise validate Header instead
    if (!authQuery) {
        return bearerAuth<Env>( { verifyToken: async (token, c) => timingSafeEqual(token, c.env.API_TOKEN) })(c, next);
    } else {
        if (! await timingSafeEqual(authQuery, c.env.API_TOKEN)) {
            throw new HTTPException(403);
        }
    }
    await next();
};
