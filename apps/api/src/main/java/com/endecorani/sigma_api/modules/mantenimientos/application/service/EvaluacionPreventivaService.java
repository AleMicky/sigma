package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response.BatchEvaluacionProgramacionResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ConfiguracionPreventiva;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EvaluacionPreventivaService {

    private final ConfiguracionPreventivaService configuracionService;
    private final ProgramacionMantenimientoService programacionService;

    @Scheduled(cron = "${sigma.mantenimientos.preventivo.cron:0 0 6 * * *}", zone = "America/La_Paz")
    public void ejecutarEvaluacionProgramada() {
        ConfiguracionPreventiva config = configuracionService.obtenerActualDominio();
        if (!Boolean.TRUE.equals(config.getEvaluacionAutomaticaHabilitada())) {
            log.debug("Evaluación preventiva automática deshabilitada en configuración");
            return;
        }
        BatchEvaluacionProgramacionResponse resultado = programacionService.evaluarTodas();
        log.info("Evaluación preventiva automática completada: {} evaluadas, {} cumplieron criterio",
                resultado.totalEvaluadas(), resultado.cumplieronCriterio());
    }
}
