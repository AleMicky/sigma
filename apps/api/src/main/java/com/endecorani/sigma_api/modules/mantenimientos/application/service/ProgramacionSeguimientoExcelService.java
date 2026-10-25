package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response.ProgramacionMantenimientoCriterioResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response.ProgramacionMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
public class ProgramacionSeguimientoExcelService {

    private static final DateTimeFormatter FECHA_HORA_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter FECHA_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private static final byte[] COLOR_HEADER_RGB = new byte[]{(byte) 11, (byte) 79, (byte) 138}; // #0B4F8A ENDE Blue
    private static final byte[] COLOR_ZEBRA_RGB = new byte[]{(byte) 248, (byte) 250, (byte) 252}; // #F8FAFC

    // Colores de alerta
    private static final byte[] COLOR_CRITICO_BG = new byte[]{(byte) 254, (byte) 226, (byte) 226}; // #FEE2E2 Rojo suave
    private static final byte[] COLOR_CRITICO_FG = new byte[]{(byte) 185, (byte) 28, (byte) 28};   // #B91C1C
    private static final byte[] COLOR_ALERTA_BG = new byte[]{(byte) 254, (byte) 243, (byte) 199};  // #FEF3C7 Amarillo suave
    private static final byte[] COLOR_ALERTA_FG = new byte[]{(byte) 180, (byte) 83, (byte) 9};    // #B45309
    private static final byte[] COLOR_OK_BG = new byte[]{(byte) 220, (byte) 252, (byte) 231};      // #DCFCE7 Verde suave
    private static final byte[] COLOR_OK_FG = new byte[]{(byte) 21, (byte) 128, (byte) 61};       // #15803D

    public byte[] generarExcel(List<ProgramacionMantenimientoResponse> programaciones) {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            XSSFSheet sheet = workbook.createSheet("Seguimiento Preventivo");
            sheet.setDisplayGridlines(true);

            // Estilos
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

            // Estilos de badge / alerta
            CellStyle styleCritico = crearEstiloAlerta(workbook, COLOR_CRITICO_BG, COLOR_CRITICO_FG);
            CellStyle styleAlerta = crearEstiloAlerta(workbook, COLOR_ALERTA_BG, COLOR_ALERTA_FG);
            CellStyle styleOk = crearEstiloAlerta(workbook, COLOR_OK_BG, COLOR_OK_FG);

            int rowIndex = 0;

            // Fila 0: Título principal
            Row titleRow = sheet.createRow(rowIndex++);
            titleRow.setHeightInPoints(24);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("ENDE CORANI S.A. - REPORTE DE SEGUIMIENTO DE MANTENIMIENTO PREVENTIVO Y TELEMETRÍA");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 13));

            // Fila 1: Subtítulo
            Row subtitleRow = sheet.createRow(rowIndex++);
            subtitleRow.setHeightInPoints(18);
            Cell subtitleCell = subtitleRow.createCell(0);
            subtitleCell.setCellValue("Sistema Integrado de Gestión SIGMA | Emitido: " + LocalDateTime.now().format(FECHA_HORA_FORMATTER));
            subtitleCell.setCellStyle(subtitleStyle);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 13));

            // Contar alertas preventivas
            long totalProgs = programaciones.size();
            long vigentes = programaciones.stream().filter(p -> Boolean.TRUE.equals(p.activo())).count();
            int contadorCriticos = 0;
            int contadorAlertas = 0;
            int contadorAlDia = 0;

            LocalDate hoy = LocalDate.now();

            for (ProgramacionMantenimientoResponse p : programaciones) {
                if (!Boolean.TRUE.equals(p.activo())) continue;
                String peorEstado = "AL_DIA";
                if (p.criterios() != null) {
                    for (ProgramacionMantenimientoCriterioResponse c : p.criterios()) {
                        if (!Boolean.TRUE.equals(c.activo())) continue;
                        String estado = calcularEstadoCriterio(c, hoy);
                        if ("REQUIERE_SERVICIO".equals(estado)) {
                            peorEstado = "REQUIERE_SERVICIO";
                            break;
                        } else if ("PROXIMO".equals(estado)) {
                            peorEstado = "PROXIMO";
                        }
                    }
                }
                if ("REQUIERE_SERVICIO".equals(peorEstado)) contadorCriticos++;
                else if ("PROXIMO".equals(peorEstado)) contadorAlertas++;
                else contadorAlDia++;
            }

            // Fila 2: Resumen ejecutivo
            Row metaRow = sheet.createRow(rowIndex++);
            metaRow.setHeightInPoints(16);
            Cell metaCell = metaRow.createCell(0);
            metaCell.setCellValue(String.format("Total Programaciones: %d | Vigentes: %d | 🔴 Requieren Servicio: %d | 🟡 Próximos a Vencer: %d | 🟢 Al Día: %d",
                    totalProgs, vigentes, contadorCriticos, contadorAlertas, contadorAlDia));
            metaCell.setCellStyle(metaStyle);
            sheet.addMergedRegion(new CellRangeAddress(2, 2, 0, 13));

            // Fila 3: Espacio
            rowIndex++;

            // Fila 4: Cabeceras
            String[] headers = {
                    "Nº",
                    "Código Activo",
                    "Nombre del Activo",
                    "Tipo de Activo",
                    "Código Plan",
                    "Plan de Mantenimiento",
                    "Criterio",
                    "Frecuencia / Intervalo",
                    "Lectura Actual",
                    "Próximo Umbral",
                    "% Progreso",
                    "Margen Restante",
                    "Estado de Alerta",
                    "Programación"
            };

            Row headerRow = sheet.createRow(rowIndex++);
            headerRow.setHeightInPoints(22);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Filas de datos
            int itemIndex = 1;
            for (ProgramacionMantenimientoResponse prog : programaciones) {
                ProgramacionMantenimientoResponse.PlanActivoInfo info = prog.planActivo();
                String activoCodigo = info != null && info.activoCodigo() != null ? info.activoCodigo() : "N/D";
                String activoNombre = info != null && info.activoNombre() != null ? info.activoNombre() : "N/D";
                String tipoActivo = info != null && info.tipoActivoNombre() != null ? info.tipoActivoNombre() : "N/D";
                String planCodigo = info != null && info.planCodigo() != null ? info.planCodigo() : "N/D";
                String planNombre = info != null && info.planNombre() != null ? info.planNombre() : "N/D";
                boolean progActiva = Boolean.TRUE.equals(prog.activo());

                List<ProgramacionMantenimientoCriterioResponse> criterios = prog.criterios();
                if (criterios == null || criterios.isEmpty()) {
                    Row row = sheet.createRow(rowIndex++);
                    row.setHeightInPoints(18);
                    boolean isZebra = (itemIndex % 2 == 0);
                    CellStyle tLeft = isZebra ? dataZebraLeft : dataTextLeft;
                    CellStyle tCenter = isZebra ? dataZebraCenter : dataTextCenter;

                    row.createCell(0).setCellValue(itemIndex++);
                    row.getCell(0).setCellStyle(tCenter);
                    row.createCell(1).setCellValue(activoCodigo);
                    row.getCell(1).setCellStyle(tCenter);
                    row.createCell(2).setCellValue(activoNombre);
                    row.getCell(2).setCellStyle(tLeft);
                    row.createCell(3).setCellValue(tipoActivo);
                    row.getCell(3).setCellStyle(tLeft);
                    row.createCell(4).setCellValue(planCodigo);
                    row.getCell(4).setCellStyle(tCenter);
                    row.createCell(5).setCellValue(planNombre);
                    row.getCell(5).setCellStyle(tLeft);
                    row.createCell(6).setCellValue("Sin Criterios");
                    row.getCell(6).setCellStyle(tCenter);
                    row.createCell(7).setCellValue("-");
                    row.getCell(7).setCellStyle(tCenter);
                    row.createCell(8).setCellValue("-");
                    row.getCell(8).setCellStyle(tCenter);
                    row.createCell(9).setCellValue("-");
                    row.getCell(9).setCellStyle(tCenter);
                    row.createCell(10).setCellValue("-");
                    row.getCell(10).setCellStyle(tCenter);
                    row.createCell(11).setCellValue("-");
                    row.getCell(11).setCellStyle(tCenter);
                    row.createCell(12).setCellValue("SIN CRITERIOS");
                    row.getCell(12).setCellStyle(tCenter);
                    row.createCell(13).setCellValue(progActiva ? "ACTIVA" : "INACTIVA");
                    row.getCell(13).setCellStyle(tCenter);
                    continue;
                }

                for (ProgramacionMantenimientoCriterioResponse criterio : criterios) {
                    Row row = sheet.createRow(rowIndex++);
                    row.setHeightInPoints(18);
                    boolean isZebra = (itemIndex % 2 == 0);

                    CellStyle textLeft = isZebra ? dataZebraLeft : dataTextLeft;
                    CellStyle textCenter = isZebra ? dataZebraCenter : dataTextCenter;
                    CellStyle textRight = isZebra ? dataZebraRight : dataTextRight;

                    // Nº
                    Cell c0 = row.createCell(0);
                    c0.setCellValue(itemIndex++);
                    c0.setCellStyle(textCenter);

                    // Código Activo
                    Cell c1 = row.createCell(1);
                    c1.setCellValue(activoCodigo);
                    c1.setCellStyle(textCenter);

                    // Nombre Activo
                    Cell c2 = row.createCell(2);
                    c2.setCellValue(activoNombre);
                    c2.setCellStyle(textLeft);

                    // Tipo Activo
                    Cell c3 = row.createCell(3);
                    c3.setCellValue(tipoActivo);
                    c3.setCellStyle(textLeft);

                    // Plan Código
                    Cell c4 = row.createCell(4);
                    c4.setCellValue(planCodigo);
                    c4.setCellStyle(textCenter);

                    // Plan Nombre
                    Cell c5 = row.createCell(5);
                    c5.setCellValue(planNombre);
                    c5.setCellStyle(textLeft);

                    // Criterio
                    Cell c6 = row.createCell(6);
                    TipoCriterioMantenimiento tipo = criterio.tipoCriterio();
                    c6.setCellValue(formatearTipoCriterio(tipo));
                    c6.setCellStyle(textCenter);

                    String frecuenciaStr = "-";
                    String actualStr = "-";
                    String proximoStr = "-";
                    String progresoStr = "0%";
                    String margenStr = "-";
                    String estadoAlerta;

                    if (!progActiva || !Boolean.TRUE.equals(criterio.activo())) {
                        estadoAlerta = "INACTIVO";
                    } else {
                        estadoAlerta = calcularEstadoCriterio(criterio, hoy);
                    }

                    if (tipo == TipoCriterioMantenimiento.TIEMPO) {
                        int dias = criterio.intervaloDias() != null ? criterio.intervaloDias() : 0;
                        frecuenciaStr = "Cada " + dias + " días";
                        actualStr = hoy.format(FECHA_FORMATTER);
                        proximoStr = criterio.proximaFecha() != null ? criterio.proximaFecha().format(FECHA_FORMATTER) : "-";

                        if (criterio.proximaFecha() != null && dias > 0) {
                            LocalDate fechaBase = criterio.proximaFecha().minusDays(dias);
                            long diasTranscurridos = ChronoUnit.DAYS.between(fechaBase, hoy);
                            long diasRestantes = ChronoUnit.DAYS.between(hoy, criterio.proximaFecha());

                            double pct = Math.min(Math.max(((double) diasTranscurridos / dias) * 100.0, 0.0), 999.0);
                            progresoStr = String.format("%.0f%%", pct);

                            if (diasRestantes < 0) {
                                margenStr = String.format("Vencido hace %d d", Math.abs(diasRestantes));
                            } else {
                                margenStr = String.format("Faltan %d d", diasRestantes);
                            }
                        }
                    } else {
                        String unidad = tipo == TipoCriterioMantenimiento.KILOMETRAJE ? " km" : " hrs";
                        BigDecimal intervalo = criterio.intervaloUso() != null ? criterio.intervaloUso() : BigDecimal.ZERO;
                        BigDecimal prox = criterio.proximoValorUso() != null ? criterio.proximoValorUso() : BigDecimal.ZERO;
                        BigDecimal actual = criterio.valorActualUso() != null ? criterio.valorActualUso() : BigDecimal.ZERO;
                        BigDecimal base = prox.subtract(intervalo);

                        frecuenciaStr = "Cada " + intervalo.stripTrailingZeros().toPlainString() + unidad;
                        actualStr = actual.stripTrailingZeros().toPlainString() + unidad;
                        proximoStr = prox.stripTrailingZeros().toPlainString() + unidad;

                        if (intervalo.compareTo(BigDecimal.ZERO) > 0) {
                            BigDecimal avance = actual.subtract(base).max(BigDecimal.ZERO);
                            BigDecimal pct = avance.multiply(BigDecimal.valueOf(100)).divide(intervalo, 0, RoundingMode.HALF_UP);
                            progresoStr = pct + "%";
                        }

                        BigDecimal diff = prox.subtract(actual);
                        if (diff.compareTo(BigDecimal.ZERO) <= 0) {
                            margenStr = String.format("Rebasado por %s%s", diff.abs().stripTrailingZeros().toPlainString(), unidad);
                        } else {
                            margenStr = String.format("Faltan %s%s", diff.stripTrailingZeros().toPlainString(), unidad);
                        }
                    }

                    Cell c7 = row.createCell(7);
                    c7.setCellValue(frecuenciaStr);
                    c7.setCellStyle(textCenter);

                    Cell c8 = row.createCell(8);
                    c8.setCellValue(actualStr);
                    c8.setCellStyle(textCenter);

                    Cell c9 = row.createCell(9);
                    c9.setCellValue(proximoStr);
                    c9.setCellStyle(textCenter);

                    Cell c10 = row.createCell(10);
                    c10.setCellValue(progresoStr);
                    c10.setCellStyle(textRight);

                    Cell c11 = row.createCell(11);
                    c11.setCellValue(margenStr);
                    c11.setCellStyle(textLeft);

                    Cell c12 = row.createCell(12);
                    c12.setCellValue(formatearEstadoAlerta(estadoAlerta));
                    if ("REQUIERE_SERVICIO".equals(estadoAlerta)) {
                        c12.setCellStyle(styleCritico);
                    } else if ("PROXIMO".equals(estadoAlerta)) {
                        c12.setCellStyle(styleAlerta);
                    } else if ("INACTIVO".equals(estadoAlerta)) {
                        c12.setCellStyle(textCenter);
                    } else {
                        c12.setCellStyle(styleOk);
                    }

                    Cell c13 = row.createCell(13);
                    c13.setCellValue(progActiva ? "ACTIVA" : "INACTIVA");
                    c13.setCellStyle(textCenter);
                }
            }

            // Autoajustar ancho de columnas clave
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

    private String calcularEstadoCriterio(ProgramacionMantenimientoCriterioResponse c, LocalDate hoy) {
        if (c.tipoCriterio() == TipoCriterioMantenimiento.TIEMPO) {
            if (c.proximaFecha() == null) return "AL_DIA";
            if (!c.proximaFecha().isAfter(hoy)) return "REQUIERE_SERVICIO";
            long diasRestantes = ChronoUnit.DAYS.between(hoy, c.proximaFecha());
            if (diasRestantes <= 15) return "PROXIMO";
            return "AL_DIA";
        } else {
            BigDecimal prox = c.proximoValorUso() != null ? c.proximoValorUso() : BigDecimal.ZERO;
            BigDecimal actual = c.valorActualUso() != null ? c.valorActualUso() : BigDecimal.ZERO;
            BigDecimal intervalo = c.intervaloUso() != null ? c.intervaloUso() : BigDecimal.ZERO;
            BigDecimal base = prox.subtract(intervalo);

            if (actual.compareTo(prox) >= 0 && prox.compareTo(BigDecimal.ZERO) > 0) {
                return "REQUIERE_SERVICIO";
            }

            if (intervalo.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal avance = actual.subtract(base).max(BigDecimal.ZERO);
                double pct = avance.doubleValue() / intervalo.doubleValue();
                if (pct >= 0.85) return "PROXIMO";
            }

            return "AL_DIA";
        }
    }

    private String formatearTipoCriterio(TipoCriterioMantenimiento tipo) {
        if (tipo == null) return "N/D";
        return switch (tipo) {
            case TIEMPO -> "Tiempo (Días)";
            case KILOMETRAJE -> "Odómetro (Km)";
            case HORAS_USO -> "Horómetro (Hrs)";
        };
    }

    private String formatearEstadoAlerta(String estado) {
        if ("REQUIERE_SERVICIO".equals(estado)) return "🔴 REQUIERE SERVICIO";
        if ("PROXIMO".equals(estado)) return "🟡 PRÓXIMO A VENCER";
        if ("INACTIVO".equals(estado)) return "⚪ INACTIVO";
        return "🟢 AL DÍA";
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
        aplicarBordes(style, BorderStyle.THIN, IndexedColors.GREY_40_PERCENT.getIndex());
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
