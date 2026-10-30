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

    @Query(value = """
        SELECT s
        FROM SolicitudVehicularEntity s
        LEFT JOIN com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.TipoSolicitudVehicularEntity tsv ON s.tipoSolicitudVehicularId = tsv.id
        LEFT JOIN com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity ve ON s.solicitanteId = ve.empleadoId
        WHERE (:hasSearch = false
            OR LOWER(s.numero) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(s.motivo) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(s.destino) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(s.estado) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(tsv.nombre) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(tsv.codigo) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(ve.codigo) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(ve.nombreCompleto) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:hasEstados = false OR UPPER(s.estado) IN (:estados))
          AND (:hasTipo = false OR s.tipoSolicitudVehicularId = :tipoSolicitudVehicularId)
          AND (:hasSolicitante = false OR s.solicitanteId = :solicitanteId)
          AND (:hasResponsable = false OR s.responsableAsignacionId = :responsableAsignacionId)
          AND (:hasConductor = false OR s.conductorAsignadoId = :conductorAsignadoId)
    """,
    countQuery = """
        SELECT count(s)
        FROM SolicitudVehicularEntity s
        LEFT JOIN com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.TipoSolicitudVehicularEntity tsv ON s.tipoSolicitudVehicularId = tsv.id
        LEFT JOIN com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity ve ON s.solicitanteId = ve.empleadoId
        WHERE (:hasSearch = false
            OR LOWER(s.numero) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(s.motivo) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(s.destino) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(s.estado) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(tsv.nombre) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(tsv.codigo) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(ve.codigo) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(ve.nombreCompleto) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:hasEstados = false OR UPPER(s.estado) IN (:estados))
          AND (:hasTipo = false OR s.tipoSolicitudVehicularId = :tipoSolicitudVehicularId)
          AND (:hasSolicitante = false OR s.solicitanteId = :solicitanteId)
          AND (:hasResponsable = false OR s.responsableAsignacionId = :responsableAsignacionId)
          AND (:hasConductor = false OR s.conductorAsignadoId = :conductorAsignadoId)
    """)
    Page<SolicitudVehicularEntity> searchWithFilters(
            @Param("hasSearch") boolean hasSearch,
            @Param("search") String search,
            @Param("hasEstados") boolean hasEstados,
            @Param("estados") java.util.Collection<String> estados,
            @Param("hasTipo") boolean hasTipo,
            @Param("tipoSolicitudVehicularId") UUID tipoSolicitudVehicularId,
            @Param("hasSolicitante") boolean hasSolicitante,
            @Param("solicitanteId") UUID solicitanteId,
            @Param("hasResponsable") boolean hasResponsable,
            @Param("responsableAsignacionId") UUID responsableAsignacionId,
            @Param("hasConductor") boolean hasConductor,
            @Param("conductorAsignadoId") UUID conductorAsignadoId,
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

    @Query("""
        SELECT s
        FROM SolicitudVehicularEntity s
        WHERE UPPER(s.estado) <> 'BORRADOR'
          AND (:hasFechaInicio = false OR s.fechaRetornoEstimada >= :fechaInicio)
          AND (:hasFechaFin = false OR s.fechaSalida <= :fechaFin)
        ORDER BY s.fechaSalida ASC
    """)
    java.util.List<SolicitudVehicularEntity> findParaCalendario(
            @Param("hasFechaInicio") boolean hasFechaInicio,
            @Param("fechaInicio") java.time.LocalDateTime fechaInicio,
            @Param("hasFechaFin") boolean hasFechaFin,
            @Param("fechaFin") java.time.LocalDateTime fechaFin
    );

    @Query("""
        SELECT DISTINCT s
        FROM SolicitudVehicularEntity s
        LEFT JOIN com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.TipoSolicitudVehicularEntity tsv ON s.tipoSolicitudVehicularId = tsv.id
        LEFT JOIN com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity ve ON s.solicitanteId = ve.empleadoId
        LEFT JOIN com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.AsignacionVehicularEntity a ON a.solicitudVehicularId = s.id
        LEFT JOIN com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity act ON (s.activoId = act.id OR a.activoId = act.id)
        WHERE (:search IS NULL OR :search = ''
            OR LOWER(s.numero) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(s.motivo) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(s.destino) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(tsv.nombre) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(tsv.codigo) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(ve.codigo) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(ve.nombreCompleto) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(act.codigo) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(act.nombre) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:estado IS NULL OR :estado = '' OR UPPER(s.estado) = UPPER(:estado))
          AND (:tipoSolicitudVehicularId IS NULL OR s.tipoSolicitudVehicularId = :tipoSolicitudVehicularId)
          AND (:solicitanteId IS NULL OR s.solicitanteId = :solicitanteId)
          AND (:conductorId IS NULL OR s.conductorAsignadoId = :conductorId OR a.conductorId = :conductorId)
          AND (:activoId IS NULL OR s.activoId = :activoId OR a.activoId = :activoId)
          AND (CAST(:fechaDesde AS java.time.LocalDateTime) IS NULL OR s.fechaSalida >= :fechaDesde)
          AND (CAST(:fechaHasta AS java.time.LocalDateTime) IS NULL OR s.fechaSalida <= :fechaHasta)
        ORDER BY s.fechaSalida DESC
    """)
    java.util.List<SolicitudVehicularEntity> findForReporte(
            @Param("search") String search,
            @Param("activoId") UUID activoId,
            @Param("solicitanteId") UUID solicitanteId,
            @Param("conductorId") UUID conductorId,
            @Param("tipoSolicitudVehicularId") UUID tipoSolicitudVehicularId,
            @Param("estado") String estado,
            @Param("fechaDesde") java.time.LocalDateTime fechaDesde,
            @Param("fechaHasta") java.time.LocalDateTime fechaHasta
    );
}
