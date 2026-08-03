package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.Categoria;
import com.endecorani.sigma_api.modules.activos.domain.repository.CategoriaRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.CategoriaEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper.CategoriaPersistenceMapper;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class CategoriaRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        Categoria,
        CategoriaEntity,
        UUID
        >
        implements CategoriaRepository {

    private final SpringCategoriaRepository springRepository;

    private final CategoriaPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            CategoriaEntity,
            UUID
            > jpaRepository() {

        return springRepository;
    }

    @Override
    protected CategoriaEntity toEntity(
            Categoria domain
    ) {
        return mapper.toEntity(domain);
    }

    @Override
    protected Categoria toDomain(
            CategoriaEntity entity
    ) {
        return mapper.toDomain(entity);
    }

    @Override
    public boolean existsByCodigoIgnoreCase(
            String codigo
    ) {
        return springRepository
                .existsByCodigoIgnoreCase(codigo);
    }

    @Override
    public boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    ) {
        return springRepository
                .existsByCodigoIgnoreCaseAndIdNot(
                        codigo,
                        id
                );
    }

    @Override
    public Page<Categoria> search(String query, Pageable pageable) {
        return springRepository
                .search(query, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Integer findMaxOrden() {
        return springRepository.findMaxOrden();
    }
}
