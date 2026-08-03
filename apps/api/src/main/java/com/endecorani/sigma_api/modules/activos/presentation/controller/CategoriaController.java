package com.endecorani.sigma_api.modules.activos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.activos.application.dto.CategoriaRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.CategoriaResponse;
import com.endecorani.sigma_api.modules.activos.application.service.CategoriaService;
import com.endecorani.sigma_api.shared.application.crud.CrudService;
import com.endecorani.sigma_api.shared.presentation.controller.AbstractCrudController;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/categorias")
@RequiredArgsConstructor
@Tag(
        name = "Categorías",
        description = "Administración del catálogo de categorías de activos"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class CategoriaController
        extends AbstractCrudController<
        CategoriaRequest,
        CategoriaResponse,
        UUID
        > {

    private final CategoriaService categoriaService;

    @Override
    protected CrudService<
            CategoriaRequest,
            CategoriaResponse,
            UUID
            > service() {
        return categoriaService;
    }
}
