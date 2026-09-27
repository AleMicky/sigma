package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.viajevehicular.request;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoViajeVehicular;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

public record ViajeVehicularUpdate(
        @NotNull(message = "La asignación vehicular es obligatoria")
        UUID asignacionVehicularId,

        LocalDateTime fechaSalidaReal,

        Long kilometrajeSalida,

        LocalDateTime fechaRetornoReal,

        Long kilometrajeRetorno,

        EstadoViajeVehicular estado,

        @Size(max = 1000, message = "La observación no puede superar los 1000 caracteres")
        String observacion
) {
}
