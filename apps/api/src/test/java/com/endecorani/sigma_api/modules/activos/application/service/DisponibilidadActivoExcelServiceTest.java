package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoResponse;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.util.ArrayList;
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

    @Test
    void cubosDelExcelSonExcluyentesSumanTotalYTasaSeCalculaEnElServidor() throws Exception {
        List<ActivoResponse> activos = new ArrayList<>();
        activos.add(activo(false, "MANTENIMIENTO")); // de baja por flag: gana sobre mantenimiento
        activos.add(activo(true, "DE_BAJA"));         // de baja por código
        activos.add(activo(true, "MANTENIMIENTO"));
        activos.add(activo(true, "MANTENIMIENTO"));
        activos.add(activo(true, "FUERA_SERVICIO"));
        activos.add(activo(true, "RESERVA"));
        activos.add(activo(true, "EN_VIAJE"));
        activos.add(activo(true, "OPERATIVO"));
        activos.add(activo(true, "ESTADO_NO_CATALOGADO"));
        activos.add(activo(true, null));

        ActivoEstadoClasificador.Conteo conteo = ActivoEstadoClasificador.Conteo.de(activos);
        assertEquals(10, conteo.total());
        assertEquals(2, conteo.deBaja());
        assertEquals(2, conteo.enMantenimiento());
        assertEquals(1, conteo.fueraServicio());
        assertEquals(1, conteo.reserva());
        assertEquals(1, conteo.enViaje());
        assertEquals(3, conteo.operativo());
        assertEquals(conteo.total(), conteo.deBaja() + conteo.enMantenimiento()
                + conteo.fueraServicio() + conteo.reserva() + conteo.enViaje() + conteo.operativo());
        assertEquals(conteo.disponibles() * 100.0 / conteo.total(), conteo.tasaDisponibilidad());

        byte[] excel = service.generarExcel(activos, Map.of());
        try (XSSFWorkbook workbook = new XSSFWorkbook(new ByteArrayInputStream(excel))) {
            String resumen = workbook.getSheetAt(0).getRow(2).getCell(0).getStringCellValue();
            assertTrue(resumen.contains("Total Activos: 10"), resumen);
            assertTrue(resumen.contains("Disponibles: 5 (50.0%)"), resumen);
            assertTrue(resumen.contains("En Mantenimiento: 2"), resumen);
            assertTrue(resumen.contains("Fuera de Servicio: 1"), resumen);
            assertTrue(resumen.contains("De Baja: 2"), resumen);
        }
    }

    @Test
    void detalleDelExcel_muestraCategoriaUbicacionYEstadoDeRegistro() throws Exception {
        UUID categoriaId = UUID.randomUUID();
        UUID tipoId = UUID.randomUUID();
        ActivoResponse activo = new ActivoResponse(
                UUID.randomUUID(),
                "ACT-DET-001",
                "ALT-001",
                "Vehículo de prueba",
                "Observación de prueba",
                new ActivoResponse.TipoActivoInfo(tipoId, categoriaId, "Vehículos", null, null, null),
                new ActivoResponse.UbicacionInfo(UUID.randomUUID(), "UBI-1", "Almacén central"),
                new ActivoResponse.EstadoOperativoInfo(UUID.randomUUID(), "OPERATIVO", "Operativo", null, null),
                LocalDate.of(2026, 11, 26),
                null,
                false,
                null);

        byte[] excel = service.generarExcel(List.of(activo), Map.of(categoriaId, "Transporte"));
        try (XSSFWorkbook workbook = new XSSFWorkbook(new ByteArrayInputStream(excel))) {
            var sheet = workbook.getSheetAt(0);
            assertEquals("Nº", sheet.getRow(4).getCell(0).getStringCellValue());
            assertEquals("Descripción", sheet.getRow(4).getCell(10).getStringCellValue());

            var fila = sheet.getRow(5);
            assertEquals("ACT-DET-001", fila.getCell(1).getStringCellValue());
            assertEquals("ALT-001", fila.getCell(2).getStringCellValue());
            assertEquals("Vehículos", fila.getCell(4).getStringCellValue());
            assertEquals("Transporte", fila.getCell(5).getStringCellValue());
            assertEquals("Almacén central", fila.getCell(6).getStringCellValue());
            assertEquals("26/11/2026", fila.getCell(8).getStringCellValue());
            assertEquals("Inactivo", fila.getCell(9).getStringCellValue());
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
                codigoEstado == null
                        ? null
                        : new ActivoResponse.EstadoOperativoInfo(
                                UUID.randomUUID(), codigoEstado, codigoEstado, null, null),
                null,
                null,
                activo,
                null);
    }
}
