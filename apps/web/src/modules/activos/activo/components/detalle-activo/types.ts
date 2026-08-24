export type TabType =
  | "informacion"
  | "documentacion"
  | "accesorios"
  | "asignacion"
  | "historial"

export interface DocumentoItem {
  id: string
  titulo: string
  codigoRef: string
  tipo: string
  fechaEmision: string
  fechaVencimiento: string
  estado: "vigente" | "por_vencer" | "vencido"
  tamano: string
  archivoUrl?: string
}

export interface MantenimientoItem {
  id: string
  tipo: "preventivo" | "correctivo" | "inspeccion"
  titulo: string
  fecha: string
  kilometraje?: string
  responsable: string
  costo?: string
  observaciones: string
}
