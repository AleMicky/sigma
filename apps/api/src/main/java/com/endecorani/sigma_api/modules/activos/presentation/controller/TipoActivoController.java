package com.endecorani.sigma_api.modules.activos.presentation.controller;

import com.endecorani.sigma_api.modules.activos.application.dto.TipoActivoRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.TipoActivoResponse;
import com.endecorani.sigma_api.modules.activos.application.service.TipoActivoService;
import com.endecorani.sigma_api.shared.application.crud.CrudService;
import com.endecorani.sigma_api.shared.presentation.controller.AbstractCrudController;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
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
