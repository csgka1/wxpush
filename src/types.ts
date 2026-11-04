import type { Env as LibEnv } from "hono";

export type EnvVar = {
    API_TOKEN: string;
    WX_APPID: string;
    WX_SECRET: string;
    WX_USERID: string;
    WX_TEMPLATE_ID: string;
    WX_BASE_URL: string;
    ALIVE_DAYS: string;
};

export type MetaData = {
    pageTitle?: string;
};

export interface Env extends LibEnv {
    Bindings: EnvVar;
    Variables: MetaData;
}