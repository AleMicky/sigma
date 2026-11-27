package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ConfiguracionPreventiva;

import java.util.Optional;

public interface ConfiguracionPreventivaRepository {
    Optional<ConfiguracionPreventiva> findCurrent();
    ConfiguracionPreventiva save(ConfiguracionPreventiva configuracion);
}
