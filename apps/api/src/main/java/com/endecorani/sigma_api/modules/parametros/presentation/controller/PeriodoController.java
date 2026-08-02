package com.endecorani.sigma_api.modules.parametros.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.parametros.application.dto.PeriodoRequest;
import com.endecorani.sigma_api.modules.parametros.application.dto.PeriodoResponse;
import com.endecorani.sigma_api.modules.parametros.application.service.PeriodoService;
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
@RequestMapping(ApiConstants.API_V1 + "/periodos")
@RequiredArgsConstructor
@Tag(
        name = "Períodos",
        description = "Consulta y actualización de períodos de gestión"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class PeriodoController
        extends AbstractCrudController<
        PeriodoRequest,
        PeriodoResponse,
        UUID
        > {

    private final PeriodoService periodoService;

    @Override
    protected CrudService<
            PeriodoRequest,
            PeriodoResponse,
            UUID
            > service() {
        return periodoService;
    }

    @GetMapping(params = "gestionId")
    @Operation(summary = "Listar períodos filtrados por gestión")
    public ResponseEntity<ApiResponse<PageResponse<PeriodoResponse>>> findByGestionId(
            @RequestParam UUID gestionId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        periodoService.findByGestionId(
                                gestionId,
                                pageRequest
                        )
                )
        );
    }
}
