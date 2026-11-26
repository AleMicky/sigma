package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoResponse;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class DisponibilidadActivoExcelServiceTest {

    private final DisponibilidadActivoExcelService service = new DisponibilidadActivoExcelService();

    @Test
    void resumenDelExcelUsaLaMismaReglaDeBajaExcluyente() throws Exception {
        byte[] excel = service.generarExcel(
                List.of(
                        activo(false, "MANTENIMIENTO"), // de baja por flag, no cuenta como mantenimiento
                        activo(true, "DE_BAJA"),         // de baja por código
                        activo(true, "OPERATIVO"),
                        activo(true, "RESERVA")),
                Map.of());

        try (XSSFWorkbook workbook = new XSSFWorkbook(new ByteArrayInputStream(excel))) {
            String resumen = workbook.getSheetAt(0).getRow(2).getCell(0).getStringCellValue();

            assertTrue(resumen.contains("Total Activos: 4"), resumen);
            assertTrue(resumen.contains("Disponibles: 2 (50.0%)"), resumen);
            assertTrue(resumen.contains("En Mantenimiento: 0"), resumen);
            assertTrue(resumen.contains("Fuera de Servicio: 0"), resumen);
            assertTrue(resumen.contains("De Baja: 2"), resumen);
        }
    }

    @Test
    void resumenDelExcelSinActivosReportaTasaCero() throws Exception {
        byte[] excel = service.generarExcel(List.of(), Map.of());

        try (XSSFWorkbook workbook = new XSSFWorkbook(new ByteArrayInputStream(excel))) {
            String resumen = workbook.getSheetAt(0).getRow(2).getCell(0).getStringCellValue();
            assertTrue(resumen.contains("Disponibles: 0 (0.0%)"), resumen);
        }
    }

    private static ActivoResponse activo(Boolean activo, String codigoEstado) {
        return new ActivoResponse(
                UUID.randomUUID(),
                "ACT-" + codigoEstado,
                null,
                "Activo " + codigoEstado,
                null,
                null,
                null,
                new ActivoResponse.EstadoOperativoInfo(
                        UUID.randomUUID(), codigoEstado, codigoEstado, null, null),
                null,
                null,
                activo,
                null);
    }
}
