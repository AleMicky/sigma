package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ControlActivo;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ControlActivoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ControlActivoDetalleEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ControlActivoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.ControlActivoPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringControlActivoRepository;
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
public class ControlActivoRepositoryAdapter implements ControlActivoRepository {

    private final SpringControlActivoRepository springRepository;
    private final ControlActivoPersistenceMapper mapper;

    @Override
    public Page<ControlActivo> findAll(Pageable pageable) {
        return springRepository.findAll(pageable).map(mapper::toDomain);
    }

    @Override
    public Optional<ControlActivo> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<ControlActivo> findBySolicitudMantenimientoId(UUID solicitudMantenimientoId) {
        return springRepository.findBySolicitudMantenimientoId(solicitudMantenimientoId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<ControlActivo> findByOrdenTrabajoId(UUID ordenTrabajoId) {
        return springRepository.findByOrdenTrabajoId(ordenTrabajoId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<ControlActivo> findByActivoId(UUID activoId) {
        return springRepository.findByActivoId(activoId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public ControlActivo save(ControlActivo controlActivo) {
        if (controlActivo.getId() != null) {
            Optional<ControlActivoEntity> existingOpt = springRepository.findById(controlActivo.getId());
            if (existingOpt.isPresent()) {
                ControlActivoEntity existing = existingOpt.get();
                existing.setSolicitudMantenimientoId(controlActivo.getSolicitudMantenimientoId());
                existing.setOrdenTrabajoId(controlActivo.getOrdenTrabajoId());
                existing.setActivoId(controlActivo.getActivoId());
                existing.setTipo(controlActivo.getTipo());
                existing.setEntregadoPorId(controlActivo.getEntregadoPorId());
                existing.setRecibidoPorId(controlActivo.getRecibidoPorId());
                existing.setFecha(controlActivo.getFecha());
                existing.setConforme(controlActivo.isConforme());
                existing.setObservacion(controlActivo.getObservacion());

                if (controlActivo.getDetalles() != null) {
                    existing.getDetalles().clear();
                    springRepository.saveAndFlush(existing);

                    List<ControlActivoDetalleEntity> newDetalles = controlActivo.getDetalles().stream()
                            .map(mapper::toDetalleEntity)
                            .collect(Collectors.toList());
                    existing.getDetalles().addAll(newDetalles);
                }

                ControlActivoEntity saved = springRepository.save(existing);
                return mapper.toDomain(saved);
            }
        }

        ControlActivoEntity entity = mapper.toEntity(controlActivo);
        ControlActivoEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }
}
