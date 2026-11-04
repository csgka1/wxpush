import { marked } from "marked"
import { Script } from 'vite-ssr-components/hono'
import { getBeijingTime } from "./util"

type SkinProps = {
    title: string
    message: string
    date?: Date
}

export default function Skin({ title, message, date }: SkinProps) {
    const parsedMarkdown = marked.parse(message, { async: false });
    return (
        <div>
            <div id="particles-root"></div>

            <div class="container pulse">
                <div class="title">{title}</div>

                <div class="info-card">
                    <div class="info-label">通知内容</div>
                    <div class="info-content" id="message" dangerouslySetInnerHTML={{ __html: parsedMarkdown }} />
                </div>

                <div class="info-card">
                    <div class="info-label">时间</div>
                    <div class="info-content">{getBeijingTime(date)}</div>
                </div>
            </div>
            <Script src="/src/client/skin.client.tsx" />
        </div>
    )
}