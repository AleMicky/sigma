package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAccesorio;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoAccesorioRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAccesorioEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper.ActivoAccesorioPersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ActivoAccesorioRepositoryImpl implements ActivoAccesorioRepository {

    private final SpringActivoAccesorioRepository springRepository;
    private final ActivoAccesorioPersistenceMapper mapper;

    @Override
    public ActivoAccesorio save(ActivoAccesorio activoAccesorio) {
        ActivoAccesorioEntity entity = mapper.toEntity(activoAccesorio);
        return mapper.toDomain(springRepository.save(entity));
    }

    @Override
    public Optional<ActivoAccesorio> findById(UUID id) {
        return springRepository
                .findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public List<ActivoAccesorio> findAll() {
        return springRepository
                .findAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Page<ActivoAccesorio> findAll(Pageable pageable) {
        return springRepository
                .findAll(pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<ActivoAccesorio> findByActivoId(
            UUID activoId,
            Pageable pageable
    ) {
        return springRepository
                .findByActivoId(activoId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<ActivoAccesorio> findByAccesorioId(
            UUID accesorioId,
            Pageable pageable
    ) {
        return springRepository
                .findByAccesorioId(accesorioId, pageable)
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
    public Page<ActivoAccesorio> search(
            String query,
            Pageable pageable
    ) {
        return springRepository
                .search(query, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<ActivoAccesorio> searchByActivoId(
            UUID activoId,
            String query,
            Pageable pageable
    ) {
        return springRepository
                .searchByActivoId(activoId, query, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public boolean existsByActivoIdAndAccesorioId(
            UUID activoId,
            UUID accesorioId
    ) {
        return springRepository.existsByActivoIdAndAccesorioId(activoId, accesorioId);
    }

    @Override
    public boolean existsByActivoIdAndAccesorioIdAndIdNot(
            UUID activoId,
            UUID accesorioId,
            UUID id
    ) {
        return springRepository.existsByActivoIdAndAccesorioIdAndIdNot(activoId, accesorioId, id);
    }
}
