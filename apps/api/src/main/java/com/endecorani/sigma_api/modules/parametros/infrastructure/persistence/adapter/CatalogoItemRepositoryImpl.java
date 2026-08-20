package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.parametros.domain.model.CatalogoItem;
import com.endecorani.sigma_api.modules.parametros.domain.repository.CatalogoItemRepository;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.CatalogoItemEntity;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.mapper.CatalogoItemPersistenceMapper;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository.SpringCatalogoItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class CatalogoItemRepositoryImpl
        implements CatalogoItemRepository {

    private final SpringCatalogoItemRepository springRepository;

    private final CatalogoItemPersistenceMapper mapper;

    @Override
    public CatalogoItem save(CatalogoItem domain) {
        CatalogoItemEntity entity = mapper.toEntity(domain);
        CatalogoItemEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<CatalogoItem> findById(UUID id) {
        return springRepository
                .findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public Page<CatalogoItem> findAll(Pageable pageable) {
        return springRepository
                .findAll(pageable)
                .map(mapper::toDomain);
    }

    @Override
    public boolean existsById(UUID id) {
        return springRepository.existsById(id);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }

    @Override
    public Page<CatalogoItem> findByCatalogoId(
            UUID catalogoId,
            Pageable pageable
    ) {
        return springRepository
                .findByCatalogo_Id(catalogoId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<CatalogoItem> searchByCatalogoId(
            UUID catalogoId,
            String query,
            Pageable pageable
    ) {
        return springRepository
                .searchByCatalogoId(catalogoId, query, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public boolean existsByCatalogoIdAndValorIgnoreCase(
            UUID catalogoId,
            String valor
    ) {
        return springRepository.existsByCatalogo_IdAndValorIgnoreCase(
                catalogoId,
                valor
        );
    }

    @Override
    public boolean existsByCatalogoIdAndValorIgnoreCaseAndIdNot(
            UUID catalogoId,
            String valor,
            UUID id
    ) {
        return springRepository.existsByCatalogo_IdAndValorIgnoreCaseAndIdNot(
                catalogoId,
                valor,
                id
        );
    }

    @Override
    public Integer findMaxOrdenByCatalogoId(UUID catalogoId) {
        return springRepository.findMaxOrdenByCatalogoId(catalogoId);
    }

    @Override
    public boolean existsByCatalogoIdAndOrden(
            UUID catalogoId,
            Integer orden
    ) {
        return springRepository.existsByCatalogo_IdAndOrden(catalogoId, orden);
    }

    @Override
    public boolean existsByCatalogoIdAndOrdenAndIdNot(
            UUID catalogoId,
            Integer orden,
            UUID id
    ) {
        return springRepository.existsByCatalogo_IdAndOrdenAndIdNot(
                catalogoId,
                orden,
                id
        );
    }

    @Override
    public Page<CatalogoItem> findByCodigo(
            String codigo,
            Pageable pageable
    ) {
        return springRepository
                .findByCatalogo_Codigo(codigo, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<CatalogoItem> searchByCodigo(
            String codigo,
            String query,
            Pageable pageable
    ) {
        return springRepository
                .searchByCodigo(codigo, query, pageable)
                .map(mapper::toDomain);
    }
}
