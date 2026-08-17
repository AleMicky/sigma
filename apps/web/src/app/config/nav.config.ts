import {
  AlertCircle,
  BookOpen,
  Boxes,
  Briefcase,
  Building,
  Building2,
  FileSearch,
  FileText,
  FolderTree,
  LayoutDashboard,
  LayoutGrid,
  List,
  MapPin,
  Paperclip,
  Ruler,
  ScrollText,
  Settings2,
  SlidersHorizontal,
  Tags,
  Type,
  UserCheck,
  Users,
  Wrench,
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
        title: "Mantenimiento",
        items: [
          {
            title: "Logs de Migración",
            to: routes.organizacion.migraciones,
            icon: ScrollText,
          },
        ],
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
        icon: Boxes,
      },
      {
        title: "Catálogo de Activos",
        to: routes.activos.catalogo,
        icon: LayoutGrid,
      },
      {
        title: "Consulta de Documentos",
        to: routes.activos.consultaDocumentos,
        icon: FileSearch,
      },
      {
        title: "Configuraciones",
        items: [
          {
            title: "Categorías",
            to: routes.categorias.root,
            icon: FolderTree,
          },
          {
            title: "Tipos de activo",
            to: routes.tiposActivo.root,
            icon: Tags,
          },
          {
            title: "Accesorios",
            to: routes.accesorios.root,
            icon: Paperclip,
          },
          {
            title: "Tipos de documento",
            to: routes.tiposDocumento.root,
            icon: FileText,
          },
        ],
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
        title: "Configuraciones",
        items: [
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
        title: "Configuraciones",
        items: [
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
    ],
  },
  {
    title: "Mantenimientos",
    to: routes.mantenimientos.root,
    icon: Wrench,
    children: [
      {
        title: "Tipos de Mantenimiento",
        to: routes.mantenimientos.tiposMantenimiento,
        icon: Tags,
      },
      {
        title: "Prioridades",
        to: routes.mantenimientos.prioridades,
        icon: AlertCircle,
      },
    ],
  },
]
