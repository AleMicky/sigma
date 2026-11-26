package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.reporte.TotalesGestionVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoViajeVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringCargaCombustibleRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringViajeVehicularRepository;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/** REQ-VEH-009: totales calculados en SQL sobre todas las filas filtradas. */
@ExtendWith(MockitoExtension.class)
class GestionVehicularTotalesServiceTest {

    @Mock
    private SpringCargaCombustibleRepository cargaCombustibleRepository;
    @Mock
    private SpringViajeVehicularRepository viajeVehicularRepository;

    @InjectMocks
    private GestionVehicularTotalesService service;

    @Test
    void combustible_debeSumarTodasLasFilasFiltradasSinLimiteDePagina() {
        UUID activoId = UUID.randomUUID();
        LocalDateTime desde = LocalDateTime.of(2026, 1, 1, 0, 0);
        LocalDateTime hasta = LocalDateTime.of(2026, 11, 26, 23, 59);
        when(cargaCombustibleRepository.resumenTotales(
                "Camión", activoId, null, null, null, null, desde, hasta))
                .thenReturn(new Object[]{1001L, new BigDecimal("2500.500"), new BigDecimal("18000.75"), 0L});

        TotalesGestionVehicularResponse response = service.obtener(
                "COMBUSTIBLE", "  Camión  ", activoId, null, null, null, null,
                null, null, null, null, desde, hasta);

        assertEquals(1001L, response.totalRegistros());
        assertEquals(new BigDecimal("2500.500"), response.totalLitros());
        assertEquals(new BigDecimal("18000.75"), response.totalImporte());
        assertEquals(0L, response.totalKm());
        assertEquals(desde, response.fechaDesde());
        assertEquals(hasta, response.fechaHasta());
        verify(cargaCombustibleRepository).resumenTotales(
                "Camión", activoId, null, null, null, null, desde, hasta);
        verifyNoInteractions(viajeVehicularRepository);
    }

    @Test
    void viajes_debeSumarKmDeTodLasFilasFiltradas() {
        UUID conductorId = UUID.randomUUID();
        when(viajeVehicularRepository.resumenTotales(
                null, null, null, null, conductorId, EstadoViajeVehicular.FINALIZADO, null, null))
                .thenReturn(new Object[]{501L, 0L, 0L, 12345L});

        TotalesGestionVehicularResponse response = service.obtener(
                "viajes", null, null, null, null, null, null,
                null, null, conductorId, EstadoViajeVehicular.FINALIZADO, null, null);

        assertEquals(501L, response.totalRegistros());
        assertEquals(BigDecimal.ZERO, response.totalLitros());
        assertEquals(BigDecimal.ZERO, response.totalImporte());
        assertEquals(12345L, response.totalKm());
        verify(viajeVehicularRepository).resumenTotales(
                null, null, null, null, conductorId, EstadoViajeVehicular.FINALIZADO, null, null);
        verifyNoInteractions(cargaCombustibleRepository);
    }

    @Test
    void moduloDesconocido_debeLanzar422() {
        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.obtener("otro", null, null, null, null, null, null,
                        null, null, null, null, null, null));

        assertEquals("MODULO_TOTALES_INVALIDO", ex.getCode());
        verifyNoInteractions(cargaCombustibleRepository, viajeVehicularRepository);
    }
}
