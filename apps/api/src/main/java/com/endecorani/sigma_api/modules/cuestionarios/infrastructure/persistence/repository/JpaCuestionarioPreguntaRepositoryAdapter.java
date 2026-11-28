package com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioPregunta;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioPreguntaRepository;
import com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.mapper.CuestionarioPersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class JpaCuestionarioPreguntaRepositoryAdapter implements CuestionarioPreguntaRepository {

    private final SpringCuestionarioPreguntaRepository springRepository;
    private final CuestionarioPersistenceMapper mapper;

    @Override
    public CuestionarioPregunta save(CuestionarioPregunta pregunta) {
        return mapper.toDomain(springRepository.save(mapper.toEntity(pregunta)));
    }

    @Override
    public List<CuestionarioPregunta> saveAll(List<CuestionarioPregunta> preguntas) {
        if (preguntas == null || preguntas.isEmpty()) {
            return List.of();
        }
        return springRepository.saveAll(preguntas.stream().map(mapper::toEntity).toList())
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<CuestionarioPregunta> findByCuestionarioIdOrderByOrdenAsc(UUID cuestionarioId) {
        return springRepository.findByCuestionarioIdOrderByOrdenAsc(cuestionarioId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<CuestionarioPregunta> findByCuestionarioIdAndActivoTrueOrderByOrdenAsc(UUID cuestionarioId) {
        return springRepository.findByCuestionarioIdAndActivoTrueOrderByOrdenAsc(cuestionarioId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public long countByCuestionarioIdAndActivoTrue(UUID cuestionarioId) {
        return springRepository.countByCuestionarioIdAndActivoTrue(cuestionarioId);
    }

    @Override
    public Map<UUID, Long> countActiveByCuestionarioIds(Collection<UUID> cuestionarioIds) {
        if (cuestionarioIds == null || cuestionarioIds.isEmpty()) {
            return Map.of();
        }
        Map<UUID, Long> result = new HashMap<>();
        for (Object[] row : springRepository.countActiveGroupedByCuestionarioIds(cuestionarioIds)) {
            result.put((UUID) row[0], ((Number) row[1]).longValue());
        }
        return result;
    }

    @Override
    public void deleteByCuestionarioId(UUID cuestionarioId) {
        springRepository.deleteByCuestionarioId(cuestionarioId);
    }

    @Override
    public void flush() {
        springRepository.flush();
    }
}
