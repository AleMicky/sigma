package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.OrdenTrabajoEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringOrdenTrabajoRepository
        extends JpaRepository<OrdenTrabajoEntity, UUID> {

    boolean existsBySolicitudMantenimientoId(UUID solicitudMantenimientoId);

    Page<OrdenTrabajoEntity> findBySolicitudMantenimientoId(
            UUID solicitudMantenimientoId,
            Pageable pageable
    );

    boolean existsBySolicitudMantenimientoIdAndIdNot(
            UUID solicitudMantenimientoId,
            UUID id
    );

    @Query("""
            select o
            from OrdenTrabajoEntity o
            where lower(o.numero) like lower(concat('%', :query, '%'))
            """)
    Page<OrdenTrabajoEntity> search(
            @Param("query") String query,
            Pageable pageable
    );
}
