package com.endecorani.sigma_api.modules.parametros.domain.repository;

import com.endecorani.sigma_api.modules.parametros.domain.model.Correlativo;

import java.util.Optional;
import java.util.UUID;

public interface CorrelativoRepository {
    Correlativo save(Correlativo correlativo);

    Optional<Correlativo> findById(UUID id);

    Optional<Correlativo> findForUpdate(
            String codigo,
            Integer gestion
    );

    boolean existsByCodigoAndGestion(
            String codigo,
            Integer gestion
    );
}
