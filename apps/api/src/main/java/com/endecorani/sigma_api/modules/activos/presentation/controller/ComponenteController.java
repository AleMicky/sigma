package com.endecorani.sigma_api.modules.activos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.activos.application.dto.request.ComponenteRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.ComponenteResponse;
import com.endecorani.sigma_api.modules.activos.application.service.ComponenteService;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/componentes")
@RequiredArgsConstructor
@Tag(
        name = "Componentes",
        description = "Administración de componentes por tipo de activo"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class ComponenteController
        extends AbstractCrudController<
        ComponenteRequest,
        ComponenteResponse,
        UUID
        > {

    private final ComponenteService componenteService;

    @Override
    protected CrudService<
            ComponenteRequest,
            ComponenteResponse,
            UUID
            > service() {
        return componenteService;
    }

    @GetMapping(params = "tipoActivoId")
    @Operation(summary = "Listar componentes filtrados por tipo de activo")
    public ResponseEntity<ApiResponse<PageResponse<ComponenteResponse>>> findByTipoActivoId(
            @RequestParam UUID tipoActivoId,
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        componenteService.findByTipoActivoId(
                                tipoActivoId,
                                q,
                                pageRequest
                        )
                )
        );
    }

    @PatchMapping("/{id}/activo")
    @Operation(summary = "Activar o desactivar un componente")
    public ResponseEntity<ApiResponse<ComponenteResponse>> toggleActivo(
            @PathVariable UUID id,
            @RequestBody Map<String, Boolean> body
    ) {
        Boolean activo = body.getOrDefault("activo", Boolean.TRUE);
        return ResponseEntity.ok(
                ApiResponse.success(
                        componenteService.toggleActivo(id, activo)
                )
        );
    }
}
