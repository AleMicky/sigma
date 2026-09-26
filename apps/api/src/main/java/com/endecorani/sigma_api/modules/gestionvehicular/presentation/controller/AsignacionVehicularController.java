package com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.asignacionvehicular.request.AsignacionVehicularRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.asignacionvehicular.request.AsignacionVehicularUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.asignacionvehicular.response.AsignacionVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.AsignacionVehicularService;
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
@RequestMapping(ApiConstants.API_V1 + "/asignaciones-vehiculares")
@RequiredArgsConstructor
@Tag(
        name = "Asignaciones Vehiculares",
        description = "Administración de asignaciones de vehículos y conductores a solicitudes vehiculares"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class AsignacionVehicularController {

    private final AsignacionVehicularService service;

    @GetMapping
    @Operation(summary = "Listar asignaciones vehiculares con paginación y filtros opcionales")
    public ResponseEntity<ApiResponse<PageResponse<AsignacionVehicularResponse>>> listar(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID solicitudVehicularId,
            @RequestParam(required = false) UUID activoId,
            @RequestParam(required = false) UUID conductorId,
            @RequestParam(required = false) UUID asignadoPorId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listar(search, solicitudVehicularId, activoId, conductorId, asignadoPorId, pageRequest))
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una asignación vehicular por ID")
    public ResponseEntity<ApiResponse<AsignacionVehicularResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findById(id))
        );
    }

    @GetMapping("/solicitud/{solicitudVehicularId}")
    @Operation(summary = "Listar asignaciones de una solicitud vehicular")
    public ResponseEntity<ApiResponse<List<AsignacionVehicularResponse>>> findBySolicitudVehicularId(
            @PathVariable UUID solicitudVehicularId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findBySolicitudVehicularId(solicitudVehicularId))
        );
    }

    @PostMapping
    @Operation(summary = "Crear una nueva asignación vehicular")
    public ResponseEntity<ApiResponse<AsignacionVehicularResponse>> create(
            @Valid @RequestBody AsignacionVehicularRequest request
    ) {
        AsignacionVehicularResponse response = service.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Asignación vehicular creada correctamente", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar una asignación vehicular existente")
    public ResponseEntity<ApiResponse<AsignacionVehicularResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody AsignacionVehicularUpdate request
    ) {
        AsignacionVehicularResponse response = service.update(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Asignación vehicular actualizada correctamente", response)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar una asignación vehicular")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success("Asignación vehicular eliminada correctamente")
        );
    }
}
