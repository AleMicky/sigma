package com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.inventarios.domain.model.CategoriaInsumo;
import com.endecorani.sigma_api.modules.inventarios.domain.repository.CategoriaInsumoRepository;
import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity.CategoriaInsumoEntity;
import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.mapper.CategoriaInsumoPersistenceMapper;
import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.specification.SpringCategoriaInsumoRepository;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class CategoriaInsumoRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        CategoriaInsumo,
        CategoriaInsumoEntity,
        UUID
        >
        implements CategoriaInsumoRepository {

    private final SpringCategoriaInsumoRepository springRepository;

    private final CategoriaInsumoPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            CategoriaInsumoEntity,
            UUID
            > jpaRepository() {
        return springRepository;
    }

    @Override
    protected CategoriaInsumoEntity toEntity(
            CategoriaInsumo domain
    ) {
        return mapper.toEntity(domain);
    }

    @Override
    protected CategoriaInsumo toDomain(
            CategoriaInsumoEntity entity
    ) {
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
    public Page<CategoriaInsumo> search(String query, Pageable pageable) {
        return springRepository
                .search(query, pageable)
                .map(mapper::toDomain);
    }
}
