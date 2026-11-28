import { useCallback, useMemo, useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import {
  AlertCircle,
  ClipboardList,
  CopyPlus,
  EyeOff,
  FilePlus2,
  Pencil,
  Play,
  PowerOff,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { appConfig } from "@/app/config"
import { routes } from "@/app/config/routes"
import { useAuthStore } from "@/app/store/auth.store"
import { getErrorMessage } from "@/shared/api"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { DataTable } from "@/shared/components/data-table"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import {
  OptionsCombobox,
  type OptionsComboboxOption,
} from "@/shared/components/options-combobox"
import { PageShell } from "@/shared/components/page-shell"
import { SearchField } from "@/shared/components/search-field"
import { StatusBadge } from "@/shared/components/status-badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"
import { Button } from "@/shared/components/ui/button"
import { isAdminUser } from "@/shared/hooks/use-allowed-nav-items"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"

import {
  useDeleteCuestionario,
  useInactivarCuestionario,
  useNuevaVersionCuestionario,
  usePublicarCuestionario,
} from "../api/cuestionario.mutations"
import { cuestionarioQueries } from "../api/cuestionario.queries"
import type {
  Cuestionario,
  EstadoCuestionario,
} from "../api/cuestionario.types"
import { CuestionarioFormDialog } from "../components/CuestionarioFormDialog"
import {
  ESTADO_CUESTIONARIO_LABELS,
  ESTADO_CUESTIONARIO_OPTIONS,
  ESTADO_CUESTIONARIO_VARIANT,
  formatDisparadorLabel,
  isConflictActiveCuestionarioError,
} from "../lib/cuestionario.utils"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function CuestionariosPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isAdmin = isAdminUser(user?.roles)

  const search = usePaginatedSearch({ debounceMs: 300 })
  const [moduloOrigen, setModuloOrigen] = useState("")
  const [estado, setEstado] = useState<EstadoCuestionario | "">("")

  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Cuestionario | null>(null)
  const [deletingItem, setDeletingItem] = useState<Cuestionario | null>(null)
  const [inactivatingItem, setInactivatingItem] = useState<Cuestionario | null>(
    null,
  )
  const [conflictPublishItem, setConflictPublishItem] = useState<{
    item: Cuestionario
    message: string
  } | null>(null)

  const disparadoresQuery = useQuery(cuestionarioQueries.disparadores())
  const disparadores = useMemo(
    () => disparadoresQuery.data ?? [],
    [disparadoresQuery.data],
  )

  const moduloOptions = useMemo<OptionsComboboxOption[]>(() => {
    const map = new Map<string, string>()
    for (const item of disparadores) {
      if (!map.has(item.moduloOrigen)) {
        map.set(
          item.moduloOrigen,
          item.moduloEtiqueta || item.moduloOrigen.replaceAll("_", " "),
        )
      }
    }
    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }))
  }, [disparadores])

  const queryParams = useMemo(
    () => ({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "updatedAt",
      direction: "DESC" as const,
      ...(search.query ? { q: search.query } : {}),
      ...(moduloOrigen ? { moduloOrigen } : {}),
      ...(estado ? { estado } : {}),
    }),
    [search.page, search.query, moduloOrigen, estado],
  )

  const listQuery = useQuery(cuestionarioQueries.list(queryParams))
  const items = useMemo(
    () => listQuery.data?.content ?? [],
    [listQuery.data?.content],
  )

  useClampPage(search.page, search.setPage, listQuery.data?.totalPages)

  const deleteMutation = useDeleteCuestionario()
  const publicarMutation = usePublicarCuestionario()
  const inactivarMutation = useInactivarCuestionario()
  const nuevaVersionMutation = useNuevaVersionCuestionario()

  const hasFilters = Boolean(search.search || moduloOrigen || estado)

  const handleClearFilters = () => {
    search.setSearch("")
    search.setPage(0)
    setModuloOrigen("")
    setEstado("")
  }

  const { mutateAsync: publicarMutateAsync, isPending: isPublicarPending } =
    publicarMutation
  const { mutateAsync: nuevaVersionMutateAsync, isPending: isNuevaVersionPending } =
    nuevaVersionMutation
  const isInactivarPending = inactivarMutation.isPending

  const handlePublicar = useCallback(
    async (item: Cuestionario) => {
      try {
        await publicarMutateAsync({
          id: item.id,
          reemplazarActivo: false,
        })
      } catch (err: unknown) {
        if (isConflictActiveCuestionarioError(err)) {
          setConflictPublishItem({
            item,
            message: getErrorMessage(err),
          })
        } else {
          toast.error(getErrorMessage(err))
        }
      }
    },
    [publicarMutateAsync],
  )

  const handleConfirmReplacePublish = async () => {
    if (!conflictPublishItem) return
    try {
      await publicarMutateAsync({
        id: conflictPublishItem.item.id,
        reemplazarActivo: true,
      })
      setConflictPublishItem(null)
    } catch (err: unknown) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleConfirmInactivar = async () => {
    if (!inactivatingItem) return
    try {
      await inactivarMutation.mutateAsync(inactivatingItem.id)
      setInactivatingItem(null)
    } catch {
      // Notificado por la mutación
    }
  }

  const handleNuevaVersion = useCallback(
    async (item: Cuestionario) => {
      try {
        const created = await nuevaVersionMutateAsync(item.id)
        void navigate({
          to: routes.cuestionarios.constructor(created.id),
        })
      } catch {
        // Notificado por la mutación
      }
    },
    [nuevaVersionMutateAsync, navigate],
  )

  const handleConfirmDelete = async () => {
    if (!deletingItem) return
    try {
      await deleteMutation.mutateAsync(deletingItem.id)
      setDeletingItem(null)
    } catch {
      // Notificado por la mutación
    }
  }

  const columns = useMemo<ColumnDef<Cuestionario>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: "Cuestionario",
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="flex min-w-52 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-md border border-primary/25 bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-primary">
                  {item.codigo}
                </span>
                <span className="rounded-md border border-border/70 bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                  v{item.version}
                </span>
                {item.obligatorio ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[10.5px] font-medium text-warning">
                    <ShieldCheck className="size-3" />
                    Obligatorio
                  </span>
                ) : null}
                {item.anonimoEnReportes ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-info/30 bg-info/10 px-1.5 py-0.5 text-[10.5px] font-medium text-info">
                    <EyeOff className="size-3" />
                    Anónimo
                  </span>
                ) : null}
              </div>
              <p className="text-sm font-semibold text-foreground">
                {item.nombre}
              </p>
              {item.descripcion ? (
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {item.descripcion}
                </p>
              ) : null}
            </div>
          )
        },
      },
      {
        accessorKey: "eventoDisparador",
        header: "Disparador",
        cell: ({ row }) => {
          const item = row.original
          return (
            <span className="text-xs font-medium text-foreground">
              {formatDisparadorLabel(
                disparadores,
                item.moduloOrigen,
                item.entidadTipo,
                item.eventoDisparador,
              )}
            </span>
          )
        },
      },
      {
        accessorKey: "totalPreguntas",
        header: "Preguntas",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
            {row.original.totalPreguntas}
          </span>
        ),
      },
      {
        accessorKey: "totalRespuestas",
        header: "Respuestas",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {row.original.totalRespuestas}
          </span>
        ),
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => (
          <StatusBadge variant={ESTADO_CUESTIONARIO_VARIANT[row.original.estado]}>
            {ESTADO_CUESTIONARIO_LABELS[row.original.estado]}
          </StatusBadge>
        ),
      },
      {
        id: "acciones",
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => {
          const item = row.original
          if (!isAdmin) {
            return (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="xs"
                  render={<Link to={routes.cuestionarios.constructor(item.id)} />}
                >
                  Ver preguntas
                </Button>
              </div>
            )
          }

          const canPublish =
            item.estado === "BORRADOR" || item.estado === "INACTIVO"
          const canInactivate = item.estado === "PUBLICADO"
          const canNewVersion =
            item.estado === "PUBLICADO" || item.estado === "INACTIVO"
          const canDelete =
            item.estado === "BORRADOR" && item.totalRespuestas === 0

          return (
            <div className="flex flex-wrap items-center justify-end gap-1">
              <Button
                variant="outline"
                size="xs"
                className="gap-1"
                title="Abrir constructor de preguntas"
                render={<Link to={routes.cuestionarios.constructor(item.id)} />}
              >
                <SlidersHorizontal className="size-3" />
                Constructor
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon-xs"
                aria-label={`Editar ${item.nombre}`}
                title="Editar configuración"
                onClick={() => {
                  setEditingItem(item)
                  setFormOpen(true)
                }}
              >
                <Pencil />
              </Button>

              {canPublish ? (
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  disabled={isPublicarPending}
                  onClick={() => void handlePublicar(item)}
                  className="gap-1 border-success/40 bg-success/10 text-success hover:bg-success/20 hover:text-success"
                  title="Publicar cuestionario"
                >
                  <Play className="size-3" />
                  Publicar
                </Button>
              ) : null}

              {canInactivate ? (
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  disabled={isInactivarPending}
                  onClick={() => setInactivatingItem(item)}
                  className="gap-1 border-warning/40 bg-warning/10 text-warning hover:bg-warning/20 hover:text-warning"
                  title="Inactivar cuestionario"
                >
                  <PowerOff className="size-3" />
                  Inactivar
                </Button>
              ) : null}

              {canNewVersion ? (
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  disabled={isNuevaVersionPending}
                  onClick={() => void handleNuevaVersion(item)}
                  className="gap-1"
                  title="Crear nueva versión en borrador"
                >
                  <CopyPlus className="size-3" />
                  Nueva versión
                </Button>
              ) : null}

              {canDelete ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-xs"
                  aria-label={`Eliminar ${item.nombre}`}
                  title="Eliminar cuestionario"
                  onClick={() => setDeletingItem(item)}
                >
                  <Trash2 />
                </Button>
              ) : null}
            </div>
          )
        },
      },
    ],
    [
      disparadores,
      isAdmin,
      isPublicarPending,
      isInactivarPending,
      isNuevaVersionPending,
      handlePublicar,
      handleNuevaVersion,
    ],
  )

  return (
    <PageShell size="full" padding="compact" layout="scroll" className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Cuestionarios y Evaluaciones
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Administra encuestas dinámicas, versionado, disparadores de procesos
            y publicación activa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => {
              void listQuery.refetch()
              void disparadoresQuery.refetch()
            }}
            disabled={listQuery.isFetching}
            className="h-9 gap-1.5 rounded-xl text-xs"
          >
            <RefreshCw
              className={listQuery.isFetching ? "size-3.5 animate-spin" : "size-3.5"}
            />
            Actualizar
          </Button>
          {isAdmin ? (
            <Button
              type="button"
              size="lg"
              onClick={() => {
                setEditingItem(null)
                setFormOpen(true)
              }}
              className="h-9 gap-1.5 rounded-xl text-xs font-semibold"
            >
              <FilePlus2 className="size-4" />
              Nuevo cuestionario
            </Button>
          ) : null}
        </div>
      </div>

      {/* Barra de filtros con altura (h-9) y radio (rounded-xl) estrictamente uniformes */}
      <div className="flex flex-col gap-2 rounded-xl border border-border/80 bg-card p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchField
          value={search.search}
          onChange={search.setSearch}
          placeholder="Buscar por código o nombre…"
          aria-label="Buscar cuestionarios"
          className="w-full sm:max-w-xs sm:flex-1"
          inputClassName="h-9 rounded-xl text-xs"
        />

        <div className="w-full sm:w-52">
          <OptionsCombobox
            size="sm"
            options={moduloOptions}
            value={moduloOrigen}
            onValueChange={(next) => {
              setModuloOrigen(next)
              search.setPage(0)
            }}
            placeholder="Todos los módulos"
            ariaLabel="Filtrar por módulo"
            showClear
          />
        </div>

        <div className="w-full sm:w-44">
          <OptionsCombobox
            size="sm"
            options={ESTADO_CUESTIONARIO_OPTIONS}
            value={estado}
            onValueChange={(next) => {
              setEstado(next as EstadoCuestionario | "")
              search.setPage(0)
            }}
            placeholder="Todos los estados"
            ariaLabel="Filtrar por estado"
            showClear
          />
        </div>

        {hasFilters ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleClearFilters}
            className="h-9 gap-1.5 rounded-xl px-3 text-xs"
          >
            <X className="size-3.5" />
            Limpiar
          </Button>
        ) : null}
      </div>

      {/* Tabla principal */}
      {listQuery.isLoading ? (
        <div
          aria-busy="true"
          className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xs"
        >
          <ListSkeleton rows={5} rowClassName="h-14 rounded-lg" />
        </div>
      ) : listQuery.isError ? (
        <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xs">
          <EmptyState
            icon={<AlertCircle className="size-6 text-destructive" />}
            title="Error al cargar cuestionarios"
            description={getErrorMessage(listQuery.error)}
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void listQuery.refetch()}
                className="gap-1.5"
              >
                <RefreshCw className="size-3.5" />
                Reintentar
              </Button>
            }
          />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          page={listQuery.data}
          onPageChange={search.setPage}
          emptyIcon={<ClipboardList className="size-6 text-muted-foreground" />}
          emptyTitle={
            hasFilters
              ? "No hay cuestionarios con los filtros seleccionados"
              : "Aún no existen cuestionarios configurados"
          }
          emptyDescription={
            hasFilters
              ? "Prueba con otros criterios de búsqueda o limpia los filtros activos."
              : "Crea un cuestionario para evaluar conductores, servicios o procesos operativos."
          }
          emptyAction={
            hasFilters ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
              >
                Limpiar filtros
              </Button>
            ) : isAdmin ? (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setEditingItem(null)
                  setFormOpen(true)
                }}
                className="gap-1.5"
              >
                <FilePlus2 className="size-3.5" />
                Crear primer cuestionario
              </Button>
            ) : undefined
          }
        />
      )}

      {/* Diálogo crear/editar */}
      <CuestionarioFormDialog
        open={formOpen}
        onOpenChange={(next) => {
          setFormOpen(next)
          if (!next) setEditingItem(null)
        }}
        cuestionario={editingItem}
        onSaved={(saved) => {
          if (!editingItem) {
            void navigate({
              to: routes.cuestionarios.constructor(saved.id),
            })
          }
        }}
      />

      {/* Confirmar reemplazo al publicar */}
      <AlertDialog
        open={Boolean(conflictPublishItem)}
        onOpenChange={(open) => {
          if (!open) setConflictPublishItem(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Ya existe un cuestionario publicado
            </AlertDialogTitle>
            <AlertDialogDescription>
              {conflictPublishItem?.message ||
                "Existe otra versión publicada para el mismo disparador."}{" "}
              ¿Deseas publicar{" "}
              <strong>{conflictPublishItem?.item.nombre}</strong> (v
              {conflictPublishItem?.item.version}) e inactivar automáticamente
              la versión activa anterior?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={publicarMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={publicarMutation.isPending}
              onClick={() => void handleConfirmReplacePublish()}
            >
              {publicarMutation.isPending
                ? "Publicando…"
                : "Reemplazar y publicar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmar inactivación */}
      <AlertDialog
        open={Boolean(inactivatingItem)}
        onOpenChange={(open) => {
          if (!open) setInactivatingItem(null)
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Inactivar cuestionario</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Deseas inactivar{" "}
              <strong>{inactivatingItem?.nombre}</strong>? Dejará de generar
              nuevas evaluaciones automáticas, pero conservará las respuestas ya
              registradas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={inactivarMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={inactivarMutation.isPending}
              onClick={() => void handleConfirmInactivar()}
            >
              {inactivarMutation.isPending ? "Inactivando…" : "Inactivar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmar eliminación */}
      <ConfirmDeleteDialog
        open={Boolean(deletingItem)}
        onOpenChange={(open) => {
          if (!open) setDeletingItem(null)
        }}
        title="Eliminar cuestionario"
        description={`¿Estás seguro de que deseas eliminar "${deletingItem?.nombre ?? ""}"? Esta acción es permanente.`}
        confirmLabel="Eliminar"
        isPending={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </PageShell>
  )
}
