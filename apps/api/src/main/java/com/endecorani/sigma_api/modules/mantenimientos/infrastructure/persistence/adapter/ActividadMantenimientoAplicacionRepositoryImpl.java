package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ActividadMantenimientoAplicacion;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ActividadMantenimientoAplicacionRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ActividadMantenimientoAplicacionEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.ActividadMantenimientoAplicacionPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.specification.SpringActividadMantenimientoAplicacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ActividadMantenimientoAplicacionRepositoryImpl
        implements ActividadMantenimientoAplicacionRepository {

    private final SpringActividadMantenimientoAplicacionRepository springRepository;
    private final ActividadMantenimientoAplicacionPersistenceMapper mapper;

    @Override
    public ActividadMantenimientoAplicacion save(
            ActividadMantenimientoAplicacion domain
    ) {
        ActividadMantenimientoAplicacionEntity entity =
                mapper.toEntity(domain);
        return mapper.toDomain(springRepository.save(entity));
    }

    @Override
    public Optional<ActividadMantenimientoAplicacion> findById(UUID id) {
        return springRepository
                .findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public List<ActividadMantenimientoAplicacion> findAll() {
        return springRepository
                .findAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Page<ActividadMantenimientoAplicacion> findAll(
            Pageable pageable
    ) {
        return springRepository
                .findAll(pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<ActividadMantenimientoAplicacion>
    findByActividadMantenimientoId(
            UUID actividadMantenimientoId,
            Pageable pageable
    ) {
        return springRepository
                .findByActividadMantenimientoId(
                        actividadMantenimientoId,
                        pageable
                )
                .map(mapper::toDomain);
    }

    @Override
    public Page<ActividadMantenimientoAplicacion> findByTipoActivoId(
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
    public boolean
    existsByActividadMantenimientoIdAndTipoActivoIdAndComponenteId(
            UUID actividadMantenimientoId,
            UUID tipoActivoId,
            UUID componenteId
    ) {
        return springRepository
                .existsByActividadMantenimientoIdAndTipoActivoIdAndComponenteId(
                        actividadMantenimientoId,
                        tipoActivoId,
                        componenteId
                );
    }

    @Override
    public boolean
    existsByActividadMantenimientoIdAndTipoActivoIdAndComponenteIdAndIdNot(
            UUID actividadMantenimientoId,
            UUID tipoActivoId,
            UUID componenteId,
            UUID id
    ) {
        return springRepository
                .existsByActividadMantenimientoIdAndTipoActivoIdAndComponenteIdAndIdNot(
                        actividadMantenimientoId,
                        tipoActivoId,
                        componenteId,
                        id
                );
    }
}
