package com.endecorani.sigma_api.modules.organizacion.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.organizacion.application.dto.EmpleadoRequest;
import com.endecorani.sigma_api.modules.organizacion.application.dto.EmpleadoResponse;
import com.endecorani.sigma_api.modules.organizacion.application.service.EmpleadoService;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/empleados")
@RequiredArgsConstructor
@Tag(
        name = "Empleados",
        description = "Administración de empleados de la organización"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class EmpleadoController
        extends AbstractCrudController<
        EmpleadoRequest,
        EmpleadoResponse,
        UUID
        > {

    private final EmpleadoService empleadoService;

    @Override
    protected CrudService<
            EmpleadoRequest,
            EmpleadoResponse,
            UUID
            > service() {
        return empleadoService;
    }

    @GetMapping(params = "areaId")
    @Operation(summary = "Listar empleados filtrados por área")
    public ResponseEntity<ApiResponse<PageResponse<EmpleadoResponse>>> findByAreaId(
            @RequestParam UUID areaId,
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        empleadoService.find(null, areaId, null, q, pageRequest)
                )
        );
    }

    @GetMapping("/area/{areaId}")
    @Operation(summary = "Listar empleados pertenecientes a un área específica")
    public ResponseEntity<ApiResponse<PageResponse<EmpleadoResponse>>> findByAreaPath(
            @PathVariable UUID areaId,
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        empleadoService.find(null, areaId, null, q, pageRequest)
                )
        );
    }

    @GetMapping("/buscar")
    @Operation(summary = "Listar empleados con filtros opcionales por persona, área, cargo o búsqueda")
    public ResponseEntity<ApiResponse<PageResponse<EmpleadoResponse>>> find(
            @RequestParam(required = false) UUID personaId,
            @RequestParam(required = false) UUID areaId,
            @RequestParam(required = false) UUID cargoId,
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        if (personaId == null && areaId == null && cargoId == null && q == null) {
            return ResponseEntity.ok(
                    ApiResponse.success(
                            empleadoService.findAll(pageRequest)
                    )
            );
        }

        return ResponseEntity.ok(
                ApiResponse.success(
                        empleadoService.find(personaId, areaId, cargoId, q, pageRequest)
                )
        );
    }
}