package com.endecorani.sigma_api.modules.seguridad.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Solicitud para asignar o desasociar una persona a un usuario")
public class AsignarPersonaUsuarioRequest {

    @Schema(
            description = "Identificador de la persona (null para desasociar)",
            example = "b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"
    )
    private UUID personaId;
}
