package com.endecorani.sigma_api.modules.activos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.activos.application.dto.request.ActivoAsignacionRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoAsignacionResponse;
import com.endecorani.sigma_api.modules.activos.application.service.ActivoAsignacionService;
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
@RequestMapping(ApiConstants.API_V1 + "/activo-asignaciones")
@RequiredArgsConstructor
@Tag(name = "Activo Asignaciones", description = "Administración de asignaciones de activos a empleados o áreas")
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class ActivoAsignacionController extends AbstractCrudController<ActivoAsignacionRequest, ActivoAsignacionResponse, UUID> {

    private final ActivoAsignacionService service;

    @Override
    protected CrudService<ActivoAsignacionRequest, ActivoAsignacionResponse, UUID> service() {
        return service;
    }

    @GetMapping(params = "activoId")
    @Operation(summary = "Listar asignaciones filtradas por activo")
    public ResponseEntity<ApiResponse<PageResponse<ActivoAsignacionResponse>>> findByActivoId(
            @RequestParam UUID activoId,
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.find(activoId, q, pageRequest)));
    }
}
