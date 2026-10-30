package com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response;

public record BatchProgramacionTipoResponse(
        int creados,
        int actualizados,
        int totalProcesados,
        String mensaje
) {}

