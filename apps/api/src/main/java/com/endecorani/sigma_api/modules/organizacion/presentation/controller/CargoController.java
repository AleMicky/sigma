package com.endecorani.sigma_api.modules.organizacion.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.organizacion.application.dto.CargoRequest;
import com.endecorani.sigma_api.modules.organizacion.application.dto.CargoResponse;
import com.endecorani.sigma_api.modules.organizacion.application.service.CargoService;
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
@RequestMapping(ApiConstants.API_V1 + "/cargos")
@RequiredArgsConstructor
@Tag(
        name = "Cargos",
        description = "Administración del catálogo de cargos de la organización"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class CargoController
        extends AbstractCrudController<
        CargoRequest,
        CargoResponse,
        UUID
        > {

    private final CargoService cargoService;

    @Override
    protected CrudService<
            CargoRequest,
            CargoResponse,
            UUID
            > service() {
        return cargoService;
    }

    @GetMapping(params = "q")
    @Operation(summary = "Buscar cargos por código o nombre")
    public ResponseEntity<ApiResponse<PageResponse<CargoResponse>>> search(
            @RequestParam String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        cargoService.search(q, pageRequest)
                )
        );
    }
}