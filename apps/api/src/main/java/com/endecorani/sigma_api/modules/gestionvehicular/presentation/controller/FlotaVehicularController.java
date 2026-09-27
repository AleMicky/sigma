package com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehicular.request.FlotaVehicularRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehicular.request.FlotaVehicularUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehicular.response.FlotaVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.FlotaVehicularService;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/flotas-vehiculares")
@RequiredArgsConstructor
@Tag(
        name = "Flotas Vehiculares",
        description = "Administración y catálogo de flotas vehiculares"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class FlotaVehicularController {

    private final FlotaVehicularService service;

    @GetMapping
    @Operation(summary = "Listar flotas vehiculares con paginación y filtros")
    public ResponseEntity<ApiResponse<PageResponse<FlotaVehicularResponse>>> listar(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean activo,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listar(search, activo, pageRequest))
        );
    }

    @GetMapping("/activas")
    @Operation(summary = "Listar todas las flotas vehiculares activas")
    public ResponseEntity<ApiResponse<List<FlotaVehicularResponse>>> findAllActivos() {
        return ResponseEntity.ok(
                ApiResponse.success(service.findAllActivos())
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una flota vehicular por ID")
    public ResponseEntity<ApiResponse<FlotaVehicularResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findById(id))
        );
    }

    @PostMapping
    @Operation(summary = "Crear una nueva flota vehicular")
    public ResponseEntity<ApiResponse<FlotaVehicularResponse>> create(
            @Valid @RequestBody FlotaVehicularRequest request
    ) {
        FlotaVehicularResponse response = service.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Flota vehicular creada correctamente", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar una flota vehicular existente")
    public ResponseEntity<ApiResponse<FlotaVehicularResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody FlotaVehicularUpdate request
    ) {
        FlotaVehicularResponse response = service.update(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Flota vehicular actualizada correctamente", response)
        );
    }

    @PatchMapping("/{id}/toggle-activo")
    @Operation(summary = "Alternar estado activo/inactivo de una flota vehicular")
    public ResponseEntity<ApiResponse<FlotaVehicularResponse>> toggleActivo(
            @PathVariable UUID id
    ) {
        FlotaVehicularResponse response = service.toggleActivo(id);
        return ResponseEntity.ok(
                ApiResponse.success("Estado de la flota vehicular actualizado correctamente", response)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar una flota vehicular")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success("Flota vehicular eliminada correctamente")
        );
    }
}
