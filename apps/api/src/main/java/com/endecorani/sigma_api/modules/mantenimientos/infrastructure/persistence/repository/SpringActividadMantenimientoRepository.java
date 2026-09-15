package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ActividadMantenimientoEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringActividadMantenimientoRepository extends JpaRepository<ActividadMantenimientoEntity, UUID> {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id);

    Optional<ActividadMantenimientoEntity> findByCodigoIgnoreCase(String codigo);

    @Query("""
        SELECT a
        FROM ActividadMantenimientoEntity a
        WHERE LOWER(a.codigo) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(a.nombre) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(a.descripcion) LIKE LOWER(CONCAT('%', :search, '%'))
    """)
    Page<ActividadMantenimientoEntity> search(@Param("search") String search, Pageable pageable);

    @Query("""
        SELECT DISTINCT a
        FROM ActividadMantenimientoEntity a
        LEFT JOIN a.aplicaciones ap
        WHERE a.aplicaTodosTiposActivo = true
           OR ap.tipoActivoId = :tipoActivoId
    """)
    List<ActividadMantenimientoEntity> findByTipoActivoId(@Param("tipoActivoId") UUID tipoActivoId);
}
