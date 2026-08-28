package com.endecorani.sigma_api.modules.organizacion.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.organizacion.application.dto.request.ResponsabilidadRequest;
import com.endecorani.sigma_api.modules.organizacion.application.dto.response.ResponsabilidadResponse;
import com.endecorani.sigma_api.modules.organizacion.application.service.ResponsabilidadService;
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
@RequestMapping(ApiConstants.API_V1 + "/responsabilidades")
@RequiredArgsConstructor
@Tag(
        name = "Responsabilidades",
        description = "Administración del catálogo de responsabilidades de la organización"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class ResponsabilidadController
        extends AbstractCrudController<
        ResponsabilidadRequest,
        ResponsabilidadResponse,
        UUID
        > {

    private final ResponsabilidadService responsabilidadService;

    @Override
    protected CrudService<
            ResponsabilidadRequest,
            ResponsabilidadResponse,
            UUID
            > service() {
        return responsabilidadService;
    }

    @GetMapping(params = "q")
    @Operation(summary = "Buscar responsabilidades por código o nombre")
    public ResponseEntity<ApiResponse<PageResponse<ResponsabilidadResponse>>> search(
            @RequestParam String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        responsabilidadService.search(q, pageRequest)
                )
        );
    }
}
