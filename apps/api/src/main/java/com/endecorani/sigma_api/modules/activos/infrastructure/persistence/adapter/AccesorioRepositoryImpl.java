package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.activos.domain.model.Accesorio;
import com.endecorani.sigma_api.modules.activos.domain.repository.AccesorioRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.AccesorioEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper.AccesorioPersistenceMapper;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringAccesorioRepository;
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
    public Page<Accesorio> findByCategoriaId(
            UUID categoriaId,
            Pageable pageable
    ) {
        return springRepository
                .findByCategoriaId(categoriaId, pageable)
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
    public Page<Accesorio> searchByCategoriaId(
            UUID categoriaId,
            String query,
            Pageable pageable
    ) {
        return springRepository
                .searchByCategoriaId(categoriaId, query, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public boolean existsByCategoriaIdAndCodigoIgnoreCase(
            UUID categoriaId,
            String codigo
    ) {
        return springRepository.existsByCategoriaIdAndCodigoIgnoreCase(categoriaId, codigo);
    }

    @Override
    public boolean existsByCategoriaIdAndCodigoIgnoreCaseAndIdNot(
            UUID categoriaId,
            String codigo,
            UUID id
    ) {
        return springRepository.existsByCategoriaIdAndCodigoIgnoreCaseAndIdNot(categoriaId, codigo, id);
    }
}
