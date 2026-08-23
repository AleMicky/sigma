import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { categoriaQueries } from "@/modules/activos/categoria/api/categoria.queries"
import { getErrorMessage } from "@/shared/api"
import { MasterDetailLayout } from "@/shared/components/master-detail"
import { RefreshButton } from "@/shared/components/refresh-button"
import { Button } from "@/shared/components/ui/button"
import { useMasterDetail } from "@/shared/hooks/use-master-detail"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"

import { tipoActivoQueries } from "../api/tipo-activo.queries"
import type { TipoActivo } from "../api/tipo-activo.service"
import { TipoActivoDetailPanel } from "../components/TipoActivoDetailPanel"
import { TipoActivoFormDialog } from "../components/TipoActivoFormDialog"
import { TipoActivoMasterPanel } from "../components/TipoActivoMasterPanel"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function TiposActivoPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TipoActivo | null>(null)

  const search = usePaginatedSearch()

  const tiposQuery = useQuery(
    tipoActivoQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const categoriasQuery = useQuery(
    categoriaQueries.list({
      page: 0,
      size: 100,
      sortBy: "orden",
      direction: "ASC",
    }),
  )

  const categorias = useMemo(
    () => categoriasQuery.data?.content ?? [],
    [categoriasQuery.data?.content],
  )

  const categoriasById = useMemo(
    () =>
      new Map(
        categorias.map((categoria) => [categoria.id, categoria.nombre]),
      ),
    [categorias],
  )

  const tipos = tiposQuery.data?.content ?? []

  useClampPage(search.page, search.setPage, tiposQuery.data?.totalPages)

  const masterDetail = useMasterDetail(tipos)

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(tipoActivo: TipoActivo) {
    setEditing(tipoActivo)
    setDialogOpen(true)
  }

  return (
    <div className="flex h-full flex-col min-h-0">
      <MasterDetailLayout
        title={
          masterDetail.isMobile &&
          masterDetail.mobileShowDetail &&
          masterDetail.selected
            ? masterDetail.selected.nombre
            : "Tipos de Activo"
        }
        showMaster={masterDetail.showMaster}
        showDetail={masterDetail.showDetail}
        showBack={masterDetail.isMobile && masterDetail.mobileShowDetail}
        backLabel="Volver a tipos de activo"
        onBack={masterDetail.backToMaster}
        headerAction={
          <div className="flex items-center gap-1.5 sm:gap-2">
            <RefreshButton
              size="sm"
              queries={[tiposQuery, categoriasQuery]}
            />

            <Button
              size="sm"
              type="button"
              onClick={openCreate}
              className="shrink-0 gap-1 shadow-2xs"
            >
              <Plus className="size-3.5" />
              <span>Nuevo Tipo</span>
            </Button>
          </div>
        }
        master={
          <TipoActivoMasterPanel
            tipos={tipos}
            page={tiposQuery.data}
            selectedId={masterDetail.selectedId}
            search={search.search}
            isLoading={tiposQuery.isLoading}
            isFetching={tiposQuery.isFetching}
            errorMessage={
              tiposQuery.isError
                ? getErrorMessage(tiposQuery.error)
                : null
            }
            categoriasById={categoriasById}
            onSearchChange={search.setSearch}
            onSelect={masterDetail.select}
            onCreate={openCreate}
            onEdit={openEdit}
            onPageChange={search.setPage}
          />
        }
        detail={
          <TipoActivoDetailPanel
            tipoActivo={masterDetail.selected}
          />
        }
      >
        <TipoActivoFormDialog
          key={editing?.id ?? "new-tipo"}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          tipoActivo={editing}
          onSuccess={(saved) => {
            masterDetail.revealDetail(saved.id)
            if (!editing) {
              search.setPage(0)
            }
          }}
        />
      </MasterDetailLayout>
    </div>
  )
}
