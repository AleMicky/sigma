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

import type { TipoInsumoAtributo } from "../../tipo-insumo-atributo/api/tipo-insumo-atributo.service"
import { TipoInsumoAtributoFormDialog } from "../../tipo-insumo-atributo/components/TipoInsumoAtributoFormDialog"
import { tipoInsumoQueries } from "../api/tipo-insumo.queries"
import type { TipoInsumo } from "../api/tipo-insumo.service"
import { TipoInsumoDetailPanel } from "../components/TipoInsumoDetailPanel"
import { TipoInsumoFormDialog } from "../components/TipoInsumoFormDialog"
import { TipoInsumoHelpModal } from "../components/TipoInsumoHelpModal"
import { TipoInsumoMasterPanel } from "../components/TipoInsumoMasterPanel"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function TiposInsumoPage() {
  const [tipoDialogOpen, setTipoDialogOpen] = useState(false)
  const [editingTipo, setEditingTipo] = useState<TipoInsumo | null>(null)
  const [atributoDialogOpen, setAtributoDialogOpen] = useState(false)
  const [editingAtributo, setEditingAtributo] =
    useState<TipoInsumoAtributo | null>(null)
  const [helpModalOpen, setHelpModalOpen] = useState(false)

  const tipoSearch = usePaginatedSearch()

  const tiposQuery = useQuery(
    tipoInsumoQueries.list({
      page: tipoSearch.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(tipoSearch.query ? { q: tipoSearch.query } : {}),
    }),
  )

  const tipos = tiposQuery.data?.content ?? []

  useClampPage(
    tipoSearch.page,
    tipoSearch.setPage,
    tiposQuery.data?.totalPages,
  )

  const masterDetail = useMasterDetail(tipos)
  const atributoSearch = usePaginatedSearch({
    resetKey: masterDetail.selectedId,
  })

  function openCreateTipo() {
    setEditingTipo(null)
    setTipoDialogOpen(true)
  }

  function openEditTipo(tipo: TipoInsumo) {
    setEditingTipo(tipo)
    setTipoDialogOpen(true)
  }

  function openCreateAtributo() {
    setEditingAtributo(null)
    setAtributoDialogOpen(true)
  }

  function openEditAtributo(attr: TipoInsumoAtributo) {
    setEditingAtributo(attr)
    setAtributoDialogOpen(true)
  }

  return (
    <div className="flex h-full flex-col min-h-0">
      <MasterDetailLayout
        title={
          masterDetail.isMobile &&
          masterDetail.mobileShowDetail &&
          masterDetail.selected
            ? masterDetail.selected.nombre
            : "Tipos de Insumo"
        }
        showMaster={masterDetail.showMaster}
        showDetail={masterDetail.showDetail}
        showBack={masterDetail.isMobile && masterDetail.mobileShowDetail}
        backLabel="Volver a tipos de insumo"
        onBack={masterDetail.backToMaster}
        headerAction={
          <div className="flex items-center gap-1.5 sm:gap-2">
            <RefreshButton
              size="sm"
              queries={[tiposQuery]}
            />

            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => setHelpModalOpen(true)}
              className="shrink-0 gap-1.5 text-xs"
              title="Guía de tipos de insumo y atributos dinámicos"
            >
              <HelpCircle className="size-3.5 text-primary" />
              <span className="hidden sm:inline">Guía</span>
            </Button>

            {masterDetail.showMaster ? (
              <Button
                size="sm"
                type="button"
                onClick={openCreateTipo}
                className="shrink-0 gap-1 shadow-2xs"
              >
                <Plus className="size-3.5" />
                <span>Nuevo Tipo</span>
              </Button>
            ) : (
              <Button
                size="sm"
                type="button"
                onClick={openCreateAtributo}
                className="shrink-0 gap-1 shadow-2xs"
              >
                <Plus className="size-3.5" />
                <span>Agregar Atributo</span>
              </Button>
            )}
          </div>
        }
        master={
          <TipoInsumoMasterPanel
            tipos={tipos}
            page={tiposQuery.data}
            selectedId={masterDetail.selectedId}
            search={tipoSearch.search}
            isLoading={tiposQuery.isLoading}
            isFetching={tiposQuery.isFetching}
            errorMessage={
              tiposQuery.isError
                ? getErrorMessage(tiposQuery.error)
                : null
            }
            onSearchChange={tipoSearch.setSearch}
            onSelect={masterDetail.select}
            onCreate={openCreateTipo}
            onEdit={openEditTipo}
            onPageChange={tipoSearch.setPage}
          />
        }
        detail={
          <TipoInsumoDetailPanel
            tipoInsumo={masterDetail.selected}
            search={atributoSearch.search}
            hidePrimaryAction={
              masterDetail.isMobile && masterDetail.mobileShowDetail
            }
            onSearchChange={atributoSearch.setSearch}
            onCreateAtributo={openCreateAtributo}
            onEditAtributo={openEditAtributo}
          />
        }
      >
        {/* Modal para Crear / Editar Tipo de Insumo */}
        <TipoInsumoFormDialog
          key={editingTipo?.id ?? "new-tipo"}
          open={tipoDialogOpen}
          onOpenChange={setTipoDialogOpen}
          tipoInsumo={editingTipo}
          onSuccess={(saved) => {
            masterDetail.revealDetail(saved.id)
            tipoSearch.setPage(0)
          }}
        />

        {/* Modal para Crear / Editar Atributo Dinámico */}
        {masterDetail.selected ? (
          <TipoInsumoAtributoFormDialog
            key={
              editingAtributo?.id ??
              `new-attr-${masterDetail.selected.id}`
            }
            tipoInsumoId={masterDetail.selected.id}
            open={atributoDialogOpen}
            onOpenChange={setAtributoDialogOpen}
            atributo={editingAtributo}
            onSuccess={() => {
              if (!editingAtributo) {
                atributoSearch.setPage(0)
              }
            }}
          />
        ) : null}

        {/* Modal de Ayuda */}
        <TipoInsumoHelpModal
          open={helpModalOpen}
          onOpenChange={setHelpModalOpen}
        />
      </MasterDetailLayout>
    </div>
  )
}
