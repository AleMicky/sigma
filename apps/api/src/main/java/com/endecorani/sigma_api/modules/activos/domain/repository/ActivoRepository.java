package com.endecorani.sigma_api.modules.activos.domain.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ActivoRepository extends CrudRepository<Activo, UUID> {

    Page<Activo> findByTipoActivoId(UUID tipoActivoId, Pageable pageable);

    Page<Activo> searchByTipoActivoId(
            UUID tipoActivoId,
            String query,
            Pageable pageable);

    Page<Activo> search(String query, Pageable pageable);

    Page<Activo> findAllFiltered(
            UUID tipoActivoId,
            Boolean activo,
            Pageable pageable);

    /** REQ-BIZ-006: versión con filtro de ubicación. */
    Page<Activo> findAllFiltered(
            UUID tipoActivoId,
            UUID ubicacionId,
            Boolean activo,
            Pageable pageable);

    Page<Activo> searchFiltered(
            String query,
            UUID tipoActivoId,
            Boolean activo,
            Pageable pageable);

    /** REQ-BIZ-006: versión con filtro de ubicación. */
    Page<Activo> searchFiltered(
            String query,
            UUID tipoActivoId,
            UUID ubicacionId,
            Boolean activo,
            Pageable pageable);

    /** REQ-BIZ-006: agregación con exactamente los mismos filtros del listado. */
    ActivoResumenProjection summarize(
            String query,
            UUID tipoActivoId,
            UUID ubicacionId,
            Boolean activo);

    Page<Activo> searchDisponibilidad(
            String query,
            UUID estadoOperativoId,
            UUID tipoActivoId,
            UUID categoriaId,
            UUID ubicacionId,
            Boolean activo,
            Pageable pageable);

    java.util.List<Activo> findForDisponibilidadExport(
            String query,
            UUID estadoOperativoId,
            UUID tipoActivoId,
            UUID categoriaId,
            UUID ubicacionId,
            Boolean activo);

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id);
}
