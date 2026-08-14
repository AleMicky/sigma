package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.EmpleadoEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringEmpleadoRepository
        extends BaseJpaRepository<
        EmpleadoEntity,
        UUID
        >,
        JpaSpecificationExecutor<EmpleadoEntity> {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    );
}
