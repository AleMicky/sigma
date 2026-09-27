package com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.request.FlotaVehiculoBatchRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.request.FlotaVehiculoRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.request.FlotaVehiculoUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.request.SincronizarFlotaVehiculosRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.response.FlotaVehiculoResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.FlotaVehiculoService;
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
@RequestMapping(ApiConstants.API_V1 + "/flota-vehiculos")
@RequiredArgsConstructor
@Tag(
        name = "Vehículos de Flota",
        description = "Administración y asignación de vehículos a flotas vehiculares"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class FlotaVehiculoController {

    private final FlotaVehiculoService service;

    @GetMapping
    @Operation(summary = "Listar vehículos de flota con paginación y filtros")
    public ResponseEntity<ApiResponse<PageResponse<FlotaVehiculoResponse>>> listar(
            @RequestParam(required = false) UUID flotaVehicularId,
            @RequestParam(required = false) UUID activoId,
            @RequestParam(required = false) Boolean activo,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listar(flotaVehicularId, activoId, activo, pageRequest))
        );
    }

    @GetMapping("/flota/{flotaVehicularId}")
    @Operation(summary = "Listar todos los vehículos pertenecientes a una flota específica")
    public ResponseEntity<ApiResponse<List<FlotaVehiculoResponse>>> findByFlotaVehicularId(
            @PathVariable UUID flotaVehicularId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findByFlotaVehicularId(flotaVehicularId))
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener asignación de vehículo a flota por ID")
    public ResponseEntity<ApiResponse<FlotaVehiculoResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findById(id))
        );
    }

    @PostMapping
    @Operation(summary = "Asignar uno o múltiples vehículos a una flota")
    public ResponseEntity<ApiResponse<List<FlotaVehiculoResponse>>> create(
            @Valid @RequestBody FlotaVehiculoRequest request
    ) {
        List<FlotaVehiculoResponse> response = service.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vehículo(s) asignado(s) a la flota correctamente", response));
    }

    @PostMapping("/batch")
    @Operation(summary = "Asignar una lista de múltiples vehículos a una flota")
    public ResponseEntity<ApiResponse<List<FlotaVehiculoResponse>>> createBatch(
            @Valid @RequestBody FlotaVehiculoBatchRequest request
    ) {
        List<FlotaVehiculoResponse> response = service.createBatch(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vehículos asignados a la flota correctamente", response));
    }

    @PutMapping("/flota/{flotaVehicularId}/sincronizar")
    @Operation(summary = "Sincronizar/actualizar el conjunto completo de vehículos asignados a una flota")
    public ResponseEntity<ApiResponse<List<FlotaVehiculoResponse>>> sincronizar(
            @PathVariable UUID flotaVehicularId,
            @Valid @RequestBody SincronizarFlotaVehiculosRequest request
    ) {
        List<FlotaVehiculoResponse> response = service.sincronizar(flotaVehicularId, request);
        return ResponseEntity.ok(
                ApiResponse.success("Vehículos de la flota sincronizados correctamente", response)
        );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar asignación individual de vehículo en flota")
    public ResponseEntity<ApiResponse<FlotaVehiculoResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody FlotaVehiculoUpdate request
    ) {
        FlotaVehiculoResponse response = service.update(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Asignación de vehículo actualizada correctamente", response)
        );
    }

    @PatchMapping("/{id}/toggle-activo")
    @Operation(summary = "Alternar estado activo/inactivo del vehículo en la flota")
    public ResponseEntity<ApiResponse<FlotaVehiculoResponse>> toggleActivo(
            @PathVariable UUID id
    ) {
        FlotaVehiculoResponse response = service.toggleActivo(id);
        return ResponseEntity.ok(
                ApiResponse.success("Estado del vehículo en flota actualizado correctamente", response)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desvincular/eliminar vehículo de la flota")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success("Vehículo desvinculado de la flota correctamente")
        );
    }
}
