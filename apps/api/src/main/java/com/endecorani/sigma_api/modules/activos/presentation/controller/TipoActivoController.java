package com.endecorani.sigma_api.modules.activos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.activos.application.dto.request.TipoActivoRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.TipoActivoResponse;
import com.endecorani.sigma_api.modules.activos.application.service.TipoActivoService;
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
@RequestMapping(ApiConstants.API_V1 + "/tipos-activo")
@RequiredArgsConstructor
@Tag(
        name = "Tipos de activo",
        description = "Administración del catálogo de tipos de activo"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class TipoActivoController
        extends AbstractCrudController<
        TipoActivoRequest,
        TipoActivoResponse,
        UUID
        > {

    private final TipoActivoService tipoActivoService;

    @Override
    protected CrudService<
            TipoActivoRequest,
            TipoActivoResponse,
            UUID
            > service() {
        return tipoActivoService;
    }
}
