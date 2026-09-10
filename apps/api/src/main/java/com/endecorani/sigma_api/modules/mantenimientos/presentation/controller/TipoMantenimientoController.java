package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.tipo.request.TipoMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.tipo.request.TipoMantenimientoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.tipo.response.TipoMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.TipoMantenimientoService;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
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
    public Page<TipoMantenimientoResponse> listar(
            @RequestParam(required = false) String search,
            Pageable pageable
    ) {
        return service.listar(search, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un tipo de mantenimiento por ID")
    public TipoMantenimientoResponse buscarPorId(
            @PathVariable UUID id
    ) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear un nuevo tipo de mantenimiento")
    public TipoMantenimientoResponse crear(
            @Valid @RequestBody TipoMantenimientoRequest dto
    ) {
        return service.crear(dto);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un tipo de mantenimiento existente")
    public TipoMantenimientoResponse actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody TipoMantenimientoUpdate dto
    ) {
        return service.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Eliminar un tipo de mantenimiento")
    public void eliminar(
            @PathVariable UUID id
    ) {
        service.eliminar(id);
    }
}
