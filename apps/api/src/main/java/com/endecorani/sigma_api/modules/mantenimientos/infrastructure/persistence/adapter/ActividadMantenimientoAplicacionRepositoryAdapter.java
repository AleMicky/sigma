package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ActividadMantenimientoAplicacion;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ActividadMantenimientoAplicacionRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ActividadMantenimientoAplicacionEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.ActividadMantenimientoPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringActividadMantenimientoAplicacionRepository;
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
public class ActividadMantenimientoAplicacionRepositoryAdapter implements ActividadMantenimientoAplicacionRepository {

    private final SpringActividadMantenimientoAplicacionRepository springRepository;
    private final ActividadMantenimientoPersistenceMapper mapper;

    @Override
    public Optional<ActividadMantenimientoAplicacion> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toAplicacionDomain);
    }

    @Override
    public Page<ActividadMantenimientoAplicacion> findAll(Pageable pageable) {
        return springRepository.findAll(pageable).map(mapper::toAplicacionDomain);
    }

    @Override
    public Page<ActividadMantenimientoAplicacion> findByActividadMantenimientoId(UUID actividadMantenimientoId, Pageable pageable) {
        return springRepository.findByActividadMantenimientoId(actividadMantenimientoId, pageable).map(mapper::toAplicacionDomain);
    }

    @Override
    public List<ActividadMantenimientoAplicacion> findByActividadMantenimientoId(UUID actividadMantenimientoId) {
        return springRepository.findByActividadMantenimientoId(actividadMantenimientoId).stream()
                .map(mapper::toAplicacionDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<ActividadMantenimientoAplicacion> findByTipoActivoId(UUID tipoActivoId) {
        return springRepository.findByTipoActivoId(tipoActivoId).stream()
                .map(mapper::toAplicacionDomain)
                .collect(Collectors.toList());
    }

    @Override
    public ActividadMantenimientoAplicacion save(ActividadMantenimientoAplicacion aplicacion) {
        ActividadMantenimientoAplicacionEntity entity = mapper.toAplicacionEntity(aplicacion);
        ActividadMantenimientoAplicacionEntity saved = springRepository.save(entity);
        return mapper.toAplicacionDomain(saved);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }

    @Override
    public boolean existsByActividadMantenimientoId(UUID actividadMantenimientoId) {
        return springRepository.existsByActividadMantenimientoId(actividadMantenimientoId);
    }

    @Override
    public boolean existsByActividadMantenimientoIdAndTipoActivoIdAndComponenteId(UUID actividadMantenimientoId, UUID tipoActivoId, UUID componenteId) {
        return springRepository.existsByActividadMantenimientoIdAndTipoActivoIdAndComponenteId(actividadMantenimientoId, tipoActivoId, componenteId);
    }
}
