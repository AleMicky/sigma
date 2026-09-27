package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.FlotaVehicularEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringFlotaVehicularRepository extends JpaRepository<FlotaVehicularEntity, UUID> {

    Optional<FlotaVehicularEntity> findByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id);

    List<FlotaVehicularEntity> findByActivoTrueOrderByNombreAsc();

    @Query("""
        SELECT f FROM FlotaVehicularEntity f
        WHERE (:search IS NULL OR
               LOWER(f.codigo) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(f.nombre) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(f.descripcion) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:activo IS NULL OR f.activo = :activo)
    """)
    Page<FlotaVehicularEntity> searchWithFilters(
            @Param("search") String search,
            @Param("activo") Boolean activo,
            Pageable pageable
    );
}
