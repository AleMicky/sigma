package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimientoTrazabilidad;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoTrazabilidadRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.SolicitudMantenimientoTrazabilidadEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.SolicitudMantenimientoTrazabilidadPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringSolicitudMantenimientoTrazabilidadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class SolicitudMantenimientoTrazabilidadRepositoryAdapter implements SolicitudMantenimientoTrazabilidadRepository {

    private final SpringSolicitudMantenimientoTrazabilidadRepository springRepository;
    private final SolicitudMantenimientoTrazabilidadPersistenceMapper mapper;

    @Override
    public SolicitudMantenimientoTrazabilidad save(SolicitudMantenimientoTrazabilidad trazabilidad) {
        SolicitudMantenimientoTrazabilidadEntity entity = mapper.toEntity(trazabilidad);
        SolicitudMantenimientoTrazabilidadEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public List<SolicitudMantenimientoTrazabilidad> findBySolicitudMantenimientoId(UUID solicitudMantenimientoId) {
        return springRepository.findBySolicitudMantenimientoIdOrderByFechaAsc(solicitudMantenimientoId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }
}
