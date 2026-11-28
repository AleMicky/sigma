package com.endecorani.sigma_api.modules.cuestionarios.domain.repository;

import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioRespuestaDetalle;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface CuestionarioRespuestaDetalleRepository {

    List<CuestionarioRespuestaDetalle> saveAll(List<CuestionarioRespuestaDetalle> respuestas);

    List<CuestionarioRespuestaDetalle> findByAsignacionId(UUID asignacionId);

    List<CuestionarioRespuestaDetalle> findByAsignacionIdIn(Collection<UUID> asignacionIds);

    boolean existsByCuestionarioId(UUID cuestionarioId);
}
