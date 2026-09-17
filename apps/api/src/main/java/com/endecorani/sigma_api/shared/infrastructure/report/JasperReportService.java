package com.endecorani.sigma_api.shared.infrastructure.report;

import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class JasperReportService {

    private final Map<String, JasperReport> reportCache = new ConcurrentHashMap<>();

    /**
     * Compila o recupera de caché un reporte JRXML desde el classpath.
     *
     * @param reportPath Ruta en el classpath (ej: "reports/solicitudes/solicitud_mantenimiento.jrxml")
     * @return Objeto JasperReport compilado
     */
    public JasperReport getOrCompileReport(String reportPath) {
        return reportCache.computeIfAbsent(reportPath, path -> {
            try {
                ClassPathResource resource = new ClassPathResource(path);
                if (!resource.exists()) {
                    throw new BusinessException("No se encontró la plantilla de reporte en: " + path);
                }
                try (InputStream inputStream = resource.getInputStream()) {
                    log.info("Compilando plantilla JasperReport: {}", path);
                    return JasperCompileManager.compileReport(inputStream);
                }
            } catch (Exception e) {
                log.error("Error al compilar plantilla de reporte: {}", path, e);
                throw new BusinessException("Error al compilar la plantilla de reporte: " + e.getMessage());
            }
        });
    }

    /**
     * Genera un reporte PDF con parámetros y una fuente de datos de tipo Colección.
     */
    public byte[] generatePdfReport(String reportPath, Map<String, Object> parameters, Collection<?> dataList) {
        try {
            JasperReport jasperReport = getOrCompileReport(reportPath);
            JRDataSource dataSource = (dataList != null && !dataList.isEmpty())
                    ? new JRBeanCollectionDataSource(dataList)
                    : new JREmptyDataSource();

            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);
            return JasperExportManager.exportReportToPdf(jasperPrint);
        } catch (JRException e) {
            log.error("Error al generar el reporte PDF: {}", reportPath, e);
            throw new BusinessException("Error al generar el reporte PDF: " + e.getMessage());
        }
    }

    /**
     * Genera un reporte PDF solo con parámetros (usando JREmptyDataSource).
     */
    public byte[] generatePdfReport(String reportPath, Map<String, Object> parameters) {
        return generatePdfReport(reportPath, parameters, null);
    }
}
