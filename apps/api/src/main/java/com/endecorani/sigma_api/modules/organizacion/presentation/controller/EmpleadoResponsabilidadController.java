package com.endecorani.sigma_api.modules.organizacion.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.organizacion.application.dto.request.EmpleadoResponsabilidadRequest;
import com.endecorani.sigma_api.modules.organizacion.application.dto.response.EmpleadoResponsabilidadResponse;
import com.endecorani.sigma_api.modules.organizacion.application.service.EmpleadoResponsabilidadService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/empleados/{empleadoId}/responsabilidades")
@RequiredArgsConstructor
@Tag(
        name = "Empleados Responsabilidades",
        description = "Administración de las responsabilidades asignadas a cada empleado de la organización"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class EmpleadoResponsabilidadController {

    private final EmpleadoResponsabilidadService empleadoResponsabilidadService;

    @PostMapping
    @Operation(summary = "Registrar una responsabilidad asignada a un empleado")
    public ResponseEntity<ApiResponse<EmpleadoResponsabilidadResponse>> create(
            @PathVariable UUID empleadoId,
            @Valid @RequestBody EmpleadoResponsabilidadRequest request
    ) {
        EmpleadoResponsabilidadResponse response =
                empleadoResponsabilidadService.create(empleadoId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Registro creado correctamente",
                                response
                        )
                );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar la responsabilidad asignada a un empleado")
    public ResponseEntity<ApiResponse<EmpleadoResponsabilidadResponse>> update(
            @PathVariable UUID empleadoId,
            @PathVariable UUID id,
            @Valid @RequestBody EmpleadoResponsabilidadRequest request
    ) {
        EmpleadoResponsabilidadResponse response =
                empleadoResponsabilidadService.update(empleadoId, id, request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro actualizado correctamente",
                        response
                )
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una responsabilidad asignada a un empleado por su identificador")
    public ResponseEntity<ApiResponse<EmpleadoResponsabilidadResponse>> findById(
            @PathVariable UUID empleadoId,
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        empleadoResponsabilidadService.findById(empleadoId, id)
                )
        );
    }

    @GetMapping
    @Operation(summary = "Listar las responsabilidades asignadas a un empleado de forma paginada")
    public ResponseEntity<ApiResponse<PageResponse<EmpleadoResponsabilidadResponse>>> findAll(
            @PathVariable UUID empleadoId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        empleadoResponsabilidadService.findAllByEmpleado(
                                empleadoId,
                                pageRequest
                        )
                )
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar una responsabilidad asignada a un empleado")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID empleadoId,
            @PathVariable UUID id
    ) {
        empleadoResponsabilidadService.delete(empleadoId, id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro eliminado correctamente"
                )
        );
    }
}
