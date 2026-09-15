package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ChecklistMantenimientoEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringChecklistMantenimientoRepository extends JpaRepository<ChecklistMantenimientoEntity, UUID> {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id);

    Optional<ChecklistMantenimientoEntity> findByCodigoIgnoreCase(String codigo);

    List<ChecklistMantenimientoEntity> findByActividadMantenimientoId(UUID actividadMantenimientoId);

    Page<ChecklistMantenimientoEntity> findByActividadMantenimientoId(UUID actividadMantenimientoId, Pageable pageable);

    @Query("""
        SELECT c
        FROM ChecklistMantenimientoEntity c
        WHERE LOWER(c.codigo) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(c.nombre) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(c.descripcion) LIKE LOWER(CONCAT('%', :search, '%'))
    """)
    Page<ChecklistMantenimientoEntity> search(@Param("search") String search, Pageable pageable);
}
