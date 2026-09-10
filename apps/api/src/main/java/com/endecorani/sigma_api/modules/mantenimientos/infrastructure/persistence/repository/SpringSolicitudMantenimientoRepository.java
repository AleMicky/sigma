package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

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

    @Query("""
        SELECT s
        FROM SolicitudMantenimientoEntity s
        WHERE LOWER(s.numero) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(s.titulo) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(s.estado) LIKE LOWER(CONCAT('%', :search, '%'))
    """)
    Page<SolicitudMantenimientoEntity> search(@Param("search") String search, Pageable pageable);
}
