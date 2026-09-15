package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.request.OrdenTrabajoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.request.OrdenTrabajoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.response.OrdenTrabajoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.OrdenTrabajoService;
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
@RequestMapping(ApiConstants.API_V1 + "/ordenes-trabajo")
@RequiredArgsConstructor
@Tag(
        name = "Órdenes de Trabajo",
        description = "Administración de órdenes de trabajo de mantenimiento técnico"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class OrdenTrabajoController {

    private final OrdenTrabajoService service;

    @GetMapping
    @Operation(summary = "Listar órdenes de trabajo con paginación y búsqueda opcional")
    public ResponseEntity<ApiResponse<PageResponse<OrdenTrabajoResponse>>> listar(
            @RequestParam(required = false) String search,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listar(search, pageRequest))
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una orden de trabajo por ID")
    public ResponseEntity<ApiResponse<OrdenTrabajoResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findById(id))
        );
    }

    @GetMapping("/numero/{numero}")
    @Operation(summary = "Obtener una orden de trabajo por su número correlativo")
    public ResponseEntity<ApiResponse<OrdenTrabajoResponse>> findByNumero(
            @PathVariable String numero
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findByNumero(numero))
        );
    }

    @GetMapping("/solicitud/{solicitudId}")
    @Operation(summary = "Obtener la orden de trabajo asociada a una solicitud de mantenimiento")
    public ResponseEntity<ApiResponse<OrdenTrabajoResponse>> findBySolicitud(
            @PathVariable UUID solicitudId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findBySolicitudMantenimientoId(solicitudId))
        );
    }

    @PostMapping
    @Operation(summary = "Crear una nueva orden de trabajo con sus actividades y adjuntos")
    public ResponseEntity<ApiResponse<OrdenTrabajoResponse>> create(
            @Valid @RequestBody OrdenTrabajoRequest dto
    ) {
        OrdenTrabajoResponse response = service.create(dto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Orden de trabajo creada correctamente", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar una orden de trabajo existente")
    public ResponseEntity<ApiResponse<OrdenTrabajoResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody OrdenTrabajoUpdate dto
    ) {
        OrdenTrabajoResponse response = service.update(id, dto);
        return ResponseEntity.ok(
                ApiResponse.success("Orden de trabajo actualizada correctamente", response)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar una orden de trabajo")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success("Orden de trabajo eliminada correctamente")
        );
    }
}
