package com.endecorani.sigma_api.modules.parametros.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.parametros.application.dto.request.GestionRequest;
import com.endecorani.sigma_api.modules.parametros.application.dto.response.GestionResponse;
import com.endecorani.sigma_api.modules.parametros.application.service.GestionService;
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
@RequestMapping(ApiConstants.API_V1 + "/gestiones")
@RequiredArgsConstructor
@Tag(
        name = "Gestiones",
        description = "Administración de gestiones y sus períodos"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class GestionController
        extends AbstractCrudController<
        GestionRequest,
        GestionResponse,
        UUID
        > {

    private final GestionService gestionService;

    @Override
    protected CrudService<
            GestionRequest,
            GestionResponse,
            UUID
            > service() {
        return gestionService;
    }

    @GetMapping(params = "q")
    @Operation(summary = "Buscar gestiones por año")
    public ResponseEntity<ApiResponse<PageResponse<GestionResponse>>> search(
            @RequestParam String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        gestionService.search(q, pageRequest)
                )
        );
    }
}
