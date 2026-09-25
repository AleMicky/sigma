package com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.request.ConductorRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.request.ConductorUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.response.ConductorResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.ConductorService;
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
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/conductores")
@RequiredArgsConstructor
@Tag(
        name = "Conductores",
        description = "Administración de conductores del parque vehicular"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class ConductorController {

    private final ConductorService service;

    @GetMapping
    @Operation(summary = "Listar conductores con paginación y búsqueda opcional")
    public ResponseEntity<ApiResponse<PageResponse<ConductorResponse>>> listar(
            @RequestParam(required = false) String search,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listar(search, pageRequest))
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un conductor por ID")
    public ResponseEntity<ApiResponse<ConductorResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findById(id))
        );
    }

    @PostMapping
    @Operation(summary = "Crear un nuevo conductor")
    public ResponseEntity<ApiResponse<ConductorResponse>> create(
            @Valid @RequestBody ConductorRequest request
    ) {
        ConductorResponse response = service.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Conductor creado correctamente", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un conductor existente")
    public ResponseEntity<ApiResponse<ConductorResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ConductorUpdate request
    ) {
        ConductorResponse response = service.update(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Conductor actualizado correctamente", response)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un conductor")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success("Conductor eliminado correctamente")
        );
    }
}
