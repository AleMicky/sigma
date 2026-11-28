package com.endecorani.sigma_api.modules.cuestionarios.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record MisAsignacionesLoteRequest(
        @NotBlank(message = "El tipo de entidad es obligatorio")
        @Size(max = 60, message = "El tipo de entidad no puede exceder 60 caracteres")
        String entidadTipo,

        @NotNull(message = "La lista de identificadores de entidad es obligatoria")
        @Size(max = 100, message = "Se permite consultar un máximo de 100 entidades por lote")
        List<UUID> entidadIds
) {}
