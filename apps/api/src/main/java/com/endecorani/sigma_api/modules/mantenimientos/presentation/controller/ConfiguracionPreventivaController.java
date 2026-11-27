package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.preventivo.request.ConfiguracionPreventivaRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.preventivo.response.ConfiguracionPreventivaResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.ConfiguracionPreventivaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/mantenimientos/preventivo/configuracion")
@RequiredArgsConstructor
@Tag(name = "Mantenimiento Preventivo - Configuración", description = "Umbrales de alerta y parámetros del motor preventivo")
public class ConfiguracionPreventivaController {

    private final ConfiguracionPreventivaService service;

    @GetMapping
    @PreAuthorize(MantenimientoRoles.LECTURA)
    @Operation(summary = "Obtener configuración preventiva vigente")
    public ResponseEntity<ConfiguracionPreventivaResponse> obtener() {
        return ResponseEntity.ok(service.obtenerActual());
    }

    @PutMapping
    @PreAuthorize(MantenimientoRoles.OPERACION)
    @Operation(summary = "Actualizar umbrales de alerta y evaluación automática")
    public ResponseEntity<ConfiguracionPreventivaResponse> actualizar(
            @Valid @RequestBody ConfiguracionPreventivaRequest request
    ) {
        return ResponseEntity.ok(service.actualizar(request));
    }
}
