package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoResumenProjection;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringActivoRepository
                extends BaseJpaRepository<ActivoEntity, UUID> {

        Page<ActivoEntity> findByTipoActivoId(UUID tipoActivoId, Pageable pageable);

        @Query("""
                        select activo
                        from ActivoEntity activo
                        where activo.tipoActivoId = :tipoActivoId
                          and (
                               lower(activo.codigo) like lower(concat('%', :query, '%'))
                               or (activo.codigoAlternativo is not null and lower(activo.codigoAlternativo) like lower(concat('%', :query, '%')))
                               or lower(activo.nombre) like lower(concat('%', :query, '%'))
                               or (activo.descripcion is not null and lower(activo.descripcion) like lower(concat('%', :query, '%')))
                          )
                        """)
        Page<ActivoEntity> searchByTipoActivoId(
                        @Param("tipoActivoId") UUID tipoActivoId,
                        @Param("query") String query,
                        Pageable pageable);

        @Query("""
                        select activo
                        from ActivoEntity activo
                        where lower(activo.codigo) like lower(concat('%', :query, '%'))
                           or (activo.codigoAlternativo is not null and lower(activo.codigoAlternativo) like lower(concat('%', :query, '%')))
                           or lower(activo.nombre) like lower(concat('%', :query, '%'))
                           or (activo.descripcion is not null and lower(activo.descripcion) like lower(concat('%', :query, '%')))
                        """)
        Page<ActivoEntity> search(
                        @Param("query") String query,
                        Pageable pageable);

        default Page<ActivoEntity> findAllFiltered(
                UUID tipoActivoId,
                Boolean activo,
                Pageable pageable) {
                return findAllFiltered(tipoActivoId, null, activo, pageable);
        }

        @Query("""
                SELECT a
                FROM ActivoEntity a
                WHERE (:tipoActivoId IS NULL OR a.tipoActivoId = :tipoActivoId)
                  AND (:ubicacionId IS NULL OR a.ubicacionId = :ubicacionId)
                  AND (:activo IS NULL OR a.activo = :activo)
                """)
        Page<ActivoEntity> findAllFiltered(
                @Param("tipoActivoId") UUID tipoActivoId,
                @Param("ubicacionId") UUID ubicacionId,
                @Param("activo") Boolean activo,
                Pageable pageable);

        default Page<ActivoEntity> searchFiltered(
                String query,
                UUID tipoActivoId,
                Boolean activo,
                Pageable pageable) {
                return searchFiltered(query, tipoActivoId, null, activo, pageable);
        }

        @Query("""
                SELECT a
                FROM ActivoEntity a
                WHERE (:tipoActivoId IS NULL OR a.tipoActivoId = :tipoActivoId)
                  AND (:ubicacionId IS NULL OR a.ubicacionId = :ubicacionId)
                  AND (:activo IS NULL OR a.activo = :activo)
                  AND (
                    CAST(:query AS String) IS NULL
                    OR LOWER(a.codigo) LIKE LOWER(CONCAT('%', CAST(:query AS String), '%'))
                    OR (a.codigoAlternativo IS NOT NULL AND LOWER(a.codigoAlternativo) LIKE LOWER(CONCAT('%', CAST(:query AS String), '%')))
                    OR LOWER(a.nombre) LIKE LOWER(CONCAT('%', CAST(:query AS String), '%'))
                    OR (a.descripcion IS NOT NULL AND LOWER(a.descripcion) LIKE LOWER(CONCAT('%', CAST(:query AS String), '%')))
                  )
                """)
        Page<ActivoEntity> searchFiltered(
                @Param("query") String query,
                @Param("tipoActivoId") UUID tipoActivoId,
                @Param("ubicacionId") UUID ubicacionId,
                @Param("activo") Boolean activo,
                Pageable pageable);

        /**
         * REQ-BIZ-006: deBaja = activo = false; enMantenimiento = nombre del
         * estado operativo contiene "mantenimiento"; operativos = no dado de
         * baja y sin mantenimiento. Se agrega en servidor con los mismos
         * filtros que el listado (q, tipo, ubicación y activo).
         */
        @Query("""
                SELECT COUNT(a) AS total,
                       COALESCE(SUM(CASE WHEN a.activo = false THEN 1 ELSE 0 END), 0) AS deBaja,
                       COALESCE(SUM(CASE WHEN LOWER(e.nombre) LIKE '%mantenimiento%' THEN 1 ELSE 0 END), 0) AS enMantenimiento,
                       COALESCE(SUM(CASE WHEN a.activo = true
                                          AND (e.nombre IS NULL OR LOWER(e.nombre) NOT LIKE '%mantenimiento%')
                                         THEN 1 ELSE 0 END), 0) AS operativos
                FROM ActivoEntity a
                LEFT JOIN a.estadoOperativo e
                WHERE (:tipoActivoId IS NULL OR a.tipoActivoId = :tipoActivoId)
                  AND (:ubicacionId IS NULL OR a.ubicacionId = :ubicacionId)
                  AND (:activo IS NULL OR a.activo = :activo)
                  AND (
                    CAST(:query AS String) IS NULL
                    OR LOWER(a.codigo) LIKE LOWER(CONCAT('%', CAST(:query AS String), '%'))
                    OR (a.codigoAlternativo IS NOT NULL AND LOWER(a.codigoAlternativo) LIKE LOWER(CONCAT('%', CAST(:query AS String), '%')))
                    OR LOWER(a.nombre) LIKE LOWER(CONCAT('%', CAST(:query AS String), '%'))
                    OR (a.descripcion IS NOT NULL AND LOWER(a.descripcion) LIKE LOWER(CONCAT('%', CAST(:query AS String), '%')))
                  )
                """)
        ActivoResumenProjection summarize(
                @Param("query") String query,
                @Param("tipoActivoId") UUID tipoActivoId,
                @Param("ubicacionId") UUID ubicacionId,
                @Param("activo") Boolean activo);

        @Query("""
                SELECT a
                FROM ActivoEntity a
                LEFT JOIN TipoActivoEntity ta ON a.tipoActivoId = ta.id
                WHERE (:estadoOperativoId IS NULL OR a.estadoOperativoId = :estadoOperativoId)
                  AND (:tipoActivoId IS NULL OR a.tipoActivoId = :tipoActivoId)
                  AND (:categoriaId IS NULL OR ta.categoriaId = :categoriaId)
                  AND (:ubicacionId IS NULL OR a.ubicacionId = :ubicacionId)
                  AND (:activo IS NULL OR a.activo = :activo)
                  AND (
                    CAST(:query AS String) IS NULL
                    OR LOWER(a.codigo) LIKE LOWER(CONCAT('%', CAST(:query AS String), '%'))
                    OR (a.codigoAlternativo IS NOT NULL AND LOWER(a.codigoAlternativo) LIKE LOWER(CONCAT('%', CAST(:query AS String), '%')))
                    OR LOWER(a.nombre) LIKE LOWER(CONCAT('%', CAST(:query AS String), '%'))
                    OR (a.descripcion IS NOT NULL AND LOWER(a.descripcion) LIKE LOWER(CONCAT('%', CAST(:query AS String), '%')))
                  )
                ORDER BY a.nombre ASC
                """)
        Page<ActivoEntity> searchDisponibilidad(
                @Param("query") String query,
                @Param("estadoOperativoId") UUID estadoOperativoId,
                @Param("tipoActivoId") UUID tipoActivoId,
                @Param("categoriaId") UUID categoriaId,
                @Param("ubicacionId") UUID ubicacionId,
                @Param("activo") Boolean activo,
                Pageable pageable);

        @Query("""
                SELECT a
                FROM ActivoEntity a
                LEFT JOIN TipoActivoEntity ta ON a.tipoActivoId = ta.id
                WHERE (:estadoOperativoId IS NULL OR a.estadoOperativoId = :estadoOperativoId)
                  AND (:tipoActivoId IS NULL OR a.tipoActivoId = :tipoActivoId)
                  AND (:categoriaId IS NULL OR ta.categoriaId = :categoriaId)
                  AND (:ubicacionId IS NULL OR a.ubicacionId = :ubicacionId)
                  AND (:activo IS NULL OR a.activo = :activo)
                  AND (
                    CAST(:query AS String) IS NULL
                    OR LOWER(a.codigo) LIKE LOWER(CONCAT('%', CAST(:query AS String), '%'))
                    OR (a.codigoAlternativo IS NOT NULL AND LOWER(a.codigoAlternativo) LIKE LOWER(CONCAT('%', CAST(:query AS String), '%')))
                    OR LOWER(a.nombre) LIKE LOWER(CONCAT('%', CAST(:query AS String), '%'))
                    OR (a.descripcion IS NOT NULL AND LOWER(a.descripcion) LIKE LOWER(CONCAT('%', CAST(:query AS String), '%')))
                  )
                ORDER BY a.nombre ASC
                """)
        java.util.List<ActivoEntity> findForDisponibilidadExport(
                @Param("query") String query,
                @Param("estadoOperativoId") UUID estadoOperativoId,
                @Param("tipoActivoId") UUID tipoActivoId,
                @Param("categoriaId") UUID categoriaId,
                @Param("ubicacionId") UUID ubicacionId,
                @Param("activo") Boolean activo);

        boolean existsByCodigoIgnoreCase(String codigo);

        boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id);
}
