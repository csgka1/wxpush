import type { Hono, Env as LibEnv } from "hono";

import { auth_token } from "../middlewares";
import { wxsend } from "./wxsend";

export const RegisterApi = <Env extends LibEnv>(app: Hono<Env>) => {
    app.use('/api/*', auth_token, );

    app.route('/api/send', wxsend);

    // 兼容以前的版本
    app.route('/api/wxsend', wxsend);

}