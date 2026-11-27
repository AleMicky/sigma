package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.request.OrdenTrabajoAdjuntoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.response.OrdenTrabajoAdjuntoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.OrdenTrabajoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoAdjunto;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoAdjuntoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.storage.DocumentStorageService;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrdenTrabajoAdjuntoService {

    private static final String ADJUNTO_FOLDER = "orden_trabajo_adjuntos";

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "nombreArchivo",
            "tipoMime",
            "tamanio",
            "createdAt",
            "updatedAt"
    );

    private final OrdenTrabajoAdjuntoRepository repository;
    private final OrdenTrabajoRepository ordenTrabajoRepository;
    private final OrdenTrabajoMapper mapper;
    private final DocumentStorageService documentStorageService;

    @Transactional
    public OrdenTrabajoAdjuntoResponse createWithFile(UUID ordenTrabajoId, OrdenTrabajoAdjuntoRequest request, MultipartFile file) {
        validarOrdenTrabajo(ordenTrabajoId);

        UUID fileId = UUID.randomUUID();
        DocumentStorageService.StoredFile stored = documentStorageService.store(
                ADJUNTO_FOLDER,
                fileId,
                file
        );

        String descripcion = request != null ? request.descripcion() : null;

        OrdenTrabajoAdjunto domain = OrdenTrabajoAdjunto.builder()
                .ordenTrabajoId(ordenTrabajoId)
                .nombreArchivo(stored.nombreOriginal())
                .tipoMime(stored.mimeType())
                .tamanio(stored.tamanoBytes())
                .url(stored.publicUrl())
                .descripcion(descripcion)
                .build();

        return mapper.toAdjuntoResponse(repository.save(domain));
    }

    @Transactional
    public OrdenTrabajoAdjuntoResponse replaceFile(UUID ordenTrabajoId, UUID id, MultipartFile file) {
        OrdenTrabajoAdjunto domain = obtenerPorId(ordenTrabajoId, id);
        String oldUrl = domain.getUrl();

        UUID fileId = UUID.randomUUID();
        DocumentStorageService.StoredFile stored = documentStorageService.store(
                ADJUNTO_FOLDER,
                fileId,
                file
        );

        domain.setNombreArchivo(stored.nombreOriginal());
        domain.setTipoMime(stored.mimeType());
        domain.setTamanio(stored.tamanoBytes());
        domain.setUrl(stored.publicUrl());

        OrdenTrabajoAdjunto saved = repository.save(domain);

        if (oldUrl != null && !oldUrl.equals(stored.publicUrl())) {
            documentStorageService.delete(oldUrl);
        }

        return mapper.toAdjuntoResponse(saved);
    }

    @Transactional(readOnly = true)
    public OrdenTrabajoAdjuntoResponse findById(UUID ordenTrabajoId, UUID id) {
        OrdenTrabajoAdjunto domain = obtenerPorId(ordenTrabajoId, id);
        return mapper.toAdjuntoResponse(domain);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrdenTrabajoAdjuntoResponse> findByOrdenTrabajoId(UUID ordenTrabajoId, PageRequestDto pageRequest) {
        validarOrdenTrabajo(ordenTrabajoId);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<OrdenTrabajoAdjunto> resultado = repository.findByOrdenTrabajoId(ordenTrabajoId, pageable);
        return PageResponse.from(resultado, mapper::toAdjuntoResponse);
    }

    @Transactional
    public void delete(UUID ordenTrabajoId, UUID id) {
        OrdenTrabajoAdjunto domain = obtenerPorId(ordenTrabajoId, id);
        if (domain.getUrl() != null) {
            documentStorageService.delete(domain.getUrl());
        }
        repository.deleteById(id);
    }

    private void validarOrdenTrabajo(UUID ordenTrabajoId) {
        if (ordenTrabajoId == null || !ordenTrabajoRepository.findById(ordenTrabajoId).isPresent()) {
            throw new ResourceNotFoundException("Orden de trabajo", ordenTrabajoId);
        }
    }

    /** REQ-MANT-002: el ID del padre es obligatorio; un adjunto de otra orden se oculta como 404. */
    private OrdenTrabajoAdjunto obtenerPorId(UUID ordenTrabajoId, UUID id) {
        validarOrdenTrabajo(ordenTrabajoId);
        return repository.findByIdAndOrdenTrabajoId(id, ordenTrabajoId)
                .orElseThrow(() -> new ResourceNotFoundException("Adjunto de orden de trabajo", id));
    }
}
