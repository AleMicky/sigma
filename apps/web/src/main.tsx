import { StrictMode } from "react"
import ReactDOM from "react-dom/client"

import { AppProviders } from "@/app/providers"
import { RouterApp } from "@/app/router"

import "./index.css"

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("No se encontró el elemento #root")
}

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <RouterApp />
    </AppProviders>
  </StrictMode>,
)
