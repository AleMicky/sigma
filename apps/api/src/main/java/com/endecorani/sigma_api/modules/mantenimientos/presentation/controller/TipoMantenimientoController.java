package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.tipo.request.TipoMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.tipo.request.TipoMantenimientoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.tipo.response.TipoMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.TipoMantenimientoService;
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
@RequestMapping(ApiConstants.API_V1 + "/tipos-mantenimiento")
@RequiredArgsConstructor
@Tag(
        name = "Tipos de mantenimiento",
        description = "Administración de tipos de mantenimiento"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class TipoMantenimientoController {

    private final TipoMantenimientoService service;

    @GetMapping
    @Operation(summary = "Listar tipos de mantenimiento con paginación y búsqueda opcional")
    public ResponseEntity<ApiResponse<PageResponse<TipoMantenimientoResponse>>> listar(
            @RequestParam(required = false) String search,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listar(search, pageRequest))
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un tipo de mantenimiento por ID")
    public ResponseEntity<ApiResponse<TipoMantenimientoResponse>> buscarPorId(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.buscarPorId(id))
        );
    }

    @PostMapping
    @Operation(summary = "Crear un nuevo tipo de mantenimiento")
    public ResponseEntity<ApiResponse<TipoMantenimientoResponse>> crear(
            @Valid @RequestBody TipoMantenimientoRequest dto
    ) {
        TipoMantenimientoResponse response = service.crear(dto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tipo de mantenimiento creado correctamente", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un tipo de mantenimiento existente")
    public ResponseEntity<ApiResponse<TipoMantenimientoResponse>> actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody TipoMantenimientoUpdate dto
    ) {
        TipoMantenimientoResponse response = service.actualizar(id, dto);
        return ResponseEntity.ok(
                ApiResponse.success("Tipo de mantenimiento actualizado correctamente", response)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un tipo de mantenimiento")
    public ResponseEntity<ApiResponse<Void>> eliminar(
            @PathVariable UUID id
    ) {
        service.eliminar(id);
        return ResponseEntity.ok(
                ApiResponse.success("Tipo de mantenimiento eliminado correctamente")
        );
    }
}
