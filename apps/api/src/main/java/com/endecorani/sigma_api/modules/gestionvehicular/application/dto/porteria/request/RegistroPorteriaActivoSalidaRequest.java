package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record RegistroPorteriaActivoSalidaRequest(
        UUID activoId,

        @Size(max = 300, message = "La descripción del ítem no debe exceder 300 caracteres")
        String descripcionItem,

        @Min(value = 1, message = "La cantidad debe ser al menos 1")
        Integer cantidad,

        @Size(max = 500, message = "La observación de salida no debe exceder 500 caracteres")
        String observacionSalida
) {}

