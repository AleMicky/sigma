package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ReporteSeguimientoFiltros.NivelAlertaReporte;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ReporteSeguimientoFiltros.TipoCriterioReporte;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response.ProgramacionMantenimientoCriterioResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response.ProgramacionMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.util.FlexibleLocalDateTimeParser;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Slf4j
@Service
public class ProgramacionSeguimientoExcelService {

    private static final DateTimeFormatter FECHA_HORA_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter FECHA_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    /**
     * REQ-MANT-015: la tabla Web calcula fechas y márgenes con la fecha local del navegador
     * (es-BO). En servidor se usa la misma zona operacional, nunca la zona del host.
     */
    private static final ZoneId ZONA = FlexibleLocalDateTimeParser.OPERATIONAL_ZONE;

    private static final byte[] COLOR_HEADER_RGB = new byte[]{(byte) 11, (byte) 79, (byte) 138}; // #0B4F8A ENDE Blue
    private static final byte[] COLOR_ZEBRA_RGB = new byte[]{(byte) 248, (byte) 250, (byte) 252}; // #F8FAFC

    private static final byte[] COLOR_CRITICO_BG = new byte[]{(byte) 254, (byte) 226, (byte) 226}; // #FEE2E2
    private static final byte[] COLOR_CRITICO_FG = new byte[]{(byte) 185, (byte) 28, (byte) 28};   // #B91C1C
    private static final byte[] COLOR_ALERTA_BG = new byte[]{(byte) 254, (byte) 243, (byte) 199};  // #FEF3C7
    private static final byte[] COLOR_ALERTA_FG = new byte[]{(byte) 180, (byte) 83, (byte) 9};    // #B45309
    private static final byte[] COLOR_OK_BG = new byte[]{(byte) 220, (byte) 252, (byte) 231};      // #DCFCE7
    private static final byte[] COLOR_OK_FG = new byte[]{(byte) 21, (byte) 128, (byte) 61};       // #15803D

    private record FilaSeguimiento(
            String activoCodigo,
            String activoNombre,
            String tipoActivo,
            String planCodigo,
            String planNombre,
            TipoCriterioMantenimiento tipoCriterio,
            String frecuenciaLabel,
            String lecturaActualLabel,
            String proximoUmbralLabel,
            int porcentaje,
            String margenRestanteLabel,
            NivelAlertaReporte estadoAlerta,
            boolean programacionActiva
    ) {}

    private record CalculoCriterio(
            String frecuenciaLabel,
            String lecturaActualLabel,
            String proximoUmbralLabel,
            int porcentaje,
            String margenRestanteLabel,
            NivelAlertaReporte estadoBase
    ) {}

    /** Compatibilidad con el contrato anterior: sin filtros nuevos. */
    public byte[] generarExcel(List<ProgramacionMantenimientoResponse> programaciones) {
        return generarExcel(programaciones, null, null, null);
    }

    /**
     * REQ-MANT-015: genera exactamente las mismas filas que la tabla Web después de aplicar
     * alerta, tipo de criterio y búsqueda ({@code q}) sobre la proyección calculada en servidor.
     */
    public byte[] generarExcel(
            List<ProgramacionMantenimientoResponse> programaciones,
            String q,
            NivelAlertaReporte filtroAlerta,
            TipoCriterioReporte filtroCriterio
    ) {
        // REQ-MANT-034: regla canónica = fecha local entera America/La_Paz; la hora no interviene.
        LocalDate hoy = LocalDate.now(ZONA);
        NumberFormat numero = NumberFormat.getNumberInstance(Locale.forLanguageTag("es-BO"));

        List<FilaSeguimiento> todasLasFilas = construirFilas(programaciones, hoy, numero);
        List<FilaSeguimiento> filas = todasLasFilas.stream()
                .filter(fila -> cumpleFiltros(fila, q, filtroAlerta, filtroCriterio))
                .toList();

        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            XSSFSheet sheet = workbook.createSheet("Seguimiento Preventivo");
            sheet.setDisplayGridlines(true);

            CellStyle titleStyle = crearEstiloTitulo(workbook);
            CellStyle subtitleStyle = crearEstiloSubtitulo(workbook);
            CellStyle metaStyle = crearEstiloMeta(workbook);
            CellStyle headerStyle = crearEstiloCabecera(workbook);

            CellStyle dataTextLeft = crearEstiloTexto(workbook, HorizontalAlignment.LEFT, false);
            CellStyle dataTextCenter = crearEstiloTexto(workbook, HorizontalAlignment.CENTER, false);
            CellStyle dataTextRight = crearEstiloTexto(workbook, HorizontalAlignment.RIGHT, false);
            CellStyle dataZebraLeft = crearEstiloTexto(workbook, HorizontalAlignment.LEFT, true);
            CellStyle dataZebraCenter = crearEstiloTexto(workbook, HorizontalAlignment.CENTER, true);
            CellStyle dataZebraRight = crearEstiloTexto(workbook, HorizontalAlignment.RIGHT, true);

            CellStyle styleCritico = crearEstiloAlerta(workbook, COLOR_CRITICO_BG, COLOR_CRITICO_FG);
            CellStyle styleAlerta = crearEstiloAlerta(workbook, COLOR_ALERTA_BG, COLOR_ALERTA_FG);
            CellStyle styleOk = crearEstiloAlerta(workbook, COLOR_OK_BG, COLOR_OK_FG);

            int rowIndex = 0;

            Row titleRow = sheet.createRow(rowIndex++);
            titleRow.setHeightInPoints(24);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("ENDE CORANI S.A. - REPORTE DE SEGUIMIENTO DE MANTENIMIENTO PREVENTIVO Y TELEMETRÍA");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 13));

            Row subtitleRow = sheet.createRow(rowIndex++);
            subtitleRow.setHeightInPoints(18);
            Cell subtitleCell = subtitleRow.createCell(0);
            subtitleCell.setCellValue("Sistema Integrado de Gestión SIGMA | Emitido: "
                    + LocalDateTime.now(ZONA).format(FECHA_HORA_FORMATTER));
            subtitleCell.setCellStyle(subtitleStyle);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 13));

            // REQ-MANT-015: el resumen usa todas las filas calculadas, igual que las métricas Web.
            long totalProgs = programaciones == null ? 0 : programaciones.size();
            long vigentes = programaciones == null ? 0 : programaciones.stream()
                    .filter(p -> Boolean.TRUE.equals(p.activo()))
                    .count();
            long criticos = todasLasFilas.stream().filter(f -> f.estadoAlerta() == NivelAlertaReporte.CRITICO).count();
            long proximos = todasLasFilas.stream().filter(f -> f.estadoAlerta() == NivelAlertaReporte.PROXIMO).count();
            long alDia = todasLasFilas.stream().filter(f -> f.estadoAlerta() == NivelAlertaReporte.AL_DIA).count();

            Row metaRow = sheet.createRow(rowIndex++);
            metaRow.setHeightInPoints(16);
            Cell metaCell = metaRow.createCell(0);
            metaCell.setCellValue(String.format(
                    "Total Programaciones: %d | Vigentes: %d | 🔴 Requieren Servicio: %d | 🟡 Atención Próxima: %d | 🟢 Al Día: %d",
                    totalProgs, vigentes, criticos, proximos, alDia));
            metaCell.setCellStyle(metaStyle);
            sheet.addMergedRegion(new CellRangeAddress(2, 2, 0, 13));

            rowIndex++;

            String[] headers = {
                    "Nº", "Código Activo", "Nombre del Activo", "Tipo de Activo", "Código Plan",
                    "Plan de Mantenimiento", "Criterio", "Frecuencia / Intervalo", "Lectura Actual",
                    "Próximo Umbral", "% Progreso", "Margen Restante", "Estado de Alerta", "Programación"
            };

            Row headerRow = sheet.createRow(rowIndex++);
            headerRow.setHeightInPoints(22);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int itemIndex = 1;
            for (FilaSeguimiento fila : filas) {
                Row row = sheet.createRow(rowIndex++);
                row.setHeightInPoints(18);
                boolean isZebra = (itemIndex % 2 == 0);
                CellStyle textLeft = isZebra ? dataZebraLeft : dataTextLeft;
                CellStyle textCenter = isZebra ? dataZebraCenter : dataTextCenter;
                CellStyle textRight = isZebra ? dataZebraRight : dataTextRight;

                Cell[] celdas = new Cell[14];
                for (int i = 0; i < celdas.length; i++) {
                    celdas[i] = row.createCell(i);
                }

                celdas[0].setCellValue(itemIndex++);
                celdas[0].setCellStyle(textCenter);
                celdas[1].setCellValue(fila.activoCodigo());
                celdas[1].setCellStyle(textCenter);
                celdas[2].setCellValue(fila.activoNombre());
                celdas[2].setCellStyle(textLeft);
                celdas[3].setCellValue(fila.tipoActivo());
                celdas[3].setCellStyle(textLeft);
                celdas[4].setCellValue(fila.planCodigo());
                celdas[4].setCellStyle(textCenter);
                celdas[5].setCellValue(fila.planNombre());
                celdas[5].setCellStyle(textLeft);
                celdas[6].setCellValue(formatearTipoCriterio(fila.tipoCriterio()));
                celdas[6].setCellStyle(textCenter);
                celdas[7].setCellValue(fila.frecuenciaLabel());
                celdas[7].setCellStyle(textCenter);
                celdas[8].setCellValue(fila.lecturaActualLabel());
                celdas[8].setCellStyle(textCenter);
                celdas[9].setCellValue(fila.proximoUmbralLabel());
                celdas[9].setCellStyle(textCenter);
                celdas[10].setCellValue(fila.porcentaje() + "%");
                celdas[10].setCellStyle(textRight);
                celdas[11].setCellValue(fila.margenRestanteLabel());
                celdas[11].setCellStyle(textLeft);
                celdas[12].setCellValue(formatearEstadoAlerta(fila.estadoAlerta()));
                celdas[12].setCellStyle(estiloAlerta(fila.estadoAlerta(), styleCritico, styleAlerta, styleOk, textCenter));
                celdas[13].setCellValue(fila.programacionActiva() ? "ACTIVA" : "INACTIVA");
                celdas[13].setCellStyle(textCenter);
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                int currentWidth = sheet.getColumnWidth(i);
                sheet.setColumnWidth(i, Math.max(currentWidth + 1000, 3200));
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            log.error("Error al generar el reporte Excel de seguimiento preventivo: {}", e.getMessage(), e);
            throw new BusinessException("No fue posible generar el archivo Excel de seguimiento preventivo.");
        }
    }

    /**
     * REQ-MANT-015: desglose por criterio (o una fila "sin criterios"), con la misma semántica
     * que {@code ProgramacionSeguimientoReportView.tsx:76-209}.
     */
    private List<FilaSeguimiento> construirFilas(
            List<ProgramacionMantenimientoResponse> programaciones, LocalDate hoy, NumberFormat numero) {
        List<FilaSeguimiento> filas = new ArrayList<>();
        if (programaciones == null) {
            return filas;
        }
        for (ProgramacionMantenimientoResponse prog : programaciones) {
            ProgramacionMantenimientoResponse.PlanActivoInfo info = prog.planActivo();
            String activoCodigo = n(info == null ? null : info.activoCodigo());
            String activoNombre = n(info == null ? null : info.activoNombre());
            String tipoActivo = n(info == null ? null : info.tipoActivoNombre());
            String planCodigo = n(info == null ? null : info.planCodigo());
            String planNombre = n(info == null ? null : info.planNombre());
            boolean progActiva = Boolean.TRUE.equals(prog.activo());

            List<ProgramacionMantenimientoCriterioResponse> criterios = prog.criterios();
            if (criterios == null || criterios.isEmpty()) {
                filas.add(new FilaSeguimiento(
                        activoCodigo, activoNombre, tipoActivo, planCodigo, planNombre,
                        TipoCriterioMantenimiento.TIEMPO,
                        "Sin criterios configurados", "-", "-", 0, "Pendiente configuración",
                        NivelAlertaReporte.INACTIVO, progActiva));
                continue;
            }

            for (ProgramacionMantenimientoCriterioResponse criterio : criterios) {
                boolean criterioActivo = Boolean.TRUE.equals(criterio.activo());
                TipoCriterioMantenimiento tipo = criterio.tipoCriterio() != null
                        ? criterio.tipoCriterio() : TipoCriterioMantenimiento.TIEMPO;

                CalculoCriterio calculo;
                if (tipo == TipoCriterioMantenimiento.TIEMPO) {
                    calculo = calcularTiempo(hoy, criterio.proximaFecha(), criterio.intervaloDias());
                } else {
                    calculo = calcularUso(
                            tipo,
                            criterio.intervaloUso(),
                            criterio.proximoValorUso(),
                            criterio.valorActualUso(),
                            numero);
                }

                NivelAlertaReporte estado = (!progActiva || !criterioActivo)
                        ? NivelAlertaReporte.INACTIVO
                        : calculo.estadoBase();

                filas.add(new FilaSeguimiento(
                        activoCodigo, activoNombre, tipoActivo, planCodigo, planNombre, tipo,
                        calculo.frecuenciaLabel(), calculo.lecturaActualLabel(), calculo.proximoUmbralLabel(),
                        calculo.porcentaje(), calculo.margenRestanteLabel(), estado, progActiva));
            }
        }
        return filas;
    }

    /**
     * Regla Web para TIEMPO: progreso = HALF_UP exacto de ((hoy - base) / intervalo * 100), limitado a 999.
     * CRITICO si la fecha ya pasó; PROXIMO si faltan ≤ 15 días o el progreso es ≥ 85%; AL_DIA en
     * caso contrario. {@code base = proximaFecha - intervaloDias}. La hora del día no interviene.
     */
    private CalculoCriterio calcularTiempo(LocalDate hoy, LocalDate proximaFecha, Integer intervaloDias) {
        int dias = intervaloDias != null ? intervaloDias : 0;
        String frecuencia = "Cada " + dias + " días";
        String lectura = hoy.format(FECHA_FORMATTER);
        String proximo = proximaFecha != null ? proximaFecha.format(FECHA_FORMATTER) : "-";

        if (proximaFecha == null || dias <= 0) {
            return new CalculoCriterio(frecuencia, lectura, proximo, 0, "", NivelAlertaReporte.AL_DIA);
        }

        LocalDate fechaBase = proximaFecha.minusDays(dias);
        long transcurridos = ChronoUnit.DAYS.between(fechaBase, hoy);
        // REQ-MANT-035: HALF_UP exacto, igual que la rama de uso (evita 57.5 -> 57 por double).
        long porcentajeRedondeado = BigDecimal.valueOf(transcurridos)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(dias), 0, RoundingMode.HALF_UP)
                .longValueExact();
        int porcentaje = (int) Math.min(Math.max(porcentajeRedondeado, 0L), 999L);

        long diffDias = ChronoUnit.DAYS.between(hoy, proximaFecha);
        String margen = diffDias < 0
                ? "Vencido hace " + Math.abs(diffDias) + " d"
                : "Faltan " + diffDias + " d";

        NivelAlertaReporte estado;
        if (diffDias < 0) {
            estado = NivelAlertaReporte.CRITICO;
        } else if (diffDias <= 15 || porcentaje >= 85) {
            estado = NivelAlertaReporte.PROXIMO;
        } else {
            estado = NivelAlertaReporte.AL_DIA;
        }
        return new CalculoCriterio(frecuencia, lectura, proximo, porcentaje, margen, estado);
    }

    /**
     * Regla Web para KILOMETRAJE/HORAS_USO: avance = max(actual - (umbral - intervalo), 0);
     * progreso = redondeo(avance / intervalo * 100), limitado a 999. CRITICO si el umbral se
     * rebasó (o se alcanzó con umbral > 0); PROXIMO si el progreso es ≥ 85% (margen del 15%).
     */
    private CalculoCriterio calcularUso(
            TipoCriterioMantenimiento tipo,
            BigDecimal intervaloCrudo,
            BigDecimal proxCrudo,
            BigDecimal actualCrudo,
            NumberFormat numero
    ) {
        BigDecimal intervalo = intervaloCrudo != null ? intervaloCrudo : BigDecimal.ZERO;
        BigDecimal prox = proxCrudo != null ? proxCrudo : BigDecimal.ZERO;
        BigDecimal actual = actualCrudo != null ? actualCrudo : BigDecimal.ZERO;
        String unidad = tipo == TipoCriterioMantenimiento.KILOMETRAJE ? "km" : "hrs";
        BigDecimal base = prox.subtract(intervalo);

        String frecuencia = "Cada " + numero.format(intervalo) + " " + unidad;
        String lectura = numero.format(actual) + " " + unidad;
        String proximo = numero.format(prox) + " " + unidad;

        int porcentaje = 0;
        if (intervalo.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal avance = actual.subtract(base).max(BigDecimal.ZERO);
            BigDecimal pct = avance.multiply(BigDecimal.valueOf(100))
                    .divide(intervalo, 0, RoundingMode.HALF_UP);
            porcentaje = Math.min(pct.intValue(), 999);
        }

        BigDecimal diff = prox.subtract(actual);
        String margen;
        NivelAlertaReporte estado;
        if (diff.compareTo(BigDecimal.ZERO) <= 0 && prox.compareTo(BigDecimal.ZERO) > 0) {
            margen = "Rebasado por " + numero.format(diff.abs()) + " " + unidad;
            estado = NivelAlertaReporte.CRITICO;
        } else {
            margen = "Faltan " + numero.format(diff) + " " + unidad;
            estado = porcentaje >= 85 ? NivelAlertaReporte.PROXIMO : NivelAlertaReporte.AL_DIA;
        }
        return new CalculoCriterio(frecuencia, lectura, proximo, porcentaje, margen, estado);
    }

    /** Espejo de {@code filasFiltradas} en la vista Web. */
    private boolean cumpleFiltros(
            FilaSeguimiento fila, String q, NivelAlertaReporte alerta, TipoCriterioReporte criterio) {
        if (alerta != null && fila.estadoAlerta() != alerta) {
            return false;
        }
        if (criterio != null && fila.tipoCriterio() != mapear(criterio)) {
            return false;
        }
        if (q != null && !q.isBlank()) {
            String busqueda = q.trim().toLowerCase(Locale.ROOT);
            return contiene(fila.activoCodigo(), busqueda)
                    || contiene(fila.activoNombre(), busqueda)
                    || contiene(fila.planCodigo(), busqueda)
                    || contiene(fila.planNombre(), busqueda)
                    || contiene(fila.tipoActivo(), busqueda);
        }
        return true;
    }

    private boolean contiene(String valor, String busqueda) {
        return valor != null && valor.toLowerCase(Locale.ROOT).contains(busqueda);
    }

    private TipoCriterioMantenimiento mapear(TipoCriterioReporte filtro) {
        return switch (filtro) {
            case TIEMPO -> TipoCriterioMantenimiento.TIEMPO;
            case KILOMETRAJE -> TipoCriterioMantenimiento.KILOMETRAJE;
            case HORAS_USO -> TipoCriterioMantenimiento.HORAS_USO;
        };
    }

    private String n(String valor) {
        return valor == null || valor.isBlank() ? "N/D" : valor;
    }

    private String formatearTipoCriterio(TipoCriterioMantenimiento tipo) {
        if (tipo == null) return "Tiempo";
        return switch (tipo) {
            case TIEMPO -> "Tiempo";
            case KILOMETRAJE -> "Odómetro";
            case HORAS_USO -> "Horómetro";
        };
    }

    private String formatearEstadoAlerta(NivelAlertaReporte estado) {
        return switch (estado) {
            case CRITICO -> "🔴 Requiere Servicio";
            case PROXIMO -> "🟡 Atención Próxima";
            case INACTIVO -> "⚪ Pausado";
            case AL_DIA -> "🟢 Al Día";
        };
    }

    private CellStyle estiloAlerta(
            NivelAlertaReporte estado,
            CellStyle styleCritico, CellStyle styleAlerta, CellStyle styleOk, CellStyle textCenter) {
        return switch (estado) {
            case CRITICO -> styleCritico;
            case PROXIMO -> styleAlerta;
            case INACTIVO -> textCenter;
            case AL_DIA -> styleOk;
        };
    }

    private CellStyle crearEstiloTitulo(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 13);
        font.setColor(new XSSFColor(COLOR_HEADER_RGB, null));
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle crearEstiloSubtitulo(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setFontHeightInPoints((short) 10);
        font.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle crearEstiloMeta(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setItalic(true);
        font.setFontHeightInPoints((short) 9);
        font.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle crearEstiloCabecera(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 10);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);

        style.setFillForegroundColor(new XSSFColor(COLOR_HEADER_RGB, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        aplicarBordes(style, BorderStyle.THIN, IndexedColors.GREY_40_PERCENT.getIndex());
        return style;
    }

    private CellStyle crearEstiloTexto(XSSFWorkbook workbook, HorizontalAlignment align, boolean isZebra) {
        CellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setFontHeightInPoints((short) 9);
        style.setFont(font);
        style.setAlignment(align);
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        if (isZebra) {
            style.setFillForegroundColor(new XSSFColor(COLOR_ZEBRA_RGB, null));
            style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        }

        aplicarBordes(style, BorderStyle.THIN, IndexedColors.GREY_25_PERCENT.getIndex());
        return style;
    }

    private CellStyle crearEstiloAlerta(XSSFWorkbook workbook, byte[] bgRgb, byte[] fgRgb) {
        CellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setFontHeightInPoints((short) 9);
        font.setBold(true);
        font.setColor(new XSSFColor(fgRgb, null));
        style.setFont(font);

        style.setFillForegroundColor(new XSSFColor(bgRgb, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        aplicarBordes(style, BorderStyle.THIN, IndexedColors.GREY_25_PERCENT.getIndex());
        return style;
    }

    private void aplicarBordes(CellStyle style, BorderStyle border, short color) {
        style.setBorderTop(border);
        style.setBorderBottom(border);
        style.setBorderLeft(border);
        style.setBorderRight(border);
        style.setTopBorderColor(color);
        style.setBottomBorderColor(color);
        style.setLeftBorderColor(color);
        style.setRightBorderColor(color);
    }
}
