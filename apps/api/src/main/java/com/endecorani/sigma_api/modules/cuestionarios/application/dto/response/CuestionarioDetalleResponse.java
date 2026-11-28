package com.endecorani.sigma_api.modules.cuestionarios.application.dto.response;

import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.EstadoCuestionario;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CuestionarioDetalleResponse(
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
        long totalRespuestas,
        List<PreguntaResponse> preguntas,
        Instant createdAt,
        Instant updatedAt
) {}
