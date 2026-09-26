import { useEffect, useMemo, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import { routes } from "@/app/config/routes"
import { tipoSolicitudVehicularQueries } from "@/modules/gestionvehicular/tipo-solicitud/api/tipo-solicitud.queries"
import type { TipoSolicitudVehicular } from "@/modules/gestionvehicular/tipo-solicitud/api/tipo-solicitud.service"
import { empleadoQueries } from "@/modules/organizacion/empleado/api/empleado.queries"
import type { Empleado } from "@/modules/organizacion/empleado/api/empleado.service"
import { isApiError } from "@/shared/api"

import {
  useCreateSolicitudVehicularWithFiles,
  useUpdateSolicitudVehicular,
} from "../api/solicitud-vehicular.mutations"
import { solicitudVehicularQueries } from "../api/solicitud-vehicular.queries"
import type { SolicitudVehicularPayload } from "../api/solicitud-vehicular.service"
import {
  defaultSolicitudVehicularValues,
  type SolicitudVehicularFormValues,
  solicitudVehicularSchema,
} from "../schemas/solicitud-vehicular.schema"

type UseSolicitudVehicularFormProps = {
  solicitudId?: string
}

function toDatetimeLocal(isoString?: string | null): string {
  if (!isoString) return ""
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function useSolicitudVehicularForm({
  solicitudId,
}: UseSolicitudVehicularFormProps = {}) {
  const navigate = useNavigate()
  const isEditing = Boolean(solicitudId)

  // 1. Cargar solicitud en caso de edición
  const solicitudQuery = useQuery({
    ...solicitudVehicularQueries.detail(solicitudId ?? ""),
    enabled: isEditing,
  })
  const solicitud = solicitudQuery.data

  // 2. Mutaciones
  const createWithFilesMutation = useCreateSolicitudVehicularWithFiles()
  const updateMutation = useUpdateSolicitudVehicular()

  // 3. Estados de UI y archivos
  const [formError, setFormError] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)

  // Cache dinámico para solicitantes extras
  const [extraEmpleados, setExtraEmpleados] = useState<Map<string, Empleado>>(
    new Map()
  )

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

  // 4. Catálogo: Tipos de solicitud vehicular
  const tiposQuery = useQuery(
    tipoSolicitudVehicularQueries.list({ size: 100 })
  )
  const tiposList = useMemo(
    () => tiposQuery.data?.content ?? [],
    [tiposQuery.data?.content]
  )
  const tiposMap = useMemo(
    () => new Map(tiposList.map((t: TipoSolicitudVehicular) => [t.id, t])),
    [tiposList]
  )

  // 5. Catálogo: Empleados
  const empleadosQuery = useQuery(
    empleadoQueries.misEmpleados({ size: 100, sortBy: "codigo", direction: "ASC" })
  )
  const empleados = useMemo(
    () => empleadosQuery.data?.content ?? [],
    [empleadosQuery.data?.content]
  )
  const solicitante = solicitud?.solicitante
  const empleadosMap = useMemo(() => {
    const map = new Map<string, Empleado>()
    for (const e of empleados) {
      map.set(e.id, e)
    }
    for (const [id, e] of extraEmpleados.entries()) {
      map.set(id, e)
    }
    if (solicitante?.id && !map.has(solicitante.id)) {
      map.set(solicitante.id, {
        id: solicitante.id,
        codigo: solicitante.codigo,
        personaNombreCompleto: solicitante.nombreCompleto,
        cargo: { nombre: solicitante.cargo },
        area: { nombre: solicitante.area },
      } as unknown as Empleado)
    }
    return map
  }, [empleados, extraEmpleados, solicitante])

  // 6. Valores iniciales
  const defaultValues = useMemo(() => {
    if (solicitud) {
      return {
        numero: solicitud.numero,
        tipoSolicitudVehicularId: solicitud.tipoSolicitudVehicularId,
        solicitanteId: solicitud.solicitanteId,
        motivo: solicitud.motivo,
        justificacion: solicitud.justificacion ?? "",
        destino: solicitud.destino,
        fechaSalida: toDatetimeLocal(solicitud.fechaSalida),
        fechaRetornoEstimada: toDatetimeLocal(solicitud.fechaRetornoEstimada),
        cantidadPasajeros: solicitud.cantidadPasajeros ?? 1,
        observacion: solicitud.observacion ?? "",
        estado: solicitud.estado ?? "PENDIENTE",
        processInstanceId: solicitud.processInstanceId ?? "",
      }
    }

    return {
      ...defaultSolicitudVehicularValues,
      numero: "",
      estado: "PENDIENTE",
    }
  }, [solicitud])

  // 7. Instancia TanStack Form
  const form = useForm({
    defaultValues: defaultValues as SolicitudVehicularFormValues,
    validators: {
      onSubmit: solicitudVehicularSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      const selectedTipo = tiposMap.get(value.tipoSolicitudVehicularId)
      if (selectedTipo?.requiereJustificacion && !value.justificacion?.trim()) {
        setFormError(
          "La justificación técnica/operativa es obligatoria para el tipo de solicitud seleccionado."
        )
        return
      }

      if (
        selectedTipo?.requiereRespaldo &&
        !isEditing &&
        selectedFiles.length === 0
      ) {
        setFormError(
          "Debe adjuntar al menos un archivo de respaldo para este tipo de solicitud."
        )
        return
      }

      try {
        const salidaIso = new Date(value.fechaSalida).toISOString()
        const retornoIso = new Date(value.fechaRetornoEstimada).toISOString()

        const payload: SolicitudVehicularPayload = {
          numero: value.numero?.trim() ? value.numero.trim().toUpperCase() : (solicitud?.numero || undefined),
          tipoSolicitudVehicularId: value.tipoSolicitudVehicularId.trim(),
          solicitanteId: value.solicitanteId.trim(),
          motivo: value.motivo.trim(),
          justificacion: value.justificacion?.trim() || null,
          destino: value.destino.trim(),
          fechaSalida: salidaIso,
          fechaRetornoEstimada: retornoIso,
          cantidadPasajeros: Number(value.cantidadPasajeros) || 1,
          observacion: value.observacion?.trim() || null,
          estado: value.estado || (solicitud?.estado || "PENDIENTE"),
          processInstanceId: value.processInstanceId?.trim() || null,
        }

        if (isEditing && solicitudId) {
          await updateMutation.mutateAsync({
            id: solicitudId,
            payload,
          })
        } else {
          await createWithFilesMutation.mutateAsync({
            payload,
            files: selectedFiles,
          })
        }

        navigate({ to: routes.gestionVehicular.solicitudes })
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar la solicitud vehicular. Por favor revisa los campos."
        )
      }
    },
  })

  // Sincronizar campos en edición
  useEffect(() => {
    if (solicitud) {
      form.setFieldValue("numero", solicitud.numero)
      form.setFieldValue(
        "tipoSolicitudVehicularId",
        solicitud.tipoSolicitudVehicularId
      )
      form.setFieldValue("solicitanteId", solicitud.solicitanteId)
      form.setFieldValue("motivo", solicitud.motivo)
      form.setFieldValue("justificacion", solicitud.justificacion ?? "")
      form.setFieldValue("destino", solicitud.destino)
      form.setFieldValue("fechaSalida", toDatetimeLocal(solicitud.fechaSalida))
      form.setFieldValue(
        "fechaRetornoEstimada",
        toDatetimeLocal(solicitud.fechaRetornoEstimada)
      )
      form.setFieldValue(
        "cantidadPasajeros",
        solicitud.cantidadPasajeros ?? 1
      )
      form.setFieldValue("observacion", solicitud.observacion ?? "")
      form.setFieldValue("estado", solicitud.estado ?? "PENDIENTE")
      form.setFieldValue(
        "processInstanceId",
        solicitud.processInstanceId ?? ""
      )
    }
  }, [solicitud, form])

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
    createWithFilesMutation.isPending ||
    updateMutation.isPending

  const estadoNorm = (solicitud?.estado ?? "").toLowerCase()
  const isEditable =
    !solicitud ||
    estadoNorm === "pendiente" ||
    estadoNorm === "borrador" ||
    estadoNorm === "observado"

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
    // Tipos de solicitud
    tiposList,
    tiposMap,
    tiposLoading: tiposQuery.isLoading,
    // Empleados
    empleados,
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

export type UseSolicitudVehicularFormReturn = ReturnType<
  typeof useSolicitudVehicularForm
>
