import {
  BookOpen,
  Boxes,
  FileText,
  FolderTree,
  LayoutDashboard,
  List,
  Settings2,
  SlidersHorizontal,
  Tags,
  Type,
} from "lucide-react"

import type { NavItem } from "@/shared/types/nav.types"

import { routes } from "./routes"

export const navItems: NavItem[] = [
  {
    title: "Inicio",
    to: routes.home,
    icon: LayoutDashboard,
  },
  {
    title: "Activos",
    to: routes.activos.root,
    icon: Boxes,
    children: [
      {
        title: "Listado",
        to: routes.activos.root,
        icon: List,
      },
      {
        title: "Tipos de activo",
        to: routes.tiposActivo.root,
        icon: Tags,
      },
      {
        title: "Categorías",
        to: routes.categorias.root,
        icon: FolderTree,
      },
      {
        title: "Tipos de documento",
        to: routes.tiposDocumento.root,
        icon: FileText,
      },
    ],
  },
  {
    title: "Parámetros",
    to: routes.parametros.root,
    icon: Settings2,
    children: [
      {
        title: "Gestión",
        to: routes.parametros.gestion,
        icon: SlidersHorizontal,
      },
      {
        title: "Catálogos",
        to: routes.parametros.catalogos,
        icon: BookOpen,
      },
      {
        title: "Tipos de datos",
        to: routes.parametros.tiposDato,
        icon: Type,
      },
    ],
  },
]
