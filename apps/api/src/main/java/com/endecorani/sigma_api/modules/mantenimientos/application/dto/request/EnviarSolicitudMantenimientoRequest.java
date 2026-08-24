package com.endecorani.sigma_api.modules.mantenimientos.application.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record EnviarSolicitudMantenimientoRequest(

        @NotNull
        UUID aprobadorId,

        @NotNull
        UUID supervisorId

) {

}