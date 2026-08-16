import {
  BookOpen,
  Boxes,
  Briefcase,
  Building,
  Building2,
  FileText,
  FolderTree,
  LayoutDashboard,
  List,
  MapPin,
  Ruler,
  ScrollText,
  Settings2,
  SlidersHorizontal,
  Tags,
  Type,
  UserCheck,
  Users,
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
    title: "Organización",
    to: routes.organizacion.root,
    icon: Building2,
    children: [
      {
        title: "Empleados",
        to: routes.organizacion.empleados,
        icon: UserCheck,
      },
      {
        title: "Áreas",
        to: routes.organizacion.areas,
        icon: Building,
      },
      {
        title: "Cargos",
        to: routes.organizacion.cargos,
        icon: Briefcase,
      },
      {
        title: "Personas",
        to: routes.organizacion.personas,
        icon: Users,
      },
      {
        title: "Logs de Migración",
        to: routes.organizacion.migraciones,
        icon: ScrollText,
      },
    ],
  },
  {
    title: "Activos",
    to: routes.activos.root,
    icon: Boxes,
    children: [
      {
        title: "Registro de Activos",
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
    title: "Inventarios",
    to: routes.inventarios.root,
    icon: Boxes,
    children: [
      {
        title: "Insumos",
        to: routes.inventarios.root,
        icon: List,
      },
      {
        title: "Tipos de insumo",
        to: routes.inventarios.tiposInsumo.root,
        icon: Tags,
      },
      {
        title: "Categorías",
        to: routes.inventarios.categorias.root,
        icon: FolderTree,
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
      {
        title: "Ubicaciones",
        to: routes.parametros.ubicaciones,
        icon: MapPin,
      },
      {
        title: "Unidades de medida",
        to: routes.parametros.unidadesMedida,
        icon: Ruler,
      },
    ],
  },
]
