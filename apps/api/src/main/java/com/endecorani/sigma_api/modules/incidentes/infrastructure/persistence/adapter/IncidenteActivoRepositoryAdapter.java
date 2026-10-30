package com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.incidentes.domain.model.IncidenteActivo;
import com.endecorani.sigma_api.modules.incidentes.domain.repository.IncidenteActivoRepository;
import com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.entity.IncidenteActivoEntity;
import com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.mapper.IncidenteActivoPersistenceMapper;
import com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.repository.SpringIncidenteActivoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class IncidenteActivoRepositoryAdapter implements IncidenteActivoRepository {

    private final SpringIncidenteActivoRepository springRepository;
    private final IncidenteActivoPersistenceMapper mapper;

    @Override
    public Page<IncidenteActivo> findAll(Pageable pageable) {
        return springRepository.findAll(pageable).map(mapper::toDomain);
    }

    @Override
    public Page<IncidenteActivo> searchWithFilters(
            String search,
            String tipoIncidente,
            String prioridad,
            String estado,
            UUID activoId,
            Pageable pageable
    ) {
        String searchPattern = (search != null && !search.isBlank())
                ? search.toLowerCase().trim()
                : null;
        return springRepository.searchWithFilters(
                searchPattern,
                tipoIncidente,
                prioridad,
                estado,
                activoId,
                pageable
        ).map(mapper::toDomain);
    }

    @Override
    public List<IncidenteActivo> findByActivoId(UUID activoId) {
        return springRepository.findByActivoId(activoId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Optional<IncidenteActivo> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public IncidenteActivo save(IncidenteActivo incidenteActivo) {
        IncidenteActivoEntity entity = mapper.toEntity(incidenteActivo);
        IncidenteActivoEntity saved = springRepository.save(entity);
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

