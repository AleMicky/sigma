package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ProgramacionMantenimientoCriterioRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ProgramacionMantenimientoCriterioUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response.ProgramacionMantenimientoCriterioResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.ProgramacionMantenimientoCriterioService;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({
        ApiConstants.API_V1 + "/programacion-mantenimiento-criterios",
        ApiConstants.API_V1 + "/programaciones-mantenimiento-criterios"
})
@RequiredArgsConstructor
@Tag(
        name = "Criterios de Programación de Mantenimiento",
        description = "Administración individual de criterios preventivos (tiempo, odómetro, horómetro) asociados a programaciones"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class ProgramacionMantenimientoCriterioController {

    private final ProgramacionMantenimientoCriterioService service;

    @PostMapping("/programacion/{programacionId}")
    @Operation(
            summary = "Agregar un criterio a una programación",
            description = "Valida que no exista otro criterio del mismo tipo en la programación (R2) y que el activo soporte dicho dato (R3)."
    )
    public ResponseEntity<ApiResponse<ProgramacionMantenimientoCriterioResponse>> create(
            @PathVariable UUID programacionId,
            @Valid @RequestBody ProgramacionMantenimientoCriterioRequest request
    ) {
        ProgramacionMantenimientoCriterioResponse response = service.create(programacionId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Criterio agregado a la programación correctamente", response));
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Actualizar un criterio de programación",
            description = "Actualiza intervalos o valores límite. Garantiza que la programación conserve al menos un criterio activo (R1)."
    )
    public ResponseEntity<ApiResponse<ProgramacionMantenimientoCriterioResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ProgramacionMantenimientoCriterioUpdate request
    ) {
        ProgramacionMantenimientoCriterioResponse response = service.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Criterio actualizado correctamente", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener el detalle de un criterio por su ID")
    public ResponseEntity<ApiResponse<ProgramacionMantenimientoCriterioResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.findById(id)));
    }

    @GetMapping("/programacion/{programacionId}")
    @Operation(summary = "Listar los criterios de una programación específica")
    public ResponseEntity<ApiResponse<List<ProgramacionMantenimientoCriterioResponse>>> findByProgramacionId(
            @PathVariable UUID programacionId
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.findByProgramacionId(programacionId)));
    }

    @PatchMapping("/{id}/activar")
    @Operation(summary = "Activar un criterio de programación")
    public ResponseEntity<ApiResponse<ProgramacionMantenimientoCriterioResponse>> activar(
            @PathVariable UUID id
    ) {
        ProgramacionMantenimientoCriterioResponse response = service.activar(id);
        return ResponseEntity.ok(ApiResponse.success("Criterio activado correctamente", response));
    }

    @PatchMapping("/{id}/desactivar")
    @Operation(
            summary = "Desactivar un criterio de programación",
            description = "Valida que no sea el único criterio activo de la programación (Regla 1)."
    )
    public ResponseEntity<ApiResponse<ProgramacionMantenimientoCriterioResponse>> desactivar(
            @PathVariable UUID id
    ) {
        ProgramacionMantenimientoCriterioResponse response = service.desactivar(id);
        return ResponseEntity.ok(ApiResponse.success("Criterio desactivado correctamente", response));
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Eliminar un criterio de programación",
            description = "Valida que no sea el único criterio activo de la programación (Regla 1)."
    )
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Criterio eliminado correctamente", null));
    }
}
