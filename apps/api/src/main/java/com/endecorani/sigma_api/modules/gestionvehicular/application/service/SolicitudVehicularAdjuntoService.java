package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.request.SolicitudVehicularAdjuntoRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response.SolicitudVehicularAdjuntoResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.mapper.SolicitudVehicularAdjuntoMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SolicitudVehicularAdjunto;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SolicitudVehicularAdjuntoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SolicitudVehicularRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.storage.DocumentStorageService;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SolicitudVehicularAdjuntoService {

    private static final String ADJUNTO_FOLDER = "solicitud_vehicular_adjuntos";

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "nombreArchivo",
            "nombreOriginal",
            "mimeType",
            "size",
            "createdAt",
            "updatedAt"
    );

    private final SolicitudVehicularAdjuntoRepository repository;
    private final SolicitudVehicularRepository solicitudVehicularRepository;
    private final SolicitudVehicularAdjuntoMapper mapper;
    private final DocumentStorageService documentStorageService;

    @Transactional
    public SolicitudVehicularAdjuntoResponse createWithFile(
            UUID solicitudVehicularId,
            SolicitudVehicularAdjuntoRequest request,
            MultipartFile file
    ) {
        validarSolicitudVehicularExiste(solicitudVehicularId);

        UUID fileId = UUID.randomUUID();
        DocumentStorageService.StoredFile stored = documentStorageService.store(
                ADJUNTO_FOLDER,
                fileId,
                file
        );

        String descripcion = request != null ? StringUtils.normalize(request.descripcion()) : null;

        SolicitudVehicularAdjunto domain = SolicitudVehicularAdjunto.builder()
                .solicitudVehicularId(solicitudVehicularId)
                .nombreArchivo(stored.nombreArchivo() != null ? stored.nombreArchivo() : stored.nombreOriginal())
                .nombreOriginal(stored.nombreOriginal())
                .url(stored.publicUrl())
                .mimeType(stored.mimeType())
                .size(stored.tamanoBytes())
                .descripcion(descripcion)
                .build();

        return mapper.toResponse(repository.save(domain));
    }

    @Transactional
    public List<SolicitudVehicularAdjuntoResponse> uploadMultipleFiles(
            UUID solicitudVehicularId,
            List<MultipartFile> files
    ) {
        if (files == null || files.isEmpty()) {
            return List.of();
        }

        validarSolicitudVehicularExiste(solicitudVehicularId);

        List<SolicitudVehicularAdjunto> adjuntos = new ArrayList<>();
        for (MultipartFile file : files) {
            UUID fileId = UUID.randomUUID();
            DocumentStorageService.StoredFile stored = documentStorageService.store(
                    ADJUNTO_FOLDER,
                    fileId,
                    file
            );

            adjuntos.add(SolicitudVehicularAdjunto.builder()
                    .solicitudVehicularId(solicitudVehicularId)
                    .nombreArchivo(stored.nombreArchivo() != null ? stored.nombreArchivo() : stored.nombreOriginal())
                    .nombreOriginal(stored.nombreOriginal())
                    .url(stored.publicUrl())
                    .mimeType(stored.mimeType())
                    .size(stored.tamanoBytes())
                    .build());
        }

        return repository.saveAll(adjuntos).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional
    public SolicitudVehicularAdjuntoResponse replaceFile(UUID id, MultipartFile file) {
        SolicitudVehicularAdjunto domain = obtenerPorId(id);

        if (domain.getUrl() != null) {
            documentStorageService.delete(domain.getUrl());
        }

        UUID fileId = domain.getId() != null ? domain.getId() : UUID.randomUUID();
        DocumentStorageService.StoredFile stored = documentStorageService.store(
                ADJUNTO_FOLDER,
                fileId,
                file
        );

        domain.setNombreArchivo(stored.nombreArchivo() != null ? stored.nombreArchivo() : stored.nombreOriginal());
        domain.setNombreOriginal(stored.nombreOriginal());
        domain.setUrl(stored.publicUrl());
        domain.setMimeType(stored.mimeType());
        domain.setSize(stored.tamanoBytes());

        return mapper.toResponse(repository.save(domain));
    }

    @Transactional(readOnly = true)
    public SolicitudVehicularAdjuntoResponse findById(UUID id) {
        SolicitudVehicularAdjunto domain = obtenerPorId(id);
        return mapper.toResponse(domain);
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudVehicularAdjuntoResponse> findBySolicitudVehicularId(
            UUID solicitudVehicularId,
            PageRequestDto pageRequest
    ) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<SolicitudVehicularAdjunto> resultado = repository.findBySolicitudVehicularId(solicitudVehicularId, pageable);
        return PageResponse.from(resultado, mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public List<SolicitudVehicularAdjuntoResponse> findBySolicitudVehicularId(UUID solicitudVehicularId) {
        return repository.findBySolicitudVehicularId(solicitudVehicularId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional
    public void delete(UUID id) {
        SolicitudVehicularAdjunto domain = obtenerPorId(id);
        if (domain.getUrl() != null) {
            documentStorageService.delete(domain.getUrl());
        }
        repository.deleteById(id);
    }

    @Transactional
    public void deleteBySolicitudVehicularId(UUID solicitudVehicularId) {
        List<SolicitudVehicularAdjunto> adjuntos = repository.findBySolicitudVehicularId(solicitudVehicularId);
        for (SolicitudVehicularAdjunto adjunto : adjuntos) {
            if (adjunto.getUrl() != null) {
                documentStorageService.delete(adjunto.getUrl());
            }
        }
        repository.deleteBySolicitudVehicularId(solicitudVehicularId);
    }

    private SolicitudVehicularAdjunto obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Adjunto de solicitud vehicular", id));
    }

    private void validarSolicitudVehicularExiste(UUID solicitudVehicularId) {
        if (solicitudVehicularRepository.findById(solicitudVehicularId).isEmpty()) {
            throw new ResourceNotFoundException("Solicitud vehicular", solicitudVehicularId);
        }
    }
}
