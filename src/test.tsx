import { Script } from 'vite-ssr-components/hono'

type TestPageProps = {
    token: string
}

export default function TestPage({ token }: TestPageProps) {
    return (
        <main class="test-page">
            <h1>WXPush 测试页面</h1>
            <p class="test-page__hint">
                当前 token：<strong>{token}</strong>
            </p>

            <div id="testFormRoot" data-token={token}></div>
            <noscript>请启用 JavaScript 以使用测试表单。</noscript>
            <Script src="/src/client/test-form.client.tsx" />
        </main>
    )
}
