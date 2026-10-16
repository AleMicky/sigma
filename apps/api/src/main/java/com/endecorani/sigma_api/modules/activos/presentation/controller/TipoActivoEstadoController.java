package com.endecorani.sigma_api.modules.activos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.activos.application.dto.request.TipoActivoEstadoRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.TipoActivoEstadoResponse;
import com.endecorani.sigma_api.modules.activos.application.service.TipoActivoEstadoService;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/tipos-activo-estados")
@RequiredArgsConstructor
@Tag(
        name = "Tipos de activo - Estados operativos",
        description = "Administración de estados operativos asignados a tipos de activo"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class TipoActivoEstadoController
        extends AbstractCrudController<TipoActivoEstadoRequest, TipoActivoEstadoResponse, UUID> {

    private final TipoActivoEstadoService tipoActivoEstadoService;

    @Override
    protected CrudService<TipoActivoEstadoRequest, TipoActivoEstadoResponse, UUID> service() {
        return tipoActivoEstadoService;
    }

    @GetMapping(params = "tipoActivoId")
    @Operation(summary = "Listar estados operativos asignados a un tipo de activo")
    public ResponseEntity<ApiResponse<PageResponse<TipoActivoEstadoResponse>>> findByTipoActivoId(
            @RequestParam UUID tipoActivoId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        tipoActivoEstadoService.findByTipoActivoId(tipoActivoId, pageRequest)
                )
        );
    }

    @GetMapping(params = "estadoOperativoId")
    @Operation(summary = "Listar tipos de activo asociados a un estado operativo")
    public ResponseEntity<ApiResponse<PageResponse<TipoActivoEstadoResponse>>> findByEstadoOperativoId(
            @RequestParam UUID estadoOperativoId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        tipoActivoEstadoService.findByEstadoOperativoId(estadoOperativoId, pageRequest)
                )
        );
    }
}
