package com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.tiposolicitudvehicular.request.TipoSolicitudVehicularRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.tiposolicitudvehicular.request.TipoSolicitudVehicularUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.tiposolicitudvehicular.response.TipoSolicitudVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.TipoSolicitudVehicularService;
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
@RequestMapping(ApiConstants.API_V1 + "/tipos-solicitud-vehicular")
@RequiredArgsConstructor
@Tag(
        name = "Tipos de Solicitud Vehicular",
        description = "Administración de tipos de solicitud vehicular"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class TipoSolicitudVehicularController {

    private final TipoSolicitudVehicularService service;

    @GetMapping
    @Operation(summary = "Listar tipos de solicitud vehicular con paginación y búsqueda opcional")
    public ResponseEntity<ApiResponse<PageResponse<TipoSolicitudVehicularResponse>>> listar(
            @RequestParam(required = false) String search,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listar(search, pageRequest))
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un tipo de solicitud vehicular por ID")
    public ResponseEntity<ApiResponse<TipoSolicitudVehicularResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findById(id))
        );
    }

    @PostMapping
    @Operation(summary = "Crear un nuevo tipo de solicitud vehicular")
    public ResponseEntity<ApiResponse<TipoSolicitudVehicularResponse>> create(
            @Valid @RequestBody TipoSolicitudVehicularRequest request
    ) {
        TipoSolicitudVehicularResponse response = service.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tipo de solicitud vehicular creado correctamente", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un tipo de solicitud vehicular existente")
    public ResponseEntity<ApiResponse<TipoSolicitudVehicularResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody TipoSolicitudVehicularUpdate request
    ) {
        TipoSolicitudVehicularResponse response = service.update(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Tipo de solicitud vehicular actualizado correctamente", response)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un tipo de solicitud vehicular")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success("Tipo de solicitud vehicular eliminado correctamente")
        );
    }
}
