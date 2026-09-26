package com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.request.SolicitudVehicularRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.request.SolicitudVehicularUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response.SolicitudVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.SolicitudVehicularService;
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
@RequestMapping(ApiConstants.API_V1 + "/solicitudes-vehiculares")
@RequiredArgsConstructor
@Tag(
        name = "Solicitudes Vehiculares",
        description = "Administración de solicitudes vehiculares"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class SolicitudVehicularController {

    private final SolicitudVehicularService service;

    @GetMapping
    @Operation(summary = "Listar solicitudes vehiculares con paginación y filtros opcionales")
    public ResponseEntity<ApiResponse<PageResponse<SolicitudVehicularResponse>>> listar(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) UUID tipoSolicitudVehicularId,
            @RequestParam(required = false) UUID solicitanteId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listar(search, estado, tipoSolicitudVehicularId, solicitanteId, pageRequest))
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una solicitud vehicular por ID")
    public ResponseEntity<ApiResponse<SolicitudVehicularResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findById(id))
        );
    }

    @PostMapping
    @Operation(summary = "Crear una nueva solicitud vehicular")
    public ResponseEntity<ApiResponse<SolicitudVehicularResponse>> create(
            @Valid @RequestBody SolicitudVehicularRequest request
    ) {
        SolicitudVehicularResponse response = service.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Solicitud vehicular creada correctamente", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar una solicitud vehicular existente")
    public ResponseEntity<ApiResponse<SolicitudVehicularResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody SolicitudVehicularUpdate request
    ) {
        SolicitudVehicularResponse response = service.update(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Solicitud vehicular actualizada correctamente", response)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar una solicitud vehicular")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success("Solicitud vehicular eliminada correctamente")
        );
    }
}
