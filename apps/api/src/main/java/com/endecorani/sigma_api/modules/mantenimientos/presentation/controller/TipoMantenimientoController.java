package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.TipoMantenimientoService;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.TipoMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.presentation.request.ActualizarTipoMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.presentation.request.CrearTipoMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.presentation.response.TipoMantenimientoResponse;
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
public class TipoMantenimientoController {

    private final TipoMantenimientoService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TipoMantenimientoResponse crear(
            @Valid @RequestBody CrearTipoMantenimientoRequest request
    ) {
        TipoMantenimiento tipo = service.crear(request);
        return toResponse(tipo);
    }

    @GetMapping
    @Operation(summary = "Listar o buscar tipos de mantenimiento con paginación")
    public ResponseEntity<ApiResponse<PageResponse<TipoMantenimientoResponse>>> listar(
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.find(q, pageRequest))
        );
    }

    @GetMapping("/{id}")
    public TipoMantenimientoResponse obtener(
            @PathVariable UUID id
    ) {

        return toResponse(
                service.obtener(id)
        );
    }

    @PutMapping("/{id}")
    public TipoMantenimientoResponse actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody ActualizarTipoMantenimientoRequest request
    ) {

        return toResponse(
                service.actualizar(id, request)
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(
            @PathVariable UUID id
    ) {

        service.eliminar(id);
    }

    private TipoMantenimientoResponse toResponse(
            TipoMantenimiento tipo
    ) {

        return new TipoMantenimientoResponse(
                tipo.getId(),
                tipo.getCodigo(),
                tipo.getNombre(),
                tipo.getDescripcion()
        );
    }
}