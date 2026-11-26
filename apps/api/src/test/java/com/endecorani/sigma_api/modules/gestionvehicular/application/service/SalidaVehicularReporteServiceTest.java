package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringTipoActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SalidaVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.BitacoraVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularEventoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringCargaCombustibleRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.shared.infrastructure.report.JasperReportService;
import com.endecorani.sigma_api.shared.util.FlexibleLocalDateTimeParser;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Cubre únicamente la conversión de filtros y el año por defecto de los reportes,
 * que antes usaban {@code ZoneOffset.UTC} / {@code LocalDate.now()}.
 */
@ExtendWith(MockitoExtension.class)
class SalidaVehicularReporteServiceTest {

    private static final ZoneId ZONA = FlexibleLocalDateTimeParser.OPERATIONAL_ZONE;
    private static final LocalDateTime DESDE = LocalDateTime.of(2026, 11, 26, 0, 0);
    private static final LocalDateTime HASTA = LocalDateTime.of(2026, 11, 26, 23, 59, 59);
    private static final Instant DESDE_INSTANT = DESDE.atZone(ZONA).toInstant();
    private static final Instant HASTA_INSTANT = HASTA.atZone(ZONA).toInstant();

    @Mock
    private SalidaVehicularRepository salidaRepository;
    @Mock
    private SalidaVehicularEventoRepository eventoRepository;
    @Mock
    private BitacoraVehicularRepository bitacoraRepository;
    @Mock
    private SalidaVehicularService salidaService;
    @Mock
    private SpringActivoRepository activoRepository;
    @Mock
    private SpringTipoActivoRepository tipoActivoRepository;
    @Mock
    private SpringActivoAtributoRepository activoAtributoRepository;
    @Mock
    private SpringActivoAtributoValorRepository activoAtributoValorRepository;
    @Mock
    private SpringVEmpleadoRepository vempleadoRepository;
    @Mock
    private SpringCargaCombustibleRepository cargaCombustibleRepository;
    @Mock
    private JasperReportService jasperReportService;

    @InjectMocks
    private SalidaVehicularReporteService service;

    @Test
    void generarReporteGeneral_debeConvertirFiltrosDesdeAmericaLaPaz() {
        when(salidaService.resolverAlcance(null, null))
                .thenReturn(new SalidaVehicularService.AlcanceArea(null, null, false, false));

        service.generarReporteGeneral(null, null, null, null, null, null, DESDE, HASTA);

        ArgumentCaptor<Instant> desde = ArgumentCaptor.forClass(Instant.class);
        ArgumentCaptor<Instant> hasta = ArgumentCaptor.forClass(Instant.class);
        verify(salidaRepository).findForReporte(
                isNull(), isNull(), isNull(), isNull(), isNull(), eq(false), isNull(),
                desde.capture(), hasta.capture());
        assertEquals(DESDE_INSTANT, desde.getValue());
        assertEquals(HASTA_INSTANT, hasta.getValue());
    }

    @Test
    void generarReporteVehiculosKilometraje_debeConvertirFiltrosDesdeAmericaLaPaz() {
        service.generarReporteVehiculosKilometraje(null, DESDE, HASTA);

        verificarFiltrosSalidas();
    }

    @Test
    void generarReporteEmpleados_debeConvertirFiltrosDeSalidasYBitacoras() {
        UUID empleadoId = UUID.randomUUID();
        SalidaVehicular salida = SalidaVehicular.builder()
                .id(UUID.randomUUID())
                .empleadoId(empleadoId)
                .build();
        when(salidaRepository.findForReporte(
                isNull(), isNull(), eq(empleadoId), isNull(), any(), any()))
                .thenReturn(List.of(salida));

        service.generarReporteEmpleados(empleadoId, DESDE, HASTA);

        ArgumentCaptor<Instant> desdeSalidas = ArgumentCaptor.forClass(Instant.class);
        ArgumentCaptor<Instant> hastaSalidas = ArgumentCaptor.forClass(Instant.class);
        verify(salidaRepository).findForReporte(
                isNull(), isNull(), eq(empleadoId), isNull(),
                desdeSalidas.capture(), hastaSalidas.capture());
        assertEquals(DESDE_INSTANT, desdeSalidas.getValue());
        assertEquals(HASTA_INSTANT, hastaSalidas.getValue());

        ArgumentCaptor<Instant> desdeBitacoras = ArgumentCaptor.forClass(Instant.class);
        ArgumentCaptor<Instant> hastaBitacoras = ArgumentCaptor.forClass(Instant.class);
        verify(bitacoraRepository).findConFiltros(
                isNull(), eq(empleadoId), isNull(), desdeBitacoras.capture(), hastaBitacoras.capture());
        assertEquals(DESDE_INSTANT, desdeBitacoras.getValue());
        assertEquals(HASTA_INSTANT, hastaBitacoras.getValue());
    }

    @Test
    void generarReporteTiempos_debeConvertirFiltrosDesdeAmericaLaPaz() {
        service.generarReporteTiempos(null, null, DESDE, HASTA);

        verificarFiltrosSalidas();
    }

    @Test
    void generarReporteBitacoras_debeConvertirFiltrosDesdeAmericaLaPaz() {
        service.generarReporteBitacoras(null, null, null, DESDE, HASTA);

        ArgumentCaptor<Instant> desde = ArgumentCaptor.forClass(Instant.class);
        ArgumentCaptor<Instant> hasta = ArgumentCaptor.forClass(Instant.class);
        verify(bitacoraRepository).findConFiltros(
                isNull(), isNull(), isNull(), desde.capture(), hasta.capture());
        assertEquals(DESDE_INSTANT, desde.getValue());
        assertEquals(HASTA_INSTANT, hasta.getValue());
    }

    @Test
    void generarReporteBitacoraPdf_conFiltros_debeConvertirInstantesYUsarAnioDeLaFecha() {
        service.generarReporteBitacoraPdf(null, DESDE, HASTA, null);

        verificarFiltrosSalidas();
        assertEquals("2026", capturarParametrosPdf().get("ANIO"));
    }

    @Test
    void generarReporteBitacoraPdf_sinFechaDesde_debeUsarAnioDeAmericaLaPaz() {
        service.generarReporteBitacoraPdf(null, null, null, null);

        verify(salidaRepository).findForReporte(
                isNull(), isNull(), isNull(), isNull(), isNull(), isNull());
        assertEquals(
                String.valueOf(LocalDate.now(ZONA).getYear()),
                capturarParametrosPdf().get("ANIO"));
    }

    private void verificarFiltrosSalidas() {
        ArgumentCaptor<Instant> desde = ArgumentCaptor.forClass(Instant.class);
        ArgumentCaptor<Instant> hasta = ArgumentCaptor.forClass(Instant.class);
        verify(salidaRepository).findForReporte(
                isNull(), isNull(), isNull(), isNull(), desde.capture(), hasta.capture());
        assertEquals(DESDE_INSTANT, desde.getValue());
        assertEquals(HASTA_INSTANT, hasta.getValue());
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> capturarParametrosPdf() {
        ArgumentCaptor<Map<String, Object>> parametros = ArgumentCaptor.forClass(Map.class);
        verify(jasperReportService).generatePdfReport(anyString(), parametros.capture(), any());
        return parametros.getValue();
    }
}
