package com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.controlactivo.request.ControlActivoRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.controlactivo.request.ControlActivoUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.controlactivo.response.ControlActivoResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.ControlActivoService;
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

@RestController("gestionVehicularControlActivoController")
@RequestMapping(ApiConstants.API_V1 + "/controles-activos-vehiculares")
@RequiredArgsConstructor
@Tag(
        name = "Control de Activos Vehiculares",
        description = "Administración de controles de activos vehiculares (entrega y devolución de accesorios)"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class ControlActivoController {

    private final ControlActivoService service;

    @GetMapping
    @Operation(summary = "Listar controles de activos vehiculares con paginación")
    public ResponseEntity<ApiResponse<PageResponse<ControlActivoResponse>>> findAll(
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findAll(pageRequest))
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un control de activo vehicular por ID")
    public ResponseEntity<ApiResponse<ControlActivoResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findById(id))
        );
    }

    @GetMapping("/solicitud/{solicitudVehicularId}")
    @Operation(summary = "Listar controles de activos por solicitud vehicular")
    public ResponseEntity<ApiResponse<List<ControlActivoResponse>>> findBySolicitud(
            @PathVariable UUID solicitudVehicularId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findBySolicitudVehicularId(solicitudVehicularId))
        );
    }

    @GetMapping("/asignacion/{asignacionVehicularId}")
    @Operation(summary = "Listar controles de activos por asignación vehicular")
    public ResponseEntity<ApiResponse<List<ControlActivoResponse>>> findByAsignacion(
            @PathVariable UUID asignacionVehicularId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findByAsignacionVehicularId(asignacionVehicularId))
        );
    }

    @GetMapping("/activo/{activoId}")
    @Operation(summary = "Listar controles de activos por activo/vehículo")
    public ResponseEntity<ApiResponse<List<ControlActivoResponse>>> findByActivo(
            @PathVariable UUID activoId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findByActivoId(activoId))
        );
    }

    @PostMapping
    @Operation(summary = "Crear un nuevo control de activo vehicular con sus detalles")
    public ResponseEntity<ApiResponse<ControlActivoResponse>> create(
            @Valid @RequestBody ControlActivoRequest dto
    ) {
        ControlActivoResponse response = service.create(dto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Control de activo vehicular creado correctamente", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un control de activo vehicular existente")
    public ResponseEntity<ApiResponse<ControlActivoResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ControlActivoUpdate dto
    ) {
        ControlActivoResponse response = service.update(id, dto);
        return ResponseEntity.ok(
                ApiResponse.success("Control de activo vehicular actualizado correctamente", response)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un control de activo vehicular")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success("Control de activo vehicular eliminado correctamente")
        );
    }
}
