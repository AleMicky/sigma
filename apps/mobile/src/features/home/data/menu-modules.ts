import React from "react";
import {
    BoxesIcon,
    CarIcon,
    PackageIcon,
    ShieldIcon,
    UsersIcon,
    WrenchIcon,
} from "@/src/components/icons";

export interface SubmenuItem {
    id: string;
    title: string;
    description?: string;
    badge?: string;
    route?: string;
}

export interface ModuleItem {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ size?: number; color?: string }>;
    accentColor: string;
    bgColor: string;
    borderColor: string;
    tag: string;
    items: SubmenuItem[];
}

export const SYSTEM_MODULES: ModuleItem[] = [
    {
        id: "mantenimientos",
        title: "Mantenimientos",
        description: "Gestión integral de órdenes de trabajo, solicitudes técnicas e inspecciones.",
        icon: WrenchIcon,
        accentColor: "#ea580c",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        tag: "Operaciones",
        items: [
            {
                id: "mant-solicitudes",
                title: "Solicitudes de Mantenimiento",
                description: "Crear y revisar requerimientos",
                badge: "Prioritario",
                route: "/(app)/mantenimientos/solicitudes",
            },
            {
                id: "mant-ordenes",
                title: "Órdenes de Trabajo (OT)",
                description: "Ejecución y seguimiento de trabajos",
            },
            {
                id: "mant-aprobaciones",
                title: "Aprobaciones y Supervisión",
                description: "Validación de solicitudes pendientes",
            },
            {
                id: "mant-inspecciones",
                title: "Inspecciones de Rutina",
                description: "Hojas de verificación y rondas",
            },
        ],
    },
    {
        id: "activos",
        title: "Activos",
        description: "Control del catálogo técnico de equipos, activos fijos y reportes GRS.",
        icon: BoxesIcon,
        accentColor: "#d97706",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        tag: "Equipos",
        items: [
            {
                id: "act-catalogo",
                title: "Catálogo de Activos",
                description: "Listado técnico e información general",
            },
            {
                id: "act-grs",
                title: "Reportes GRS y Documentos",
                description: "Historial documental y expedientes",
            },
            {
                id: "act-historial",
                title: "Historial de Mantenimientos",
                description: "Registro de intervenciones anteriores",
            },
        ],
    },
    {
        id: "gestion-vehicular",
        title: "Gestión Vehicular",
        description: "Control de flota automotriz, conductores, solicitudes de viaje y kilometraje.",
        icon: CarIcon,
        accentColor: "#4f46e5",
        bgColor: "bg-indigo-50",
        borderColor: "border-indigo-200",
        tag: "Transporte",
        items: [
            {
                id: "veh-solicitudes",
                title: "Solicitudes de Viaje",
                description: "Programación de traslados operativos",
            },
            {
                id: "veh-flota",
                title: "Control de Flota y Odómetro",
                description: "Estado de vehículos y kilometraje",
            },
            {
                id: "veh-conductores",
                title: "Asignación de Conductores",
                description: "Directorio y turnos de choferes",
            },
        ],
    },
    {
        id: "inventarios",
        title: "Inventarios",
        description: "Control de repuestos, insumos de almacén y abastecimiento operativo.",
        icon: PackageIcon,
        accentColor: "#059669",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        tag: "Almacén",
        items: [
            {
                id: "inv-repuestos",
                title: "Consulta de Repuestos",
                description: "Búsqueda de stock disponible",
            },
            {
                id: "inv-solicitudes",
                title: "Solicitudes de Almacén",
                description: "Despacho de materiales para OT",
            },
        ],
    },
    {
        id: "organizacion",
        title: "Organización",
        description: "Directorio de personal, cuadrillas técnicas, áreas y responsabilidades.",
        icon: UsersIcon,
        accentColor: "#2563eb",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        tag: "Estructura",
        items: [
            {
                id: "org-personal",
                title: "Directorio de Personal",
                description: "Técnicos, operadores y supervisores",
            },
            {
                id: "org-cuadrillas",
                title: "Cuadrillas Técnicas",
                description: "Asignación por turnos y zonas",
            },
        ],
    },
    {
        id: "seguridad",
        title: "Seguridad y Sistema",
        description: "Administración de usuarios, roles, perfiles y parámetros del sistema.",
        icon: ShieldIcon,
        accentColor: "#db2777",
        bgColor: "bg-pink-50",
        borderColor: "border-pink-200",
        tag: "Control",
        items: [
            {
                id: "seg-usuarios",
                title: "Usuarios y Permisos",
                description: "Gestión de accesos y credenciales",
            },
            {
                id: "seg-servidor",
                title: "Configuración del Servidor",
                description: "Ajustes de conexión y API",
                route: "/server-config",
            },
        ],
    },
];

export const QUICK_SHORTCUTS = [
    {
        id: "quick-solicitud",
        title: "Solicitudes",
        subtitle: "Mantenimiento",
        icon: WrenchIcon,
        color: "#ea580c",
        bg: "bg-orange-500",
        route: "/(app)/mantenimientos/solicitudes",
    },
    {
        id: "quick-activos",
        title: "Catálogo Activos",
        subtitle: "Buscar equipo",
        icon: BoxesIcon,
        color: "#d97706",
        bg: "bg-amber-500",
    },
    {
        id: "quick-viaje",
        title: "Solicitar Viaje",
        subtitle: "Vehículos",
        icon: CarIcon,
        color: "#4f46e5",
        bg: "bg-indigo-500",
    },
    {
        id: "quick-repuestos",
        title: "Repuestos",
        subtitle: "Stock almacén",
        icon: PackageIcon,
        color: "#059669",
        bg: "bg-emerald-500",
    },
];
