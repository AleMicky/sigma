package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.parametros.domain.model.Gestion;
import com.endecorani.sigma_api.modules.parametros.domain.repository.GestionRepository;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.GestionEntity;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.mapper.GestionPersistenceMapper;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository.SpringGestionRepository;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class GestionRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        Gestion,
        GestionEntity,
        UUID
        >
        implements GestionRepository {

    private final SpringGestionRepository springRepository;

    private final GestionPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            GestionEntity,
            UUID
            > jpaRepository() {
        return springRepository;
    }

    @Override
    protected GestionEntity toEntity(Gestion domain) {
        return mapper.toEntity(domain);
    }

    @Override
    protected Gestion toDomain(GestionEntity entity) {
        return mapper.toDomain(entity);
    }

    @Override
    public boolean existsByGestion(Integer gestion) {
        return springRepository.existsByGestion(gestion);
    }

    @Override
    public boolean existsByGestionAndIdNot(
            Integer gestion,
            UUID id
    ) {
        return springRepository.existsByGestionAndIdNot(gestion, id);
    }

    @Override
    public Page<Gestion> findByGestion(
            Integer gestion,
            Pageable pageable
    ) {
        return springRepository
                .findByGestion(gestion, pageable)
                .map(mapper::toDomain);
    }
}
