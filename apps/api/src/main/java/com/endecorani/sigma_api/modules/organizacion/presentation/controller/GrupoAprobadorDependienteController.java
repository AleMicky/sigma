package com.endecorani.sigma_api.modules.organizacion.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.organizacion.application.dto.request.GrupoAprobadorDependienteRequest;
import com.endecorani.sigma_api.modules.organizacion.application.dto.response.AprobadorSelectResponse;
import com.endecorani.sigma_api.modules.organizacion.application.dto.response.DependienteSelectResponse;
import com.endecorani.sigma_api.modules.organizacion.application.dto.response.GrupoAprobadorDependienteResponse;
import com.endecorani.sigma_api.modules.organizacion.application.service.GrupoAprobadorDependienteService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/grupos-aprobadores")
@RequiredArgsConstructor
@Tag(
        name = "Grupos Aprobadores Dependientes",
        description = "Administración de los empleados dependientes asociados a cada grupo aprobador de la organización"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class GrupoAprobadorDependienteController {

    private final GrupoAprobadorDependienteService grupoAprobadorDependienteService;

    @PostMapping("/{grupoAprobadorId}/dependientes")
    @Operation(summary = "Registrar un dependiente dentro de un grupo aprobador")
    public ResponseEntity<ApiResponse<GrupoAprobadorDependienteResponse>> create(
            @PathVariable UUID grupoAprobadorId,
            @Valid @RequestBody GrupoAprobadorDependienteRequest request
    ) {
        GrupoAprobadorDependienteResponse response =
                grupoAprobadorDependienteService.create(grupoAprobadorId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Registro creado correctamente",
                                response
                        )
                );
    }

    @PutMapping("/{grupoAprobadorId}/dependientes/{id}")
    @Operation(summary = "Actualizar un dependiente de un grupo aprobador")
    public ResponseEntity<ApiResponse<GrupoAprobadorDependienteResponse>> update(
            @PathVariable UUID grupoAprobadorId,
            @PathVariable UUID id,
            @Valid @RequestBody GrupoAprobadorDependienteRequest request
    ) {
        GrupoAprobadorDependienteResponse response =
                grupoAprobadorDependienteService.update(grupoAprobadorId, id, request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro actualizado correctamente",
                        response
                )
        );
    }

    @GetMapping("/{grupoAprobadorId}/dependientes/{id}")
    @Operation(summary = "Obtener un dependiente de un grupo aprobador por su identificador")
    public ResponseEntity<ApiResponse<GrupoAprobadorDependienteResponse>> findById(
            @PathVariable UUID grupoAprobadorId,
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        grupoAprobadorDependienteService.findById(grupoAprobadorId, id)
                )
        );
    }

    @GetMapping("/{grupoAprobadorId}/dependientes")
    @Operation(summary = "Listar los dependientes de un grupo aprobador de forma paginada")
    public ResponseEntity<ApiResponse<PageResponse<GrupoAprobadorDependienteResponse>>> findAll(
            @PathVariable UUID grupoAprobadorId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        grupoAprobadorDependienteService.findAllByGrupoAprobador(
                                grupoAprobadorId,
                                pageRequest
                        )
                )
        );
    }

    @DeleteMapping("/{grupoAprobadorId}/dependientes/{id}")
    @Operation(summary = "Eliminar un dependiente de un grupo aprobador")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID grupoAprobadorId,
            @PathVariable UUID id
    ) {
        grupoAprobadorDependienteService.delete(grupoAprobadorId, id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro eliminado correctamente"
                )
        );
    }

    @GetMapping("/empleados/{empleadoId}/aprobadores/select")
    @Operation(summary = "Listar los aprobadores asignados a un empleado para dropdown/select")
    public ResponseEntity<ApiResponse<List<AprobadorSelectResponse>>> findAprobadoresSelectByEmpleadoId(
            @PathVariable UUID empleadoId
    ) {
        List<AprobadorSelectResponse> response =
                grupoAprobadorDependienteService.findAprobadoresSelectByEmpleadoId(empleadoId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Aprobadores obtenidos correctamente",
                        response
                )
        );
    }

    @GetMapping("/aprobadores/{aprobadorId}/dependientes/select")
    @Operation(summary = "Listar los dependientes asignados a un aprobador para dropdown/select")
    public ResponseEntity<ApiResponse<List<DependienteSelectResponse>>> findDependientesSelectByAprobadorId(
            @PathVariable UUID aprobadorId
    ) {
        List<DependienteSelectResponse> response =
                grupoAprobadorDependienteService.findDependientesSelectByAprobadorId(aprobadorId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Dependientes obtenidos correctamente",
                        response
                )
        );
    }
}