package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoResponse;
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
import java.util.Map;

@Slf4j
@Service
public class DisponibilidadActivoExcelService {

    private static final DateTimeFormatter FECHA_HORA_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter FECHA_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private static final byte[] COLOR_HEADER_RGB = new byte[]{(byte) 11, (byte) 79, (byte) 138}; // #0B4F8A ENDE Blue
    private static final byte[] COLOR_ZEBRA_RGB = new byte[]{(byte) 248, (byte) 250, (byte) 252}; // #F8FAFC
    private static final byte[] COLOR_TOTAL_RGB = new byte[]{(byte) 226, (byte) 232, (byte) 240}; // #E2E8F0

    public byte[] generarExcel(
            List<ActivoResponse> activos,
            Map<java.util.UUID, String> categoriaMap
    ) {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            XSSFSheet sheet = workbook.createSheet("Disponibilidad de Activos");
            sheet.setDisplayGridlines(true);

            // Estilos
            CellStyle titleStyle = crearEstiloTitulo(workbook);
            CellStyle subtitleStyle = crearEstiloSubtitulo(workbook);
            CellStyle metaStyle = crearEstiloMeta(workbook);
            CellStyle headerStyle = crearEstiloCabecera(workbook);

            CellStyle dataTextLeft = crearEstiloTexto(workbook, HorizontalAlignment.LEFT, false);
            CellStyle dataTextCenter = crearEstiloTexto(workbook, HorizontalAlignment.CENTER, false);
            CellStyle dataZebraLeft = crearEstiloTexto(workbook, HorizontalAlignment.LEFT, true);
            CellStyle dataZebraCenter = crearEstiloTexto(workbook, HorizontalAlignment.CENTER, true);

            CellStyle summaryLabelStyle = crearEstiloResumen(workbook, HorizontalAlignment.LEFT, true);
            CellStyle summaryValueStyle = crearEstiloResumen(workbook, HorizontalAlignment.CENTER, false);

            int rowIndex = 0;

            // Fila 0: Título principal
            Row titleRow = sheet.createRow(rowIndex++);
            titleRow.setHeightInPoints(24);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("ENDE CORANI S.A. - REPORTE DE DISPONIBILIDAD Y ESTADOS OPERATIVOS DE ACTIVOS");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 9));

            // Fila 1: Subtítulo
            Row subtitleRow = sheet.createRow(rowIndex++);
            subtitleRow.setHeightInPoints(18);
            Cell subtitleCell = subtitleRow.createCell(0);
            subtitleCell.setCellValue("Sistema Integrado de Gestión SIGMA | Generado: " + LocalDateTime.now().format(FECHA_HORA_FORMATTER));
            subtitleCell.setCellStyle(subtitleStyle);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 9));

            // Fila 2: Resumen ejecutivo
            long total = activos.size();
            long operativos = activos.stream().filter(a -> a.estadoOperativo() != null && "OPERATIVO".equalsIgnoreCase(a.estadoOperativo().codigo())).count();
            long mantenimiento = activos.stream().filter(a -> a.estadoOperativo() != null && "MANTENIMIENTO".equalsIgnoreCase(a.estadoOperativo().codigo())).count();
            long fueraServicio = activos.stream().filter(a -> a.estadoOperativo() != null && "FUERA_SERVICIO".equalsIgnoreCase(a.estadoOperativo().codigo())).count();
            long reserva = activos.stream().filter(a -> a.estadoOperativo() != null && "RESERVA".equalsIgnoreCase(a.estadoOperativo().codigo())).count();
            long enViaje = activos.stream().filter(a -> a.estadoOperativo() != null && "EN_VIAJE".equalsIgnoreCase(a.estadoOperativo().codigo())).count();
            long deBaja = activos.stream().filter(a -> a.estadoOperativo() != null && "DE_BAJA".equalsIgnoreCase(a.estadoOperativo().codigo())).count();
            double tasaDisponibilidad = total > 0 ? ((double) (operativos + reserva + enViaje) / total) * 100.0 : 0.0;

            Row metaRow = sheet.createRow(rowIndex++);
            metaRow.setHeightInPoints(16);
            Cell metaCell = metaRow.createCell(0);
            metaCell.setCellValue(String.format("Total Activos: %d | Disponibles: %d (%.1f%%) | En Mantenimiento: %d | Fuera de Servicio: %d | De Baja: %d",
                    total, (operativos + reserva + enViaje), tasaDisponibilidad, mantenimiento, fueraServicio, deBaja));
            metaCell.setCellStyle(metaStyle);
            sheet.addMergedRegion(new CellRangeAddress(2, 2, 0, 9));

            // Fila 3: Espacio
            rowIndex++;

            // Fila 4: Cabeceras
            String[] headers = {
                    "Nº",
                    "Código Activo",
                    "Nombre del Activo",
                    "Tipo de Activo",
                    "Categoría",
                    "Ubicación",
                    "Estado Operativo",
                    "Fecha Adquisición",
                    "Estado Registro",
                    "Descripción"
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
            for (ActivoResponse activo : activos) {
                Row row = sheet.createRow(rowIndex++);
                row.setHeightInPoints(18);
                boolean isZebra = (itemIndex % 2 == 0);

                CellStyle textLeft = isZebra ? dataZebraLeft : dataTextLeft;
                CellStyle textCenter = isZebra ? dataZebraCenter : dataTextCenter;

                // 0: Nº
                Cell c0 = row.createCell(0);
                c0.setCellValue(itemIndex++);
                c0.setCellStyle(textCenter);

                // 1: Código
                Cell c1 = row.createCell(1);
                c1.setCellValue(activo.codigo() != null ? activo.codigo() : "");
                c1.setCellStyle(textCenter);

                // 2: Nombre
                Cell c2 = row.createCell(2);
                c2.setCellValue(activo.nombre() != null ? activo.nombre() : "");
                c2.setCellStyle(textLeft);

                // 3: Tipo
                Cell c3 = row.createCell(3);
                c3.setCellValue(activo.tipoActivo() != null && activo.tipoActivo().nombre() != null ? activo.tipoActivo().nombre() : "");
                c3.setCellStyle(textLeft);

                // 4: Categoría
                Cell c4 = row.createCell(4);
                String catNombre = "";
                if (activo.tipoActivo() != null && activo.tipoActivo().categoriaId() != null && categoriaMap != null) {
                    catNombre = categoriaMap.getOrDefault(activo.tipoActivo().categoriaId(), "");
                }
                c4.setCellValue(catNombre);
                c4.setCellStyle(textLeft);

                // 5: Ubicación
                Cell c5 = row.createCell(5);
                c5.setCellValue(activo.ubicacion() != null && activo.ubicacion().nombre() != null ? activo.ubicacion().nombre() : "");
                c5.setCellStyle(textLeft);

                // 6: Estado Operativo
                Cell c6 = row.createCell(6);
                String estadoStr = activo.estadoOperativo() != null ? activo.estadoOperativo().nombre() : "Sin Estado";
                c6.setCellValue(estadoStr);
                c6.setCellStyle(textCenter);

                // 7: Fecha Adquisición
                Cell c7 = row.createCell(7);
                c7.setCellValue(activo.fechaAdquisicion() != null ? activo.fechaAdquisicion().format(FECHA_FORMATTER) : "");
                c7.setCellStyle(textCenter);

                // 8: Estado Registro (Activo/Inactivo)
                Cell c8 = row.createCell(8);
                c8.setCellValue(Boolean.TRUE.equals(activo.activo()) ? "Activo" : "Inactivo");
                c8.setCellStyle(textCenter);

                // 9: Descripción
                Cell c9 = row.createCell(9);
                c9.setCellValue(activo.descripcion() != null ? activo.descripcion() : "");
                c9.setCellStyle(textLeft);
            }

            // Autoajustar columnas
            for (int col = 0; col < headers.length; col++) {
                sheet.autoSizeColumn(col);
                int currentWidth = sheet.getColumnWidth(col);
                sheet.setColumnWidth(col, Math.max(currentWidth + 1200, 3000));
            }

            workbook.write(out);
            return out.toByteArray();

        } catch (IOException e) {
            log.error("Error al generar el reporte Excel de disponibilidad de activos", e);
            throw new BusinessException("No fue posible generar el archivo Excel de disponibilidad de activos.");
        }
    }

    private CellStyle crearEstiloTitulo(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
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

    private CellStyle crearEstiloResumen(XSSFWorkbook workbook, HorizontalAlignment align, boolean isBold) {
        CellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setFontHeightInPoints((short) 9);
        font.setBold(isBold);
        style.setFont(font);
        style.setAlignment(align);
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        style.setFillForegroundColor(new XSSFColor(COLOR_TOTAL_RGB, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
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
