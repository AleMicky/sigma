package com.endecorani.sigma_api.modules.cuestionarios.application.dto.response;

import java.util.List;

public record AsignacionDetalleResponse(
        AsignacionCuestionarioResponse asignacion,
        CuestionarioDetalleResponse cuestionario,
        List<RespuestaDetalleResponse> respuestas
) {}
