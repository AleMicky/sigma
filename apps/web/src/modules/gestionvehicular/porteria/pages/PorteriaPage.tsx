import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  CheckCircle2,
  Clock,
  LogIn,
  LogOut,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react"

import { appConfig } from "@/app/config"
import { EmptyState } from "@/shared/components/empty-state"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"

import { useAnularRegistroPorteriaMutation } from "../api/porteria.mutations"
import { porteriaQueries } from "../api/porteria.queries"
import type {
  EstadoRegistroPorteria,
  RegistroPorteria,
} from "../api/porteria.types"
import { RegistrarLlegadaPorteriaDialog } from "../components/RegistrarLlegadaPorteriaDialog"
import { RegistrarSalidaPorteriaDialog } from "../components/RegistrarSalidaPorteriaDialog"

const DEFAULT_PAGE_SIZE = appConfig.pagination?.defaultPageSize ?? 20

function formatDateTime(value?: string | null): string {
  if (!value) return "—"
  return new Date(value).toLocaleString("es-BO", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

function EstadoBadge({ estado }: { estado: EstadoRegistroPorteria }) {
  if (estado === "AFUERA") {
    return (
      <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-600">
        <Clock className="mr-1 size-3" />
        Afuera
      </Badge>
    )
  }
  if (estado === "COMPLETADO") {
    return (
      <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600">
        <CheckCircle2 className="mr-1 size-3" />
        Completado
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-destructive">
      <XCircle className="mr-1 size-3" />
      Anulado
    </Badge>
  )
}

export function PorteriaPage() {
  const [tab, setTab] = useState<"afuera" | "historial">("afuera")
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 300)
  const [estadoFiltro, setEstadoFiltro] = useState<string>("ALL")
  const [page, setPage] = useState(0)

  const [salidaOpen, setSalidaOpen] = useState(false)
  const [llegadaTarget, setLlegadaTarget] = useState<RegistroPorteria | null>(
    null
  )

  const afueraQuery = useQuery(porteriaQueries.afuera())
  const historialQuery = useQuery(
    porteriaQueries.list({
      page,
      size: DEFAULT_PAGE_SIZE,
      search: debouncedSearch || undefined,
      estado:
        estadoFiltro !== "ALL"
          ? (estadoFiltro as EstadoRegistroPorteria)
          : undefined,
    })
  )

  const anularMutation = useAnularRegistroPorteriaMutation()

  const afueraList = Array.isArray(afueraQuery.data) ? afueraQuery.data : []
  const historialPage = historialQuery.data
  const historialList = Array.isArray(historialPage?.content)
    ? historialPage.content
    : []

  const handleAnular = (registro: RegistroPorteria) => {
    if (!window.confirm(`¿Anular el registro ${registro.numero}?`)) return
    anularMutation.mutate({ id: registro.id })
  }

  const renderActivos = (registro: RegistroPorteria) => (
    <div className="flex flex-wrap gap-1.5">
      {(registro.activos ?? []).map((item) => {
        const label = item.activoNombre
          ? `${item.activoCodigo ?? ""} ${item.activoNombre}`.trim()
          : item.descripcionItem || "Ítem"
        return (
          <Badge
            key={item.id}
            variant={item.retornado === false ? "destructive" : "secondary"}
            className="font-normal"
          >
            <Package className="mr-1 size-3" />
            {label}
            {item.cantidad > 1 ? ` (x${item.cantidad})` : ""}
            {item.retornado === false ? " · No retornó" : ""}
          </Badge>
        )
      })}
    </div>
  )

  return (
    <PageShell layout="scroll" className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Control de Portería
            </h1>
            <p className="text-sm text-muted-foreground">
              Registro rápido de salida y llegada de empleados con activos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void afueraQuery.refetch()
              void historialQuery.refetch()
            }}
          >
            <RefreshCw className="mr-1.5 size-4" />
            Actualizar
          </Button>
          <Button onClick={() => setSalidaOpen(true)}>
            <LogOut className="mr-1.5 size-4" />
            Registrar Salida
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Actualmente afuera
              </p>
              <p className="text-2xl font-bold">{afueraList.length}</p>
            </div>
            <Clock className="size-8 text-amber-500/70" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Total en historial
              </p>
              <p className="text-2xl font-bold">
                {historialPage?.totalElements ?? 0}
              </p>
            </div>
            <ShieldCheck className="size-8 text-sky-500/70" />
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "afuera" | "historial")}
      >
        <TabsList>
          <TabsTrigger value="afuera">
            Afuera ahora ({afueraList.length})
          </TabsTrigger>
          <TabsTrigger value="historial">Historial completo</TabsTrigger>
        </TabsList>

        <TabsContent value="afuera" className="mt-4">
          {afueraList.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="size-5.5 text-muted-foreground/80" />}
              title="No hay salidas pendientes de retorno"
              description="Todos los empleados y activos han retornado o aún no se registraron salidas."
            />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Hora Salida</TableHead>
                    <TableHead>Guardia Salida</TableHead>
                    <TableHead>Activos / Ítems</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {afueraList.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell className="font-medium">{reg.numero}</TableCell>
                      <TableCell>
                        {reg.empleadoNombre ?? reg.empleadoId}
                      </TableCell>
                      <TableCell>
                        {formatDateTime(reg.fechaHoraSalida)}
                      </TableCell>
                      <TableCell>{reg.guardiaSalidaNombre ?? "—"}</TableCell>
                      <TableCell>{renderActivos(reg)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => setLlegadaTarget(reg)}
                          >
                            <LogIn className="mr-1.5 size-3.5" />
                            Registrar Llegada
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAnular(reg)}
                            disabled={anularMutation.isPending}
                          >
                            Anular
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="historial" className="mt-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar por número u observación..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(0)
                }}
              />
            </div>
            <Select
              value={estadoFiltro}
              onValueChange={(val) => {
                setEstadoFiltro(val ?? "ALL")
                setPage(0)
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los estados</SelectItem>
                <SelectItem value="AFUERA">Afuera</SelectItem>
                <SelectItem value="COMPLETADO">Completado</SelectItem>
                <SelectItem value="ANULADO">Anulado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {historialList.length === 0 ? (
            <EmptyState
              icon={<ShieldCheck className="size-5.5 text-muted-foreground/80" />}
              title="Sin registros en el historial"
              description="No se encontraron registros con los filtros actuales."
            />
          ) : (
            <>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Empleado</TableHead>
                      <TableHead>Salida</TableHead>
                      <TableHead>Llegada</TableHead>
                      <TableHead>Activos / Ítems</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historialList.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell className="font-medium">
                          {reg.numero}
                        </TableCell>
                        <TableCell>
                          <EstadoBadge estado={reg.estado} />
                        </TableCell>
                        <TableCell>
                          {reg.empleadoNombre ?? reg.empleadoId}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <div>{formatDateTime(reg.fechaHoraSalida)}</div>
                            <div className="text-muted-foreground">
                              {reg.guardiaSalidaNombre ?? ""}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <div>{formatDateTime(reg.fechaHoraLlegada)}</div>
                            <div className="text-muted-foreground">
                              {reg.guardiaLlegadaNombre ?? ""}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{renderActivos(reg)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {historialPage && historialPage.totalPages > 1 && (
                <Pagination
                  page={historialPage}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <RegistrarSalidaPorteriaDialog
        open={salidaOpen}
        onOpenChange={setSalidaOpen}
      />

      <RegistrarLlegadaPorteriaDialog
        open={Boolean(llegadaTarget)}
        onOpenChange={(open) => {
          if (!open) setLlegadaTarget(null)
        }}
        registro={llegadaTarget}
      />
    </PageShell>
  )
}

