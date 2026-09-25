package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface SpringConductorRepository extends JpaRepository<ConductorEntity, UUID> {

    boolean existsByEmpleadoId(UUID empleadoId);

    boolean existsByEmpleadoIdAndIdNot(UUID empleadoId, UUID id);

    boolean existsByNumeroLicenciaIgnoreCase(String numeroLicencia);

    boolean existsByNumeroLicenciaIgnoreCaseAndIdNot(String numeroLicencia, UUID id);

    @Query("""
        SELECT c
        FROM ConductorEntity c
        WHERE LOWER(c.numeroLicencia) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(c.categoriaLicencia) LIKE LOWER(CONCAT('%', :search, '%'))
    """)
    Page<ConductorEntity> search(@Param("search") String search, Pageable pageable);
}
