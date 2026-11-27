package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ConfiguracionPreventiva;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ConfiguracionPreventivaRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ConfiguracionPreventivaEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringConfiguracionPreventivaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ConfiguracionPreventivaRepositoryAdapter implements ConfiguracionPreventivaRepository {

    private final SpringConfiguracionPreventivaRepository springRepository;

    @Override
    public Optional<ConfiguracionPreventiva> findCurrent() {
        return springRepository.findFirstByOrderByCreatedAtAsc().map(this::toDomain);
    }

    @Override
    public ConfiguracionPreventiva save(ConfiguracionPreventiva domain) {
        ConfiguracionPreventivaEntity entity = springRepository.findFirstByOrderByCreatedAtAsc()
                .orElseGet(ConfiguracionPreventivaEntity::new);
        entity.setDiasAnticipacionAlerta(domain.getDiasAnticipacionAlerta());
        entity.setKmAnticipacionAlerta(domain.getKmAnticipacionAlerta());
        entity.setHorasAnticipacionAlerta(domain.getHorasAnticipacionAlerta());
        entity.setEvaluacionAutomaticaHabilitada(domain.getEvaluacionAutomaticaHabilitada());
        entity.setCronEvaluacion(domain.getCronEvaluacion());
        return toDomain(springRepository.save(entity));
    }

    private ConfiguracionPreventiva toDomain(ConfiguracionPreventivaEntity e) {
        return ConfiguracionPreventiva.builder()
                .id(e.getId())
                .diasAnticipacionAlerta(e.getDiasAnticipacionAlerta())
                .kmAnticipacionAlerta(e.getKmAnticipacionAlerta())
                .horasAnticipacionAlerta(e.getHorasAnticipacionAlerta())
                .evaluacionAutomaticaHabilitada(e.getEvaluacionAutomaticaHabilitada())
                .cronEvaluacion(e.getCronEvaluacion())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .createdBy(e.getCreatedBy())
                .updatedBy(e.getUpdatedBy())
                .createdById(e.getCreatedById())
                .updatedById(e.getUpdatedById())
                .build();
    }
}
