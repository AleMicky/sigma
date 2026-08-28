package com.endecorani.sigma_api.modules.organizacion.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.organizacion.application.dto.request.GrupoAprobadorDetalleRequest;
import com.endecorani.sigma_api.modules.organizacion.application.dto.response.GrupoAprobadorDetalleResponse;
import com.endecorani.sigma_api.modules.organizacion.application.service.GrupoAprobadorDetalleService;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/grupos-aprobadores/{grupoAprobadorId}/detalles")
@RequiredArgsConstructor
@Tag(
        name = "Grupos Aprobadores Detalles",
        description = "Administración de los aprobadores que conforman cada grupo aprobador de la organización"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class GrupoAprobadorDetalleController {

    private final GrupoAprobadorDetalleService grupoAprobadorDetalleService;

    @PostMapping
    @Operation(summary = "Registrar un aprobador dentro de un grupo aprobador")
    public ResponseEntity<ApiResponse<GrupoAprobadorDetalleResponse>> create(
            @PathVariable UUID grupoAprobadorId,
            @Valid @RequestBody GrupoAprobadorDetalleRequest request
    ) {
        GrupoAprobadorDetalleResponse response =
                grupoAprobadorDetalleService.create(grupoAprobadorId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Registro creado correctamente",
                                response
                        )
                );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un aprobador de un grupo aprobador")
    public ResponseEntity<ApiResponse<GrupoAprobadorDetalleResponse>> update(
            @PathVariable UUID grupoAprobadorId,
            @PathVariable UUID id,
            @Valid @RequestBody GrupoAprobadorDetalleRequest request
    ) {
        GrupoAprobadorDetalleResponse response =
                grupoAprobadorDetalleService.update(grupoAprobadorId, id, request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro actualizado correctamente",
                        response
                )
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un aprobador de un grupo aprobador por su identificador")
    public ResponseEntity<ApiResponse<GrupoAprobadorDetalleResponse>> findById(
            @PathVariable UUID grupoAprobadorId,
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        grupoAprobadorDetalleService.findById(grupoAprobadorId, id)
                )
        );
    }

    @GetMapping
    @Operation(summary = "Listar los aprobadores de un grupo aprobador de forma paginada")
    public ResponseEntity<ApiResponse<PageResponse<GrupoAprobadorDetalleResponse>>> findAll(
            @PathVariable UUID grupoAprobadorId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        grupoAprobadorDetalleService.findAllByGrupoAprobador(
                                grupoAprobadorId,
                                pageRequest
                        )
                )
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un aprobador de un grupo aprobador")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID grupoAprobadorId,
            @PathVariable UUID id
    ) {
        grupoAprobadorDetalleService.delete(grupoAprobadorId, id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro eliminado correctamente"
                )
        );
    }
}
