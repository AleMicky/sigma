package com.endecorani.sigma_api.modules.cuestionarios.application.dto.response;

import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.EstadoCuestionario;

import java.time.Instant;
import java.util.UUID;

public record CuestionarioResponse(
        UUID id,
        String codigo,
        String nombre,
        String descripcion,
        String moduloOrigen,
        String entidadTipo,
        String eventoDisparador,
        Integer version,
        EstadoCuestionario estado,
        Boolean obligatorio,
        Boolean anonimoEnReportes,
        Boolean activo,
        long totalPreguntas,
        long totalRespuestas,
        Instant createdAt,
        Instant updatedAt
) {}
