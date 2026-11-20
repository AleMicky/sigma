package com.endecorani.sigma_api.shared.infrastructure.report.controlactivo;

import com.endecorani.sigma_api.shared.infrastructure.report.BarcodeUtil;
import com.endecorani.sigma_api.shared.infrastructure.report.JasperReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ControlActivoActaReportGenerator {

    private static final String REPORTE_CONTROL_ACTIVO_PATH = "reports/controles-activos/acta_control_activo.jrxml";
    private static final String LOGO_PATH = "reports/images/logo-ende-corani.png";
    private static final DateTimeFormatter FORMATTER_FECHA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final JasperReportService jasperReportService;

    public byte[] generarPdf(ControlActivoActaReportData data) {
        String tipoActa = data.entrega() ? "ACTA DE ENTREGA" : "ACTA DE DEVOLUCIÓN";
        String numeroSolicitud = (data.numeroSolicitud() != null && !data.numeroSolicitud().isBlank())
                ? data.numeroSolicitud()
                : "S/N";

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("TITULO_REPORTE", data.tituloReporte());
        parameters.put("TIPO_ACTA", tipoActa);
        parameters.put("NUMERO_SOLICITUD", numeroSolicitud);
        parameters.put("TITULO_SOLICITUD", defaultDash(data.tituloSolicitud()));
        parameters.put("ACTIVO_CODIGO", defaultDash(data.activoCodigo()));
        parameters.put("ACTIVO_NOMBRE", defaultDash(data.activoNombre()));
        parameters.put("FECHA_ACTA", data.fechaActa() != null ? data.fechaActa().format(FORMATTER_FECHA_HORA) : "-");
        parameters.put("ESTADO_CONFORMIDAD", Boolean.TRUE.equals(data.conforme()) ? "CONFORME" : "NO CONFORME");
        parameters.put("ENTREGADO_POR", defaultDash(data.entregadoPorNombre()));
        parameters.put("ENTREGADO_CARGO", data.entregadoPorCargo() != null ? data.entregadoPorCargo() : "");
        parameters.put("RECIBIDO_POR", defaultDash(data.recibidoPorNombre()));
        parameters.put("RECIBIDO_CARGO", data.recibidoPorCargo() != null ? data.recibidoPorCargo() : "");
        parameters.put("OBSERVACION_GENERAL", data.observacionGeneral() != null ? data.observacionGeneral() : "");
        parameters.put("FECHA_EMISION", LocalDateTime.now().format(FORMATTER_FECHA_HORA));
        parameters.put("GENERADO_POR", defaultDash(data.generadoPor()));

        String barcodeValue = (data.numeroSolicitud() != null && !data.numeroSolicitud().isBlank())
                ? data.numeroSolicitud() + "-" + (data.entrega() ? "ENT" : "DEV")
                : data.controlId().toString();
        BufferedImage barcodeImage = BarcodeUtil.generateBarcode128(barcodeValue, 320, 60);
        if (barcodeImage != null) {
            parameters.put("BARCODE_IMAGEN", barcodeImage);
        }

        cargarLogo(parameters);

        List<ControlActivoAccesorioReporteItem> items = data.accesorios() != null
                ? data.accesorios()
                : Collections.emptyList();

        return jasperReportService.generatePdfReport(REPORTE_CONTROL_ACTIVO_PATH, parameters, items);
    }

    private void cargarLogo(Map<String, Object> parameters) {
        try {
            ClassPathResource logoResource = new ClassPathResource(LOGO_PATH);
            if (logoResource.exists()) {
                try (InputStream is = logoResource.getInputStream()) {
                    parameters.put("LOGO_EMPRESA", new ByteArrayInputStream(is.readAllBytes()));
                }
            }
        } catch (Exception e) {
            log.warn("No se pudo cargar el logo para el reporte de control de activo: {}", e.getMessage());
        }
    }

    private static String defaultDash(String value) {
        return (value != null && !value.isBlank()) ? value : "-";
    }
}
