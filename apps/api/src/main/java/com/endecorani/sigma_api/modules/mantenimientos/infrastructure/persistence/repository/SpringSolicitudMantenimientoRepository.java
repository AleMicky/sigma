package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.SolicitudMantenimientoEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringSolicitudMantenimientoRepository
        extends JpaRepository<
        SolicitudMantenimientoEntity,
        UUID
        > {

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
}
