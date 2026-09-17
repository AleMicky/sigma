package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoResumenProjection;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.SolicitudMantenimientoEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface SpringSolicitudMantenimientoRepository extends JpaRepository<SolicitudMantenimientoEntity, UUID> {

    boolean existsByNumeroIgnoreCase(String numero);

    boolean existsByNumeroIgnoreCaseAndIdNot(String numero, UUID id);

    @Query(value = """
        SELECT s
        FROM SolicitudMantenimientoEntity s
        LEFT JOIN FETCH s.solicitanteView
        LEFT JOIN FETCH s.aprobadorView
        LEFT JOIN FETCH s.responsableView
        LEFT JOIN FETCH s.supervisorView
        LEFT JOIN FETCH s.activo
        LEFT JOIN FETCH s.tipoMantenimiento
        LEFT JOIN FETCH s.prioridad
        WHERE LOWER(s.numero) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(s.titulo) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(s.estado) LIKE LOWER(CONCAT('%', :search, '%'))
    """,
    countQuery = """
        SELECT count(s)
        FROM SolicitudMantenimientoEntity s
        WHERE LOWER(s.numero) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(s.titulo) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(s.estado) LIKE LOWER(CONCAT('%', :search, '%'))
    """)
    Page<SolicitudMantenimientoEntity> search(@Param("search") String search, Pageable pageable);

    @Query(value = """
        SELECT s
        FROM SolicitudMantenimientoEntity s
        LEFT JOIN FETCH s.solicitanteView
        LEFT JOIN FETCH s.aprobadorView
        LEFT JOIN FETCH s.responsableView
        LEFT JOIN FETCH s.supervisorView
        LEFT JOIN FETCH s.activo
        LEFT JOIN FETCH s.tipoMantenimiento
        LEFT JOIN FETCH s.prioridad
    """,
    countQuery = """
        SELECT count(s)
        FROM SolicitudMantenimientoEntity s
    """)
    Page<SolicitudMantenimientoEntity> findAllWithDetails(Pageable pageable);

    @Query("""
        SELECT s
        FROM SolicitudMantenimientoEntity s
        LEFT JOIN FETCH s.solicitanteView
        LEFT JOIN FETCH s.aprobadorView
        LEFT JOIN FETCH s.responsableView
        LEFT JOIN FETCH s.supervisorView
        LEFT JOIN FETCH s.activo
        LEFT JOIN FETCH s.tipoMantenimiento
        LEFT JOIN FETCH s.prioridad
        WHERE s.id = :id
    """)
    java.util.Optional<SolicitudMantenimientoEntity> findByIdWithDetails(@Param("id") UUID id);

    @Query(value = """
        SELECT s
        FROM SolicitudMantenimientoEntity s
        LEFT JOIN FETCH s.solicitanteView
        LEFT JOIN FETCH s.aprobadorView
        LEFT JOIN FETCH s.responsableView
        LEFT JOIN FETCH s.supervisorView
        LEFT JOIN FETCH s.activo activo
        LEFT JOIN FETCH s.tipoMantenimiento
        LEFT JOIN FETCH s.prioridad
        LEFT JOIN s.solicitante solicitante
        LEFT JOIN s.aprobador aprobador
        LEFT JOIN s.responsable responsable
        LEFT JOIN s.supervisor supervisor
        WHERE (:hasQ = false OR LOWER(s.numero) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(s.titulo) LIKE LOWER(CONCAT('%', :q, '%')))
          AND (:hasEstados = false OR UPPER(s.estado) IN (:estados))
          AND (:hasSolicitante = false OR solicitante.id = :solicitanteId)
          AND (:hasResponsable = false OR responsable.id = :responsableId)
          AND (:hasSupervisor = false OR supervisor.id = :supervisorId)
          AND (:hasActivo = false OR activo.id = :activoId)
          AND (:hasAprobador = false OR aprobador.id = :aprobadorId)
    """,
    countQuery = """
        SELECT count(s)
        FROM SolicitudMantenimientoEntity s
        LEFT JOIN s.solicitante solicitante
        LEFT JOIN s.responsable responsable
        LEFT JOIN s.supervisor supervisor
        LEFT JOIN s.activo activo
        LEFT JOIN s.aprobador aprobador
        WHERE (:hasQ = false OR LOWER(s.numero) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(s.titulo) LIKE LOWER(CONCAT('%', :q, '%')))
          AND (:hasEstados = false OR UPPER(s.estado) IN (:estados))
          AND (:hasSolicitante = false OR solicitante.id = :solicitanteId)
          AND (:hasResponsable = false OR responsable.id = :responsableId)
          AND (:hasSupervisor = false OR supervisor.id = :supervisorId)
          AND (:hasActivo = false OR activo.id = :activoId)
          AND (:hasAprobador = false OR aprobador.id = :aprobadorId)
    """)
    Page<SolicitudMantenimientoEntity> searchWithCriteria(
            @Param("hasQ") boolean hasQ, @Param("q") String q,
            @Param("hasEstados") boolean hasEstados, @Param("estados") java.util.Collection<String> estados,
            @Param("hasSolicitante") boolean hasSolicitante, @Param("solicitanteId") UUID solicitanteId,
            @Param("hasResponsable") boolean hasResponsable, @Param("responsableId") UUID responsableId,
            @Param("hasSupervisor") boolean hasSupervisor, @Param("supervisorId") UUID supervisorId,
            @Param("hasActivo") boolean hasActivo, @Param("activoId") UUID activoId,
            @Param("hasAprobador") boolean hasAprobador, @Param("aprobadorId") UUID aprobadorId,
            Pageable pageable
    );

    @Query("""
            select
                count(s) as total,
                coalesce(sum(case when upper(s.estado) = 'BORRADOR' then 1 else 0 end), 0) as borradores,
                coalesce(sum(case when upper(s.estado) in ('SOLICITADO', 'OBSERVADO') then 1 else 0 end), 0) as enRevision,
                coalesce(sum(case when upper(s.estado) in ('SOLICITADO', 'OBSERVADO', 'ASIGNADO', 'EN_MANTENIMIENTO', 'EN_REVISION', 'OBSERVADO_MANTENIMIENTO', 'VALIDADO') then 1 else 0 end), 0) as enProceso,
                coalesce(sum(case when upper(s.estado) in ('TRABAJO_REALIZADO', 'FINALIZADO', 'CERRADO') then 1 else 0 end), 0) as finalizadas,
                coalesce(sum(case when upper(s.estado) = 'SOLICITADO' then 1 else 0 end), 0) as porAprobar,
                coalesce(sum(case when upper(s.estado) = 'OBSERVADO' then 1 else 0 end), 0) as observadas,
                coalesce(sum(case when upper(s.estado) = 'OBSERVADO' then 1 else 0 end), 0) as enObservadas,
                coalesce(sum(case when upper(s.estado) = 'ASIGNADO' then 1 else 0 end), 0) as asignadas,
                coalesce(sum(case when upper(s.estado) in ('EN_MANTENIMIENTO', 'EN_REVISION', 'OBSERVADO_MANTENIMIENTO', 'VALIDADO', 'TRABAJO_REALIZADO', 'FINALIZADO', 'CERRADO') then 1 else 0 end), 0) as enProcesoAprobacion,
                coalesce(sum(case when upper(s.estado) = 'ASIGNADO' then 1 else 0 end), 0) as porIniciar,
                coalesce(sum(case when upper(s.estado) in ('EN_MANTENIMIENTO', 'OBSERVADO_MANTENIMIENTO', 'VALIDADO') then 1 else 0 end), 0) as enEjecucion,
                coalesce(sum(case when upper(s.estado) = 'EN_REVISION' then 1 else 0 end), 0) as porRevisar,
                coalesce(sum(case when upper(s.estado) = 'OBSERVADO_MANTENIMIENTO' then 1 else 0 end), 0) as observadasMantenimiento,
                coalesce(sum(case when upper(s.estado) = 'VALIDADO' then 1 else 0 end), 0) as validadas,
                coalesce(sum(case when upper(s.estado) in ('TRABAJO_REALIZADO', 'FINALIZADO', 'CERRADO') then 1 else 0 end), 0) as trabajoConcluido
            from SolicitudMantenimientoEntity s
            left join s.solicitante solicitante
            left join s.aprobador aprobador
            left join s.supervisor supervisor
            left join s.responsable responsable
            where (:hasSolicitante = false or solicitante.id = :solicitanteId)
              and (:hasAprobador = false or aprobador.id = :aprobadorId)
              and (:hasSupervisor = false or supervisor.id = :supervisorId)
              and (:hasResponsable = false or responsable.id = :responsableId)
            """)
    SolicitudMantenimientoResumenProjection obtenerResumen(
            @Param("hasSolicitante") boolean hasSolicitante, @Param("solicitanteId") UUID solicitanteId,
            @Param("hasAprobador") boolean hasAprobador, @Param("aprobadorId") UUID aprobadorId,
            @Param("hasSupervisor") boolean hasSupervisor, @Param("supervisorId") UUID supervisorId,
            @Param("hasResponsable") boolean hasResponsable, @Param("responsableId") UUID responsableId
    );



    

}
