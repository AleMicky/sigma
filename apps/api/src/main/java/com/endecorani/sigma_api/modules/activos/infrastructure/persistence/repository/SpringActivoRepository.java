package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

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
                           or lower(activo.nombre) like lower(concat('%', :query, '%'))
                           or (activo.descripcion is not null and lower(activo.descripcion) like lower(concat('%', :query, '%')))
                        """)
        Page<ActivoEntity> search(
                        @Param("query") String query,
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
                    :query IS NULL
                    OR LOWER(a.codigo) LIKE LOWER(CONCAT('%', :query, '%'))
                    OR LOWER(a.nombre) LIKE LOWER(CONCAT('%', :query, '%'))
                    OR (a.descripcion IS NOT NULL AND LOWER(a.descripcion) LIKE LOWER(CONCAT('%', :query, '%')))
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
                    :query IS NULL
                    OR LOWER(a.codigo) LIKE LOWER(CONCAT('%', :query, '%'))
                    OR LOWER(a.nombre) LIKE LOWER(CONCAT('%', :query, '%'))
                    OR (a.descripcion IS NOT NULL AND LOWER(a.descripcion) LIKE LOWER(CONCAT('%', :query, '%')))
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
