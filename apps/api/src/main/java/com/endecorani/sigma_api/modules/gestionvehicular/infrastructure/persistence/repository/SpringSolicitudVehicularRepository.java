package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.SolicitudVehicularEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface SpringSolicitudVehicularRepository extends JpaRepository<SolicitudVehicularEntity, UUID> {

    boolean existsByNumeroIgnoreCase(String numero);

    boolean existsByNumeroIgnoreCaseAndIdNot(String numero, UUID id);

    Optional<SolicitudVehicularEntity> findByNumeroIgnoreCase(String numero);

    @Query("""
        SELECT s
        FROM SolicitudVehicularEntity s
        LEFT JOIN com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.TipoSolicitudVehicularEntity tsv ON s.tipoSolicitudVehicularId = tsv.id
        LEFT JOIN com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity ve ON s.solicitanteId = ve.empleadoId
        WHERE (:search IS NULL
            OR LOWER(s.numero) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(s.motivo) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(s.destino) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(s.estado) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(tsv.nombre) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(tsv.codigo) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(ve.codigo) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(ve.nombreCompleto) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:estado IS NULL OR LOWER(s.estado) = LOWER(:estado))
          AND (:tipoSolicitudVehicularId IS NULL OR s.tipoSolicitudVehicularId = :tipoSolicitudVehicularId)
          AND (:solicitanteId IS NULL OR s.solicitanteId = :solicitanteId)
    """)
    Page<SolicitudVehicularEntity> searchWithFilters(
            @Param("search") String search,
            @Param("estado") String estado,
            @Param("tipoSolicitudVehicularId") UUID tipoSolicitudVehicularId,
            @Param("solicitanteId") UUID solicitanteId,
            Pageable pageable
    );

    @Query("""
        SELECT s
        FROM SolicitudVehicularEntity s
        LEFT JOIN com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.TipoSolicitudVehicularEntity tsv ON s.tipoSolicitudVehicularId = tsv.id
        LEFT JOIN com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity ve ON s.solicitanteId = ve.empleadoId
        WHERE LOWER(s.numero) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(s.motivo) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(s.destino) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(s.estado) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(tsv.nombre) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(tsv.codigo) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(ve.codigo) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(ve.nombreCompleto) LIKE LOWER(CONCAT('%', :search, '%'))
    """)
    Page<SolicitudVehicularEntity> search(@Param("search") String search, Pageable pageable);
}
