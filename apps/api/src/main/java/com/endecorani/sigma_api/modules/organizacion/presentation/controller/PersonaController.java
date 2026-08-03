package com.endecorani.sigma_api.modules.organizacion.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.organizacion.application.dto.PersonaRequest;
import com.endecorani.sigma_api.modules.organizacion.application.dto.PersonaResponse;
import com.endecorani.sigma_api.modules.organizacion.application.service.PersonaService;
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
@RequestMapping(ApiConstants.API_V1 + "/personas")
@RequiredArgsConstructor
@Tag(
        name = "Personas",
        description = "Administración de personas de la organización"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class PersonaController
        extends AbstractCrudController<
        PersonaRequest,
        PersonaResponse,
        UUID
        > {

    private final PersonaService personaService;

    @Override
    protected CrudService<
            PersonaRequest,
            PersonaResponse,
            UUID
            > service() {
        return personaService;
    }

    @GetMapping(params = "q")
    @Operation(summary = "Buscar personas por nombres, apellidos o número de documento")
    public ResponseEntity<ApiResponse<PageResponse<PersonaResponse>>> search(
            @RequestParam String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        personaService.search(q, pageRequest)
                )
        );
    }
}