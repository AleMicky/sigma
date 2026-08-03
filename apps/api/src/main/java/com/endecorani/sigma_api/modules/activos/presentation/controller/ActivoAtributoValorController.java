package com.endecorani.sigma_api.modules.activos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.activos.application.dto.ActivoAtributoValorRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.ActivoAtributoValorResponse;
import com.endecorani.sigma_api.modules.activos.application.service.ActivoAtributoValorService;
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
@RequestMapping(ApiConstants.API_V1 + "/activo-atributo-valores")
@RequiredArgsConstructor
@Tag(
        name = "Valores de atributo de activo",
        description = "Administración de valores de atributos personalizados por activo"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class ActivoAtributoValorController
        extends AbstractCrudController<
        ActivoAtributoValorRequest,
        ActivoAtributoValorResponse,
        UUID
        > {

    private final ActivoAtributoValorService activoAtributoValorService;

    @Override
    protected CrudService<
            ActivoAtributoValorRequest,
            ActivoAtributoValorResponse,
            UUID
            > service() {
        return activoAtributoValorService;
    }

    @GetMapping(params = "activoId")
    @Operation(summary = "Listar valores de atributos filtrados por activo")
    public ResponseEntity<ApiResponse<PageResponse<ActivoAtributoValorResponse>>> findByActivoId(
            @RequestParam UUID activoId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        activoAtributoValorService.findByActivoId(
                                activoId,
                                pageRequest
                        )
                )
        );
    }
}
