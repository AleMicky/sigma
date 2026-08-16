package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.ActivoDocumentoRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.ActivoDocumentoResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.ActivoDocumento;
import com.endecorani.sigma_api.modules.activos.domain.model.TiposDocumento;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoDocumentoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoDocumentoSearchCriteria;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TiposDocumentoRepository;
import com.endecorani.sigma_api.shared.application.crud.AbstractCrudService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.storage.DocumentStorageService;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActivoDocumentoService extends AbstractCrudService<ActivoDocumento, ActivoDocumentoRequest, ActivoDocumentoResponse, UUID> {

    private static final String DOCUMENT_FOLDER = "activo_documentos";
    private static final int NOMBRE_MAX_LENGTH = 150;
    private static final int DESCRIPCION_MAX_LENGTH = 500;

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "nombre",
            "fechaEmision",
            "fechaVencimiento",
            "createdAt",
            "updatedAt"
    );

    private final ActivoDocumentoRepository repository;
    private final ActivoRepository activoRepository;
    private final TiposDocumentoRepository tiposDocumentoRepository;
    private final DocumentStorageService documentStorageService;

    @Override
    protected CrudRepository<ActivoDocumento, UUID> repository() {
        return repository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Transactional
    public ActivoDocumentoResponse createWithFile(ActivoDocumentoRequest request, MultipartFile file) {
        validateReferencias(request);
        String nombre = normalizeNombre(request.nombre());
        TiposDocumento tipoDocumento = requireTipoDocumento(request.tipoDocumentoId());
        requireFechaVencimientoIfNecessary(tipoDocumento, request.fechaVencimiento());

        UUID documentoId = UUID.randomUUID();
        DocumentStorageService.StoredFile stored = documentStorageService.store(
                DOCUMENT_FOLDER,
                documentoId,
                file
        );

        ActivoDocumento domain = ActivoDocumento.builder()
                .id(documentoId)
                .activoId(request.activoId())
                .tipoDocumentoId(request.tipoDocumentoId())
                .numeroDocumento(request.numeroDocumento())
                .nombre(nombre)
                .descripcion(normalizeDescripcion(request.descripcion()))
                .fechaEmision(request.fechaEmision())
                .fechaVencimiento(request.fechaVencimiento())
                .nombreArchivo(stored.nombreArchivo())
                .rutaArchivo(stored.publicUrl())
                .mimeType(stored.mimeType())
                .size(stored.tamanoBytes())
                .build();

        return toResponse(repository.save(domain));
    }

    @Transactional
    public ActivoDocumentoResponse replaceFile(UUID id, MultipartFile file) {
        ActivoDocumento domain = findDomainById(id);

        DocumentStorageService.StoredFile stored = documentStorageService.store(
                DOCUMENT_FOLDER,
                domain.getId(),
                file
        );

        if (domain.getRutaArchivo() != null) {
            documentStorageService.delete(domain.getRutaArchivo());
        }

        domain.setNombreArchivo(stored.nombreArchivo());
        domain.setRutaArchivo(stored.publicUrl());
        domain.setMimeType(stored.mimeType());
        domain.setSize(stored.tamanoBytes());

        return toResponse(repository.save(domain));
    }

    @Override
    @Transactional
    public ActivoDocumentoResponse update(UUID id, ActivoDocumentoRequest request) {
        validateReferencias(request);
        String nombre = normalizeNombre(request.nombre());
        TiposDocumento tipoDocumento = requireTipoDocumento(request.tipoDocumentoId());
        requireFechaVencimientoIfNecessary(tipoDocumento, request.fechaVencimiento());

        ActivoDocumento domain = findDomainById(id);
        domain.setActivoId(request.activoId());
        domain.setTipoDocumentoId(request.tipoDocumentoId());
        domain.setNumeroDocumento(request.numeroDocumento());
        domain.setNombre(nombre);
        domain.setDescripcion(normalizeDescripcion(request.descripcion()));
        domain.setFechaEmision(request.fechaEmision());
        domain.setFechaVencimiento(request.fechaVencimiento());

        return toResponse(repository.save(domain));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        ActivoDocumento domain = findDomainById(id);
        if (domain.getRutaArchivo() != null) {
            documentStorageService.delete(domain.getRutaArchivo());
        }
        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public PageResponse<ActivoDocumentoResponse> find(UUID activoId, UUID tipoDocumentoId, String query, PageRequestDto pageRequest) {
        ActivoDocumentoSearchCriteria criteria = new ActivoDocumentoSearchCriteria(activoId, tipoDocumentoId, StringUtils.normalize(query));
        return PageResponse.from(
                repository.findAll(criteria, pageRequest.toPageable(allowedSortFields())),
                this::toResponse
        );
    }

    @Override
    protected ActivoDocumento toDomain(ActivoDocumentoRequest request) {
        throw new BusinessException("NOT_SUPPORTED", "Debe crear el documento usando createWithFile");
    }

    @Override
    protected void updateDomain(ActivoDocumento domain, ActivoDocumentoRequest request) {
        // Handled in update method
    }

    @Override
    protected ActivoDocumentoResponse toResponse(ActivoDocumento domain) {
        return new ActivoDocumentoResponse(
                domain.getId(),
                domain.getActivoId(),
                domain.getTipoDocumentoId(),
                domain.getNumeroDocumento(),
                domain.getNombre(),
                domain.getDescripcion(),
                domain.getFechaEmision(),
                domain.getFechaVencimiento(),
                domain.getNombreArchivo(),
                domain.getRutaArchivo(),
                domain.getMimeType(),
                domain.getSize(),
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );
    }

    @Override
    protected String resourceName() {
        return "ActivoDocumento";
    }

    private void validateReferencias(ActivoDocumentoRequest request) {
        if (!activoRepository.existsById(request.activoId())) {
            throw new ResourceNotFoundException("Activo", request.activoId());
        }
        if (!tiposDocumentoRepository.existsById(request.tipoDocumentoId())) {
            throw new ResourceNotFoundException("TipoDocumento", request.tipoDocumentoId());
        }
    }

    private TiposDocumento requireTipoDocumento(UUID tipoDocumentoId) {
        return tiposDocumentoRepository.findById(tipoDocumentoId)
                .orElseThrow(() -> new ResourceNotFoundException("TipoDocumento", tipoDocumentoId));
    }

    private void requireFechaVencimientoIfNecessary(TiposDocumento tipoDocumento, LocalDate fechaVencimiento) {
        if (Boolean.TRUE.equals(tipoDocumento.getRequiereVencimiento()) && fechaVencimiento == null) {
            throw new BusinessException("FECHA_VENCIMIENTO_REQUIRED", "El tipo de documento requiere fecha de vencimiento");
        }
    }

    private String normalizeNombre(String value) {
        String normalized = StringUtils.normalize(value);
        if (normalized == null || normalized.isBlank() || normalized.length() > NOMBRE_MAX_LENGTH) {
            throw new BusinessException("INVALID_NOMBRE", "El nombre es requerido y no puede superar los " + NOMBRE_MAX_LENGTH + " caracteres");
        }
        return normalized;
    }

    private String normalizeDescripcion(String value) {
        String normalized = StringUtils.normalize(value);
        if (normalized != null && normalized.length() > DESCRIPCION_MAX_LENGTH) {
            throw new BusinessException("INVALID_DESCRIPCION", "La descripción no puede superar los " + DESCRIPCION_MAX_LENGTH + " caracteres");
        }
        return normalized;
    }
}
