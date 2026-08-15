package com.endecorani.sigma_api.modules.inventarios.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.inventarios.application.dto.request.TipoInsumoAtributoRequest;
import com.endecorani.sigma_api.modules.inventarios.application.dto.response.TipoInsumoAtributoResponse;
import com.endecorani.sigma_api.modules.inventarios.application.service.TipoInsumoAtributoService;
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
@RequestMapping(ApiConstants.API_V1 + "/tipos-insumo-atributos")
@RequiredArgsConstructor
@Tag(
        name = "Atributos de tipo de insumo",
        description = "Administración de atributos personalizados por tipo de insumo"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class TipoInsumoAtributoController
        extends AbstractCrudController<
        TipoInsumoAtributoRequest,
        TipoInsumoAtributoResponse,
        UUID
        > {

    private final TipoInsumoAtributoService tipoInsumoAtributoService;

    @Override
    protected CrudService<
            TipoInsumoAtributoRequest,
            TipoInsumoAtributoResponse,
            UUID
            > service() {
        return tipoInsumoAtributoService;
    }

    @GetMapping(params = "tipoInsumoId")
    @Operation(summary = "Listar atributos filtrados por tipo de insumo")
    public ResponseEntity<ApiResponse<PageResponse<TipoInsumoAtributoResponse>>> findByTipoInsumoId(
            @RequestParam UUID tipoInsumoId,
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        tipoInsumoAtributoService.findByTipoInsumoId(
                                tipoInsumoId,
                                q,
                                pageRequest
                        )
                )
        );
    }
}
