package com.endecorani.sigma_api.modules.parametros.domain.repository;

import com.endecorani.sigma_api.modules.parametros.domain.model.Correlativo;

import java.util.Optional;
import java.util.UUID;

public interface CorrelativoRepository {
    Correlativo save(Correlativo correlativo);

    /**
     * Inserta el correlativo de forma atómica; si otro proceso ya lo creó para la
     * misma (codigo, gestion), no hace nada y no aborta la transacción en PostgreSQL.
     *
     * @return número de filas insertadas ({@code 0} cuando ya existía).
     */
    int insertIfAbsent(Correlativo correlativo);

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
