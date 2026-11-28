package com.endecorani.sigma_api.modules.cuestionarios.application.dto.response;

import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.TipoPregunta;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record RespuestaDetalleResponse(
        UUID id,
        UUID preguntaId,
        String preguntaEnunciadoSnapshot,
        TipoPregunta tipoPreguntaSnapshot,
        String valorTexto,
        BigDecimal valorNumerico,
        Boolean valorBooleano,
        UUID opcionId,
        List<UUID> opcionesIds,
        BigDecimal puntajeObtenido
) {}
