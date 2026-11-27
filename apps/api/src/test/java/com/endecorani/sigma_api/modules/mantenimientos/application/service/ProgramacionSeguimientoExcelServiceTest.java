package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ReporteSeguimientoFiltros.NivelAlertaReporte;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ReporteSeguimientoFiltros.TipoCriterioReporte;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response.ProgramacionMantenimientoCriterioResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response.ProgramacionMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.shared.util.FlexibleLocalDateTimeParser;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * REQ-MANT-015 / REQ-MANT-034 / REQ-MANT-035: verifica que el Excel proyecte exactamente las
 * mismas filas que la tabla Web ({@code ProgramacionSeguimientoReportView.tsx:76-245}), que los
 * filtros se apliquen sobre esa proyección, que TIEMPO use la regla canónica de fecha local
 * entera {@code America/La_Paz} y que el redondeo HALF_UP exacto no regresione en TIEMPO ni USO.
 */
class ProgramacionSeguimientoExcelServiceTest {

    private final ProgramacionSeguimientoExcelService service = new ProgramacionSeguimientoExcelService();
    private final LocalDate hoy = LocalDate.now(FlexibleLocalDateTimeParser.OPERATIONAL_ZONE);

    @Test
    void sinFiltros_debeIncluirTodasLasFilasCalculadas() {
        assertEquals(12, leerFilas(generar(null, null, null)).size());
    }

    @Test
    void filtroPorCadaAlerta_debeDevuelveSoloLasFilasCoincidentes() {
        assertFilas(generar(NivelAlertaReporte.CRITICO, null, null), 2,
                "🔴 Requiere Servicio", "🔴 Requiere Servicio");
        assertFilas(generar(NivelAlertaReporte.PROXIMO, null, null), 5,
                "🟡 Atención Próxima", "🟡 Atención Próxima", "🟡 Atención Próxima",
                "🟡 Atención Próxima", "🟡 Atención Próxima");
        assertFilas(generar(NivelAlertaReporte.AL_DIA, null, null), 3,
                "🟢 Al Día", "🟢 Al Día", "🟢 Al Día");
        assertFilas(generar(NivelAlertaReporte.INACTIVO, null, null), 2,
                "⚪ Pausado", "⚪ Pausado");
    }

    @Test
    void filtroPorCadaCriterio_debeDevuelveSoloLasFilasCoincidentes() {
        List<FilaExcel> tiempo = leerFilas(generar(null, TipoCriterioReporte.TIEMPO, null));
        assertEquals(8, tiempo.size());
        assertTrue(tiempo.stream().allMatch(f -> "Tiempo".equals(f.tipoCriterio())));

        List<FilaExcel> kilometraje = leerFilas(generar(null, TipoCriterioReporte.KILOMETRAJE, null));
        assertEquals(3, kilometraje.size());
        assertTrue(kilometraje.stream().allMatch(f -> "Odómetro".equals(f.tipoCriterio())));

        List<FilaExcel> horas = leerFilas(generar(null, TipoCriterioReporte.HORAS_USO, null));
        assertEquals(1, horas.size());
        assertEquals("Horómetro", horas.get(0).tipoCriterio());
    }

    @Test
    void combinacionDeQConAlertaYCriterio_debeAplicarLosTresFiltros() {
        List<FilaExcel> filas = leerFilas(generar(NivelAlertaReporte.CRITICO,
                TipoCriterioReporte.KILOMETRAJE, "ACT-KM"));

        assertEquals(1, filas.size());
        assertEquals("ACT-KM", filas.get(0).activoCodigo());
        assertEquals("Odómetro", filas.get(0).tipoCriterio());
        assertEquals("🔴 Requiere Servicio", filas.get(0).estadoAlerta());

        assertTrue(leerFilas(generar(NivelAlertaReporte.CRITICO,
                TipoCriterioReporte.KILOMETRAJE, "ACT-TIEMPO")).isEmpty());
    }

    @Test
    void umbralesWeb_debenClasificarProgresoYMargen() {
        List<FilaExcel> criticos = leerFilas(generar(NivelAlertaReporte.CRITICO, null, null));
        assertTrue(criticos.stream().anyMatch(f -> "Vencido hace 1 d".equals(f.margen())));
        assertTrue(criticos.stream().anyMatch(f -> "Rebasado por 500 km".equals(f.margen())));

        List<FilaExcel> proximos = leerFilas(generar(NivelAlertaReporte.PROXIMO, null, null));
        assertTrue(proximos.stream().anyMatch(f -> "85%".equals(f.porcentaje())));
        assertTrue(proximos.stream().anyMatch(f -> "Faltan 0 d".equals(f.margen())));
        assertTrue(proximos.stream().anyMatch(f -> "Faltan 15 d".equals(f.margen())));

        List<FilaExcel> alDia = leerFilas(generar(NivelAlertaReporte.AL_DIA, null, null));
        assertTrue(alDia.stream().anyMatch(f -> "84%".equals(f.porcentaje())));
        assertTrue(alDia.stream().anyMatch(f -> "Faltan 16 d".equals(f.margen())));
    }

    @Test
    void bordesTiempoConIntervalo30_debenUsarLaFechaLocalEntera() {
        FilaExcel vencida = filaUnica(hoy.minusDays(1), 30);
        assertEquals("🔴 Requiere Servicio", vencida.estadoAlerta());
        assertEquals("Vencido hace 1 d", vencida.margen());

        FilaExcel hoyMismo = filaUnica(hoy, 30);
        assertEquals("🟡 Atención Próxima", hoyMismo.estadoAlerta());
        assertEquals("Faltan 0 d", hoyMismo.margen());
        assertEquals("100%", hoyMismo.porcentaje());

        FilaExcel quince = filaUnica(hoy.plusDays(15), 30);
        assertEquals("🟡 Atención Próxima", quince.estadoAlerta());
        assertEquals("Faltan 15 d", quince.margen());
        assertEquals("50%", quince.porcentaje());

        FilaExcel dieciseis = filaUnica(hoy.plusDays(16), 30);
        assertEquals("🟢 Al Día", dieciseis.estadoAlerta());
        assertEquals("Faltan 16 d", dieciseis.margen());
        assertEquals("47%", dieciseis.porcentaje());
    }

    @Test
    void porcentajeTiempo85Y84_conDiffMayorA15_debeClasificarPorUmbral() {
        FilaExcel ochentaYCinco = filaUnica(hoy.plusDays(30), 200);
        assertEquals("85%", ochentaYCinco.porcentaje());
        assertEquals("Faltan 30 d", ochentaYCinco.margen());
        assertEquals("🟡 Atención Próxima", ochentaYCinco.estadoAlerta());

        FilaExcel ochentaYCuatro = filaUnica(hoy.plusDays(32), 200);
        assertEquals("84%", ochentaYCuatro.porcentaje());
        assertEquals("Faltan 32 d", ochentaYCuatro.margen());
        assertEquals("🟢 Al Día", ochentaYCuatro.estadoAlerta());
    }

    @Test
    void redondeoHalfUpDebeSerExacto_enTiempoYUso() {
        // TIEMPO: proximaFecha = hoy+17 con intervalo 40 => transcurridos=23 => 57.5 -> 58.
        FilaExcel tiempo = filaUnica(hoy.plusDays(17), 40);
        assertEquals("Tiempo", tiempo.tipoCriterio());
        assertEquals("58%", tiempo.porcentaje());
        assertEquals("Faltan 17 d", tiempo.margen());
        assertEquals("🟢 Al Día", tiempo.estadoAlerta());

        FilaExcel kilometraje = filaUsoUnica(TipoCriterioMantenimiento.KILOMETRAJE,
                "40", "1000", "983");
        assertEquals("Odómetro", kilometraje.tipoCriterio());
        assertEquals("58%", kilometraje.porcentaje());
        assertEquals("Faltan 17 km", kilometraje.margen());
        assertEquals("🟢 Al Día", kilometraje.estadoAlerta());

        FilaExcel horasUso = filaUsoUnica(TipoCriterioMantenimiento.HORAS_USO,
                "40", "1000", "983");
        assertEquals("Horómetro", horasUso.tipoCriterio());
        assertEquals("58%", horasUso.porcentaje());
        assertEquals("Faltan 17 hrs", horasUso.margen());
        assertEquals("🟢 Al Día", horasUso.estadoAlerta());
    }

    @Test
    void porcentajeTiempo_debeQuedarClampeadoEn999() {
        // transcurridos=440 con intervalo 40 => 1100%; el techo del contrato es 999%.
        FilaExcel vencida = filaUnica(hoy.minusDays(400), 40);
        assertEquals("999%", vencida.porcentaje());
        assertEquals("Vencido hace 400 d", vencida.margen());
        assertEquals("🔴 Requiere Servicio", vencida.estadoAlerta());
    }

    @Test
    void horaDelDiaNoDebeAlterarElCalculo_enAmericaLaPaz() throws Exception {
        // Equivalente al vi de Java: producción no expone Clock, así que se fija el LocalDate
        // que LocalDate.now(ZONA) produciría para cada instante. La hora se descarta por diseño.
        LocalDate fechaOperativa = LocalDate.of(2026, 11, 27);
        ZonedDateTime apertura = fechaOperativa.atTime(0, 1)
                .atZone(FlexibleLocalDateTimeParser.OPERATIONAL_ZONE);
        ZonedDateTime cierre = fechaOperativa.atTime(23, 59)
                .atZone(FlexibleLocalDateTimeParser.OPERATIONAL_ZONE);

        assertEquals(fechaOperativa, apertura.toLocalDate());
        assertEquals(fechaOperativa, cierre.toLocalDate());

        LocalDate proxCercana = fechaOperativa.plusDays(15);
        CalculoTiempoFijo enApertura = calcularTiempo(apertura.toLocalDate(), proxCercana, 30);
        CalculoTiempoFijo enCierre = calcularTiempo(cierre.toLocalDate(), proxCercana, 30);
        assertEquals(enApertura, enCierre);
        assertEquals("PROXIMO", enApertura.estado());

        LocalDate proxLejana = fechaOperativa.plusDays(16);
        CalculoTiempoFijo alDiaApertura = calcularTiempo(apertura.toLocalDate(), proxLejana, 30);
        CalculoTiempoFijo alDiaCierre = calcularTiempo(cierre.toLocalDate(), proxLejana, 30);
        assertEquals(alDiaApertura, alDiaCierre);
        assertEquals("AL_DIA", alDiaApertura.estado());
    }

    private void assertFilas(byte[] excel, int esperadas, String... estados) {
        List<FilaExcel> filas = leerFilas(excel);
        assertEquals(esperadas, filas.size());
        for (int i = 0; i < estados.length; i++) {
            assertEquals(estados[i], filas.get(i).estadoAlerta());
        }
    }

    private byte[] generar(NivelAlertaReporte alerta, TipoCriterioReporte criterio, String q) {
        return service.generarExcel(fixtures(), q, alerta, criterio);
    }

    private FilaExcel filaUnica(LocalDate proximaFecha, Integer intervaloDias) {
        List<ProgramacionMantenimientoResponse> programaciones = List.of(
                prog("ACT-BORDE", true, List.of(criterioTiempo(proximaFecha, intervaloDias, true))));
        List<FilaExcel> filas = leerFilas(service.generarExcel(programaciones, null, null, null));
        assertEquals(1, filas.size());
        return filas.get(0);
    }

    private FilaExcel filaUsoUnica(
            TipoCriterioMantenimiento tipo, String intervalo, String proximo, String actual) {
        List<ProgramacionMantenimientoResponse> programaciones = List.of(
                prog("ACT-USO", true,
                        List.of(criterioUso(tipo, bd(intervalo), bd(proximo), bd(actual), true))));
        List<FilaExcel> filas = leerFilas(service.generarExcel(programaciones, null, null, null));
        assertEquals(1, filas.size());
        return filas.get(0);
    }

    private CalculoTiempoFijo calcularTiempo(LocalDate hoy, LocalDate proximaFecha, Integer intervaloDias)
            throws Exception {
        Method metodo = ProgramacionSeguimientoExcelService.class.getDeclaredMethod(
                "calcularTiempo", LocalDate.class, LocalDate.class, Integer.class);
        metodo.setAccessible(true);
        Object calculo = metodo.invoke(service, hoy, proximaFecha, intervaloDias);
        Class<?> tipo = calculo.getClass();
        return new CalculoTiempoFijo(
                (Integer) valor(tipo, calculo, "porcentaje"),
                String.valueOf(valor(tipo, calculo, "estadoBase")));
    }

    private Object valor(Class<?> tipo, Object destino, String nombre) throws Exception {
        Method metodo = tipo.getDeclaredMethod(nombre);
        metodo.setAccessible(true);
        return metodo.invoke(destino);
    }

    private List<ProgramacionMantenimientoResponse> fixtures() {
        return List.of(
                prog("ACT-TIEMPO", true, List.of(
                        criterioTiempo(hoy.minusDays(1), 30, true),
                        criterioTiempo(hoy, 30, true),
                        criterioTiempo(hoy.plusDays(15), 30, true),
                        criterioTiempo(hoy.plusDays(16), 30, true),
                        criterioTiempo(hoy.plusDays(30), 200, true),
                        criterioTiempo(hoy.plusDays(32), 200, true))),
                prog("ACT-KM", true, List.of(
                        criterioUso(TipoCriterioMantenimiento.KILOMETRAJE,
                                bd("1000"), bd("10000"), bd("10500"), true),
                        criterioUso(TipoCriterioMantenimiento.KILOMETRAJE,
                                bd("1000"), bd("10000"), bd("9850"), true),
                        criterioUso(TipoCriterioMantenimiento.KILOMETRAJE,
                                bd("1000"), bd("10000"), bd("9100"), true))),
                prog("ACT-HRS", true, List.of(
                        criterioUso(TipoCriterioMantenimiento.HORAS_USO,
                                bd("100"), bd("1000"), bd("985"), true))),
                prog("ACT-PAUSADO", true, List.of(criterioTiempo(hoy.plusDays(50), 30, false))),
                prog("ACT-SIN-CRITERIOS", true, List.of())
        );
    }

    private ProgramacionMantenimientoCriterioResponse criterioTiempo(
            LocalDate proximaFecha, Integer intervaloDias, boolean activo) {
        return new ProgramacionMantenimientoCriterioResponse(
                UUID.randomUUID(), UUID.randomUUID(), TipoCriterioMantenimiento.TIEMPO,
                intervaloDias, null, proximaFecha, null, null, activo, null);
    }

    private ProgramacionMantenimientoCriterioResponse criterioUso(
            TipoCriterioMantenimiento tipo, BigDecimal intervalo, BigDecimal prox,
            BigDecimal actual, boolean activo) {
        return new ProgramacionMantenimientoCriterioResponse(
                UUID.randomUUID(), UUID.randomUUID(), tipo, null, intervalo, null,
                prox, actual, activo, null);
    }

    private ProgramacionMantenimientoResponse prog(
            String activoCodigo, boolean activo, List<ProgramacionMantenimientoCriterioResponse> criterios) {
        ProgramacionMantenimientoResponse.PlanActivoInfo plan = new ProgramacionMantenimientoResponse.PlanActivoInfo(
                UUID.randomUUID(), UUID.randomUUID(), "PLAN-" + activoCodigo, "Plan " + activoCodigo,
                UUID.randomUUID(), activoCodigo, "Activo " + activoCodigo, UUID.randomUUID(),
                "Tipo " + activoCodigo, null, null, true);
        return new ProgramacionMantenimientoResponse(
                UUID.randomUUID(), UUID.randomUUID(), plan, activo, criterios, null);
    }

    private BigDecimal bd(String valor) {
        return new BigDecimal(valor);
    }

    private List<FilaExcel> leerFilas(byte[] excel) {
        List<FilaExcel> filas = new ArrayList<>();
        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(excel))) {
            Sheet sheet = workbook.getSheet("Seguimiento Preventivo");
            for (Row row : sheet) {
                if (row.getRowNum() < 5) {
                    continue;
                }
                Cell numero = row.getCell(0);
                if (numero == null) {
                    continue;
                }
                filas.add(new FilaExcel(
                        texto(row.getCell(1)), texto(row.getCell(6)), texto(row.getCell(10)),
                        texto(row.getCell(11)), texto(row.getCell(12))));
            }
        } catch (Exception e) {
            throw new AssertionError("No se pudo leer el Excel generado", e);
        }
        return filas;
    }

    private String texto(Cell celda) {
        return celda == null ? "" : celda.getStringCellValue();
    }

    private record FilaExcel(
            String activoCodigo, String tipoCriterio, String porcentaje,
            String margen, String estadoAlerta) {}

    private record CalculoTiempoFijo(int porcentaje, String estado) {}
}
