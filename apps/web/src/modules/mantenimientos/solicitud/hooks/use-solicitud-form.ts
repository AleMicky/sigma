import { useEffect, useMemo, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import { routes } from "@/app/config/routes"
import { activoQueries } from "@/modules/activos/activo/api/activo.queries"
import type { Activo } from "@/modules/activos/activo/api/activo.service"
import { prioridadQueries } from "@/modules/mantenimientos/prioridad/api/prioridad.queries"
import type { Prioridad } from "@/modules/mantenimientos/prioridad/api/prioridad.service"
import { tipoMantenimientoQueries } from "@/modules/mantenimientos/tipo-mantenimiento/api/tipo-mantenimiento.queries"
import type { TipoMantenimiento } from "@/modules/mantenimientos/tipo-mantenimiento/api/tipo-mantenimiento.service"
import { empleadoQueries } from "@/modules/organizacion/empleado/api/empleado.queries"
import type { Empleado } from "@/modules/organizacion/empleado/api/empleado.service"
import { isApiError } from "@/shared/api"

import {
  useCreateSolicitud,
  useCreateSolicitudWithFiles,
  useUpdateSolicitud,
} from "../api/solicitud.mutations"
import { solicitudQueries } from "../api/solicitud.queries"
import type { SolicitudPayload } from "../api/solicitud.service"
import {
  defaultSolicitudValues,
  type SolicitudFormValues,
  solicitudSchema,
} from "../schemas/solicitud.schema"

type UseSolicitudFormProps = {
  solicitudId?: string
}

function getTodayDateTimeString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function useSolicitudForm({ solicitudId }: UseSolicitudFormProps = {}) {
  const navigate = useNavigate()
  const isEditing = Boolean(solicitudId)

  // 1. Cargar solicitud en edición
  const solicitudQuery = useQuery({
    ...solicitudQueries.detail(solicitudId ?? ""),
    enabled: isEditing,
  })
  const solicitud = solicitudQuery.data

  // 2. Mutaciones
  const createMutation = useCreateSolicitud()
  const createWithFilesMutation = useCreateSolicitudWithFiles()
  const updateMutation = useUpdateSolicitud()

  // 3. Estados de UI y archivos
  const [formError, setFormError] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)

  // Cache dinámico para almacenar elementos seleccionados vía comboboxes
  const [extraActivos, setExtraActivos] = useState<Map<string, Activo>>(new Map())
  const [extraEmpleados, setExtraEmpleados] = useState<Map<string, Empleado>>(new Map())

  const registerActivo = (activo?: Activo | null) => {
    if (activo?.id) {
      setExtraActivos((prev) => {
        if (prev.has(activo.id)) return prev
        const next = new Map(prev)
        next.set(activo.id, activo)
        return next
      })
    }
  }

  const registerEmpleado = (empleado?: Empleado | null) => {
    if (empleado?.id) {
      setExtraEmpleados((prev) => {
        if (prev.has(empleado.id)) return prev
        const next = new Map(prev)
        next.set(empleado.id, empleado)
        return next
      })
    }
  }

  // 4. Catálogo: Activos
  const activosQuery = useQuery(
    activoQueries.list({ size: 100, sortBy: "nombre", direction: "ASC" }),
  )
  const activos = useMemo(
    () => activosQuery.data?.content ?? [],
    [activosQuery.data?.content],
  )
  const activosMap = useMemo(() => {
    const map = new Map<string, Activo>()
    for (const a of activos) {
      map.set(a.id, a)
    }
    for (const [id, a] of extraActivos.entries()) {
      map.set(id, a)
    }
    if (solicitud?.activo?.id && !map.has(solicitud.activo.id)) {
      map.set(solicitud.activo.id, {
        id: solicitud.activo.id,
        codigo: solicitud.activo.codigo,
        nombre: solicitud.activo.nombre,
      } as Activo)
    }
    return map
  }, [activos, extraActivos, solicitud?.activo])

  // 5. Catálogo: Tipos de Mantenimiento
  const tiposMantenimientoQuery = useQuery(
    tipoMantenimientoQueries.list({ size: 100, sortBy: "nombre", direction: "ASC" }),
  )
  const tiposMantenimiento = useMemo(
    () => tiposMantenimientoQuery.data?.content ?? [],
    [tiposMantenimientoQuery.data?.content],
  )
  const tiposMantenimientoMap = useMemo(
    () => new Map(tiposMantenimiento.map((t: TipoMantenimiento) => [t.id, t])),
    [tiposMantenimiento],
  )

  // 6. Catálogo: Prioridades
  const prioridadesQuery = useQuery(
    prioridadQueries.list({ size: 100, sortBy: "nivel", direction: "ASC" }),
  )
  const prioridades = useMemo(() => {
    const list = [...(prioridadesQuery.data?.content ?? [])]
    return list.sort((a: Prioridad, b: Prioridad) => a.nivel - b.nivel)
  }, [prioridadesQuery.data?.content])

  const prioridadesMap = useMemo(
    () => new Map(prioridades.map((p: Prioridad) => [p.id, p])),
    [prioridades],
  )

  const defaultPrioridadId = useMemo(() => {
    if (solicitud?.prioridad?.id) return solicitud.prioridad.id
    const defaultItem =
      prioridades.find((p: Prioridad) => Boolean(p.porDefecto)) ?? prioridades[0]
    return defaultItem?.id ?? ""
  }, [solicitud?.prioridad?.id, prioridades])

  // 7. Catálogo: Empleados (mis empleados)
  const empleadosQuery = useQuery(
    empleadoQueries.misEmpleados({ size: 100, sortBy: "codigo", direction: "ASC" }),
  )
  const empleados = useMemo(
    () => empleadosQuery.data?.content ?? [],
    [empleadosQuery.data?.content],
  )
  const empleadosMap = useMemo(() => {
    const map = new Map<string, Empleado>()
    for (const e of empleados) {
      map.set(e.id, e)
    }
    for (const [id, e] of extraEmpleados.entries()) {
      map.set(id, e)
    }
    if (solicitud?.solicitante?.id && !map.has(solicitud.solicitante.id)) {
      map.set(solicitud.solicitante.id, {
        id: solicitud.solicitante.id,
        codigo: "",
        personaNombreCompleto: solicitud.solicitante.nombreCompleto || solicitud.solicitante.nombre || "",
      } as Empleado)
    }
    return map
  }, [empleados, extraEmpleados, solicitud?.solicitante])

  // 8. Instancia de TanStack Form
  const form = useForm({
    defaultValues: (solicitud
      ? {
        titulo: solicitud.titulo,
        descripcion: solicitud.descripcion ?? "",
        tipoFallas: solicitud.tipoFallas ?? "",
        activoId: solicitud.activo?.id ?? "",
        tipoMantenimientoId: solicitud.tipoMantenimiento?.id ?? "",
        prioridadId: solicitud.prioridad?.id ?? "",
        solicitanteId: solicitud.solicitante?.id ?? "",
        fechaSolicitud: solicitud.fechaSolicitud
          ? (solicitud.fechaSolicitud.length >= 16
            ? solicitud.fechaSolicitud.substring(0, 16)
            : solicitud.fechaSolicitud)
          : getTodayDateTimeString(),
      }
      : {
        ...defaultSolicitudValues,
        prioridadId: defaultPrioridadId,
        fechaSolicitud: getTodayDateTimeString(),
      }) as SolicitudFormValues,
    validators: {
      onSubmit: solicitudSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const payload: SolicitudPayload = {
          titulo: value.titulo.trim(),
          descripcion: value.descripcion.trim(),
          tipoFallas: (value.tipoFallas ?? "").trim() || null,
          activoId: value.activoId.trim(),
          tipoMantenimientoId: value.tipoMantenimientoId.trim(),
          prioridadId: value.prioridadId.trim(),
          solicitanteId: value.solicitanteId.trim(),
          fechaSolicitud: value.fechaSolicitud
            ? (value.fechaSolicitud.length === 16
              ? `${value.fechaSolicitud}:00`
              : (value.fechaSolicitud.includes("T")
                ? value.fechaSolicitud
                : `${value.fechaSolicitud}T00:00:00`))
            : null,
        }

        if (isEditing && solicitudId) {
          await updateMutation.mutateAsync({
            id: solicitudId,
            payload,
          })
        } else {
          if (selectedFiles.length > 0) {
            await createWithFilesMutation.mutateAsync({
              payload,
              files: selectedFiles,
            })
          } else {
            await createMutation.mutateAsync(payload)
          }
        }

        navigate({ to: routes.mantenimientos.solicitudes })
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar la solicitud de mantenimiento. Por favor revisa los campos.",
        )
      }
    },
  })

  // Sincronizar en modo edición
  useEffect(() => {
    if (solicitud) {
      form.setFieldValue("titulo", solicitud.titulo)
      form.setFieldValue("descripcion", solicitud.descripcion ?? "")
      form.setFieldValue("tipoFallas", solicitud.tipoFallas ?? "")
      form.setFieldValue("activoId", solicitud.activo?.id ?? "")
      form.setFieldValue("tipoMantenimientoId", solicitud.tipoMantenimiento?.id ?? "")
      form.setFieldValue("prioridadId", solicitud.prioridad?.id ?? "")
      form.setFieldValue("solicitanteId", solicitud.solicitante?.id ?? "")
      if (solicitud.fechaSolicitud) {
        form.setFieldValue(
          "fechaSolicitud",
          solicitud.fechaSolicitud.length >= 16
            ? solicitud.fechaSolicitud.substring(0, 16)
            : solicitud.fechaSolicitud,
        )
      }
    }
  }, [solicitud, form])

  // Autoseleccionar prioridad por defecto
  useEffect(() => {
    if (!isEditing && prioridades.length > 0) {
      const currentVal = form.getFieldValue("prioridadId")
      if (!currentVal) {
        const defaultItem =
          prioridades.find((p: Prioridad) => Boolean(p.porDefecto)) ??
          prioridades[0]
        if (defaultItem) {
          form.setFieldValue("prioridadId", defaultItem.id)
        }
      }
    }
  }, [isEditing, prioridades, form])

  // Autoseleccionar solicitante si solo tiene 1 empleado
  useEffect(() => {
    if (!isEditing && empleados.length === 1) {
      const currentVal = form.getFieldValue("solicitanteId")
      if (!currentVal) {
        form.setFieldValue("solicitanteId", empleados[0].id)
      }
    }
  }, [isEditing, empleados, form])

  // Manejo de archivos
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files)
      setSelectedFiles((prev) => [...prev, ...filesArr])
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArr = Array.from(e.dataTransfer.files)
      setSelectedFiles((prev) => [...prev, ...filesArr])
    }
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const isSubmitting =
    form.state.isSubmitting ||
    createMutation.isPending ||
    createWithFilesMutation.isPending ||
    updateMutation.isPending

  const estadoNorm = (solicitud?.estado ?? "").toLowerCase()
  const isEditable = !solicitud || estadoNorm === "borrador" || estadoNorm === "observado"

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    form.handleSubmit()
  }

  return {
    isEditing,
    solicitud,
    isLoading: solicitudQuery.isLoading,
    isEditable,
    isSubmitting,
    form,
    formError,
    setFormError,
    handleSubmit,
    // Activos
    activosMap,
    registerActivo,
    // Tipos de Mantenimiento
    tiposMantenimiento,
    tiposMantenimientoMap,
    tiposMantenimientoLoading: tiposMantenimientoQuery.isLoading,
    // Prioridades
    prioridades,
    prioridadesMap,
    prioridadesLoading: prioridadesQuery.isLoading,
    // Empleados
    empleadosMap,
    registerEmpleado,
    // Archivos
    selectedFiles,
    isDragging,
    setIsDragging,
    handleFileChange,
    handleDrop,
    removeFile,
    existingAdjuntos: solicitud?.adjuntos ?? [],
  }
}

export type UseSolicitudFormReturn = ReturnType<typeof useSolicitudForm>
