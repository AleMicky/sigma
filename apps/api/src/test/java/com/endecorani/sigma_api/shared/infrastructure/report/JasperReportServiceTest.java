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

        byte[] pdfBytes = service.generatePdfReport("reports/solicitudes/solicitud_mantenimiento.jrxml", parameters);

        assertNotNull(pdfBytes, "El PDF no debe ser nulo");
        assertTrue(pdfBytes.length > 0, "El PDF debe contener bytes");
        // Validar cabecera PDF (%PDF-)
        String header = new String(pdfBytes, 0, 5);
        assertEquals("%PDF-", header, "El archivo debe ser un PDF válido");
    }
}
