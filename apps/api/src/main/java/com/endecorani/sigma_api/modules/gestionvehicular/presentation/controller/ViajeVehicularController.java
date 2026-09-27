package com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.viajevehicular.request.RegistrarRetornoViajeRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.viajevehicular.request.RegistrarSalidaViajeRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.viajevehicular.request.ViajeVehicularRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.viajevehicular.request.ViajeVehicularUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.viajevehicular.response.ViajeVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.ViajeVehicularService;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoViajeVehicular;
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
@RequestMapping(ApiConstants.API_V1 + "/viajes-vehiculares")
@RequiredArgsConstructor
@Tag(
        name = "Viajes Vehiculares",
        description = "Administración, control y seguimiento de viajes vehiculares asignados"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class ViajeVehicularController {

    private final ViajeVehicularService service;

    @GetMapping
    @Operation(summary = "Listar viajes vehiculares con paginación y filtros opcionales")
    public ResponseEntity<ApiResponse<PageResponse<ViajeVehicularResponse>>> listar(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID asignacionVehicularId,
            @RequestParam(required = false) UUID conductorId,
            @RequestParam(required = false) EstadoViajeVehicular estado,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listar(search, asignacionVehicularId, conductorId, estado, pageRequest))
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un viaje vehicular por ID")
    public ResponseEntity<ApiResponse<ViajeVehicularResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findById(id))
        );
    }

    @GetMapping("/asignacion/{asignacionVehicularId}")
    @Operation(summary = "Obtener el viaje de una asignación vehicular")
    public ResponseEntity<ApiResponse<ViajeVehicularResponse>> findByAsignacionVehicularId(
            @PathVariable UUID asignacionVehicularId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findByAsignacionVehicularId(asignacionVehicularId))
        );
    }

    @GetMapping("/conductor/{conductorId}")
    @Operation(summary = "Listar viajes asignados a un conductor")
    public ResponseEntity<ApiResponse<List<ViajeVehicularResponse>>> findByConductorId(
            @PathVariable UUID conductorId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findByConductorId(conductorId))
        );
    }

    @PostMapping
    @Operation(summary = "Crear un nuevo registro de viaje vehicular")
    public ResponseEntity<ApiResponse<ViajeVehicularResponse>> create(
            @Valid @RequestBody ViajeVehicularRequest request
    ) {
        ViajeVehicularResponse response = service.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Viaje vehicular creado correctamente", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un viaje vehicular existente")
    public ResponseEntity<ApiResponse<ViajeVehicularResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ViajeVehicularUpdate request
    ) {
        ViajeVehicularResponse response = service.update(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Viaje vehicular actualizado correctamente", response)
        );
    }

    @PatchMapping("/{id}/salida")
    @Operation(summary = "Registrar la salida real de un viaje vehicular (fecha y kilometraje inicial)")
    public ResponseEntity<ApiResponse<ViajeVehicularResponse>> registrarSalida(
            @PathVariable UUID id,
            @Valid @RequestBody RegistrarSalidaViajeRequest request
    ) {
        ViajeVehicularResponse response = service.registrarSalida(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Salida de viaje registrada correctamente", response)
        );
    }

    @PatchMapping("/{id}/retorno")
    @Operation(summary = "Registrar el retorno real de un viaje vehicular (fecha y kilometraje final)")
    public ResponseEntity<ApiResponse<ViajeVehicularResponse>> registrarRetorno(
            @PathVariable UUID id,
            @Valid @RequestBody RegistrarRetornoViajeRequest request
    ) {
        ViajeVehicularResponse response = service.registrarRetorno(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Retorno de viaje registrado correctamente", response)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un viaje vehicular")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success("Viaje vehicular eliminado correctamente")
        );
    }
}
