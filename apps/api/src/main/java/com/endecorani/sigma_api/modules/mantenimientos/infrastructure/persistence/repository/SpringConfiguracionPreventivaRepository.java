package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ConfiguracionPreventivaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SpringConfiguracionPreventivaRepository extends JpaRepository<ConfiguracionPreventivaEntity, UUID> {
    Optional<ConfiguracionPreventivaEntity> findFirstByOrderByCreatedAtAsc();
}
