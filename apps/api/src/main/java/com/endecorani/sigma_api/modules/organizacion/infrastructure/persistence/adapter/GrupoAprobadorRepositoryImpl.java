package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.organizacion.domain.model.GrupoAprobador;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.GrupoAprobadorRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.GrupoAprobadorEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.mapper.GrupoAprobadorPersistenceMapper;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringGrupoAprobadorRepository;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class GrupoAprobadorRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        GrupoAprobador,
        GrupoAprobadorEntity,
        UUID
        >
        implements GrupoAprobadorRepository {

    private final SpringGrupoAprobadorRepository springRepository;

    private final GrupoAprobadorPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            GrupoAprobadorEntity,
            UUID
            > jpaRepository() {

        return springRepository;
    }

    @Override
    protected GrupoAprobadorEntity toEntity(GrupoAprobador domain) {
        return mapper.toEntity(domain);
    }

    @Override
    protected GrupoAprobador toDomain(GrupoAprobadorEntity entity) {
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
    public Page<GrupoAprobador> search(String query, Pageable pageable) {
        return springRepository
                .search(query, pageable)
                .map(mapper::toDomain);
    }
}
