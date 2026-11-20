package com.endecorani.sigma_api.shared.infrastructure.report.controlactivo;

import com.endecorani.sigma_api.shared.infrastructure.report.JasperReportService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ControlActivoActaReportGeneratorTest {

    @Mock
    private JasperReportService jasperReportService;

    @InjectMocks
    private ControlActivoActaReportGenerator generator;

    @Captor
    private ArgumentCaptor<Map<String, Object>> paramsCaptor;

    @Test
    void generarPdf_populatesExpectedParametersAndDelegatesToJasper() {
        byte[] expectedPdf = new byte[]{1, 2, 3};
        when(jasperReportService.generatePdfReport(
                eq("reports/controles-activos/acta_control_activo.jrxml"),
                any(),
                any()
        )).thenReturn(expectedPdf);

        UUID controlId = UUID.randomUUID();
        ControlActivoActaReportData data = ControlActivoActaReportData.builder()
                .controlId(controlId)
                .entrega(false)
                .tituloReporte("ACTA DE DEVOLUCIÓN DE VEHÍCULO")
                .numeroSolicitud("SV-2026-001")
                .tituloSolicitud("Viaje de inspección | Destino: Corani")
                .activoCodigo("VEH-01")
                .activoNombre("Camioneta Hilux")
                .fechaActa(LocalDateTime.of(2026, 11, 20, 10, 30))
                .conforme(true)
                .entregadoPorNombre("Juan Pérez")
                .entregadoPorCargo("Conductor")
                .recibidoPorNombre("Ana Gómez")
                .recibidoPorCargo("Encargada de Flota")
                .observacionGeneral("Sin novedades")
                .generadoPor("Ana Gómez - Encargada de Flota")
                .accesorios(List.of(
                        ControlActivoAccesorioReporteItem.builder()
                                .numero(1)
                                .codigo("ACC-01")
                                .nombre("Extintor")
                                .cantidadEsperada(1)
                                .cantidadEncontrada(1)
                                .estadoConformidad("CONFORME")
                                .observacion("-")
                                .build()
                ))
                .build();

        byte[] result = generator.generarPdf(data);

        assertArrayEquals(expectedPdf, result);
        verify(jasperReportService).generatePdfReport(
                eq("reports/controles-activos/acta_control_activo.jrxml"),
                paramsCaptor.capture(),
                eq(data.accesorios())
        );

        Map<String, Object> params = paramsCaptor.getValue();
        assertEquals("ACTA DE DEVOLUCIÓN DE VEHÍCULO", params.get("TITULO_REPORTE"));
        assertEquals("ACTA DE DEVOLUCIÓN", params.get("TIPO_ACTA"));
        assertEquals("SV-2026-001", params.get("NUMERO_SOLICITUD"));
        assertEquals("20/11/2026 10:30", params.get("FECHA_ACTA"));
        assertEquals("CONFORME", params.get("ESTADO_CONFORMIDAD"));
        assertEquals("Juan Pérez", params.get("ENTREGADO_POR"));
        assertEquals("Ana Gómez", params.get("RECIBIDO_POR"));
        assertNotNull(params.get("BARCODE_IMAGEN"));
    }
}
