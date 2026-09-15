package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimientoTrazabilidad;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.SolicitudMantenimientoTrazabilidadEntity;
import org.springframework.stereotype.Component;

@Component
public class SolicitudMantenimientoTrazabilidadPersistenceMapper {

    public SolicitudMantenimientoTrazabilidadEntity toEntity(SolicitudMantenimientoTrazabilidad domain) {
        if (domain == null) return null;

        SolicitudMantenimientoTrazabilidadEntity entity = new SolicitudMantenimientoTrazabilidadEntity();
        entity.setId(domain.getId());
        entity.setSolicitudMantenimientoId(domain.getSolicitudMantenimientoId());
        entity.setEstadoAnterior(domain.getEstadoAnterior());
        entity.setEstadoNuevo(domain.getEstadoNuevo());
        entity.setComentario(domain.getComentario());
        entity.setEmpleadoId(domain.getEmpleadoId());
        entity.setFecha(domain.getFecha());
        return entity;
    }

    public SolicitudMantenimientoTrazabilidad toDomain(SolicitudMantenimientoTrazabilidadEntity entity) {
        if (entity == null) return null;

        return SolicitudMantenimientoTrazabilidad.builder()
                .id(entity.getId())
                .solicitudMantenimientoId(entity.getSolicitudMantenimientoId())
                .estadoAnterior(entity.getEstadoAnterior())
                .estadoNuevo(entity.getEstadoNuevo())
                .comentario(entity.getComentario())
                .empleadoId(entity.getEmpleadoId())
                .fecha(entity.getFecha())
                .build();
    }
}
