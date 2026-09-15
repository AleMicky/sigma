package com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record ChecklistItemUpdate(
        UUID checklistMantenimientoId,

        @NotBlank(message = "El código es obligatorio")
        @Size(max = 50, message = "El código no puede superar los 50 caracteres")
        String codigo,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 200, message = "El nombre no puede superar los 200 caracteres")
        String nombre,

        @Size(max = 500, message = "La descripción no puede superar los 500 caracteres")
        String descripcion,

        @NotNull(message = "El tipo de dato es obligatorio")
        UUID tipoDatoId,

        @NotNull(message = "El orden es obligatorio")
        @Min(value = 0, message = "El orden debe ser mayor o igual a 0")
        Integer orden,

        Boolean obligatorio,

        String opciones
) {
}
