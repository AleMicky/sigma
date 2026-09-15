package com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.request;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.request.ChecklistItemUpdate;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record ActividadMantenimientoAplicacionUpdate(
        UUID id,

        UUID actividadMantenimientoId,

        @NotNull(message = "El tipo de activo es obligatorio")
        UUID tipoActivoId,

        UUID componenteId,

        @Valid
        List<ChecklistItemUpdate> checklist
) {
}
