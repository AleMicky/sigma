package com.endecorani.sigma_api.modules.incidentes.application.service;

import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteinvolucrado.request.IncidenteInvolucradoRequest;
import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteinvolucrado.request.IncidenteInvolucradoUpdate;
import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteinvolucrado.response.IncidenteInvolucradoResponse;
import com.endecorani.sigma_api.modules.incidentes.application.mapper.IncidenteInvolucradoMapper;
import com.endecorani.sigma_api.modules.incidentes.domain.model.IncidenteInvolucrado;
import com.endecorani.sigma_api.modules.incidentes.domain.repository.IncidenteActivoRepository;
import com.endecorani.sigma_api.modules.incidentes.domain.repository.IncidenteInvolucradoRepository;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IncidenteInvolucradoService {

    private final IncidenteInvolucradoRepository repository;
    private final IncidenteActivoRepository incidenteActivoRepository;
    private final IncidenteInvolucradoMapper mapper;

    @Transactional
    public IncidenteInvolucradoResponse registrar(UUID incidenteId, IncidenteInvolucradoRequest request) {
        if (!incidenteActivoRepository.existsById(incidenteId)) {
            throw new ResourceNotFoundException("Incidente", incidenteId);
        }

        IncidenteInvolucrado domain = mapper.toDomain(request);
        domain.setIncidenteActivoId(incidenteId);

        IncidenteInvolucrado guardado = repository.save(domain);
        return mapper.toResponse(guardado);
    }

    @Transactional(readOnly = true)
    public List<IncidenteInvolucradoResponse> listarPorIncidente(UUID incidenteId) {
        if (!incidenteActivoRepository.existsById(incidenteId)) {
            throw new ResourceNotFoundException("Incidente", incidenteId);
        }

        return repository.findByIncidenteActivoId(incidenteId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional
    public IncidenteInvolucradoResponse actualizar(UUID incidenteId, UUID involucradoId, IncidenteInvolucradoUpdate request) {
        if (!incidenteActivoRepository.existsById(incidenteId)) {
            throw new ResourceNotFoundException("Incidente", incidenteId);
        }

        IncidenteInvolucrado domain = repository.findByIdAndIncidenteActivoId(involucradoId, incidenteId)
                .orElseThrow(() -> new ResourceNotFoundException("Involucrado del incidente", involucradoId));

        mapper.updateDomain(request, domain);
        IncidenteInvolucrado actualizado = repository.save(domain);
        return mapper.toResponse(actualizado);
    }

    @Transactional
    public void eliminar(UUID incidenteId, UUID involucradoId) {
        if (!incidenteActivoRepository.existsById(incidenteId)) {
            throw new ResourceNotFoundException("Incidente", incidenteId);
        }

        IncidenteInvolucrado domain = repository.findByIdAndIncidenteActivoId(involucradoId, incidenteId)
                .orElseThrow(() -> new ResourceNotFoundException("Involucrado del incidente", involucradoId));

        repository.deleteById(domain.getId());
    }
}

