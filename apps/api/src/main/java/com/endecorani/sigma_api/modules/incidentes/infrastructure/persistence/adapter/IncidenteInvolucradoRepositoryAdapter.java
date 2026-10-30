package com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.incidentes.domain.model.IncidenteInvolucrado;
import com.endecorani.sigma_api.modules.incidentes.domain.repository.IncidenteInvolucradoRepository;
import com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.entity.IncidenteInvolucradoEntity;
import com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.mapper.IncidenteInvolucradoPersistenceMapper;
import com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.repository.SpringIncidenteInvolucradoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class IncidenteInvolucradoRepositoryAdapter implements IncidenteInvolucradoRepository {

    private final SpringIncidenteInvolucradoRepository springRepository;
    private final IncidenteInvolucradoPersistenceMapper mapper;

    @Override
    public List<IncidenteInvolucrado> findByIncidenteActivoId(UUID incidenteActivoId) {
        return springRepository.findByIncidenteActivoId(incidenteActivoId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Optional<IncidenteInvolucrado> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<IncidenteInvolucrado> findByIdAndIncidenteActivoId(UUID id, UUID incidenteActivoId) {
        return springRepository.findByIdAndIncidenteActivoId(id, incidenteActivoId).map(mapper::toDomain);
    }

    @Override
    public IncidenteInvolucrado save(IncidenteInvolucrado involucrado) {
        IncidenteInvolucradoEntity entity = mapper.toEntity(involucrado);
        IncidenteInvolucradoEntity saved = springRepository.save(entity);
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

