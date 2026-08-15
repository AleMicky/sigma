package com.endecorani.sigma_api.modules.inventarios.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.inventarios.application.dto.request.InsumoRequest;
import com.endecorani.sigma_api.modules.inventarios.application.dto.response.InsumoResponse;
import com.endecorani.sigma_api.modules.inventarios.application.service.InsumoService;
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
@RequestMapping(ApiConstants.API_V1 + "/insumos")
@RequiredArgsConstructor
@Tag(
        name = "Insumos",
        description = "Administración del catálogo de insumos"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class InsumoController
        extends AbstractCrudController<
        InsumoRequest,
        InsumoResponse,
        UUID
        > {

    private final InsumoService insumoService;

    @Override
    protected CrudService<
            InsumoRequest,
            InsumoResponse,
            UUID
            > service() {
        return insumoService;
    }

    @GetMapping(params = "q")
    @Operation(summary = "Buscar insumos por código, nombre o descripción")
    public ResponseEntity<ApiResponse<PageResponse<InsumoResponse>>> search(
            @RequestParam String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        insumoService.search(q, pageRequest)
                )
        );
    }
}
