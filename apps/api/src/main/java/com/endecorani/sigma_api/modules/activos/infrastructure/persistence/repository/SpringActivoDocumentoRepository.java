package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoDocumentoEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringActivoDocumentoRepository
        extends BaseJpaRepository<ActivoDocumentoEntity, UUID>, JpaSpecificationExecutor<ActivoDocumentoEntity> {
}
