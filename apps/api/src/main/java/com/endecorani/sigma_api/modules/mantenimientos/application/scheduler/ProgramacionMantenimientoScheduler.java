package com.endecorani.sigma_api.modules.mantenimientos.application.scheduler;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response.BatchEvaluacionProgramacionResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.ProgramacionMantenimientoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Componente que ejecuta de manera programada (cron) la evaluación de criterios
 * de mantenimiento preventivo (por tiempo/calendario y uso acumulado).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ProgramacionMantenimientoScheduler {

    private final ProgramacionMantenimientoService programacionMantenimientoService;

    /**
     * Evalúa todas las programaciones preventivas activas en el sistema.
     * Por defecto se ejecuta diariamente a las 05:00 AM (configurable mediante app.mantenimientos.evaluacion-cron).
     */
    @Scheduled(cron = "${app.mantenimientos.evaluacion-cron:0 0 5 * * ?}")
    public void ejecutarEvaluacionDiaria() {
        log.info("⏰ [CRON PREVENTIVO] Iniciando evaluación diaria automática de programaciones de mantenimiento...");
        try {
            BatchEvaluacionProgramacionResponse res = programacionMantenimientoService.evaluarTodas();
            log.info("⏰ [CRON PREVENTIVO] Evaluación completada con éxito: {} programaciones evaluadas, {} solicitudes generadas, {} con solicitud abierta previa, {} con errores.",
                    res.totalEvaluadas(),
                    res.solicitudesGeneradas(),
                    res.yaExistiaSolicitudAbierta(),
                    res.errores());
        } catch (Exception e) {
            log.error("⏰ [CRON PREVENTIVO] Error inesperado durante la evaluación periódica de mantenimientos: {}", e.getMessage(), e);
        }
    }
}

