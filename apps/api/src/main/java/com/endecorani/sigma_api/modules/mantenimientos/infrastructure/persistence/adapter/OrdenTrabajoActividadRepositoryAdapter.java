package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoActividad;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoActividadRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.OrdenTrabajoActividadEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.OrdenTrabajoPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringOrdenTrabajoActividadRepository;
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
public class OrdenTrabajoActividadRepositoryAdapter implements OrdenTrabajoActividadRepository {

    private final SpringOrdenTrabajoActividadRepository springRepository;
    private final OrdenTrabajoPersistenceMapper mapper;

    @Override
    public Optional<OrdenTrabajoActividad> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toActividadDomain);
    }

    @Override
    public Page<OrdenTrabajoActividad> findAll(Pageable pageable) {
        return springRepository.findAll(pageable).map(mapper::toActividadDomain);
    }

    @Override
    public Page<OrdenTrabajoActividad> findByOrdenTrabajoId(UUID ordenTrabajoId, Pageable pageable) {
        return springRepository.findByOrdenTrabajoId(ordenTrabajoId, pageable).map(mapper::toActividadDomain);
    }

    @Override
    public List<OrdenTrabajoActividad> findByOrdenTrabajoId(UUID ordenTrabajoId) {
        return springRepository.findByOrdenTrabajoId(ordenTrabajoId).stream()
                .map(mapper::toActividadDomain)
                .collect(Collectors.toList());
    }

    @Override
    public OrdenTrabajoActividad save(OrdenTrabajoActividad actividad) {
        if (actividad.getId() != null) {
            Optional<OrdenTrabajoActividadEntity> existingOpt = springRepository.findById(actividad.getId());
            if (existingOpt.isPresent()) {
                OrdenTrabajoActividadEntity entity = existingOpt.get();
                entity.setOrdenTrabajoId(actividad.getOrdenTrabajoId());
                entity.setActividadMantenimientoId(actividad.getActividadMantenimientoId());
                entity.setDescripcion(actividad.getDescripcion());
                entity.setRealizado(actividad.isRealizado());
                entity.setObservacion(actividad.getObservacion());
                entity.setFechaRealizacion(actividad.getFechaRealizacion());
                OrdenTrabajoActividadEntity saved = springRepository.save(entity);
                return mapper.toActividadDomain(saved);
            }
        }
        OrdenTrabajoActividadEntity entity = mapper.toActividadEntity(actividad);
        OrdenTrabajoActividadEntity saved = springRepository.save(entity);
        return mapper.toActividadDomain(saved);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }
}
