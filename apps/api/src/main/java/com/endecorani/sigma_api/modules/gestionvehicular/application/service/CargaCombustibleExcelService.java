package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.cargacombustible.response.CargaCombustibleResponse;
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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
public class CargaCombustibleExcelService {

    private static final DateTimeFormatter FECHA_HORA_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter FECHA_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private static final byte[] COLOR_HEADER_RGB = new byte[]{(byte) 11, (byte) 79, (byte) 138}; // #0B4F8A ENDE Blue
    private static final byte[] COLOR_ZEBRA_RGB = new byte[]{(byte) 248, (byte) 250, (byte) 252}; // #F8FAFC
    private static final byte[] COLOR_TOTAL_RGB = new byte[]{(byte) 226, (byte) 232, (byte) 240}; // #E2E8F0

    public byte[] generarExcel(List<CargaCombustibleResponse> cargas, LocalDateTime fechaDesde, LocalDateTime fechaHasta) {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            XSSFSheet sheet = workbook.createSheet("Consumo de Combustible");
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
            short decimalFormat = dataFormat.getFormat("#,##0.00");
            dataTextRight.setDataFormat(decimalFormat);
            dataZebraRight.setDataFormat(decimalFormat);
            totalNumberStyle.setDataFormat(decimalFormat);

            int rowIndex = 0;

            // Fila 0: Título principal
            Row titleRow = sheet.createRow(rowIndex++);
            titleRow.setHeightInPoints(24);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("ENDE CORANI S.A. - REPORTE DE CONSUMO Y CARGAS DE COMBUSTIBLE");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 10));

            // Fila 1: Subtítulo
            Row subtitleRow = sheet.createRow(rowIndex++);
            subtitleRow.setHeightInPoints(18);
            Cell subtitleCell = subtitleRow.createCell(0);
            subtitleCell.setCellValue("Sistema Integrado de Gestión SIGMA | Generado: " + LocalDateTime.now().format(FECHA_HORA_FORMATTER));
            subtitleCell.setCellStyle(subtitleStyle);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 10));

            // Fila 2: Filtros aplicados
            Row metaRow = sheet.createRow(rowIndex++);
            metaRow.setHeightInPoints(16);
            Cell metaCell = metaRow.createCell(0);
            String rangoFechas = (fechaDesde != null ? fechaDesde.format(FECHA_FORMATTER) : "Inicio") +
                    " al " + (fechaHasta != null ? fechaHasta.format(FECHA_FORMATTER) : "Hoy");
            metaCell.setCellValue("Periodo de consulta: " + rangoFechas + " | Total registros encontrados: " + cargas.size());
            metaCell.setCellStyle(metaStyle);
            sheet.addMergedRegion(new CellRangeAddress(2, 2, 0, 10));

            // Fila 3: Espaciador
            rowIndex++;

            // Fila 4: Cabeceras de tabla
            String[] headers = {
                    "Nº",
                    "Fecha y Hora",
                    "Nº Factura / Vale",
                    "Vehículo / Activo",
                    "Código Activo",
                    "Combustible / Insumo",
                    "Volumen (Litros)",
                    "Precio/Litro (Bs.)",
                    "Importe Total (Bs.)",
                    "Empleado Responsable",
                    "Viaje Asociado"
            };

            Row headerRow = sheet.createRow(rowIndex++);
            headerRow.setHeightInPoints(26);
            for (int col = 0; col < headers.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(headers[col]);
                cell.setCellStyle(headerStyle);
            }

            // Datos
            BigDecimal totalLitros = BigDecimal.ZERO;
            BigDecimal totalImporte = BigDecimal.ZERO;
            int contador = 1;

            for (CargaCombustibleResponse carga : cargas) {
                Row row = sheet.createRow(rowIndex++);
                row.setHeightInPoints(20);
                boolean zebra = (contador % 2 == 0);

                CellStyle cellLeft = zebra ? dataZebraLeft : dataTextLeft;
                CellStyle cellCenter = zebra ? dataZebraCenter : dataTextCenter;
                CellStyle cellRight = zebra ? dataZebraRight : dataTextRight;

                // Col 0: Nº
                Cell c0 = row.createCell(0);
                c0.setCellValue(contador++);
                c0.setCellStyle(cellCenter);

                // Col 1: Fecha y Hora
                Cell c1 = row.createCell(1);
                c1.setCellValue(carga.fechaCarga() != null ? carga.fechaCarga().format(FECHA_HORA_FORMATTER) : "-");
                c1.setCellStyle(cellCenter);

                // Col 2: Factura
                Cell c2 = row.createCell(2);
                c2.setCellValue(carga.numeroFactura() != null && !carga.numeroFactura().isBlank() ? carga.numeroFactura() : "S/F");
                c2.setCellStyle(cellCenter);

                // Col 3: Vehículo (nombre)
                Cell c3 = row.createCell(3);
                String vehiculo = (carga.activo() != null && carga.activo().nombre() != null)
                        ? carga.activo().nombre() : "N/D";
                c3.setCellValue(vehiculo);
                c3.setCellStyle(cellLeft);

                // Col 4: Código Activo
                Cell c4 = row.createCell(4);
                String codActivo = (carga.activo() != null && carga.activo().codigo() != null)
                        ? carga.activo().codigo() : "N/D";
                c4.setCellValue(codActivo);
                c4.setCellStyle(cellCenter);

                // Col 5: Combustible / Insumo
                Cell c5 = row.createCell(5);
                String insumo = (carga.insumo() != null && carga.insumo().nombre() != null)
                        ? carga.insumo().nombre() : "Combustible";
                c5.setCellValue(insumo);
                c5.setCellStyle(cellLeft);

                // Col 6: Litros
                Cell c6 = row.createCell(6);
                if (carga.litros() != null) {
                    c6.setCellValue(carga.litros().doubleValue());
                    totalLitros = totalLitros.add(carga.litros());
                } else {
                    c6.setCellValue(0.0);
                }
                c6.setCellStyle(cellRight);

                // Col 7: Precio por Litro
                Cell c7 = row.createCell(7);
                if (carga.precioPorLitro() != null) {
                    c7.setCellValue(carga.precioPorLitro().doubleValue());
                } else {
                    c7.setCellValue(0.0);
                }
                c7.setCellStyle(cellRight);

                // Col 8: Precio Total (Importe)
                Cell c8 = row.createCell(8);
                if (carga.precioTotal() != null) {
                    c8.setCellValue(carga.precioTotal().doubleValue());
                    totalImporte = totalImporte.add(carga.precioTotal());
                } else {
                    c8.setCellValue(0.0);
                }
                c8.setCellStyle(cellRight);

                // Col 9: Empleado
                Cell c9 = row.createCell(9);
                String emp = (carga.empleado() != null && carga.empleado().nombreCompleto() != null)
                        ? carga.empleado().nombreCompleto() : "N/D";
                c9.setCellValue(emp);
                c9.setCellStyle(cellLeft);

                // Col 10: Viaje Asociado
                Cell c10 = row.createCell(10);
                String viaje = (carga.viajeVehicularId() != null)
                        ? "Viaje ID: " + carga.viajeVehicularId().toString().substring(0, 8) + "..."
                        : "Carga Directa";
                c10.setCellValue(viaje);
                c10.setCellStyle(cellCenter);
            }

            // Fila de Totales
            Row totalRow = sheet.createRow(rowIndex);
            totalRow.setHeightInPoints(22);

            Cell totalLabelCell = totalRow.createCell(0);
            totalLabelCell.setCellValue("TOTAL GENERAL (" + cargas.size() + " CARGAS REGISTRADAS)");
            totalLabelCell.setCellStyle(totalLabelStyle);

            for (int c = 1; c < 6; c++) {
                Cell emptyCell = totalRow.createCell(c);
                emptyCell.setCellStyle(totalLabelStyle);
            }
            sheet.addMergedRegion(new CellRangeAddress(rowIndex, rowIndex, 0, 5));

            // Litros totales
            Cell totalLitrosCell = totalRow.createCell(6);
            totalLitrosCell.setCellValue(totalLitros.doubleValue());
            totalLitrosCell.setCellStyle(totalNumberStyle);

            // Promedio precio litro
            Cell avgPrecioCell = totalRow.createCell(7);
            if (totalLitros.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal avg = totalImporte.divide(totalLitros, 2, RoundingMode.HALF_UP);
                avgPrecioCell.setCellValue(avg.doubleValue());
            } else {
                avgPrecioCell.setCellValue(0.0);
            }
            avgPrecioCell.setCellStyle(totalNumberStyle);

            // Importe Total
            Cell totalImporteCell = totalRow.createCell(8);
            totalImporteCell.setCellValue(totalImporte.doubleValue());
            totalImporteCell.setCellStyle(totalNumberStyle);

            // Celdas restantes de total
            Cell t9 = totalRow.createCell(9);
            t9.setCellStyle(totalLabelStyle);
            Cell t10 = totalRow.createCell(10);
            t10.setCellStyle(totalLabelStyle);

            // Ajustar anchos de columnas
            for (int col = 0; col < headers.length; col++) {
                sheet.autoSizeColumn(col);
                int currentWidth = sheet.getColumnWidth(col);
                int safeWidth = Math.max(256 * 10, Math.min(256 * 40, currentWidth + 1200));
                sheet.setColumnWidth(col, safeWidth);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            log.error("Error al generar reporte Excel de consumo de combustible", e);
            throw new BusinessException("Error al generar el archivo Excel de combustible: " + e.getMessage());
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
