package com.endecorani.sigma_api.modules.parametros.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.parametros.application.dto.request.UnidadMedidaRequest;
import com.endecorani.sigma_api.modules.parametros.application.dto.response.UnidadMedidaResponse;
import com.endecorani.sigma_api.modules.parametros.application.service.UnidadMedidaService;
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
@RequestMapping(ApiConstants.API_V1 + "/unidades-medida")
@RequiredArgsConstructor
@Tag(
        name = "Unidades de medida",
        description = "Administración de unidades de medida de parámetros"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class UnidadMedidaController
        extends AbstractCrudController<
        UnidadMedidaRequest,
        UnidadMedidaResponse,
        UUID
        > {

    private final UnidadMedidaService unidadMedidaService;

    @Override
    protected CrudService<
            UnidadMedidaRequest,
            UnidadMedidaResponse,
            UUID
            > service() {
        return unidadMedidaService;
    }

    @GetMapping(params = "q")
    @Operation(summary = "Buscar unidades de medida por código, nombre o símbolo")
    public ResponseEntity<ApiResponse<PageResponse<UnidadMedidaResponse>>> search(
            @RequestParam String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        unidadMedidaService.search(q, pageRequest)
                )
        );
    }
}
