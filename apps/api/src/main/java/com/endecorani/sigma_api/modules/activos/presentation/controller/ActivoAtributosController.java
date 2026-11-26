package com.endecorani.sigma_api.modules.activos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.activos.application.dto.request.ActivoAtributosReplacementRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoAtributoValorResponse;
import com.endecorani.sigma_api.modules.activos.application.service.ActivoAtributoValorService;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * REQ-BIZ-004: endpoint de reemplazo atómico de atributos de un activo.
 * Se mantiene en un controlador propio para no alterar el constructor de
 * {@link ActivoController} ni las pruebas de seguridad existentes.
 */
@RestController
@RequestMapping(ApiConstants.API_V1 + "/activos")
@RequiredArgsConstructor
@Tag(name = "Atributos de activos", description = "Reemplazo transaccional de atributos dinámicos")
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("isAuthenticated()")
public class ActivoAtributosController {

    private final ActivoAtributoValorService activoAtributoValorService;

    @PutMapping("/{id}/atributos")
    @Operation(summary = "Reemplaza todos los valores de atributos de un activo en una sola transacción")
    public ResponseEntity<ApiResponse<List<ActivoAtributoValorResponse>>> replaceAtributos(
            @PathVariable UUID id,
            @Valid @RequestBody ActivoAtributosReplacementRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Valores de atributos actualizados correctamente",
                activoAtributoValorService.replaceValores(id, request)
        ));
    }
}
