package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.response;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.vehiculo.response.VehiculoAtributoResponse;
import lombok.Builder;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Builder
public record SalidaVehicularResponse(
        UUID id,
        String numero,
        UUID activoId,
        String activoCodigo,
        String activoDescripcion,
        String urlImagen,
        String placa,
        String marca,
        String modelo,
        List<VehiculoAtributoResponse> atributos,
        UUID empleadoId,
        String empleadoCodigo,
        String empleadoNombre,
        Instant fecha,
        String descripcionActividad,
        String observaciones,
        String estado,
        String processInstanceId,
        List<SalidaVehicularEventoResponse> eventos,
        List<BitacoraVehicularResponse> bitacoras,
        Instant createdAt,
        Instant updatedAt
) {
}
