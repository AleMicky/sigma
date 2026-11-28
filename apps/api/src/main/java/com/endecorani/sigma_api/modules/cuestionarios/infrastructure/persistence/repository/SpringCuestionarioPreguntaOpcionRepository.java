package com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.entity.CuestionarioPreguntaOpcionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface SpringCuestionarioPreguntaOpcionRepository extends JpaRepository<CuestionarioPreguntaOpcionEntity, UUID> {

    List<CuestionarioPreguntaOpcionEntity> findByPreguntaIdOrderByOrdenAsc(UUID preguntaId);

    List<CuestionarioPreguntaOpcionEntity> findByPreguntaIdInOrderByOrdenAsc(Collection<UUID> preguntaIds);

    void deleteByPreguntaIdIn(Collection<UUID> preguntaIds);
}
