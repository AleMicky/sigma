package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.preventivo.request.ConfiguracionPreventivaRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.preventivo.response.ConfiguracionPreventivaResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ConfiguracionPreventiva;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ConfiguracionPreventivaRepository;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaResponseMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ConfiguracionPreventivaService {

    private final ConfiguracionPreventivaRepository repository;
    private final AuditoriaResponseMapper auditoriaMapper;

    @Transactional(readOnly = true)
    public ConfiguracionPreventiva obtenerActualDominio() {
        return repository.findCurrent()
                .orElseGet(() -> ConfiguracionPreventiva.builder().build());
    }

    @Transactional(readOnly = true)
    public ConfiguracionPreventivaResponse obtenerActual() {
        return toResponse(obtenerActualDominio());
    }

    @Transactional
    public ConfiguracionPreventivaResponse actualizar(ConfiguracionPreventivaRequest request) {
        ConfiguracionPreventiva actual = obtenerActualDominio();
        actual.setDiasAnticipacionAlerta(request.diasAnticipacionAlerta());
        actual.setKmAnticipacionAlerta(request.kmAnticipacionAlerta());
        actual.setHorasAnticipacionAlerta(request.horasAnticipacionAlerta());
        actual.setEvaluacionAutomaticaHabilitada(request.evaluacionAutomaticaHabilitada());
        actual.setCronEvaluacion(request.cronEvaluacion().trim());
        ConfiguracionPreventiva guardado = repository.save(actual);
        return toResponse(guardado);
    }

    private ConfiguracionPreventivaResponse toResponse(ConfiguracionPreventiva domain) {
        return new ConfiguracionPreventivaResponse(
                domain.getId(),
                domain.getDiasAnticipacionAlerta(),
                domain.getKmAnticipacionAlerta(),
                domain.getHorasAnticipacionAlerta(),
                domain.getEvaluacionAutomaticaHabilitada(),
                domain.getCronEvaluacion(),
                auditoriaMapper.toResponse(domain)
        );
    }
}
