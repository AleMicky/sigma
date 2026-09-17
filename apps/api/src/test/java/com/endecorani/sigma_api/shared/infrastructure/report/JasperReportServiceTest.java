package com.endecorani.sigma_api.shared.infrastructure.report;

import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JasperReportServiceTest {

    private final JasperReportService service = new JasperReportService();

    @Test
    void debeGenerarReportePdfCorrectamente() {
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("NUMERO_SOLICITUD", "SM-2026-0001");
        parameters.put("FECHA_SOLICITUD", "17/09/2026 10:30");
        parameters.put("ESTADO", "SOLICITADO");
        parameters.put("PRIORIDAD", "ALTA");
        parameters.put("TIPO_MANTENIMIENTO", "CORRECTIVO");
        parameters.put("TIPO_FALLAS", "ELÉCTRICA");
        parameters.put("SOLICITANTE_NOMBRE", "Juan Pérez");
        parameters.put("SOLICITANTE_CARGO", "Operador de Planta");
        parameters.put("ACTIVO_CODIGO", "ACT-00123");
        parameters.put("ACTIVO_NOMBRE", "Bomba Centrífuga Principal");
        parameters.put("ACTIVO_CATEGORIA", "Maquinaria");
        parameters.put("ACTIVO_UBICACION", "Planta 1 - Nave B");
        parameters.put("TITULO", "Falla de presión y ruido anormal");
        parameters.put("DESCRIPCION", "La bomba presenta sobrecalentamiento y vibración excesiva durante el arranque.");
        parameters.put("APROBADOR_NOMBRE", "Carlos Mendoza");
        parameters.put("RESPONSABLE_NOMBRE", "Mario Gómez");
        parameters.put("SUPERVISOR_NOMBRE", "Roberto Sánchez");
        parameters.put("FECHA_INICIO", "18/09/2026 08:00");
        parameters.put("FECHA_FIN", "18/09/2026 16:00");
        parameters.put("FECHA_CIERRE", "19/09/2026 12:00");
        parameters.put("FECHA_EMISION", "17/09/2026 15:45");
        parameters.put("GENERADO_POR", "Ing. Juan Pérez - Jefe de Mantenimiento");

        java.awt.image.BufferedImage barcode = BarcodeUtil.generateBarcode128("SM-2026-0001", 320, 60);
        if (barcode != null) {
            parameters.put("BARCODE_IMAGEN", barcode);
        }

        try {
            org.springframework.core.io.ClassPathResource logoResource = new org.springframework.core.io.ClassPathResource("reports/images/logo-ende-corani.png");
            if (logoResource.exists()) {
                parameters.put("LOGO_EMPRESA", logoResource.getInputStream());
            }
        } catch (Exception ignored) {}

        byte[] pdfBytes = service.generatePdfReport("reports/solicitudes/solicitud_mantenimiento.jrxml", parameters);

        assertNotNull(pdfBytes, "El PDF no debe ser nulo");
        assertTrue(pdfBytes.length > 0, "El PDF debe contener bytes");
        // Validar cabecera PDF (%PDF-)
        String header = new String(pdfBytes, 0, 5);
        assertEquals("%PDF-", header, "El archivo debe ser un PDF válido");
    }

    @Test
    void debeGenerarReporteActaControlActivoPdf() {
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("TITULO_REPORTE", "ACTA DE ENTREGA DE CONTROL DE ACTIVO");
        parameters.put("TIPO_ACTA", "ACTA DE ENTREGA");
        parameters.put("NUMERO_SOLICITUD", "SM-2026-0001");
        parameters.put("TITULO_SOLICITUD", "Mantenimiento correctivo de generador");
        parameters.put("ACTIVO_CODIGO", "ACT-005");
        parameters.put("ACTIVO_NOMBRE", "Generador Diesel 500kVA");
        parameters.put("FECHA_ACTA", "17/09/2026 11:00");
        parameters.put("ESTADO_CONFORMIDAD", "CONFORME");
        parameters.put("ENTREGADO_POR", "Juan Pérez");
        parameters.put("ENTREGADO_CARGO", "Encargado de Mantenimiento");
        parameters.put("RECIBIDO_POR", "Carlos Gómez");
        parameters.put("RECIBIDO_CARGO", "Supervisor de Operaciones");
        parameters.put("OBSERVACION_GENERAL", "Equipo entregado en perfecto estado.");
        parameters.put("FECHA_EMISION", "17/09/2026 11:30");
        parameters.put("GENERADO_POR", "Administrador SIGMA");

        java.awt.image.BufferedImage barcode = BarcodeUtil.generateBarcode128("SM-2026-0001-ENT", 320, 60);
        if (barcode != null) {
            parameters.put("BARCODE_IMAGEN", barcode);
        }

        try {
            org.springframework.core.io.ClassPathResource logoResource = new org.springframework.core.io.ClassPathResource("reports/images/logo-ende-corani.png");
            if (logoResource.exists()) {
                parameters.put("LOGO_EMPRESA", logoResource.getInputStream());
            }
        } catch (Exception ignored) {}

        java.util.List<com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.reporte.ControlActivoAccesorioReporteDto> datasource = java.util.List.of(
                com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.reporte.ControlActivoAccesorioReporteDto.builder()
                        .numero(1)
                        .codigo("ACC-01")
                        .nombre("Cable de alimentación trifásico")
                        .cantidadEsperada(1)
                        .cantidadEncontrada(1)
                        .estadoConformidad("CONFORME")
                        .observacion("En buen estado")
                        .build()
        );

        byte[] pdfBytes = service.generatePdfReport("reports/controles-activos/acta_control_activo.jrxml", parameters, datasource);

        assertNotNull(pdfBytes, "El PDF de acta no debe ser nulo");
        assertTrue(pdfBytes.length > 0, "El PDF de acta debe contener bytes");
        String header = new String(pdfBytes, 0, 5);
        assertEquals("%PDF-", header, "El archivo debe ser un PDF válido");
    }

    @Test
    void debeGenerarReporteOrdenTrabajoPdf() {
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("NUMERO_OT", "OT-2026-0001");
        parameters.put("NUMERO_SOLICITUD", "SM-2026-0001");
        parameters.put("TITULO_SOLICITUD", "Mantenimiento preventivo semestral");
        parameters.put("TIPO_MANTENIMIENTO", "PREVENTIVO");
        parameters.put("PRIORIDAD", "MEDIA");
        parameters.put("ESTADO", "EN_MANTENIMIENTO");
        parameters.put("ACTIVO_CODIGO", "ACT-008");
        parameters.put("ACTIVO_NOMBRE", "Turbina Hidráulica T-01");
        parameters.put("ACTIVO_UBICACION", "Casa de Máquinas");
        parameters.put("RESPONSABLE_NOMBRE", "Ing. Roberto Quiroga");
        parameters.put("RESPONSABLE_CARGO", "Técnico Especialista");
        parameters.put("SUPERVISOR_NOMBRE", "Ing. Mario Rocha");
        parameters.put("SUPERVISOR_CARGO", "Supervisor de Central");
        parameters.put("FECHA_INICIO", "17/09/2026 08:00");
        parameters.put("FECHA_FIN", "17/09/2026 18:00");
        parameters.put("DIAGNOSTICO", "Se detectó leve desgaste en sellos de estanqueidad.");
        parameters.put("TRABAJO_REALIZADO", "Se realizó cambio de sellos, lubricación y balanceo dinámico.");
        parameters.put("OBSERVACION", "Pruebas de arranque satisfactorias.");
        parameters.put("FECHA_EMISION", "17/09/2026 18:30");
        parameters.put("GENERADO_POR", "Administrador SIGMA");

        java.awt.image.BufferedImage barcode = BarcodeUtil.generateBarcode128("OT-2026-0001", 320, 60);
        if (barcode != null) {
            parameters.put("BARCODE_IMAGEN", barcode);
        }

        try {
            org.springframework.core.io.ClassPathResource logoResource = new org.springframework.core.io.ClassPathResource("reports/images/logo-ende-corani.png");
            if (logoResource.exists()) {
                parameters.put("LOGO_EMPRESA", logoResource.getInputStream());
            }
        } catch (Exception ignored) {}

        java.util.List<com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.reporte.OrdenTrabajoActividadReporteDto> datasource = java.util.List.of(
                com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.reporte.OrdenTrabajoActividadReporteDto.builder()
                        .numero(1)
                        .descripcion("Inspección visual de rodamientos")
                        .estado("REALIZADO")
                        .fechaRealizacion("17/09/2026 09:00")
                        .observacion("Sin fisuras detectadas")
                        .build(),
                com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.reporte.OrdenTrabajoActividadReporteDto.builder()
                        .numero(2)
                        .descripcion("Sustitución de lubricante sintético")
                        .estado("REALIZADO")
                        .fechaRealizacion("17/09/2026 11:30")
                        .observacion("Nivel adecuado a 25 litros")
                        .build()
        );

        byte[] pdfBytes = service.generatePdfReport("reports/ordenes-trabajo/orden_trabajo.jrxml", parameters, datasource);

        assertNotNull(pdfBytes, "El PDF de orden de trabajo no debe ser nulo");
        assertTrue(pdfBytes.length > 0, "El PDF de orden de trabajo debe contener bytes");
        String header = new String(pdfBytes, 0, 5);
        assertEquals("%PDF-", header, "El archivo debe ser un PDF válido");
    }
}
