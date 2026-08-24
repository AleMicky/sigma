package com.endecorani.sigma_api.modules.mantenimientos.application.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;

import java.util.UUID;

public record EnviarSolicitudMantenimientoRequest(

        @JsonAlias({"aprobadorId"})
        UUID aprobadoPorId,

        UUID aprobadorId,

        UUID supervisorId

) {

    public UUID getEffectiveAprobadorId() {
        return aprobadoPorId != null ? aprobadoPorId : aprobadorId;
    }
}