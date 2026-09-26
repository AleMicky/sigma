package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

public record SolicitudVehicularRequest(
        @NotBlank(message = "El número es obligatorio")
        @Size(max = 50, message = "El número no puede superar los 50 caracteres")
        String numero,

        @NotNull(message = "El tipo de solicitud vehicular es obligatorio")
        UUID tipoSolicitudVehicularId,

        @NotNull(message = "El solicitante es obligatorio")
        UUID solicitanteId,

        @NotBlank(message = "El motivo es obligatorio")
        @Size(max = 500, message = "El motivo no puede superar los 500 caracteres")
        String motivo,

        @Size(max = 1000, message = "La justificación no puede superar los 1000 caracteres")
        String justificacion,

        @NotBlank(message = "El destino es obligatorio")
        @Size(max = 255, message = "El destino no puede superar los 255 caracteres")
        String destino,

        @NotNull(message = "La fecha de salida es obligatoria")
        LocalDateTime fechaSalida,

        @NotNull(message = "La fecha de retorno estimada es obligatoria")
        LocalDateTime fechaRetornoEstimada,

        @NotNull(message = "La cantidad de pasajeros es obligatoria")
        @Min(value = 1, message = "La cantidad de pasajeros debe ser al menos 1")
        Integer cantidadPasajeros,

        @Size(max = 1000, message = "La observación no puede superar los 1000 caracteres")
        String observacion,

        @Size(max = 30, message = "El estado no puede superar los 30 caracteres")
        String estado,

        @Size(max = 100, message = "El processInstanceId no puede superar los 100 caracteres")
        String processInstanceId
) {
}
