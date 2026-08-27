import { createFileRoute } from "@tanstack/react-router"

import { MenusPage } from "@/modules/seguridad/menu/pages/MenusPage"

export const Route = createFileRoute("/_dashboard/seguridad/menus/")({
  component: MenusPage,
})
