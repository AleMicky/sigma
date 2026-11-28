package com.endecorani.sigma_api.modules.cuestionarios.application.dto.response;

import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.EstadoAsignacionCuestionario;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AsignacionCuestionarioResponse(
        UUID id,
        UUID cuestionarioId,
        String cuestionarioNombre,
        String cuestionarioCodigo,
        Integer cuestionarioVersion,
        String moduloOrigen,
        String entidadTipo,
        UUID entidadId,
        String entidadCodigoRef,
        String evaluadoTipo,
        UUID evaluadoId,
        String evaluadoNombre,
        UUID evaluadorEmpleadoId,
        String evaluadorNombre,
        Boolean obligatorio,
        Boolean anonimoEnReportes,
        EstadoAsignacionCuestionario estado,
        Instant fechaHabilitacion,
        Instant fechaRespuesta,
        BigDecimal puntajeTotal,
        BigDecimal puntajeMaximo,
        BigDecimal porcentaje,
        String comentarioGeneral
) {}
