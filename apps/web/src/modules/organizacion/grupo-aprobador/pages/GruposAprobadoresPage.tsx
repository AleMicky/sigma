import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { HelpCircle, Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { MasterDetailLayout } from "@/shared/components/master-detail"
import { RefreshButton } from "@/shared/components/refresh-button"
import { Button } from "@/shared/components/ui/button"
import { useMasterDetail } from "@/shared/hooks/use-master-detail"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"

import type { GrupoAprobadorDependiente } from "../../grupo-aprobador-dependiente/api/grupo-aprobador-dependiente.service"
import { GrupoAprobadorDependienteFormDialog } from "../../grupo-aprobador-dependiente/components/GrupoAprobadorDependienteFormDialog"
import type { GrupoAprobadorDetalle } from "../../grupo-aprobador-detalle/api/grupo-aprobador-detalle.service"
import { GrupoAprobadorDetalleFormDialog } from "../../grupo-aprobador-detalle/components/GrupoAprobadorDetalleFormDialog"
import { GrupoAprobadorDetailPanel } from "../../grupo-aprobador-detalle/components/GrupoAprobadorDetailPanel"
import { grupoAprobadorQueries } from "../api/grupo-aprobador.queries"
import type { GrupoAprobador } from "../api/grupo-aprobador.service"
import { GrupoAprobadorFormDialog } from "../components/GrupoAprobadorFormDialog"
import { GrupoAprobadorHelpModal } from "../components/GrupoAprobadorHelpModal"
import { GrupoAprobadorMasterPanel } from "../components/GrupoAprobadorMasterPanel"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function GruposAprobadoresPage() {
  const [grupoDialogOpen, setGrupoDialogOpen] = useState(false)
  const [editingGrupo, setEditingGrupo] = useState<GrupoAprobador | null>(null)
  const [detalleDialogOpen, setDetalleDialogOpen] = useState(false)
  const [editingDetalle, setEditingDetalle] =
    useState<GrupoAprobadorDetalle | null>(null)
  const [dependienteDialogOpen, setDependienteDialogOpen] = useState(false)
  const [editingDependiente, setEditingDependiente] =
    useState<GrupoAprobadorDependiente | null>(null)
  const [helpModalOpen, setHelpModalOpen] = useState(false)

  const grupoSearch = usePaginatedSearch()

  const gruposQuery = useQuery(
    grupoAprobadorQueries.list({
      page: grupoSearch.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(grupoSearch.query ? { q: grupoSearch.query } : {}),
    }),
  )

  const grupos = gruposQuery.data?.content ?? []

  useClampPage(
    grupoSearch.page,
    grupoSearch.setPage,
    gruposQuery.data?.totalPages,
  )

  const masterDetail = useMasterDetail(grupos)
  const detalleSearch = usePaginatedSearch({
    resetKey: masterDetail.selectedId,
  })

  function openCreateGrupo() {
    setEditingGrupo(null)
    setGrupoDialogOpen(true)
  }

  function openEditGrupo(grupo: GrupoAprobador) {
    setEditingGrupo(grupo)
    setGrupoDialogOpen(true)
  }

  function openCreateDetalle() {
    setEditingDetalle(null)
    setDetalleDialogOpen(true)
  }

  function openEditDetalle(detalle: GrupoAprobadorDetalle) {
    setEditingDetalle(detalle)
    setDetalleDialogOpen(true)
  }

  function openCreateDependiente() {
    setEditingDependiente(null)
    setDependienteDialogOpen(true)
  }

  function openEditDependiente(dependiente: GrupoAprobadorDependiente) {
    setEditingDependiente(dependiente)
    setDependienteDialogOpen(true)
  }

  return (
    <div className="flex h-full flex-col min-h-0">
      <MasterDetailLayout
        title={
          masterDetail.isMobile &&
          masterDetail.mobileShowDetail &&
          masterDetail.selected
            ? masterDetail.selected.nombre
            : "Grupos Aprobadores"
        }
        showMaster={masterDetail.showMaster}
        showDetail={masterDetail.showDetail}
        showBack={masterDetail.isMobile && masterDetail.mobileShowDetail}
        backLabel="Volver a grupos"
        onBack={masterDetail.backToMaster}
        headerAction={
          <div className="flex items-center gap-1.5 sm:gap-2">
            <RefreshButton size="sm" queries={[gruposQuery]} />

            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => setHelpModalOpen(true)}
              className="shrink-0 gap-1.5 text-xs"
              title="Guía de grupos aprobadores y flujos"
            >
              <HelpCircle className="size-3.5 text-primary" />
              <span className="hidden sm:inline">Guía</span>
            </Button>

            {masterDetail.showMaster ? (
              <Button
                size="sm"
                type="button"
                onClick={openCreateGrupo}
                className="shrink-0 gap-1 shadow-2xs"
              >
                <Plus className="size-3.5" />
                <span>Crear Grupo</span>
              </Button>
            ) : null}
          </div>
        }
        master={
          <GrupoAprobadorMasterPanel
            grupos={grupos}
            page={gruposQuery.data}
            selectedId={masterDetail.selectedId}
            search={grupoSearch.search}
            isLoading={gruposQuery.isLoading}
            isFetching={gruposQuery.isFetching}
            errorMessage={
              gruposQuery.isError
                ? getErrorMessage(gruposQuery.error)
                : null
            }
            onSearchChange={grupoSearch.setSearch}
            onSelect={masterDetail.select}
            onCreate={openCreateGrupo}
            onEdit={openEditGrupo}
            onPageChange={grupoSearch.setPage}
          />
        }
        detail={
          <GrupoAprobadorDetailPanel
            grupo={masterDetail.selected}
            itemPage={detalleSearch.page}
            search={detalleSearch.search}
            searchQuery={detalleSearch.debouncedSearch}
            hidePrimaryAction={
              masterDetail.isMobile && masterDetail.mobileShowDetail
            }
            onSearchChange={detalleSearch.setSearch}
            onPageChange={detalleSearch.setPage}
            onAddAprobador={openCreateDetalle}
            onEditAprobador={openEditDetalle}
            onAddDependiente={openCreateDependiente}
            onEditDependiente={openEditDependiente}
          />
        }
      >
        {/* Modal para Crear / Editar Grupo Aprobador */}
        <GrupoAprobadorFormDialog
          key={editingGrupo?.id ?? "new-grupo"}
          open={grupoDialogOpen}
          onOpenChange={setGrupoDialogOpen}
          grupo={editingGrupo}
          onSuccess={(saved) => {
            masterDetail.revealDetail(saved.id)
            grupoSearch.setPage(0)
          }}
        />

        {/* Modal para Agregar / Editar Aprobador */}
        {masterDetail.selected ? (
          <GrupoAprobadorDetalleFormDialog
            key={
              editingDetalle?.id ??
              `new-detalle-${masterDetail.selected.id}`
            }
            grupoAprobadorId={masterDetail.selected.id}
            open={detalleDialogOpen}
            onOpenChange={setDetalleDialogOpen}
            detalle={editingDetalle}
            onSuccess={() => {
              if (!editingDetalle) {
                detalleSearch.setPage(0)
              }
            }}
          />
        ) : null}

        {/* Modal para Asociar / Editar Dependiente */}
        {masterDetail.selected ? (
          <GrupoAprobadorDependienteFormDialog
            key={
              editingDependiente?.id ??
              `new-dependiente-${masterDetail.selected.id}`
            }
            grupoAprobadorId={masterDetail.selected.id}
            grupoAprobadorNombre={masterDetail.selected.nombre}
            open={dependienteDialogOpen}
            onOpenChange={setDependienteDialogOpen}
            dependiente={editingDependiente}
            onSuccess={() => {
              if (!editingDependiente) {
                detalleSearch.setPage(0)
              }
            }}
          />
        ) : null}

        {/* Modal de Ayuda */}
        <GrupoAprobadorHelpModal
          open={helpModalOpen}
          onOpenChange={setHelpModalOpen}
        />
      </MasterDetailLayout>
    </div>
  )
}
