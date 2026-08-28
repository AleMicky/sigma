import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Check,
  CheckCircle2,
  Copy,
  FolderTree,
  KeyRound,
  Link as LinkIcon,
  Loader2,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  Wand2,
  X,
} from "lucide-react"

import { DynamicLucideIcon } from "@/modules/seguridad/menu/components/DynamicLucideIcon"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"
import { cn } from "@/shared/lib/utils"

import {
  useCreatePermiso,
  useDeletePermiso,
  useUpdatePermiso,
} from "../api/permiso.mutations"
import { permisoQueries } from "../api/permiso.queries"
import type { Permiso } from "../api/permiso.service"
import { PermisoFormDialog } from "./PermisoFormDialog"
import { PermisoMethodBadge } from "./PermisoMethodBadge"

type MenuTarget = {
  id: string
  nombre: string
  codigo: string
  icono?: string | null
  ruta?: string | null
}

type MenuPermisosSheetProps = {
  menu: MenuTarget | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MenuPermisosSheet({
  menu,
  open,
  onOpenChange,
}: MenuPermisosSheetProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMethod, setSelectedMethod] = useState<string>("ALL")
  const [formOpen, setFormOpen] = useState(false)
  const [editingPermiso, setEditingPermiso] = useState<Permiso | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isGeneratingCrud, setIsGeneratingCrud] = useState(false)

  const permisosQuery = useQuery({
    ...permisoQueries.byMenu(menu?.id ?? ""),
    enabled: Boolean(menu?.id && open),
  })

  const createMutation = useCreatePermiso()
  const updateMutation = useUpdatePermiso()
  const deleteMutation = useDeletePermiso()

  const permisos = permisosQuery.data ?? []

  // Filter permisos by query & method
  const filteredPermisos = useMemo(() => {
    let list = permisos
    const q = searchQuery.toLowerCase().trim()

    if (selectedMethod !== "ALL") {
      list = list.filter(
        (p) => p.metodoHttp.toUpperCase() === selectedMethod.toUpperCase(),
      )
    }

    if (q) {
      list = list.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.codigo.toLowerCase().includes(q) ||
          p.ruta.toLowerCase().includes(q) ||
          (p.descripcion && p.descripcion.toLowerCase().includes(q)),
      )
    }

    return list
  }, [permisos, searchQuery, selectedMethod])

  // Count by method
  const methodCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of permisos) {
      const m = p.metodoHttp.toUpperCase()
      counts[m] = (counts[m] ?? 0) + 1
    }
    return counts
  }, [permisos])

  const selectedDeletePermiso = permisos.find((p) => p.id === deleteId)

  function openCreate() {
    setEditingPermiso(null)
    setFormOpen(true)
  }

  function openEdit(permiso: Permiso) {
    setEditingPermiso(permiso)
    setFormOpen(true)
  }

  function handleCopy(text: string, id: string) {
    void navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
  }

  async function handleToggleActive(permiso: Permiso) {
    await updateMutation.mutateAsync({
      id: permiso.id,
      payload: {
        menuId: permiso.menuId,
        codigo: permiso.codigo,
        nombre: permiso.nombre,
        descripcion: permiso.descripcion,
        metodoHttp: permiso.metodoHttp,
        ruta: permiso.ruta,
        activo: !permiso.activo,
      },
    })
  }

  // Quick auto-generate 4 standard CRUD permissions for this menu
  async function handleAutoGenerateCrud() {
    if (!menu) return
    setIsGeneratingCrud(true)
    const baseSlug = menu.nombre.toUpperCase().replace(/[^A-Z0-9]/gi, "_")
    const baseRoute = menu.ruta
      ? menu.ruta.startsWith("/api/v1")
        ? menu.ruta
        : `/api/v1${menu.ruta.startsWith("/") ? menu.ruta : `/${menu.ruta}`}`
      : `/api/v1/${menu.codigo.toLowerCase()}`

    const standardTemplates = [
      {
        codigo: `VER_${baseSlug}`,
        nombre: `Listar y consultar ${menu.nombre}`,
        metodoHttp: "GET",
        ruta: `${baseRoute.replace(/\/+$/, "")}`,
        descripcion: `Permite consultar y listar registros del módulo ${menu.nombre}`,
      },
      {
        codigo: `CREAR_${baseSlug}`,
        nombre: `Crear ${menu.nombre}`,
        metodoHttp: "POST",
        ruta: `${baseRoute.replace(/\/+$/, "")}`,
        descripcion: `Permite registrar nuevos elementos en el módulo ${menu.nombre}`,
      },
      {
        codigo: `ACTUALIZAR_${baseSlug}`,
        nombre: `Actualizar ${menu.nombre}`,
        metodoHttp: "PUT",
        ruta: `${baseRoute.replace(/\/+$/, "")}/{id}`,
        descripcion: `Permite editar registros del módulo ${menu.nombre}`,
      },
      {
        codigo: `ELIMINAR_${baseSlug}`,
        nombre: `Eliminar ${menu.nombre}`,
        metodoHttp: "DELETE",
        ruta: `${baseRoute.replace(/\/+$/, "")}/{id}`,
        descripcion: `Permite eliminar registros del módulo ${menu.nombre}`,
      },
    ]

    try {
      for (const t of standardTemplates) {
        const exists = permisos.some(
          (p) => p.codigo === t.codigo || (p.metodoHttp === t.metodoHttp && p.ruta === t.ruta),
        )
        if (!exists) {
          await createMutation.mutateAsync({
            menuId: menu.id,
            ...t,
            activo: true,
          })
        }
      }
    } finally {
      setIsGeneratingCrud(false)
    }
  }

  if (!menu) return null

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full data-[side=right]:sm:max-w-lg data-[side=right]:md:max-w-xl p-0 flex flex-col justify-between overflow-hidden"
        >
          {/* Header Compacto */}
          <SheetHeader className="px-4 py-3 sm:px-5 sm:py-3.5 border-b bg-muted/20 space-y-2">
            <div className="flex items-center justify-between gap-3 pr-8">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-2xs shrink-0">
                  <DynamicLucideIcon
                    name={menu.icono ?? undefined}
                    className="size-4"
                    fallback={FolderTree}
                  />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <SheetTitle className="text-base font-bold truncate">
                      Permisos de Seguridad
                    </SheetTitle>
                    <code className="rounded bg-muted px-1.5 py-0.2 font-mono text-[10px] text-muted-foreground font-semibold shrink-0">
                      {menu.codigo}
                    </code>
                  </div>
                  <SheetDescription className="text-[11px] text-muted-foreground truncate">
                    Menú: <span className="font-semibold text-foreground">{menu.nombre}</span>
                    {menu.ruta && (
                      <span className="font-mono ml-1.5 text-primary text-[10.5px]">
                        ({menu.ruta})
                      </span>
                    )}
                  </SheetDescription>
                </div>
              </div>

              <Button
                size="sm"
                onClick={openCreate}
                className="h-7 text-xs gap-1 shrink-0 shadow-2xs cursor-pointer px-2.5"
              >
                <Plus className="size-3" />
                <span>Nuevo</span>
              </Button>
            </div>

            {/* Counters Bar Compacto */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 text-[11px]">
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="gap-1 text-[10.5px] font-mono py-0 h-5">
                  <KeyRound className="size-2.5 text-primary" />
                  <span>
                    {permisos.length} {permisos.length === 1 ? "permiso" : "permisos"}
                  </span>
                </Badge>

                {permisos.length > 0 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono py-0 h-5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                  >
                    {permisos.filter((p) => p.activo).length} activos
                  </Badge>
                )}
              </div>

              {/* Botón Generador Automático CRUD */}
              {permisos.length < 4 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAutoGenerateCrud}
                  disabled={isGeneratingCrud || createMutation.isPending}
                  className="h-5.5 text-[10.5px] px-2 gap-1 border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
                  title="Generar automáticamente los 4 permisos estándar GET, POST, PUT, DELETE"
                >
                  {isGeneratingCrud ? (
                    <Loader2 className="size-2.5 animate-spin" />
                  ) : (
                    <Wand2 className="size-2.5" />
                  )}
                  <span>Generar CRUD</span>
                </Button>
              )}
            </div>
          </SheetHeader>

          {/* Search and Method Filters Compacto */}
          <div className="px-4 py-2 sm:px-5 sm:py-2.5 border-b bg-card space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por código, nombre o endpoint…"
                className="pl-7 pr-7 text-xs h-7.5"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            {/* Method Filter Pills */}
            <div className="flex flex-wrap items-center gap-1 text-[10.5px]">
              <button
                type="button"
                onClick={() => setSelectedMethod("ALL")}
                className={cn(
                  "px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer",
                  selectedMethod === "ALL"
                    ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground bg-muted/50",
                )}
              >
                Todos ({permisos.length})
              </button>

              {["GET", "POST", "PUT", "DELETE", "PATCH"].map((method) => {
                const count = methodCounts[method] ?? 0
                if (count === 0 && selectedMethod !== method) return null
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() =>
                      setSelectedMethod((prev) => (prev === method ? "ALL" : method))
                    }
                    className={cn(
                      "px-2 py-0.5 rounded-md font-mono text-[9.5px] font-semibold transition-all cursor-pointer flex items-center gap-0.5",
                      selectedMethod === method
                        ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                        : "text-muted-foreground hover:text-foreground bg-muted/60",
                    )}
                  >
                    <span>{method}</span>
                    <span className="opacity-75">({count})</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* List Content Compacto */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 sm:px-5 sm:py-3 space-y-1.5 overscroll-contain">
            {permisosQuery.isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2.5 text-muted-foreground">
                <Loader2 className="size-5 animate-spin text-primary" />
                <p className="text-xs">Cargando permisos…</p>
              </div>
            ) : filteredPermisos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-2.5">
                <Shield className="size-8 stroke-1 text-muted-foreground/50" />
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">
                    {searchQuery || selectedMethod !== "ALL"
                      ? "Sin resultados para el filtro"
                      : "No hay permisos asignados"}
                  </p>
                  <p className="text-[11px] text-muted-foreground/70 max-w-xs">
                    {searchQuery || selectedMethod !== "ALL"
                      ? "Prueba cambiando el método HTTP o limpiando la búsqueda."
                      : "Crea el primer permiso o genera automáticamente los endpoints CRUD."}
                  </p>
                </div>
                {searchQuery || selectedMethod !== "ALL" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedMethod("ALL")
                    }}
                    className="h-7 text-xs mt-1"
                  >
                    Limpiar filtros
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={openCreate}
                      className="h-7 text-xs gap-1"
                    >
                      <Plus className="size-3" />
                      <span>Crear Permiso</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAutoGenerateCrud}
                      disabled={isGeneratingCrud}
                      className="h-7 text-xs gap-1 text-primary border-primary/30 hover:bg-primary/10"
                    >
                      <Sparkles className="size-3" />
                      <span>Generar CRUD</span>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredPermisos.map((permiso) => {
                  const isCopied = copiedId === permiso.id
                  return (
                    <div
                      key={permiso.id}
                      className={cn(
                        "group rounded-lg border border-border/70 bg-card px-3 py-2 transition-all hover:border-primary/40 hover:shadow-2xs space-y-1.5",
                        !permiso.activo && "opacity-60 bg-muted/20",
                      )}
                    >
                      {/* Top Row: Method, Name, Code, Status & Actions */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <PermisoMethodBadge method={permiso.metodoHttp} size="sm" />

                          <span className="text-xs font-semibold text-foreground truncate">
                            {permiso.nombre}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleCopy(permiso.codigo, permiso.id)}
                            title="Copiar código"
                            className="group/code hidden sm:inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.2 font-mono text-[9.5px] text-muted-foreground hover:bg-primary/15 hover:text-primary transition-colors cursor-pointer shrink-0"
                          >
                            <span>{permiso.codigo}</span>
                            {isCopied ? (
                              <Check className="size-2.5 text-emerald-500" />
                            ) : (
                              <Copy className="size-2.5 opacity-50 group-hover/code:opacity-100" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {/* Active toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleActive(permiso)}
                            disabled={updateMutation.isPending}
                            title={
                              permiso.activo
                                ? "Desactivar permiso"
                                : "Activar permiso"
                            }
                            className="cursor-pointer"
                          >
                            <Badge
                              variant={permiso.activo ? "default" : "outline"}
                              className={cn(
                                "text-[9px] py-0 px-1 font-medium cursor-pointer transition-all h-4",
                                permiso.activo
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                                  : "text-destructive border-destructive/40 hover:bg-destructive/10",
                              )}
                            >
                              {permiso.activo ? (
                                <span className="flex items-center gap-0.5">
                                  <CheckCircle2 className="size-2 mr-0.5" />
                                  Activo
                                </span>
                              ) : (
                                <span className="flex items-center gap-0.5">
                                  <ShieldAlert className="size-2 mr-0.5" />
                                  Inactivo
                                </span>
                              )}
                            </Badge>
                          </button>

                          <RowActions
                            editLabel="Editar permiso"
                            deleteLabel="Eliminar permiso"
                            deleteDisabled={deleteMutation.isPending}
                            onEdit={() => openEdit(permiso)}
                            onDelete={() => setDeleteId(permiso.id)}
                          />
                        </div>
                      </div>

                      {/* Route & Description Row */}
                      <div className="flex items-center justify-between gap-2 text-[10.5px]">
                        <div className="flex items-center gap-1 font-mono text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded border border-border/40 min-w-0 truncate">
                          <LinkIcon className="size-2.5 shrink-0 text-primary opacity-80" />
                          <span className="truncate select-all">{permiso.ruta}</span>
                        </div>

                        {permiso.descripcion && (
                          <span className="hidden md:inline-block text-[10.5px] text-muted-foreground/75 italic truncate max-w-[180px]">
                            {permiso.descripcion}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Form Dialog for Create / Edit */}
      <PermisoFormDialog
        key={`${editingPermiso?.id ?? "new"}-${menu.id}-${formOpen ? "open" : "closed"}`}
        open={formOpen}
        onOpenChange={setFormOpen}
        menuId={menu.id}
        menuName={menu.nombre}
        menuRoute={menu.ruta}
        permiso={editingPermiso}
      />

      {/* Delete Confirmation */}
      <ConfirmDeleteDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Eliminar permiso"
        description={`¿Seguro que deseas eliminar el permiso "${selectedDeletePermiso?.nombre}" (${selectedDeletePermiso?.codigo})? Esta acción no se puede deshacer.`}
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (deleteId) {
            await deleteMutation.mutateAsync(deleteId)
            setDeleteId(null)
          }
        }}
      />
    </>
  )
}
