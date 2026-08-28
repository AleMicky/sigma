package com.endecorani.sigma_api.modules.inventarios.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.inventarios.application.dto.request.InsumoAtributoValorRequest;
import com.endecorani.sigma_api.modules.inventarios.application.dto.response.InsumoAtributoValorResponse;
import com.endecorani.sigma_api.modules.inventarios.application.service.InsumoAtributoValorService;
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
@RequestMapping(ApiConstants.API_V1 + "/insumo-atributo-valores")
@RequiredArgsConstructor
@Tag(
        name = "Valores de atributo de insumo",
        description = "Administración de valores de atributos personalizados por insumo"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class InsumoAtributoValorController
        extends AbstractCrudController<
        InsumoAtributoValorRequest,
        InsumoAtributoValorResponse,
        UUID
        > {

    private final InsumoAtributoValorService insumoAtributoValorService;

    @Override
    protected CrudService<
            InsumoAtributoValorRequest,
            InsumoAtributoValorResponse,
            UUID
            > service() {
        return insumoAtributoValorService;
    }

    @GetMapping(params = "insumoId")
    @Operation(summary = "Listar valores de atributos filtrados por insumo")
    public ResponseEntity<ApiResponse<PageResponse<InsumoAtributoValorResponse>>> findByInsumoId(
            @RequestParam UUID insumoId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        insumoAtributoValorService.findByInsumoId(
                                insumoId,
                                pageRequest
                        )
                )
        );
    }
}
