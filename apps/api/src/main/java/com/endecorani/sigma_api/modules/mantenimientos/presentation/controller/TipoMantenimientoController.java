package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.TipoMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.TipoMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.TipoMantenimientoService;
import com.endecorani.sigma_api.shared.application.crud.CrudService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.presentation.controller.AbstractCrudController;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/tipos-mantenimiento")
@RequiredArgsConstructor
@Tag(
        name = "Tipos de Mantenimiento",
        description = "Administración del catálogo de tipos de mantenimiento"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class TipoMantenimientoController
        extends AbstractCrudController<
        TipoMantenimientoRequest,
        TipoMantenimientoResponse,
        UUID
        > {

    private final TipoMantenimientoService tipoMantenimientoService;

    @Override
    protected CrudService<
            TipoMantenimientoRequest,
            TipoMantenimientoResponse,
            UUID
            > service() {
        return tipoMantenimientoService;
    }

    @GetMapping(params = "q")
    @Operation(summary = "Buscar tipos de mantenimiento por código o nombre")
    public ResponseEntity<ApiResponse<PageResponse<TipoMantenimientoResponse>>> search(
            @RequestParam String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        tipoMantenimientoService.search(q, pageRequest)
                )
        );
    }
}