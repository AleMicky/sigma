package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.UUID;

@Repository
public interface SpringVehiculoCatalogoRepository extends JpaRepository<ActivoEntity, UUID> {

    @Query("""
            SELECT a
            FROM ActivoEntity a
            WHERE a.tipoActivoId IN :tipoActivoIds
              AND (:estadoOperativoId IS NULL OR a.estadoOperativoId = :estadoOperativoId)
              AND (:ubicacionId IS NULL OR a.ubicacionId = :ubicacionId)
              AND (:activo IS NULL OR a.activo = :activo)
              AND (
                :flotaId IS NULL
                OR EXISTS (
                    SELECT 1
                    FROM FlotaVehiculoEntity fv
                    WHERE fv.activoId = a.id
                      AND fv.flotaVehicularId = :flotaId
                      AND fv.activo = true
                )
              )
              AND (
                CAST(:query AS String) IS NULL
                OR LOWER(a.codigo) LIKE LOWER(CONCAT('%', CAST(:query AS String), '%'))
                OR (a.codigoAlternativo IS NOT NULL AND LOWER(a.codigoAlternativo) LIKE LOWER(CONCAT('%', CAST(:query AS String), '%')))
                OR LOWER(a.nombre) LIKE LOWER(CONCAT('%', CAST(:query AS String), '%'))
                OR (a.descripcion IS NOT NULL AND LOWER(a.descripcion) LIKE LOWER(CONCAT('%', CAST(:query AS String), '%')))
                OR EXISTS (
                    SELECT 1
                    FROM ActivoAtributoValorEntity av
                    INNER JOIN ActivoAtributoEntity aa ON aa.id = av.activoAtributoId
                    WHERE av.activoId = a.id
                      AND aa.visible = true
                      AND av.valor IS NOT NULL
                      AND LOWER(av.valor) LIKE LOWER(CONCAT('%', CAST(:query AS String), '%'))
                )
              )
            """)
    Page<ActivoEntity> searchVehiculos(
            @Param("tipoActivoIds") Collection<UUID> tipoActivoIds,
            @Param("query") String query,
            @Param("estadoOperativoId") UUID estadoOperativoId,
            @Param("ubicacionId") UUID ubicacionId,
            @Param("flotaId") UUID flotaId,
            @Param("activo") Boolean activo,
            Pageable pageable
    );
}
