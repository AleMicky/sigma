package com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.cargacombustible.request.CargaCombustibleRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.cargacombustible.request.CargaCombustibleUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.cargacombustible.response.CargaCombustibleResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.CargaCombustibleService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/cargas-combustible")
@RequiredArgsConstructor
@Tag(
        name = "Cargas de Combustible",
        description = "Administración, control y seguimiento de cargas de combustible para vehículos y viajes"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class CargaCombustibleController {

    private final CargaCombustibleService service;

    @GetMapping
    @Operation(summary = "Listar cargas de combustible con paginación y filtros opcionales")
    public ResponseEntity<ApiResponse<PageResponse<CargaCombustibleResponse>>> listar(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID activoId,
            @RequestParam(required = false) UUID viajeVehicularId,
            @RequestParam(required = false) UUID salidaVehicularId,
            @RequestParam(required = false) UUID insumoId,
            @RequestParam(required = false) UUID empleadoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaHasta,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listar(
                        search,
                        activoId,
                        viajeVehicularId,
                        salidaVehicularId,
                        insumoId,
                        empleadoId,
                        fechaDesde,
                        fechaHasta,
                        pageRequest
                ))
        );
    }

    @GetMapping(value = "/exportar-excel", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    @Operation(summary = "Exportar reporte de consumo y cargas de combustible en formato Excel (.xlsx)")
    public ResponseEntity<byte[]> exportarExcel(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID activoId,
            @RequestParam(required = false) UUID viajeVehicularId,
            @RequestParam(required = false) UUID salidaVehicularId,
            @RequestParam(required = false) UUID insumoId,
            @RequestParam(required = false) UUID empleadoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaHasta
    ) {
        byte[] excelBytes = service.exportarExcel(
                search, activoId, viajeVehicularId, salidaVehicularId, insumoId, empleadoId, fechaDesde, fechaHasta
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename("consumo-combustible-" + LocalDate.now() + ".xlsx")
                        .build()
        );
        headers.setContentLength(excelBytes.length);

        return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una carga de combustible por ID")
    public ResponseEntity<ApiResponse<CargaCombustibleResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findById(id))
        );
    }

    @GetMapping("/activo/{activoId}")
    @Operation(summary = "Listar cargas de combustible por activo/vehículo")
    public ResponseEntity<ApiResponse<List<CargaCombustibleResponse>>> findByActivoId(
            @PathVariable UUID activoId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findByActivoId(activoId))
        );
    }

    @GetMapping("/viaje/{viajeVehicularId}")
    @Operation(summary = "Listar cargas de combustible por viaje vehicular")
    public ResponseEntity<ApiResponse<List<CargaCombustibleResponse>>> findByViajeVehicularId(
            @PathVariable UUID viajeVehicularId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findByViajeVehicularId(viajeVehicularId))
        );
    }

    @GetMapping("/salida/{salidaVehicularId}")
    @Operation(summary = "Listar cargas de combustible por salida vehicular")
    public ResponseEntity<ApiResponse<List<CargaCombustibleResponse>>> findBySalidaVehicularId(
            @PathVariable UUID salidaVehicularId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findBySalidaVehicularId(salidaVehicularId))
        );
    }

    @PostMapping
    @Operation(summary = "Registrar una nueva carga de combustible")
    public ResponseEntity<ApiResponse<CargaCombustibleResponse>> create(
            @Valid @RequestBody CargaCombustibleRequest dto
    ) {
        CargaCombustibleResponse response = service.create(dto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Carga de combustible registrada correctamente", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar una carga de combustible existente")
    public ResponseEntity<ApiResponse<CargaCombustibleResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody CargaCombustibleUpdate dto
    ) {
        CargaCombustibleResponse response = service.update(id, dto);
        return ResponseEntity.ok(
                ApiResponse.success("Carga de combustible actualizada correctamente", response)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un registro de carga de combustible")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success("Carga de combustible eliminada correctamente", null)
        );
    }
}
