/** @jsxImportSource hono/jsx/dom */
import { render, useRef, useState } from 'hono/jsx/dom'

type TestFormValues = {
    title: string
    content: string
    userid: string
    appid: string
    secret: string
    template_id: string
    base_url: string
}

type TestFormProps = {
    token: string
}

const initialValues: TestFormValues = {
    title: '测试标题',
    content: '这是测试内容',
    userid: '',
    appid: '',
    secret: '',
    template_id: '',
    base_url: ''
}

const emptyValues: TestFormValues = {
    title: '',
    content: '',
    userid: '',
    appid: '',
    secret: '',
    template_id: '',
    base_url: ''
}

function TestForm({ token }: TestFormProps) {
    const [values, setValues] = useState(initialValues)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [responseText, setResponseText] = useState<string | null>(null)
    const submissionLock = useRef(false)

    const updateField = (name: keyof TestFormValues) => (event: Event) => {
        const field = event.currentTarget
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
            setValues((currentValues) => ({
                ...currentValues,
                [name]: field.value
            }))
        }
    }

    const clearForm = () => {
        setValues(emptyValues)
        setResponseText(null)
    }

    const handleSubmit = async (event: Event) => {
        event.preventDefault()
        if (submissionLock.current) return

        submissionLock.current = true
        setIsSubmitting(true)
        setResponseText(null)

        const payload = Object.fromEntries(
            Object.entries(values).filter(([, value]) => value.length > 0)
        )
        const headers = new Headers({
            'Content-Type': 'application/json'
        })
        if (token) {
            headers.set('Authorization', `Bearer ${token}`)
        }

        try {
            const response = await fetch('/api/wxsend', {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            })
            const body = await response.text()
            setResponseText(`Status: ${response.status}\n\n${body}`)
        } catch (error) {
            setResponseText(
                `Fetch error: ${error instanceof Error ? error.message : String(error)}`
            )
        } finally {
            submissionLock.current = false
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <form id="testForm" method="post" action="/api/wxsend" onSubmit={handleSubmit}>
                <label for="title">标题 (title)</label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    value={values.title}
                    onInput={updateField('title')}
                />

                <label for="content">内容 (content)</label>
                <textarea
                    id="content"
                    name="content"
                    rows={4}
                    value={values.content}
                    onInput={updateField('content')}
                />

                <label for="userid">用户 ID (userid，可选，多用户用 | 分隔)</label>
                <input
                    id="userid"
                    name="userid"
                    type="text"
                    placeholder="例如: OPENID1|OPENID2"
                    value={values.userid}
                    onInput={updateField('userid')}
                />

                <label for="appid">WX_APPID (可选，留空使用环境变量)</label>
                <input
                    id="appid"
                    name="appid"
                    type="text"
                    value={values.appid}
                    onInput={updateField('appid')}
                />

                <label for="secret">WX_SECRET (可选，留空使用环境变量)</label>
                <input
                    id="secret"
                    name="secret"
                    type="text"
                    value={values.secret}
                    onInput={updateField('secret')}
                />

                <label for="template_id">模板 ID (template_id，可选)</label>
                <input
                    id="template_id"
                    name="template_id"
                    type="text"
                    value={values.template_id}
                    onInput={updateField('template_id')}
                />

                <label for="base_url">跳转链接 base_url (可选)</label>
                <input
                    id="base_url"
                    name="base_url"
                    type="text"
                    value={values.base_url}
                    onInput={updateField('base_url')}
                />

                <div class="test-page__actions">
                    <button id="sendBtn" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? '发送中...' : '发送测试请求'}
                    </button>
                    <button id="clearBtn" type="button" onClick={clearForm}>
                        清空
                    </button>
                </div>
            </form>

            {responseText !== null && (
                <section class="test-page__response">
                    <label for="responseArea">响应</label>
                    <pre id="responseArea">{responseText}</pre>
                </section>
            )}
        </>
    )
}

const root = document.getElementById('testFormRoot')
if (!(root instanceof HTMLElement)) {
    throw new Error('Test form root element was not found')
}

render(<TestForm token={root.dataset.token ?? ''} />, root)
