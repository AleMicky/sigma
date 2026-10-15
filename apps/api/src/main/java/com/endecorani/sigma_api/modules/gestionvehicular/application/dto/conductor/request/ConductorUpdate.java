package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.request;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoConductor;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record ConductorUpdate(
        @NotNull(message = "El empleado es obligatorio")
        UUID empleadoId,

        EstadoConductor estado,

        @Size(max = 1000, message = "La observación no puede superar los 1000 caracteres")
        String observacion,

        @Size(max = 1000, message = "La URL de la imagen no puede superar los 1000 caracteres")
        String urlImagen,

        @Size(max = 20, message = "El tipo de sangre no puede superar los 20 caracteres")
        String tipoSangre,

        Boolean activo,

        @Valid
        List<ConductorLicenciaRequest> licencias
) {
}
