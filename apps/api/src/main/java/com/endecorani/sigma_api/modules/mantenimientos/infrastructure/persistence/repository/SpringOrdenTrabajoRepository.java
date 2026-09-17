package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.OrdenTrabajoEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface SpringOrdenTrabajoRepository extends JpaRepository<OrdenTrabajoEntity, UUID> {

    boolean existsByNumeroIgnoreCase(String numero);

    boolean existsByNumeroIgnoreCaseAndIdNot(String numero, UUID id);

    boolean existsBySolicitudMantenimientoId(UUID solicitudMantenimientoId);

    boolean existsBySolicitudMantenimientoIdAndIdNot(UUID solicitudMantenimientoId, UUID id);

    Optional<OrdenTrabajoEntity> findByNumeroIgnoreCase(String numero);

    Optional<OrdenTrabajoEntity> findBySolicitudMantenimientoId(UUID solicitudMantenimientoId);

    Page<OrdenTrabajoEntity> findBySolicitudMantenimientoId(UUID solicitudMantenimientoId, Pageable pageable);

    @Query("""
        SELECT ot
        FROM OrdenTrabajoEntity ot
        WHERE LOWER(ot.numero) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(ot.diagnostico) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(ot.trabajoRealizado) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(ot.observacion) LIKE LOWER(CONCAT('%', :search, '%'))
    """)
    Page<OrdenTrabajoEntity> search(@Param("search") String search, Pageable pageable);
}
