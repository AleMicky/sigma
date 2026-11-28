package com.endecorani.sigma_api.modules.cuestionarios.domain.repository;

import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioPreguntaOpcion;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface CuestionarioPreguntaOpcionRepository {

    List<CuestionarioPreguntaOpcion> saveAll(List<CuestionarioPreguntaOpcion> opciones);

    List<CuestionarioPreguntaOpcion> findByPreguntaIdOrderByOrdenAsc(UUID preguntaId);

    List<CuestionarioPreguntaOpcion> findByPreguntaIdInOrderByOrdenAsc(Collection<UUID> preguntaIds);

    void deleteByPreguntaIdIn(Collection<UUID> preguntaIds);

    void flush();
}
