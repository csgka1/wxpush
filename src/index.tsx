import { Env } from './types';

import { Hono } from 'hono';
import { auth_token } from './middlewares';
import { renderer } from './renderer';
import Skin from './skin';
import TestPage from './test';
import { RegisterApi } from './api';
import z from 'zod';
import { zValidator } from '@hono/zod-validator';

const app = new Hono<Env>()

RegisterApi(app)


const SkinSchema = z.object({
    title: z.string().default('消息推送'),
    message: z.string().default('无告警信息'),
    date: z.date().optional(),
});


/**
 * 消息展示页
 * 
 * params:
 *  - title: string
 *  - message: string
 *  - date: string
 */
app.get('/skin', renderer, zValidator('query', SkinSchema), async (c) => {
    c.set('pageTitle', '消息推送');
    const params = c.req.valid('query');
    return c.render(
        <Skin
            title={params.title || '消息推送'}
            message={params.message || '无告警信息'}
            date={params.date}
        />
    );
});

app.get('/test', auth_token, renderer, async (c) => {
  c.set('pageTitle', 'WXPush 测试页面');
  return c.render(<TestPage token={ c.env.API_TOKEN } />);
});

export default app;

