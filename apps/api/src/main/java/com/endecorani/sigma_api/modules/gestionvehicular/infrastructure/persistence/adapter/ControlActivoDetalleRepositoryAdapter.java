package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.ControlActivoDetalle;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ControlActivoDetalleRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ControlActivoVehicularDetalleEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper.ControlActivoVehicularPersistenceMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringControlActivoVehicularDetalleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component("gestionVehicularControlActivoDetalleRepositoryAdapter")
@RequiredArgsConstructor
public class ControlActivoDetalleRepositoryAdapter implements ControlActivoDetalleRepository {

    private final SpringControlActivoVehicularDetalleRepository springRepository;
    private final ControlActivoVehicularPersistenceMapper mapper;

    @Override
    public Optional<ControlActivoDetalle> findById(UUID id) {
        return springRepository.findById(id)
                .map(mapper::toDetalleDomain);
    }

    @Override
    public Page<ControlActivoDetalle> findAll(Pageable pageable) {
        return springRepository.findAll(pageable)
                .map(mapper::toDetalleDomain);
    }

    @Override
    public Page<ControlActivoDetalle> findByControlActivoId(UUID controlActivoId, Pageable pageable) {
        return springRepository.findByControlActivoId(controlActivoId, pageable)
                .map(mapper::toDetalleDomain);
    }

    @Override
    public List<ControlActivoDetalle> findByControlActivoId(UUID controlActivoId) {
        return springRepository.findByControlActivoId(controlActivoId).stream()
                .map(mapper::toDetalleDomain)
                .collect(Collectors.toList());
    }

    @Override
    public ControlActivoDetalle save(ControlActivoDetalle detalle) {
        ControlActivoVehicularDetalleEntity entity = mapper.toDetalleEntity(detalle);
        ControlActivoVehicularDetalleEntity saved = springRepository.save(entity);
        return mapper.toDetalleDomain(saved);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }
}
