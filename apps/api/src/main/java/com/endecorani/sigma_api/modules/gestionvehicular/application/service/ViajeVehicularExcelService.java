package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.asignacionvehicular.response.AsignacionVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.viajevehicular.response.ViajeVehicularResponse;
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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
public class ViajeVehicularExcelService {

    private static final DateTimeFormatter FECHA_HORA_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter FECHA_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private static final byte[] COLOR_HEADER_RGB = new byte[]{(byte) 11, (byte) 79, (byte) 138}; // #0B4F8A ENDE Blue
    private static final byte[] COLOR_ZEBRA_RGB = new byte[]{(byte) 248, (byte) 250, (byte) 252}; // #F8FAFC
    private static final byte[] COLOR_TOTAL_RGB = new byte[]{(byte) 226, (byte) 232, (byte) 240}; // #E2E8F0

    public byte[] generarExcel(List<ViajeVehicularResponse> viajes, LocalDateTime fechaDesde, LocalDateTime fechaHasta) {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            XSSFSheet sheet = workbook.createSheet("Historial de Viajes");
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
            CellStyle totalLabelStyle = crearEstiloTotal(workbook, HorizontalAlignment.LEFT);
            CellStyle totalNumberStyle = crearEstiloTotal(workbook, HorizontalAlignment.RIGHT);

            DataFormat dataFormat = workbook.createDataFormat();
            short numberFormat = dataFormat.getFormat("#,##0");

            int rowIndex = 0;

            // Fila 0: Título principal
            Row titleRow = sheet.createRow(rowIndex++);
            titleRow.setHeightInPoints(24);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("ENDE CORANI S.A. - REPORTE DE HISTORIAL DE VIAJES VEHICULARES");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 13));

            // Fila 1: Subtítulo
            Row subtitleRow = sheet.createRow(rowIndex++);
            subtitleRow.setHeightInPoints(18);
            Cell subtitleCell = subtitleRow.createCell(0);
            subtitleCell.setCellValue("Sistema Integrado de Gestión SIGMA | Generado: " + LocalDateTime.now().format(FECHA_HORA_FORMATTER));
            subtitleCell.setCellStyle(subtitleStyle);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 13));

            // Fila 2: Filtros aplicados
            Row metaRow = sheet.createRow(rowIndex++);
            metaRow.setHeightInPoints(16);
            Cell metaCell = metaRow.createCell(0);
            String rangoFechas = (fechaDesde != null ? fechaDesde.format(FECHA_FORMATTER) : "Inicio") +
                    " al " + (fechaHasta != null ? fechaHasta.format(FECHA_FORMATTER) : "Hoy");
            metaCell.setCellValue("Periodo de consulta: " + rangoFechas + " | Total registros encontrados: " + viajes.size());
            metaCell.setCellStyle(metaStyle);
            sheet.addMergedRegion(new CellRangeAddress(2, 2, 0, 13));

            // Fila 3: Espaciador
            rowIndex++;

            // Fila 4: Cabeceras de tabla
            String[] headers = {
                    "Nº",
                    "Nº Solicitud",
                    "Estado Viaje",
                    "Placa / Vehículo",
                    "Código Activo",
                    "Conductor",
                    "Solicitante",
                    "Destino",
                    "Motivo",
                    "Salida Real",
                    "Retorno Real",
                    "Km Salida",
                    "Km Retorno",
                    "Km Recorrido"
            };

            Row headerRow = sheet.createRow(rowIndex++);
            headerRow.setHeightInPoints(26);
            for (int col = 0; col < headers.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(headers[col]);
                cell.setCellStyle(headerStyle);
            }

            // Datos
            long totalKmRecorrido = 0;
            int contador = 1;

            for (ViajeVehicularResponse viaje : viajes) {
                Row row = sheet.createRow(rowIndex++);
                row.setHeightInPoints(20);
                boolean zebra = (contador % 2 == 0);

                CellStyle cellLeft = zebra ? dataZebraLeft : dataTextLeft;
                CellStyle cellCenter = zebra ? dataZebraCenter : dataTextCenter;
                CellStyle cellRight = zebra ? dataZebraRight : dataTextRight;

                AsignacionVehicularResponse asig = viaje.asignacionVehicular();

                // Col 0: Nº
                Cell c0 = row.createCell(0);
                c0.setCellValue(contador++);
                c0.setCellStyle(cellCenter);

                // Col 1: Nº Solicitud
                Cell c1 = row.createCell(1);
                String numSol = (asig != null && asig.solicitudVehicular() != null && asig.solicitudVehicular().numero() != null)
                        ? asig.solicitudVehicular().numero() : "S/N";
                c1.setCellValue(numSol);
                c1.setCellStyle(cellCenter);

                // Col 2: Estado
                Cell c2 = row.createCell(2);
                c2.setCellValue(viaje.estado() != null ? viaje.estado().name() : "N/D");
                c2.setCellStyle(cellCenter);

                // Col 3: Placa / Vehículo
                Cell c3 = row.createCell(3);
                String placa = (asig != null && asig.activo() != null && asig.activo().placa() != null)
                        ? asig.activo().placa()
                        : (asig != null && asig.activo() != null && asig.activo().nombre() != null ? asig.activo().nombre() : "N/D");
                c3.setCellValue(placa);
                c3.setCellStyle(cellCenter);

                // Col 4: Código Activo
                Cell c4 = row.createCell(4);
                String codActivo = (asig != null && asig.activo() != null && asig.activo().codigo() != null)
                        ? asig.activo().codigo() : "N/D";
                c4.setCellValue(codActivo);
                c4.setCellStyle(cellCenter);

                // Col 5: Conductor
                Cell c5 = row.createCell(5);
                String conductor = (asig != null && asig.conductor() != null && asig.conductor().nombreCompleto() != null)
                        ? asig.conductor().nombreCompleto() : "N/D";
                c5.setCellValue(conductor);
                c5.setCellStyle(cellLeft);

                // Col 6: Solicitante
                Cell c6 = row.createCell(6);
                String solicitante = (asig != null && asig.asignadoPor() != null && asig.asignadoPor().nombreCompleto() != null)
                        ? asig.asignadoPor().nombreCompleto() : "N/D";
                c6.setCellValue(solicitante);
                c6.setCellStyle(cellLeft);

                // Col 7: Destino
                Cell c7 = row.createCell(7);
                String destino = (asig != null && asig.solicitudVehicular() != null && asig.solicitudVehicular().destino() != null)
                        ? asig.solicitudVehicular().destino() : "-";
                c7.setCellValue(destino);
                c7.setCellStyle(cellLeft);

                // Col 8: Motivo
                Cell c8 = row.createCell(8);
                String motivo = (asig != null && asig.solicitudVehicular() != null && asig.solicitudVehicular().motivo() != null)
                        ? asig.solicitudVehicular().motivo() : "-";
                c8.setCellValue(motivo);
                c8.setCellStyle(cellLeft);

                // Col 9: Salida Real
                Cell c9 = row.createCell(9);
                c9.setCellValue(viaje.fechaSalidaReal() != null ? viaje.fechaSalidaReal().format(FECHA_HORA_FORMATTER) : "-");
                c9.setCellStyle(cellCenter);

                // Col 10: Retorno Real
                Cell c10 = row.createCell(10);
                c10.setCellValue(viaje.fechaRetornoReal() != null ? viaje.fechaRetornoReal().format(FECHA_HORA_FORMATTER) : "-");
                c10.setCellStyle(cellCenter);

                // Col 11: Km Salida
                Cell c11 = row.createCell(11);
                if (viaje.kilometrajeSalida() != null) {
                    c11.setCellValue(viaje.kilometrajeSalida());
                } else {
                    c11.setCellValue("-");
                }
                c11.setCellStyle(cellRight);

                // Col 12: Km Retorno
                Cell c12 = row.createCell(12);
                if (viaje.kilometrajeRetorno() != null) {
                    c12.setCellValue(viaje.kilometrajeRetorno());
                } else {
                    c12.setCellValue("-");
                }
                c12.setCellStyle(cellRight);

                // Col 13: Km Recorrido
                Cell c13 = row.createCell(13);
                if (viaje.kilometrajeRetorno() != null && viaje.kilometrajeSalida() != null
                        && viaje.kilometrajeRetorno() >= viaje.kilometrajeSalida()) {
                    long diff = viaje.kilometrajeRetorno() - viaje.kilometrajeSalida();
                    c13.setCellValue(diff);
                    totalKmRecorrido += diff;
                } else {
                    c13.setCellValue("-");
                }
                c13.setCellStyle(cellRight);
            }

            // Fila de Totales
            Row totalRow = sheet.createRow(rowIndex);
            totalRow.setHeightInPoints(22);

            Cell totalLabelCell = totalRow.createCell(0);
            totalLabelCell.setCellValue("TOTAL GENERAL (" + viajes.size() + " VIAJES REGISTRADOS)");
            totalLabelCell.setCellStyle(totalLabelStyle);

            for (int c = 1; c < 13; c++) {
                Cell emptyCell = totalRow.createCell(c);
                emptyCell.setCellStyle(totalLabelStyle);
            }
            sheet.addMergedRegion(new CellRangeAddress(rowIndex, rowIndex, 0, 12));

            Cell totalKmCell = totalRow.createCell(13);
            totalKmCell.setCellValue(totalKmRecorrido);
            totalKmCell.setCellStyle(totalNumberStyle);

            // Ajustar automáticamente anchos de columnas con límites seguros
            for (int col = 0; col < headers.length; col++) {
                sheet.autoSizeColumn(col);
                int currentWidth = sheet.getColumnWidth(col);
                int safeWidth = Math.max(256 * 10, Math.min(256 * 40, currentWidth + 1200));
                sheet.setColumnWidth(col, safeWidth);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            log.error("Error al generar reporte Excel de historial de viajes", e);
            throw new BusinessException("Error al generar el archivo Excel de historial de viajes: " + e.getMessage());
        }
    }

    private CellStyle crearEstiloTitulo(XSSFWorkbook wb) {
        CellStyle style = wb.createCellStyle();
        XSSFFont font = wb.createFont();
        font.setFontName("Calibri");
        font.setFontHeightInPoints((short) 14);
        font.setBold(true);
        font.setColor(new XSSFColor(COLOR_HEADER_RGB, null));
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle crearEstiloSubtitulo(XSSFWorkbook wb) {
        CellStyle style = wb.createCellStyle();
        XSSFFont font = wb.createFont();
        font.setFontName("Calibri");
        font.setFontHeightInPoints((short) 10);
        font.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle crearEstiloMeta(XSSFWorkbook wb) {
        CellStyle style = wb.createCellStyle();
        XSSFFont font = wb.createFont();
        font.setFontName("Calibri");
        font.setFontHeightInPoints((short) 9);
        font.setItalic(true);
        font.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle crearEstiloCabecera(XSSFWorkbook wb) {
        CellStyle style = wb.createCellStyle();
        XSSFFont font = wb.createFont();
        font.setFontName("Calibri");
        font.setFontHeightInPoints((short) 10);
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);

        style.setFillForegroundColor(new XSSFColor(COLOR_HEADER_RGB, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorders(style, BorderStyle.THIN, IndexedColors.GREY_40_PERCENT.getIndex());
        return style;
    }

    private CellStyle crearEstiloTexto(XSSFWorkbook wb, HorizontalAlignment align, boolean zebra) {
        CellStyle style = wb.createCellStyle();
        XSSFFont font = wb.createFont();
        font.setFontName("Calibri");
        font.setFontHeightInPoints((short) 9);
        style.setFont(font);

        if (zebra) {
            style.setFillForegroundColor(new XSSFColor(COLOR_ZEBRA_RGB, null));
            style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        }

        style.setAlignment(align);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorders(style, BorderStyle.THIN, IndexedColors.GREY_25_PERCENT.getIndex());
        return style;
    }

    private CellStyle crearEstiloTotal(XSSFWorkbook wb, HorizontalAlignment align) {
        CellStyle style = wb.createCellStyle();
        XSSFFont font = wb.createFont();
        font.setFontName("Calibri");
        font.setFontHeightInPoints((short) 10);
        font.setBold(true);
        style.setFont(font);

        style.setFillForegroundColor(new XSSFColor(COLOR_TOTAL_RGB, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        style.setAlignment(align);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderTop(BorderStyle.DOUBLE);
        style.setBorderBottom(BorderStyle.MEDIUM);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private void setBorders(CellStyle style, BorderStyle border, short color) {
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
