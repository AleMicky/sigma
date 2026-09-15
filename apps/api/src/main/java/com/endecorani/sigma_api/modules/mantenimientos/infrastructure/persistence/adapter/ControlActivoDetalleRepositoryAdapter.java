package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ControlActivoDetalle;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ControlActivoDetalleRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ControlActivoDetalleEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.ControlActivoPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringControlActivoDetalleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class ControlActivoDetalleRepositoryAdapter implements ControlActivoDetalleRepository {

    private final SpringControlActivoDetalleRepository springRepository;
    private final ControlActivoPersistenceMapper mapper;

    @Override
    public Optional<ControlActivoDetalle> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDetalleDomain);
    }

    @Override
    public Page<ControlActivoDetalle> findAll(Pageable pageable) {
        return springRepository.findAll(pageable).map(mapper::toDetalleDomain);
    }

    @Override
    public Page<ControlActivoDetalle> findByControlActivoId(UUID controlActivoId, Pageable pageable) {
        return springRepository.findByControlActivoId(controlActivoId, pageable).map(mapper::toDetalleDomain);
    }

    @Override
    public List<ControlActivoDetalle> findByControlActivoId(UUID controlActivoId) {
        return springRepository.findByControlActivoId(controlActivoId).stream()
                .map(mapper::toDetalleDomain)
                .collect(Collectors.toList());
    }

    @Override
    public ControlActivoDetalle save(ControlActivoDetalle detalle) {
        ControlActivoDetalleEntity entity = mapper.toDetalleEntity(detalle);
        ControlActivoDetalleEntity saved = springRepository.save(entity);
        return mapper.toDetalleDomain(saved);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }
}
