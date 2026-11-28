package com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioRespuestaDetalle;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioRespuestaDetalleRepository;
import com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.mapper.CuestionarioPersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class JpaCuestionarioRespuestaDetalleRepositoryAdapter implements CuestionarioRespuestaDetalleRepository {

    private final SpringCuestionarioRespuestaDetalleRepository springRepository;
    private final CuestionarioPersistenceMapper mapper;

    @Override
    public List<CuestionarioRespuestaDetalle> saveAll(List<CuestionarioRespuestaDetalle> respuestas) {
        if (respuestas == null || respuestas.isEmpty()) {
            return List.of();
        }
        return springRepository.saveAll(respuestas.stream().map(mapper::toEntity).toList())
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<CuestionarioRespuestaDetalle> findByAsignacionId(UUID asignacionId) {
        return springRepository.findByAsignacionId(asignacionId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<CuestionarioRespuestaDetalle> findByAsignacionIdIn(Collection<UUID> asignacionIds) {
        if (asignacionIds == null || asignacionIds.isEmpty()) {
            return List.of();
        }
        return springRepository.findByAsignacionIdIn(asignacionIds)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public boolean existsByCuestionarioId(UUID cuestionarioId) {
        return springRepository.existsByCuestionarioId(cuestionarioId);
    }
}
