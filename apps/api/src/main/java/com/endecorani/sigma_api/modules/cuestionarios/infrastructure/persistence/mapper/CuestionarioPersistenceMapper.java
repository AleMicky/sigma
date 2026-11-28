package com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.cuestionarios.domain.model.Cuestionario;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioAsignacion;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioPregunta;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioPreguntaOpcion;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioRespuestaDetalle;
import com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.entity.CuestionarioAsignacionEntity;
import com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.entity.CuestionarioEntity;
import com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.entity.CuestionarioPreguntaEntity;
import com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.entity.CuestionarioPreguntaOpcionEntity;
import com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.entity.CuestionarioRespuestaDetalleEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;

@Component
public class CuestionarioPersistenceMapper {

    public Cuestionario toDomain(CuestionarioEntity e) {
        if (e == null) {
            return null;
        }
        return Cuestionario.builder()
                .id(e.getId())
                .codigo(e.getCodigo())
                .nombre(e.getNombre())
                .descripcion(e.getDescripcion())
                .moduloOrigen(e.getModuloOrigen())
                .entidadTipo(e.getEntidadTipo())
                .eventoDisparador(e.getEventoDisparador())
                .version(e.getVersion())
                .estado(e.getEstado())
                .obligatorio(e.getObligatorio())
                .anonimoEnReportes(e.getAnonimoEnReportes())
                .activo(e.getActivo())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .createdBy(e.getCreatedBy())
                .updatedBy(e.getUpdatedBy())
                .createdById(e.getCreatedById())
                .updatedById(e.getUpdatedById())
                .build();
    }

    public CuestionarioEntity toEntity(Cuestionario m) {
        if (m == null) {
            return null;
        }
        CuestionarioEntity e = new CuestionarioEntity();
        e.setId(m.getId());
        e.setCodigo(m.getCodigo());
        e.setNombre(m.getNombre());
        e.setDescripcion(m.getDescripcion());
        e.setModuloOrigen(m.getModuloOrigen());
        e.setEntidadTipo(m.getEntidadTipo());
        e.setEventoDisparador(m.getEventoDisparador());
        e.setVersion(m.getVersion());
        e.setEstado(m.getEstado());
        e.setObligatorio(m.getObligatorio());
        e.setAnonimoEnReportes(m.getAnonimoEnReportes());
        e.setActivo(m.getActivo());
        e.setCreatedAt(m.getCreatedAt());
        e.setUpdatedAt(m.getUpdatedAt());
        e.setCreatedBy(m.getCreatedBy());
        e.setUpdatedBy(m.getUpdatedBy());
        e.setCreatedById(m.getCreatedById());
        e.setUpdatedById(m.getUpdatedById());
        return e;
    }

    public CuestionarioPregunta toDomain(CuestionarioPreguntaEntity e) {
        if (e == null) {
            return null;
        }
        return CuestionarioPregunta.builder()
                .id(e.getId())
                .cuestionarioId(e.getCuestionarioId())
                .seccion(e.getSeccion())
                .orden(e.getOrden())
                .enunciado(e.getEnunciado())
                .descripcionAyuda(e.getDescripcionAyuda())
                .tipoPregunta(e.getTipoPregunta())
                .obligatoria(e.getObligatoria())
                .peso(e.getPeso())
                .configJson(e.getConfigJson() != null ? new LinkedHashMap<>(e.getConfigJson()) : null)
                .activo(e.getActivo())
                .opciones(new ArrayList<>())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .createdBy(e.getCreatedBy())
                .updatedBy(e.getUpdatedBy())
                .createdById(e.getCreatedById())
                .updatedById(e.getUpdatedById())
                .build();
    }

    public CuestionarioPreguntaEntity toEntity(CuestionarioPregunta m) {
        if (m == null) {
            return null;
        }
        CuestionarioPreguntaEntity e = new CuestionarioPreguntaEntity();
        e.setId(m.getId());
        e.setCuestionarioId(m.getCuestionarioId());
        e.setSeccion(m.getSeccion());
        e.setOrden(m.getOrden());
        e.setEnunciado(m.getEnunciado());
        e.setDescripcionAyuda(m.getDescripcionAyuda());
        e.setTipoPregunta(m.getTipoPregunta());
        e.setObligatoria(m.getObligatoria());
        e.setPeso(m.getPeso());
        e.setConfigJson(m.getConfigJson() != null ? new LinkedHashMap<>(m.getConfigJson()) : null);
        e.setActivo(m.getActivo());
        e.setCreatedAt(m.getCreatedAt());
        e.setUpdatedAt(m.getUpdatedAt());
        e.setCreatedBy(m.getCreatedBy());
        e.setUpdatedBy(m.getUpdatedBy());
        e.setCreatedById(m.getCreatedById());
        e.setUpdatedById(m.getUpdatedById());
        return e;
    }

    public CuestionarioPreguntaOpcion toDomain(CuestionarioPreguntaOpcionEntity e) {
        if (e == null) {
            return null;
        }
        return CuestionarioPreguntaOpcion.builder()
                .id(e.getId())
                .preguntaId(e.getPreguntaId())
                .orden(e.getOrden())
                .etiqueta(e.getEtiqueta())
                .valor(e.getValor())
                .puntaje(e.getPuntaje())
                .activo(e.getActivo())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .createdBy(e.getCreatedBy())
                .updatedBy(e.getUpdatedBy())
                .createdById(e.getCreatedById())
                .updatedById(e.getUpdatedById())
                .build();
    }

    public CuestionarioPreguntaOpcionEntity toEntity(CuestionarioPreguntaOpcion m) {
        if (m == null) {
            return null;
        }
        CuestionarioPreguntaOpcionEntity e = new CuestionarioPreguntaOpcionEntity();
        e.setId(m.getId());
        e.setPreguntaId(m.getPreguntaId());
        e.setOrden(m.getOrden());
        e.setEtiqueta(m.getEtiqueta());
        e.setValor(m.getValor());
        e.setPuntaje(m.getPuntaje());
        e.setActivo(m.getActivo());
        e.setCreatedAt(m.getCreatedAt());
        e.setUpdatedAt(m.getUpdatedAt());
        e.setCreatedBy(m.getCreatedBy());
        e.setUpdatedBy(m.getUpdatedBy());
        e.setCreatedById(m.getCreatedById());
        e.setUpdatedById(m.getUpdatedById());
        return e;
    }

    public CuestionarioAsignacion toDomain(CuestionarioAsignacionEntity e) {
        if (e == null) {
            return null;
        }
        return CuestionarioAsignacion.builder()
                .id(e.getId())
                .cuestionarioId(e.getCuestionarioId())
                .cuestionarioVersion(e.getCuestionarioVersion())
                .moduloOrigen(e.getModuloOrigen())
                .entidadTipo(e.getEntidadTipo())
                .entidadId(e.getEntidadId())
                .entidadCodigoRef(e.getEntidadCodigoRef())
                .evaluadoTipo(e.getEvaluadoTipo())
                .evaluadoId(e.getEvaluadoId())
                .evaluadoNombreSnapshot(e.getEvaluadoNombreSnapshot())
                .evaluadorEmpleadoId(e.getEvaluadorEmpleadoId())
                .obligatorio(e.getObligatorio())
                .anonimoEnReportes(e.getAnonimoEnReportes())
                .estado(e.getEstado())
                .fechaHabilitacion(e.getFechaHabilitacion())
                .fechaRespuesta(e.getFechaRespuesta())
                .puntajeTotal(e.getPuntajeTotal())
                .puntajeMaximo(e.getPuntajeMaximo())
                .porcentaje(e.getPorcentaje())
                .comentarioGeneral(e.getComentarioGeneral())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .createdBy(e.getCreatedBy())
                .updatedBy(e.getUpdatedBy())
                .createdById(e.getCreatedById())
                .updatedById(e.getUpdatedById())
                .build();
    }

    public CuestionarioAsignacionEntity toEntity(CuestionarioAsignacion m) {
        if (m == null) {
            return null;
        }
        CuestionarioAsignacionEntity e = new CuestionarioAsignacionEntity();
        e.setId(m.getId());
        e.setCuestionarioId(m.getCuestionarioId());
        e.setCuestionarioVersion(m.getCuestionarioVersion());
        e.setModuloOrigen(m.getModuloOrigen());
        e.setEntidadTipo(m.getEntidadTipo());
        e.setEntidadId(m.getEntidadId());
        e.setEntidadCodigoRef(m.getEntidadCodigoRef());
        e.setEvaluadoTipo(m.getEvaluadoTipo());
        e.setEvaluadoId(m.getEvaluadoId());
        e.setEvaluadoNombreSnapshot(m.getEvaluadoNombreSnapshot());
        e.setEvaluadorEmpleadoId(m.getEvaluadorEmpleadoId());
        e.setObligatorio(m.getObligatorio());
        e.setAnonimoEnReportes(m.getAnonimoEnReportes());
        e.setEstado(m.getEstado());
        e.setFechaHabilitacion(m.getFechaHabilitacion());
        e.setFechaRespuesta(m.getFechaRespuesta());
        e.setPuntajeTotal(m.getPuntajeTotal());
        e.setPuntajeMaximo(m.getPuntajeMaximo());
        e.setPorcentaje(m.getPorcentaje());
        e.setComentarioGeneral(m.getComentarioGeneral());
        e.setCreatedAt(m.getCreatedAt());
        e.setUpdatedAt(m.getUpdatedAt());
        e.setCreatedBy(m.getCreatedBy());
        e.setUpdatedBy(m.getUpdatedBy());
        e.setCreatedById(m.getCreatedById());
        e.setUpdatedById(m.getUpdatedById());
        return e;
    }

    public CuestionarioRespuestaDetalle toDomain(CuestionarioRespuestaDetalleEntity e) {
        if (e == null) {
            return null;
        }
        return CuestionarioRespuestaDetalle.builder()
                .id(e.getId())
                .asignacionId(e.getAsignacionId())
                .preguntaId(e.getPreguntaId())
                .preguntaEnunciadoSnapshot(e.getPreguntaEnunciadoSnapshot())
                .tipoPreguntaSnapshot(e.getTipoPreguntaSnapshot())
                .valorTexto(e.getValorTexto())
                .valorNumerico(e.getValorNumerico())
                .valorBooleano(e.getValorBooleano())
                .opcionId(e.getOpcionId())
                .opcionesIds(e.getOpcionesIds() != null ? new ArrayList<>(e.getOpcionesIds()) : null)
                .puntajeObtenido(e.getPuntajeObtenido())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .createdBy(e.getCreatedBy())
                .updatedBy(e.getUpdatedBy())
                .createdById(e.getCreatedById())
                .updatedById(e.getUpdatedById())
                .build();
    }

    public CuestionarioRespuestaDetalleEntity toEntity(CuestionarioRespuestaDetalle m) {
        if (m == null) {
            return null;
        }
        CuestionarioRespuestaDetalleEntity e = new CuestionarioRespuestaDetalleEntity();
        e.setId(m.getId());
        e.setAsignacionId(m.getAsignacionId());
        e.setPreguntaId(m.getPreguntaId());
        e.setPreguntaEnunciadoSnapshot(m.getPreguntaEnunciadoSnapshot());
        e.setTipoPreguntaSnapshot(m.getTipoPreguntaSnapshot());
        e.setValorTexto(m.getValorTexto());
        e.setValorNumerico(m.getValorNumerico());
        e.setValorBooleano(m.getValorBooleano());
        e.setOpcionId(m.getOpcionId());
        e.setOpcionesIds(m.getOpcionesIds() != null ? new ArrayList<>(m.getOpcionesIds()) : null);
        e.setPuntajeObtenido(m.getPuntajeObtenido());
        e.setCreatedAt(m.getCreatedAt());
        e.setUpdatedAt(m.getUpdatedAt());
        e.setCreatedBy(m.getCreatedBy());
        e.setUpdatedBy(m.getUpdatedBy());
        e.setCreatedById(m.getCreatedById());
        e.setUpdatedById(m.getUpdatedById());
        return e;
    }
}
