package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoRegistroPorteria;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.RegistroPorteriaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.lang.Nullable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringRegistroPorteriaRepository extends
        JpaRepository<RegistroPorteriaEntity, UUID>,
        JpaSpecificationExecutor<RegistroPorteriaEntity> {

    @Override
    @EntityGraph(attributePaths = "activos")
    Optional<RegistroPorteriaEntity> findById(UUID id);

    @EntityGraph(attributePaths = "activos")
    List<RegistroPorteriaEntity> findByEstadoOrderByFechaHoraSalidaDesc(EstadoRegistroPorteria estado);

    @Override
    @EntityGraph(attributePaths = "activos")
    Page<RegistroPorteriaEntity> findAll(@Nullable Specification<RegistroPorteriaEntity> spec, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = "activos")
    List<RegistroPorteriaEntity> findAll(@Nullable Specification<RegistroPorteriaEntity> spec, Sort sort);
}

