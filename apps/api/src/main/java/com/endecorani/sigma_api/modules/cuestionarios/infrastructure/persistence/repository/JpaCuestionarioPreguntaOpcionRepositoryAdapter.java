package com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioPreguntaOpcion;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioPreguntaOpcionRepository;
import com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.mapper.CuestionarioPersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class JpaCuestionarioPreguntaOpcionRepositoryAdapter implements CuestionarioPreguntaOpcionRepository {

    private final SpringCuestionarioPreguntaOpcionRepository springRepository;
    private final CuestionarioPersistenceMapper mapper;

    @Override
    public List<CuestionarioPreguntaOpcion> saveAll(List<CuestionarioPreguntaOpcion> opciones) {
        if (opciones == null || opciones.isEmpty()) {
            return List.of();
        }
        return springRepository.saveAll(opciones.stream().map(mapper::toEntity).toList())
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<CuestionarioPreguntaOpcion> findByPreguntaIdOrderByOrdenAsc(UUID preguntaId) {
        return springRepository.findByPreguntaIdOrderByOrdenAsc(preguntaId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<CuestionarioPreguntaOpcion> findByPreguntaIdInOrderByOrdenAsc(Collection<UUID> preguntaIds) {
        if (preguntaIds == null || preguntaIds.isEmpty()) {
            return List.of();
        }
        return springRepository.findByPreguntaIdInOrderByOrdenAsc(preguntaIds)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public void deleteByPreguntaIdIn(Collection<UUID> preguntaIds) {
        if (preguntaIds == null || preguntaIds.isEmpty()) {
            return;
        }
        springRepository.deleteByPreguntaIdIn(preguntaIds);
    }

    @Override
    public void flush() {
        springRepository.flush();
    }
}
