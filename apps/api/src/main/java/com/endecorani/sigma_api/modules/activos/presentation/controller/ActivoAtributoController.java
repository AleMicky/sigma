package com.endecorani.sigma_api.modules.activos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.activos.application.dto.request.ActivoAtributoRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoAtributoResponse;
import com.endecorani.sigma_api.modules.activos.application.service.ActivoAtributoService;
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
@RequestMapping(ApiConstants.API_V1 + "/activo-atributos")
@RequiredArgsConstructor
@Tag(
        name = "Atributos de activo",
        description = "Administración de atributos personalizados por tipo de activo"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class ActivoAtributoController
        extends AbstractCrudController<
        ActivoAtributoRequest,
        ActivoAtributoResponse,
        UUID
        > {

    private final ActivoAtributoService activoAtributoService;

    @Override
    protected CrudService<
            ActivoAtributoRequest,
            ActivoAtributoResponse,
            UUID
            > service() {
        return activoAtributoService;
    }

    @GetMapping(params = "tipoActivoId")
    @Operation(summary = "Listar atributos filtrados por tipo de activo")
    public ResponseEntity<ApiResponse<PageResponse<ActivoAtributoResponse>>> findByTipoActivoId(
            @RequestParam UUID tipoActivoId,
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        activoAtributoService.findByTipoActivoId(
                                tipoActivoId,
                                q,
                                pageRequest
                        )
                )
        );
    }
}
