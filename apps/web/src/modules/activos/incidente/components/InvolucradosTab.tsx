import * as React from "react"
import { Edit2, Loader2, Plus, Trash2, User } from "lucide-react"

import { EmpleadoCombobox } from "@/modules/organizacion/empleado/components/EmpleadoCombobox"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { Textarea } from "@/shared/components/ui/textarea"

import {
  useActualizarInvolucradoMutation,
  useEliminarInvolucradoMutation,
  useRegistrarInvolucradoMutation,
} from "../api/incidente.mutations"
import { useIncidenteInvolucradosQuery } from "../api/incidente.queries"
import type { IncidenteInvolucrado } from "../api/incidente.types"

interface InvolucradosTabProps {
  incidenteId: string
  readOnly?: boolean
}

export function InvolucradosTab({ incidenteId, readOnly = false }: InvolucradosTabProps) {
  const { data: involucrados = [], isLoading } = useIncidenteInvolucradosQuery(incidenteId)

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingInvolucrado, setEditingInvolucrado] =
    React.useState<IncidenteInvolucrado | null>(null)

  const [tipoInvolucrado, setTipoInvolucrado] = React.useState("CONDUCTOR")
  const [empleadoId, setEmpleadoId] = React.useState("")
  const [nombre, setNombre] = React.useState("")
  const [documentoIdentidad, setDocumentoIdentidad] = React.useState("")
  const [descripcion, setDescripcion] = React.useState("")

  const registrarMutation = useRegistrarInvolucradoMutation(incidenteId)
  const actualizarMutation = useActualizarInvolucradoMutation(incidenteId)
  const eliminarMutation = useEliminarInvolucradoMutation(incidenteId)

  const isPending =
    registrarMutation.isPending ||
    actualizarMutation.isPending ||
    eliminarMutation.isPending

  const handleOpenCreate = () => {
    setEditingInvolucrado(null)
    setTipoInvolucrado("CONDUCTOR")
    setEmpleadoId("")
    setNombre("")
    setDocumentoIdentidad("")
    setDescripcion("")
    setDialogOpen(true)
  }

  const handleOpenEdit = (inv: IncidenteInvolucrado) => {
    setEditingInvolucrado(inv)
    setTipoInvolucrado(inv.tipoInvolucrado || "CONDUCTOR")
    setEmpleadoId(inv.empleadoId || "")
    setNombre(inv.nombre || "")
    setDocumentoIdentidad(inv.documentoIdentidad || "")
    setDescripcion(inv.descripcion || "")
    setDialogOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      tipoInvolucrado,
      empleadoId: empleadoId || undefined,
      nombre: nombre.trim() || undefined,
      documentoIdentidad: documentoIdentidad.trim() || undefined,
      descripcion: descripcion.trim() || undefined,
    }

    if (editingInvolucrado) {
      actualizarMutation.mutate(
        { involucradoId: editingInvolucrado.id, data: payload },
        {
          onSuccess: () => setDialogOpen(false),
        }
      )
    } else {
      registrarMutation.mutate(payload, {
        onSuccess: () => setDialogOpen(false),
      })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este involucrado del incidente?")) {
      eliminarMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Personas e Involucrados</h3>
          <p className="text-sm text-muted-foreground">
            Conductores, testigos, terceros o personal relacionado al suceso.
          </p>
        </div>
        {!readOnly && (
          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="gap-1.5 bg-primary font-medium"
          >
            <Plus className="w-4 h-4" />
            Agregar Involucrado
          </Button>
        )}
      </div>

      <Card className="border border-border/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Rol / Tipo</TableHead>
                <TableHead>Nombre / Personal</TableHead>
                <TableHead>Documento / CI</TableHead>
                <TableHead>Observaciones</TableHead>
                {!readOnly && <TableHead className="w-24 text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={readOnly ? 4 : 5} className="h-28 text-center">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : involucrados.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={readOnly ? 4 : 5}
                    className="h-32 text-center text-muted-foreground"
                  >
                    <User className="w-8 h-8 mx-auto text-muted-foreground/40 mb-1" />
                    No se han registrado personas involucradas en este incidente.
                  </TableCell>
                </TableRow>
              ) : (
                involucrados.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-semibold text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground uppercase">
                        {inv.tipoInvolucrado}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {inv.nombre || (inv.empleadoId ? "Empleado asignado" : "—")}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {inv.documentoIdentidad || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {inv.descripcion || "—"}
                    </TableCell>
                    {!readOnly && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(inv)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(inv.id)}
                            className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para Crear/Editar Involucrado */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingInvolucrado ? "Editar Involucrado" : "Registrar Involucrado"}
            </DialogTitle>
            <DialogDescription>
              Información de la persona implicada o testigo en el incidente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Tipo de Involucrado *</Label>
              <Select
                value={tipoInvolucrado}
                onValueChange={(val: string | null) => setTipoInvolucrado(val ?? "CONDUCTOR")}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Seleccione rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONDUCTOR">Conductor</SelectItem>
                  <SelectItem value="PASAJERO">Pasajero / Ocupante</SelectItem>
                  <SelectItem value="TERCERO">Tercero Involucrado</SelectItem>
                  <SelectItem value="TESTIGO">Testigo Presencial</SelectItem>
                  <SelectItem value="OFICIAL">Policía / Tránsito / Autoridad</SelectItem>
                  <SelectItem value="OTRO">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Si es empleado de la empresa:
              </Label>
              <EmpleadoCombobox
                value={empleadoId}
                onValueChange={(val, emp) => {
                  setEmpleadoId(val)
                  if (emp && !nombre) {
                    setNombre(
                      emp.personaInfo?.nombreCompleto ||
                        emp.personaNombreCompleto ||
                        ""
                    )
                  }
                }}
                placeholder="Buscar empleado de la empresa..."
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">
                Nombre Completo {empleadoId ? "" : "*"}
              </Label>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Juan Pérez Morales"
                required={!empleadoId}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Documento de Identidad (CI / DNI)</Label>
              <Input
                value={documentoIdentidad}
                onChange={(e) => setDocumentoIdentidad(e.target.value)}
                placeholder="Ej. 6543210 CBBA"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Descripción / Declaración</Label>
              <Textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Declaración preliminar, lesiones, daños a terceros..."
                rows={3}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending || (!nombre.trim() && !empleadoId)}
                className="gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
