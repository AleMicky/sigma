package com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.response.FlotaVehiculoResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.responsableflota.request.ResponsableFlotaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.responsableflota.request.ResponsableFlotaUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.responsableflota.response.ResponsableFlotaResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.ResponsableFlotaService;
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
@RequestMapping(ApiConstants.API_V1 + "/responsables-flota")
@RequiredArgsConstructor
@Tag(
        name = "Responsables de Flota",
        description = "Administración y asignación de responsables y administradores de flotas vehiculares"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class ResponsableFlotaController {

    private final ResponsableFlotaService service;

    @GetMapping
    @Operation(summary = "Listar responsables de flota con paginación y filtros")
    public ResponseEntity<ApiResponse<PageResponse<ResponsableFlotaResponse>>> listar(
            @RequestParam(required = false) UUID flotaVehicularId,
            @RequestParam(required = false) UUID empleadoId,
            @RequestParam(required = false) Boolean principal,
            @RequestParam(required = false) Boolean activo,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listar(flotaVehicularId, empleadoId, principal, activo, pageRequest))
        );
    }

    @GetMapping("/flota/{flotaVehicularId}")
    @Operation(summary = "Listar responsables asignados a una flota específica")
    public ResponseEntity<ApiResponse<List<ResponsableFlotaResponse>>> findByFlotaVehicularId(
            @PathVariable UUID flotaVehicularId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findByFlotaVehicularId(flotaVehicularId))
        );
    }

    @GetMapping("/empleado/{empleadoId}")
    @Operation(summary = "Listar flotas asignadas a un empleado")
    public ResponseEntity<ApiResponse<List<ResponsableFlotaResponse>>> findByEmpleadoId(
            @PathVariable UUID empleadoId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findByEmpleadoId(empleadoId))
        );
    }

    @GetMapping("/empleado/{empleadoId}/vehiculos")
    @Operation(summary = "Listar vehículos (activos) asociados a las flotas de las que el empleado es responsable")
    public ResponseEntity<ApiResponse<List<FlotaVehiculoResponse>>> findVehiculosByEmpleadoId(
            @PathVariable UUID empleadoId,
            @RequestParam(required = false) Boolean activo
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findVehiculosByEmpleadoId(empleadoId, activo))
        );
    }

    @GetMapping("/empleado/{empleadoId}/activos")
    @Operation(summary = "Alias para listar vehículos (activos) asociados a las flotas de las que el empleado es responsable")
    public ResponseEntity<ApiResponse<List<FlotaVehiculoResponse>>> findActivosByEmpleadoId(
            @PathVariable UUID empleadoId,
            @RequestParam(required = false) Boolean activo
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findVehiculosByEmpleadoId(empleadoId, activo))
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener responsable de flota por ID")
    public ResponseEntity<ApiResponse<ResponsableFlotaResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findById(id))
        );
    }

    @PostMapping
    @Operation(summary = "Asignar un responsable a una flota")
    public ResponseEntity<ApiResponse<ResponsableFlotaResponse>> create(
            @Valid @RequestBody ResponsableFlotaRequest request
    ) {
        ResponsableFlotaResponse response = service.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Responsable de flota asignado correctamente", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar asignación de responsable de flota")
    public ResponseEntity<ApiResponse<ResponsableFlotaResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ResponsableFlotaUpdate request
    ) {
        ResponsableFlotaResponse response = service.update(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Asignación de responsable actualizada correctamente", response)
        );
    }

    @PatchMapping("/{id}/toggle-activo")
    @Operation(summary = "Alternar estado activo/inactivo del responsable de flota")
    public ResponseEntity<ApiResponse<ResponsableFlotaResponse>> toggleActivo(
            @PathVariable UUID id
    ) {
        ResponsableFlotaResponse response = service.toggleActivo(id);
        return ResponseEntity.ok(
                ApiResponse.success("Estado del responsable de flota actualizado correctamente", response)
        );
    }

    @PatchMapping("/{id}/set-principal")
    @Operation(summary = "Definir al responsable como el principal de la flota")
    public ResponseEntity<ApiResponse<ResponsableFlotaResponse>> setPrincipal(
            @PathVariable UUID id
    ) {
        ResponsableFlotaResponse response = service.setPrincipal(id);
        return ResponseEntity.ok(
                ApiResponse.success("Responsable definido como principal correctamente", response)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desvincular/eliminar responsable de flota")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success("Responsable desvinculado de la flota correctamente")
        );
    }
}
