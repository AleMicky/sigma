package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.Accesorio;
import com.endecorani.sigma_api.modules.activos.domain.repository.AccesorioRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.AccesorioEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper.AccesorioPersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class AccesorioRepositoryImpl implements AccesorioRepository {

    private final SpringAccesorioRepository springRepository;
    private final AccesorioPersistenceMapper mapper;

    @Override
    public Accesorio save(Accesorio accesorio) {
        AccesorioEntity entity = mapper.toEntity(accesorio);
        return mapper.toDomain(springRepository.save(entity));
    }

    @Override
    public Optional<Accesorio> findById(UUID id) {
        return springRepository
                .findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public List<Accesorio> findAll() {
        return springRepository
                .findAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Page<Accesorio> findAll(Pageable pageable) {
        return springRepository
                .findAll(pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Accesorio> findByTipoActivoId(
            UUID tipoActivoId,
            Pageable pageable
    ) {
        return springRepository
                .findByTipoActivoId(tipoActivoId, pageable)
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
    public Page<Accesorio> search(
            String query,
            Pageable pageable
    ) {
        return springRepository
                .search(query, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Accesorio> searchByTipoActivoId(
            UUID tipoActivoId,
            String query,
            Pageable pageable
    ) {
        return springRepository
                .searchByTipoActivoId(tipoActivoId, query, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public boolean existsByTipoActivoIdAndCodigoIgnoreCase(
            UUID tipoActivoId,
            String codigo
    ) {
        return springRepository.existsByTipoActivoIdAndCodigoIgnoreCase(tipoActivoId, codigo);
    }

    @Override
    public boolean existsByTipoActivoIdAndCodigoIgnoreCaseAndIdNot(
            UUID tipoActivoId,
            String codigo,
            UUID id
    ) {
        return springRepository.existsByTipoActivoIdAndCodigoIgnoreCaseAndIdNot(tipoActivoId, codigo, id);
    }
}
