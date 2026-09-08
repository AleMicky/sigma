package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.TipoMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.TipoMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.TipoMantenimientoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.TipoMantenimientoPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringTipoMantenimientoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class TipoMantenimientoRepositoryAdapter
        implements TipoMantenimientoRepository {

    private final SpringTipoMantenimientoRepository springRepository;
    private final TipoMantenimientoPersistenceMapper mapper;

    @Override
    public TipoMantenimiento save(TipoMantenimiento tipoMantenimiento) {

        TipoMantenimientoEntity entity = mapper.toEntity(tipoMantenimiento);
        TipoMantenimientoEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<TipoMantenimiento> findById(UUID id) {

        return springRepository.findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public Optional<TipoMantenimiento> findByCodigo(String codigo) {

        return springRepository
                .findByCodigoIgnoreCase(codigo)
                .map(mapper::toDomain);
    }

    @Override
    public List<TipoMantenimiento> findAll() {

        return springRepository.findAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Page<TipoMantenimiento> findAll(Pageable pageable) {
        return springRepository.findAll(pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<TipoMantenimiento> search(String query, Pageable pageable) {
        return springRepository.search(query, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public boolean existsByCodigo(String codigo) {
        return springRepository.existsByCodigoIgnoreCase(codigo);
    }

    @Override
    public boolean existsByCodigoAndIdNot(String codigo, UUID id) {
        return springRepository.existsByCodigoIgnoreCaseAndIdNot(codigo, id);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }
}