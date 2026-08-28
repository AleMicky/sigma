package com.endecorani.sigma_api.modules.organizacion.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.organizacion.application.dto.request.EmpleadoRequest;
import com.endecorani.sigma_api.modules.organizacion.application.dto.response.EmpleadoResponse;
import com.endecorani.sigma_api.modules.organizacion.application.service.EmpleadoService;
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
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/empleados")
@RequiredArgsConstructor
@Tag(
        name = "Empleados",
        description = "Administración de empleados de la organización"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class EmpleadoController {

    private final EmpleadoService empleadoService;

    @PostMapping
    @Operation(summary = "Registrar un empleado")
    public ResponseEntity<ApiResponse<EmpleadoResponse>> create(
            @Valid @RequestBody EmpleadoRequest request
    ) {
        EmpleadoResponse response = empleadoService.create(request);

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
    @Operation(summary = "Actualizar un empleado")
    public ResponseEntity<ApiResponse<EmpleadoResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody EmpleadoRequest request
    ) {
        EmpleadoResponse response = empleadoService.update(id, request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro actualizado correctamente",
                        response
                )
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un empleado por su identificador")
    public ResponseEntity<ApiResponse<EmpleadoResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        empleadoService.findById(id)
                )
        );
    }

    @GetMapping
    @Operation(summary = "Listar empleados de forma paginada")
    public ResponseEntity<ApiResponse<PageResponse<EmpleadoResponse>>> findAll(
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        empleadoService.findAll(pageRequest)
                )
        );
    }

    @GetMapping("/mis-empleados")
    @Operation(summary = "Listar empleados con código, nombre completo y cargo. Admin: todos; resto: solo los de su persona")
    public ResponseEntity<ApiResponse<PageResponse<EmpleadoResponse>>> findMisEmpleados(
            @Valid @ModelAttribute PageRequestDto pageRequest,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        empleadoService.findMisEmpleados(pageRequest, authentication)
                )
        );
    }

    @GetMapping("/area/{areaId}")
    @Operation(summary = "Listar empleados pertenecientes a un área específica")
    public ResponseEntity<ApiResponse<PageResponse<EmpleadoResponse>>> findByAreaPath(
            @PathVariable UUID areaId,
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        empleadoService.find(null, areaId, null, q, pageRequest)
                )
        );
    }

    @GetMapping("/buscar")
    @Operation(summary = "Listar empleados con filtros opcionales por persona, área, cargo o búsqueda")
    public ResponseEntity<ApiResponse<PageResponse<EmpleadoResponse>>> find(
            @RequestParam(required = false) UUID personaId,
            @RequestParam(required = false) UUID areaId,
            @RequestParam(required = false) UUID cargoId,
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        if (personaId == null && areaId == null && cargoId == null && q == null) {
            return ResponseEntity.ok(
                    ApiResponse.success(
                            empleadoService.findAll(pageRequest)
                    )
            );
        }

        return ResponseEntity.ok(
                ApiResponse.success(
                        empleadoService.find(personaId, areaId, cargoId, q, pageRequest)
                )
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un empleado")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        empleadoService.delete(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro eliminado correctamente"
                )
        );
    }
}