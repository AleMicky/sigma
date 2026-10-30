package com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.incidentes.domain.model.IncidenteEvidencia;
import com.endecorani.sigma_api.modules.incidentes.domain.repository.IncidenteEvidenciaRepository;
import com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.entity.IncidenteEvidenciaEntity;
import com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.mapper.IncidenteEvidenciaPersistenceMapper;
import com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.repository.SpringIncidenteEvidenciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class IncidenteEvidenciaRepositoryAdapter implements IncidenteEvidenciaRepository {

    private final SpringIncidenteEvidenciaRepository springRepository;
    private final IncidenteEvidenciaPersistenceMapper mapper;

    @Override
    public List<IncidenteEvidencia> findByIncidenteActivoId(UUID incidenteActivoId) {
        return springRepository.findByIncidenteActivoId(incidenteActivoId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Optional<IncidenteEvidencia> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<IncidenteEvidencia> findByIdAndIncidenteActivoId(UUID id, UUID incidenteActivoId) {
        return springRepository.findByIdAndIncidenteActivoId(id, incidenteActivoId).map(mapper::toDomain);
    }

    @Override
    public IncidenteEvidencia save(IncidenteEvidencia evidencia) {
        IncidenteEvidenciaEntity entity = mapper.toEntity(evidencia);
        IncidenteEvidenciaEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }

    @Override
    public boolean existsById(UUID id) {
        return springRepository.existsById(id);
    }
}

