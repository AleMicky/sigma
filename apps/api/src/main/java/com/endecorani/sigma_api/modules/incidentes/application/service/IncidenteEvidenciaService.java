package com.endecorani.sigma_api.modules.incidentes.application.service;

import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteevidencia.response.IncidenteEvidenciaResponse;
import com.endecorani.sigma_api.modules.incidentes.application.mapper.IncidenteEvidenciaMapper;
import com.endecorani.sigma_api.modules.incidentes.domain.model.IncidenteEvidencia;
import com.endecorani.sigma_api.modules.incidentes.domain.repository.IncidenteActivoRepository;
import com.endecorani.sigma_api.modules.incidentes.domain.repository.IncidenteEvidenciaRepository;
import com.endecorani.sigma_api.shared.application.storage.DocumentStorageService;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class IncidenteEvidenciaService {

    private static final String EVIDENCIA_FOLDER = "incidente_evidencias";

    private final IncidenteEvidenciaRepository repository;
    private final IncidenteActivoRepository incidenteActivoRepository;
    private final IncidenteEvidenciaMapper mapper;
    private final DocumentStorageService documentStorageService;

    @Transactional
    public IncidenteEvidenciaResponse subirEvidencia(UUID incidenteId, MultipartFile file) {
        if (!incidenteActivoRepository.existsById(incidenteId)) {
            throw new ResourceNotFoundException("Incidente", incidenteId);
        }

        UUID fileId = UUID.randomUUID();
        DocumentStorageService.StoredFile stored = documentStorageService.store(
                EVIDENCIA_FOLDER,
                fileId,
                file
        );

        IncidenteEvidencia domain = IncidenteEvidencia.builder()
                .incidenteActivoId(incidenteId)
                .nombreArchivo(stored.nombreOriginal())
                .url(stored.publicUrl())
                .mimeType(stored.mimeType())
                .size(stored.tamanoBytes())
                .build();

        IncidenteEvidencia guardado = repository.save(domain);
        return mapper.toResponse(guardado);
    }

    @Transactional(readOnly = true)
    public List<IncidenteEvidenciaResponse> listarPorIncidente(UUID incidenteId) {
        if (!incidenteActivoRepository.existsById(incidenteId)) {
            throw new ResourceNotFoundException("Incidente", incidenteId);
        }

        return repository.findByIncidenteActivoId(incidenteId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public IncidenteEvidenciaResponse obtenerPorId(UUID incidenteId, UUID evidenciaId) {
        if (!incidenteActivoRepository.existsById(incidenteId)) {
            throw new ResourceNotFoundException("Incidente", incidenteId);
        }

        IncidenteEvidencia domain = repository.findByIdAndIncidenteActivoId(evidenciaId, incidenteId)
                .orElseThrow(() -> new ResourceNotFoundException("Evidencia del incidente", evidenciaId));

        return mapper.toResponse(domain);
    }

    @Transactional
    public void eliminar(UUID incidenteId, UUID evidenciaId) {
        if (!incidenteActivoRepository.existsById(incidenteId)) {
            throw new ResourceNotFoundException("Incidente", incidenteId);
        }

        IncidenteEvidencia domain = repository.findByIdAndIncidenteActivoId(evidenciaId, incidenteId)
                .orElseThrow(() -> new ResourceNotFoundException("Evidencia del incidente", evidenciaId));

        if (domain.getUrl() != null) {
            try {
                documentStorageService.delete(domain.getUrl());
            } catch (Exception ex) {
                log.warn("No se pudo eliminar el archivo físico {}: {}", domain.getUrl(), ex.getMessage());
            }
        }

        repository.deleteById(domain.getId());
    }
}

