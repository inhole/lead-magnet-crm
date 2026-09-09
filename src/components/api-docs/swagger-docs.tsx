"use client"

import { useEffect, useState } from "react"

declare global {
  interface Window {
    SwaggerUIBundle?: (options: Record<string, unknown>) => unknown
  }
}

const stylesheetId = "swagger-ui-stylesheet"
const scriptId = "swagger-ui-bundle"

export function SwaggerDocs() {
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!document.getElementById(stylesheetId)) {
      const stylesheet = document.createElement("link")
      stylesheet.id = stylesheetId
      stylesheet.rel = "stylesheet"
      stylesheet.href = "/api/swagger-assets/swagger-ui.css"
      document.head.appendChild(stylesheet)
    }

    const initialize = () => {
      if (!window.SwaggerUIBundle) return setError(true)
      window.SwaggerUIBundle({ url: "/api/openapi", dom_id: "#swagger-ui", deepLinking: true, docExpansion: "list", persistAuthorization: false })
    }
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null
    if (window.SwaggerUIBundle) initialize()
    else if (existing) existing.addEventListener("load", initialize, { once: true })
    else {
      const script = document.createElement("script")
      script.id = scriptId
      script.src = "/api/swagger-assets/swagger-ui-bundle.js"
      script.addEventListener("load", initialize, { once: true })
      script.addEventListener("error", () => setError(true), { once: true })
      document.body.appendChild(script)
    }
  }, [])

  return (
    <div>
      {error ? <p role="alert" className="p-8 text-sm text-destructive">API 문서 화면을 불러오지 못했습니다. OpenAPI 원본을 확인하세요.</p> : null}
      <div id="swagger-ui"><p className="p-8 text-sm text-muted-foreground">API 문서를 불러오는 중입니다.</p></div>
    </div>
  )
}
