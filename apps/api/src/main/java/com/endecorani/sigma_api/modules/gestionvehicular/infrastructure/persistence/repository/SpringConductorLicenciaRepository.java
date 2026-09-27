package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorLicenciaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SpringConductorLicenciaRepository extends JpaRepository<ConductorLicenciaEntity, UUID> {

    List<ConductorLicenciaEntity> findByConductorId(UUID conductorId);

    boolean existsByNumeroLicenciaIgnoreCase(String numeroLicencia);

    boolean existsByNumeroLicenciaIgnoreCaseAndIdNot(String numeroLicencia, UUID id);
}
