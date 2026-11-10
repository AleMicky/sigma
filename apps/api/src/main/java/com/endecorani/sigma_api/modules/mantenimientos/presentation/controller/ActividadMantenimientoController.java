package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.request.ActividadMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.request.ActividadMantenimientoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.response.ActividadMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.ActividadMantenimientoService;
import com.endecorani.sigma_api.shared.application.crud.ExtendedCrudService;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.pagination.SearchPageRequestDto;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.presentation.controller.AbstractExtendedCrudController;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/actividades-mantenimiento")
@RequiredArgsConstructor
@Tag(
        name = "Actividades de Mantenimiento",
        description = "Administración del catálogo de actividades técnicas de mantenimiento"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class ActividadMantenimientoController extends AbstractExtendedCrudController<
        ActividadMantenimientoRequest,
        ActividadMantenimientoUpdate,
        ActividadMantenimientoResponse,
        UUID
        > {

    private final ActividadMantenimientoService service;

    @Override
    protected ExtendedCrudService<ActividadMantenimientoRequest, ActividadMantenimientoUpdate, ActividadMantenimientoResponse, UUID> service() {
        return service;
    }

    @Override
    protected String createdMessage() {
        return "Actividad de mantenimiento creada correctamente";
    }

    @Override
    protected String updatedMessage() {
        return "Actividad de mantenimiento actualizada correctamente";
    }

    @Override
    protected String deletedMessage() {
        return "Actividad de mantenimiento eliminada correctamente";
    }

    @Override
    protected PageResponse<ActividadMantenimientoResponse> listResponse(SearchPageRequestDto pageRequest) {
        return service.listar(pageRequest.getSearchTerm(), pageRequest.toPageRequest());
    }

    @GetMapping("/codigo/{codigo}")
    @Operation(summary = "Obtener una actividad de mantenimiento por su código")
    public ResponseEntity<ApiResponse<ActividadMantenimientoResponse>> findByCodigo(
            @PathVariable String codigo
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findByCodigo(codigo))
        );
    }

    @GetMapping("/tipo-activo/{tipoActivoId}")
    @Operation(summary = "Listar actividades aplicables a un tipo de activo")
    public ResponseEntity<ApiResponse<List<ActividadMantenimientoResponse>>> findByTipoActivoId(
            @PathVariable UUID tipoActivoId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findByTipoActivoId(tipoActivoId))
        );
    }
}
