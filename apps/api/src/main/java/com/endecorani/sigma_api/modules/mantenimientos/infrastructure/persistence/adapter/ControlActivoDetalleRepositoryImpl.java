package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ControlActivoDetalle;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ControlActivoDetalleRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ControlActivoDetalleEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.ControlActivoDetallePersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringControlActivoDetalleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ControlActivoDetalleRepositoryImpl implements ControlActivoDetalleRepository {

    private final SpringControlActivoDetalleRepository springRepository;

    private final ControlActivoDetallePersistenceMapper mapper;

    @Override
    public ControlActivoDetalle save(ControlActivoDetalle domain) {
        ControlActivoDetalleEntity entity = mapper.toEntity(domain);
        ControlActivoDetalleEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<ControlActivoDetalle> findById(UUID id) {
        return springRepository
                .findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public List<ControlActivoDetalle> findAll() {
        return springRepository
                .findAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Page<ControlActivoDetalle> findAll(Pageable pageable) {
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
    public boolean existsByControlActivoIdAndAccesorioId(
            UUID controlActivoId,
            UUID accesorioId
    ) {
        return springRepository
                .existsByControlActivoIdAndAccesorioId(
                        controlActivoId,
                        accesorioId
                );
    }

    @Override
    public boolean existsByControlActivoIdAndAccesorioIdAndIdNot(
            UUID controlActivoId,
            UUID accesorioId,
            UUID id
    ) {
        return springRepository
                .existsByControlActivoIdAndAccesorioIdAndIdNot(
                        controlActivoId,
                        accesorioId,
                        id
                );
    }

    @Override
    public Page<ControlActivoDetalle> findByControlActivoId(
            UUID controlActivoId,
            Pageable pageable
    ) {
        return springRepository
                .findByControlActivoId(controlActivoId, pageable)
                .map(mapper::toDomain);
    }
}
