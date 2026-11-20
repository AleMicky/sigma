package com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.vehiculo.response.VehiculoCatalogoResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.VehiculoGestionVehicularService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/gestion-vehicular/vehiculos")
@RequiredArgsConstructor
@Tag(
        name = "Gestión Vehicular - Vehículos",
        description = "Consulta de activos de tipo Vehículo con todos sus atributos dinámicos e imágenes"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class VehiculoGestionVehicularController {

    private final VehiculoGestionVehicularService service;

    @GetMapping
    @Operation(summary = "Listar activos de tipo Vehículo con todos sus atributos e imagen")
    public ResponseEntity<ApiResponse<PageResponse<VehiculoCatalogoResponse>>> listar(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) UUID estadoOperativoId,
            @RequestParam(required = false) UUID ubicacionId,
            @RequestParam(required = false) UUID flotaId,
            @RequestParam(required = false) Boolean activo,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        service.listarVehiculos(
                                q,
                                estadoOperativoId,
                                ubicacionId,
                                flotaId,
                                activo,
                                pageRequest
                        )
                )
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalle de un vehículo con sus atributos visibles e imagen")
    public ResponseEntity<ApiResponse<VehiculoCatalogoResponse>> obtenerPorId(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.obtenerVehiculoPorId(id))
        );
    }
}
