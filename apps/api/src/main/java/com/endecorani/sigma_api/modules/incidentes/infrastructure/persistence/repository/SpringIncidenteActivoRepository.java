package com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.entity.IncidenteActivoEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringIncidenteActivoRepository extends JpaRepository<IncidenteActivoEntity, UUID> {

    @Query("""
        SELECT i FROM IncidenteActivoEntity i
        WHERE (:search IS NULL OR :search = ''
            OR LOWER(i.tipoIncidente) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(i.descripcion) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(COALESCE(i.ubicacion, '')) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:tipoIncidente IS NULL OR :tipoIncidente = '' OR UPPER(i.tipoIncidente) = UPPER(:tipoIncidente))
          AND (:prioridad IS NULL OR :prioridad = '' OR UPPER(i.prioridad) = UPPER(:prioridad))
          AND (:estado IS NULL OR :estado = '' OR UPPER(i.estado) = UPPER(:estado))
          AND (:activoId IS NULL OR i.activo.id = :activoId)
    """)
    Page<IncidenteActivoEntity> searchWithFilters(
            @Param("search") String search,
            @Param("tipoIncidente") String tipoIncidente,
            @Param("prioridad") String prioridad,
            @Param("estado") String estado,
            @Param("activoId") UUID activoId,
            Pageable pageable
    );

    List<IncidenteActivoEntity> findByActivoId(UUID activoId);

    Optional<IncidenteActivoEntity> findByProcessInstanceId(String processInstanceId);
}

