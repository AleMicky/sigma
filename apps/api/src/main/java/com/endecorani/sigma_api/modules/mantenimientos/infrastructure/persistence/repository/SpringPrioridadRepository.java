package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.PrioridadEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface SpringPrioridadRepository extends JpaRepository<PrioridadEntity, UUID> {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id);

    boolean existsByPorDefectoTrue();

    boolean existsByPorDefectoTrueAndIdNot(UUID id);

    @Query("""
        SELECT p
        FROM PrioridadEntity p
        WHERE LOWER(p.codigo) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(p.descripcion) LIKE LOWER(CONCAT('%', :search, '%'))
    """)
    Page<PrioridadEntity> search(@Param("search") String search, Pageable pageable);
}