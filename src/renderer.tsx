import { jsxRenderer } from 'hono/jsx-renderer'
import { Link, ViteClient } from 'vite-ssr-components/hono'
import { Env } from './types';

export const renderer = jsxRenderer<Env>(({ children }, c) => {
  const pageTitle = c.get('pageTitle') || 'Default Title';
  return (
    <html>
      <head>
        <title>{pageTitle}</title>
        <ViteClient />
        <Link href="/src/style.css" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
    
  )
})
