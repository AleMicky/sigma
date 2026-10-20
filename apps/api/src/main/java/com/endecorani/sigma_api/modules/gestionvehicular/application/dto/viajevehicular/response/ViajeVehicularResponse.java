package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.viajevehicular.response;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.asignacionvehicular.response.AsignacionVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoViajeVehicular;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.UUID;

public record ViajeVehicularResponse(
        UUID id,
        UUID asignacionVehicularId,
        AsignacionVehicularResponse asignacionVehicular,
        LocalDateTime fechaSalidaReal,
        Long kilometrajeSalida,
        LocalDateTime fechaRetornoReal,
        Long kilometrajeRetorno,
        EstadoViajeVehicular estado,
        String observacion,
        AuditoriaResponse auditoria
) {
    @JsonProperty("kilometrajeRecorrido")
    public Long getKilometrajeRecorrido() {
        if (kilometrajeRetorno != null && kilometrajeSalida != null && kilometrajeRetorno >= kilometrajeSalida) {
            return kilometrajeRetorno - kilometrajeSalida;
        }
        return null;
    }
}
