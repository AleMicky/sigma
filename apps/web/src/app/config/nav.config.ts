import {
  AlertCircle,
  Award,
  BookOpen,
  Boxes,
  Briefcase,
  Building,
  Building2,
  CheckSquare,
  FileSearch,
  FileText,
  FolderTree,
  LayoutDashboard,
  LayoutGrid,
  List,
  ListTodo,
  MapPin,
  Paperclip,
  Ruler,
  ScrollText,
  Settings2,
  ShieldCheck,
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
        title: "Responsabilidades",
        to: routes.organizacion.responsabilidades,
        icon: Award,
      },
      {
        title: "Grupos Aprobadores",
        to: routes.organizacion.gruposAprobadores,
        icon: ShieldCheck,
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
        title: "Reporte GRS (Documentos",
        to: routes.activos.consultaDocumentos,
        icon: FileSearch,
      },
      {
        title: "Configuraciones",
        items: [
          {
            title: "Categorías de activo",
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
            title: "Categorías Insumo",
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
        title: "Solicitudes",
        to: routes.mantenimientos.solicitudes,
        icon: FileText,
      },
      {
        title: "Bandeja de Aprobaciones",
        to: routes.mantenimientos.aprobaciones,
        icon: ShieldCheck,
      },
      {
        title: "Actividades",
        to: routes.mantenimientos.actividades,
        icon: ListTodo,
      },
      {
        title: "Checklists",
        to: routes.mantenimientos.checklists,
        icon: CheckSquare,
      },
      {
        title: "Configuraciones",
        items: [
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
    ],
  },
]
