package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.TipoSolicitudVehicularEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface SpringTipoSolicitudVehicularRepository extends JpaRepository<TipoSolicitudVehicularEntity, UUID> {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id);

    Optional<TipoSolicitudVehicularEntity> findByCodigoIgnoreCase(String codigo);

    @Query("""
        SELECT t
        FROM TipoSolicitudVehicularEntity t
        WHERE LOWER(t.codigo) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(t.nombre) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(COALESCE(t.descripcion, '')) LIKE LOWER(CONCAT('%', :search, '%'))
    """)
    Page<TipoSolicitudVehicularEntity> search(@Param("search") String search, Pageable pageable);
}
