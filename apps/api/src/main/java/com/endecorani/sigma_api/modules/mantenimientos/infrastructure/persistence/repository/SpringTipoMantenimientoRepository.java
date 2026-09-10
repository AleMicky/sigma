package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.TipoMantenimientoEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface SpringTipoMantenimientoRepository extends JpaRepository<TipoMantenimientoEntity, UUID> {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id);

    @Query("""
        SELECT t
        FROM TipoMantenimientoEntity t
        WHERE LOWER(t.codigo) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(t.nombre) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(t.descripcion) LIKE LOWER(CONCAT('%', :search, '%'))
    """)
    Page<TipoMantenimientoEntity> search(@Param("search") String search, Pageable pageable);
}