package com.endecorani.sigma_api.modules.seguridad.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Solicitud para asignar menús a un rol")
public class AsignarMenusRolRequest {

    @NotNull(message = "La lista de menús no puede ser nula")
    @Schema(
            description = "Lista de identificadores de menús asignados al rol",
            example = "[\"b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d\"]"
    )
    private List<UUID> menuIds;
}
