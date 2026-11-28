package com.endecorani.sigma_api.modules.cuestionarios.domain.repository;

import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioPregunta;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface CuestionarioPreguntaRepository {

    CuestionarioPregunta save(CuestionarioPregunta pregunta);

    List<CuestionarioPregunta> saveAll(List<CuestionarioPregunta> preguntas);

    List<CuestionarioPregunta> findByCuestionarioIdOrderByOrdenAsc(UUID cuestionarioId);

    List<CuestionarioPregunta> findByCuestionarioIdAndActivoTrueOrderByOrdenAsc(UUID cuestionarioId);

    long countByCuestionarioIdAndActivoTrue(UUID cuestionarioId);

    Map<UUID, Long> countActiveByCuestionarioIds(Collection<UUID> cuestionarioIds);

    void deleteByCuestionarioId(UUID cuestionarioId);

    void flush();
}
