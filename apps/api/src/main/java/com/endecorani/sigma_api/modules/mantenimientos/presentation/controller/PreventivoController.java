package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.preventivo.response.PreventivoHistorialItemResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.ProgramacionHistorialService;
import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
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
@RequestMapping("/api/v1/mantenimientos/preventivo")
@RequiredArgsConstructor
@Tag(name = "Mantenimiento Preventivo", description = "Histórico consolidado y seguimiento preventivo")
public class PreventivoController {

    private final ProgramacionHistorialService historialService;

    @GetMapping("/historico")
    @PreAuthorize(MantenimientoRoles.LECTURA)
    @Operation(summary = "Listar histórico consolidado de mantenimientos preventivos")
    public ResponseEntity<ApiResponse<PageResponse<PreventivoHistorialItemResponse>>> listarHistorico(
            @RequestParam(required = false) UUID planId,
            @RequestParam(required = false) UUID activoId,
            @RequestParam(required = false) TipoCriterioMantenimiento tipoCriterio,
            @RequestParam(required = false) Boolean completado,
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        MantenimientoPageSizeValidator.validarTamanoDeLaPeticion();
        return ResponseEntity.ok(ApiResponse.success(
                historialService.listarHistorico(planId, activoId, tipoCriterio, completado, q, pageRequest)
        ));
    }
}
