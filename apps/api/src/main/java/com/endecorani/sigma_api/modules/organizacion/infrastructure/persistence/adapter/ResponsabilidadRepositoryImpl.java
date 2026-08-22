package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.organizacion.domain.model.Responsabilidad;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.ResponsabilidadRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.ResponsabilidadEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.mapper.ResponsabilidadPersistenceMapper;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringResponsabilidadRepository;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ResponsabilidadRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        Responsabilidad,
        ResponsabilidadEntity,
        UUID
        >
        implements ResponsabilidadRepository {

    private final SpringResponsabilidadRepository springRepository;

    private final ResponsabilidadPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            ResponsabilidadEntity,
            UUID
            > jpaRepository() {

        return springRepository;
    }

    @Override
    protected ResponsabilidadEntity toEntity(Responsabilidad domain) {
        return mapper.toEntity(domain);
    }

    @Override
    protected Responsabilidad toDomain(ResponsabilidadEntity entity) {
        return mapper.toDomain(entity);
    }

    @Override
    public boolean existsByCodigoIgnoreCase(String codigo) {
        return springRepository.existsByCodigoIgnoreCase(codigo);
    }

    @Override
    public boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    ) {
        return springRepository.existsByCodigoIgnoreCaseAndIdNot(codigo, id);
    }

    @Override
    public Page<Responsabilidad> search(String query, Pageable pageable) {
        return springRepository
                .search(query, pageable)
                .map(mapper::toDomain);
    }
}
