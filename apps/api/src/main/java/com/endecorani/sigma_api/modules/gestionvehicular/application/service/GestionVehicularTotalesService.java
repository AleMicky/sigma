package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.reporte.TotalesGestionVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoViajeVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringCargaCombustibleRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringViajeVehicularRepository;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

/**
 * REQ-VEH-009: agregación SQL con los mismos filtros que el listado de cada módulo.
 * No carga entidades ni limita el cálculo a una página de resultados.
 */
@Service
@RequiredArgsConstructor
public class GestionVehicularTotalesService {

    private final SpringCargaCombustibleRepository cargaCombustibleRepository;
    private final SpringViajeVehicularRepository viajeVehicularRepository;

    @Transactional(readOnly = true)
    public TotalesGestionVehicularResponse obtener(
            String modulo,
            String search,
            UUID activoId,
            UUID viajeVehicularId,
            UUID salidaVehicularId,
            UUID insumoId,
            UUID empleadoId,
            UUID asignacionVehicularId,
            UUID solicitudVehicularId,
            UUID conductorId,
            EstadoViajeVehicular estado,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta
    ) {
        String normalizedSearch = StringUtils.normalize(search);
        String moduloNormalizado = modulo == null ? null : modulo.trim().toLowerCase(Locale.ROOT);

        return switch (moduloNormalizado == null ? "" : moduloNormalizado) {
            case "combustible" -> toResponse(
                    cargaCombustibleRepository.resumenTotales(
                            normalizedSearch,
                            activoId,
                            viajeVehicularId,
                            salidaVehicularId,
                            insumoId,
                            empleadoId,
                            fechaDesde,
                            fechaHasta),
                    fechaDesde,
                    fechaHasta,
                    false);
            case "viajes" -> toResponse(
                    viajeVehicularRepository.resumenTotales(
                            normalizedSearch,
                            asignacionVehicularId,
                            solicitudVehicularId,
                            activoId,
                            conductorId,
                            estado,
                            fechaDesde,
                            fechaHasta),
                    fechaDesde,
                    fechaHasta,
                    true);
            default -> throw new BusinessException(
                    "MODULO_TOTALES_INVALIDO",
                    "El módulo debe ser 'combustible' o 'viajes'."
            );
        };
    }

    private TotalesGestionVehicularResponse toResponse(
            Object[] row,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta,
            boolean esViaje
    ) {
        if (row == null || row.length == 0) {
            return new TotalesGestionVehicularResponse(0L, BigDecimal.ZERO, BigDecimal.ZERO, 0L, fechaDesde, fechaHasta);
        }

        long totalRegistros = numberValue(row[0]).longValue();
        // Combustible: (conteo, litros, importe). Viajes: (conteo, km).
        // Se toma la última columna para el km de viajes de forma tolerante a
        // proyecciones con columnas intermedias añadidas en el futuro.
        BigDecimal totalLitros = !esViaje && row.length > 1 ? decimalValue(row[1]) : BigDecimal.ZERO;
        BigDecimal totalImporte = !esViaje && row.length > 2 ? decimalValue(row[2]) : BigDecimal.ZERO;
        long totalKm = esViaje && row.length > 1 ? numberValue(row[row.length - 1]).longValue() : 0L;

        return new TotalesGestionVehicularResponse(
                totalRegistros,
                totalLitros,
                totalImporte,
                totalKm,
                fechaDesde,
                fechaHasta
        );
    }

    private Number numberValue(Object value) {
        return value instanceof Number number ? number : 0L;
    }

    private BigDecimal decimalValue(Object value) {
        if (value instanceof BigDecimal decimal) {
            return decimal;
        }
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        return BigDecimal.ZERO;
    }
}
