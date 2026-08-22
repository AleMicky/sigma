package com.endecorani.sigma_api.modules.organizacion.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.util.UUID;

@Schema(
        name = "PersonaResponse",
        description = "Información de una persona"
)
public record PersonaResponse(
        UUID id,
        String tipoDocumento,
        String numeroDocumento,
        String complemento,
        String nombres,
        String primerApellido,
        String segundoApellido,
        LocalDate fechaNacimiento,
        String telefono,
        String correo,
        AuditoriaResponse auditoria
) {

}

