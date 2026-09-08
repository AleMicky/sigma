package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoResumenProjection;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.SolicitudMantenimientoEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringSolicitudMantenimientoRepository
        extends JpaRepository<
        SolicitudMantenimientoEntity,
        UUID
        >,
        JpaSpecificationExecutor<SolicitudMantenimientoEntity> {

    boolean existsByNumeroIgnoreCase(String numero);

    boolean existsByNumeroIgnoreCaseAndIdNot(
            String numero,
            UUID id
    );

    Page<SolicitudMantenimientoEntity> findByActivoId(
            UUID activoId,
            Pageable pageable
    );

    Page<SolicitudMantenimientoEntity> findByEstadoIgnoreCase(
            String estado,
            Pageable pageable
    );

    Page<SolicitudMantenimientoEntity> findBySolicitanteId(
            UUID solicitanteId,
            Pageable pageable
    );

    Page<SolicitudMantenimientoEntity> findByResponsableId(
            UUID responsableId,
            Pageable pageable
    );

    @Query("""
            select s
            from SolicitudMantenimientoEntity s
            where lower(s.numero) like lower(concat('%', :query, '%'))
               or lower(s.titulo) like lower(concat('%', :query, '%'))
            """)
    Page<SolicitudMantenimientoEntity> search(
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            select
                count(s) as total,

                coalesce(sum(
                    case
                        when upper(s.estado) = 'BORRADOR'
                        then 1
                        else 0
                    end
                ), 0) as borradores,

                coalesce(sum(
                    case
                        when upper(s.estado) in (
                            'SOLICITADO',
                            'OBSERVADO'
                        )
                        then 1
                        else 0
                    end
                ), 0) as enRevision,

                coalesce(sum(
                    case
                        when upper(s.estado) in (
                            'ASIGNADO',
                            'EN_MANTENIMIENTO',
                            'EN_REVISION',
                            'OBSERVADO_MANTENIMIENTO',
                            'VALIDADO'
                        )
                        then 1
                        else 0
                    end
                ), 0) as enProceso,

                coalesce(sum(
                    case
                        when upper(s.estado) in (
                            'TRABAJO_REALIZADO',
                            'FINALIZADO',
                            'CERRADO'
                        )
                        then 1
                        else 0
                    end
                ), 0) as finalizadas

            from SolicitudMantenimientoEntity s
            where (:solicitanteId is null or s.solicitanteId = :solicitanteId)
            """)
    SolicitudMantenimientoResumenProjection obtenerResumen(@Param("solicitanteId") UUID solicitanteId);
}
