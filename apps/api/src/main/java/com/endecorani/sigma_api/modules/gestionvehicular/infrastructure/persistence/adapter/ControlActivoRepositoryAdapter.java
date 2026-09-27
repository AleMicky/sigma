package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.ControlActivo;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ControlActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ControlActivoVehicularDetalleEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ControlActivoVehicularEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper.ControlActivoVehicularPersistenceMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringControlActivoVehicularRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component("gestionVehicularControlActivoRepositoryAdapter")
@RequiredArgsConstructor
public class ControlActivoRepositoryAdapter implements ControlActivoRepository {

    private final SpringControlActivoVehicularRepository springRepository;
    private final ControlActivoVehicularPersistenceMapper mapper;

    @Override
    public Page<ControlActivo> findAll(Pageable pageable) {
        return springRepository.findAll(pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Optional<ControlActivo> findById(UUID id) {
        return springRepository.findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public List<ControlActivo> findBySolicitudVehicularId(UUID solicitudVehicularId) {
        return springRepository.findBySolicitudVehicularId(solicitudVehicularId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<ControlActivo> findByAsignacionVehicularId(UUID asignacionVehicularId) {
        return springRepository.findByAsignacionVehicularId(asignacionVehicularId).stream()
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
    public ControlActivo save(ControlActivo domain) {
        ControlActivoVehicularEntity entityToSave;

        if (domain.getId() != null) {
            Optional<ControlActivoVehicularEntity> existingEntityOpt = springRepository.findById(domain.getId());
            if (existingEntityOpt.isPresent()) {
                ControlActivoVehicularEntity existingEntity = existingEntityOpt.get();
                existingEntity.setSolicitudVehicularId(domain.getSolicitudVehicularId());
                existingEntity.setAsignacionVehicularId(domain.getAsignacionVehicularId());
                existingEntity.setActivoId(domain.getActivoId());
                existingEntity.setTipo(domain.getTipo());
                existingEntity.setRecibidoPorId(domain.getRecibidoPorId());
                existingEntity.setFecha(domain.getFecha());
                existingEntity.setConforme(domain.isConforme());
                existingEntity.setObservacion(domain.getObservacion());

                if (domain.getDetalles() != null) {
                    Map<UUID, ControlActivoVehicularDetalleEntity> existingDetallesMap = existingEntity.getDetalles().stream()
                            .filter(d -> d.getId() != null)
                            .collect(Collectors.toMap(ControlActivoVehicularDetalleEntity::getId, d -> d));

                    List<ControlActivoVehicularDetalleEntity> updatedDetalles = new ArrayList<>();

                    for (var detalleDomain : domain.getDetalles()) {
                        if (detalleDomain.getId() != null && existingDetallesMap.containsKey(detalleDomain.getId())) {
                            ControlActivoVehicularDetalleEntity existingDetalle = existingDetallesMap.get(detalleDomain.getId());
                            existingDetalle.setAccesorioId(detalleDomain.getAccesorioId());
                            existingDetalle.setCantidadEsperada(detalleDomain.getCantidadEsperada());
                            existingDetalle.setCantidadEncontrada(detalleDomain.getCantidadEncontrada());
                            existingDetalle.setConforme(detalleDomain.isConforme());
                            existingDetalle.setObservacion(detalleDomain.getObservacion());
                            updatedDetalles.add(existingDetalle);
                        } else {
                            ControlActivoVehicularDetalleEntity newDetalle = mapper.toDetalleEntity(detalleDomain);
                            updatedDetalles.add(newDetalle);
                        }
                    }

                    existingEntity.getDetalles().clear();
                    existingEntity.getDetalles().addAll(updatedDetalles);
                }

                entityToSave = existingEntity;
            } else {
                entityToSave = mapper.toEntity(domain);
            }
        } else {
            entityToSave = mapper.toEntity(domain);
        }

        ControlActivoVehicularEntity savedEntity = springRepository.save(entityToSave);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }
}
