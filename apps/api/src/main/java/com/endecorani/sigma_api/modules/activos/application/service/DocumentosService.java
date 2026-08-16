package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.DocumentosRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.DocumentosResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.Documentos;
import com.endecorani.sigma_api.modules.activos.domain.model.TiposDocumento;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.DocumentosRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.DocumentosSearchCriteria;
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
public class DocumentosService extends AbstractCrudService<
        Documentos,
        DocumentosRequest,
        DocumentosResponse,
        UUID
        > {

    private static final String DOCUMENT_FOLDER = "documentos";
    private static final int NOMBRE_MIN_LENGTH = 2;
    private static final int NOMBRE_MAX_LENGTH = 100;
    private static final int DESCRIPCION_MAX_LENGTH = 255;

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "nombre",
            "fechaDocumento",
            "fechaVencimiento",
            "createdAt",
            "updatedAt"
    );

    private final DocumentosRepository documentosRepository;
    private final ActivoRepository activoRepository;
    private final TiposDocumentoRepository tiposDocumentoRepository;
    private final DocumentStorageService documentStorageService;

    @Override
    protected CrudRepository<Documentos, UUID> repository() {
        return documentosRepository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Transactional
    public DocumentosResponse createWithFile(
            DocumentosRequest request,
            MultipartFile file
    ) {
        validateReferencias(request);
        String nombre = requireNormalizedNombre(request.nombre());
        normalizeDescripcion(request.descripcion());
        TiposDocumento tipoDocumento = requireTipoDocumento(request.tipoDocumentoId());
        requireFechaVencimientoIfNecessary(
                tipoDocumento,
                request.fechaVencimiento()
        );

        UUID fileId = UUID.randomUUID();
        DocumentStorageService.StoredFile stored = documentStorageService.store(
                DOCUMENT_FOLDER,
                fileId,
                file
        );

        Documentos domain = Documentos.builder()
                .activoId(request.activoId())
                .tipoDocumentoId(request.tipoDocumentoId())
                .nombre(nombre)
                .descripcion(normalizeDescripcion(request.descripcion()))
                .nombreOriginal(stored.nombreOriginal())
                .nombreArchivo(stored.nombreArchivo())
                .ruta(stored.publicUrl())
                .extension(stored.extension())
                .mimeType(stored.mimeType())
                .tamanoBytes(stored.tamanoBytes())
                .fechaDocumento(request.fechaDocumento())
                .fechaVencimiento(request.fechaVencimiento())
                .build();

        return toResponse(documentosRepository.save(domain));
    }

    @Transactional
    public DocumentosResponse replaceFile(UUID id, MultipartFile file) {
        Documentos domain = findDomainById(id);

        DocumentStorageService.StoredFile stored = documentStorageService.store(
                DOCUMENT_FOLDER,
                domain.getId(),
                file
        );

        if (domain.getRuta() != null) {
            documentStorageService.delete(domain.getRuta());
        }

        domain.setNombreOriginal(stored.nombreOriginal());
        domain.setNombreArchivo(stored.nombreArchivo());
        domain.setRuta(stored.publicUrl());
        domain.setExtension(stored.extension());
        domain.setMimeType(stored.mimeType());
        domain.setTamanoBytes(stored.tamanoBytes());

        return toResponse(documentosRepository.save(domain));
    }

    @Override
    @Transactional
    public DocumentosResponse update(UUID id, DocumentosRequest request) {
        validateReferencias(request);
        String nombre = requireNormalizedNombre(request.nombre());
        normalizeDescripcion(request.descripcion());
        TiposDocumento tipoDocumento = requireTipoDocumento(request.tipoDocumentoId());
        requireFechaVencimientoIfNecessary(
                tipoDocumento,
                request.fechaVencimiento()
        );

        Documentos domain = findDomainById(id);
        domain.setActivoId(request.activoId());
        domain.setTipoDocumentoId(request.tipoDocumentoId());
        domain.setNombre(nombre);
        domain.setDescripcion(normalizeDescripcion(request.descripcion()));
        domain.setFechaDocumento(request.fechaDocumento());
        domain.setFechaVencimiento(request.fechaVencimiento());

        return toResponse(documentosRepository.save(domain));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        Documentos domain = findDomainById(id);
        if (domain.getRuta() != null) {
            documentStorageService.delete(domain.getRuta());
        }
        documentosRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public PageResponse<DocumentosResponse> find(
            UUID activoId,
            UUID tipoDocumentoId,
            String query,
            PageRequestDto pageRequest
    ) {
        DocumentosSearchCriteria criteria = new DocumentosSearchCriteria(
                activoId,
                tipoDocumentoId,
                StringUtils.normalize(query)
        );

        return PageResponse.from(
                documentosRepository.findAll(
                        criteria,
                        pageRequest.toPageable(allowedSortFields())
                ),
                this::toResponse
        );
    }

    @Override
    protected Documentos toDomain(DocumentosRequest request) {
        validateReferencias(request);
        String nombre = requireNormalizedNombre(request.nombre());
        TiposDocumento tipoDocumento = requireTipoDocumento(request.tipoDocumentoId());
        requireFechaVencimientoIfNecessary(
                tipoDocumento,
                request.fechaVencimiento()
        );

        return Documentos.builder()
                .activoId(request.activoId())
                .tipoDocumentoId(request.tipoDocumentoId())
                .nombre(nombre)
                .descripcion(normalizeDescripcion(request.descripcion()))
                .fechaDocumento(request.fechaDocumento())
                .fechaVencimiento(request.fechaVencimiento())
                .build();
    }

    @Override
    protected void updateDomain(Documentos domain, DocumentosRequest request) {
        validateReferencias(request);
        String nombre = requireNormalizedNombre(request.nombre());
        TiposDocumento tipoDocumento = requireTipoDocumento(request.tipoDocumentoId());
        requireFechaVencimientoIfNecessary(
                tipoDocumento,
                request.fechaVencimiento()
        );

        domain.setActivoId(request.activoId());
        domain.setTipoDocumentoId(request.tipoDocumentoId());
        domain.setNombre(nombre);
        domain.setDescripcion(normalizeDescripcion(request.descripcion()));
        domain.setFechaDocumento(request.fechaDocumento());
        domain.setFechaVencimiento(request.fechaVencimiento());
    }

    @Override
    protected DocumentosResponse toResponse(Documentos domain) {
        return new DocumentosResponse(
                domain.getId(),
                domain.getActivoId(),
                domain.getTipoDocumentoId(),
                domain.getNombre(),
                domain.getDescripcion(),
                domain.getNombreOriginal(),
                domain.getNombreArchivo(),
                domain.getRuta(),
                domain.getExtension(),
                domain.getMimeType(),
                domain.getTamanoBytes(),
                domain.getFechaDocumento(),
                domain.getFechaVencimiento(),
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );
    }

    @Override
    protected String resourceName() {
        return "Documento";
    }

    private void validateReferencias(DocumentosRequest request) {
        requireActivoExists(request.activoId());
        requireTipoDocumentoExists(request.tipoDocumentoId());
    }

    private void requireActivoExists(UUID activoId) {
        if (!activoRepository.existsById(activoId)) {
            throw new ResourceNotFoundException("Activo", activoId);
        }
    }

    private void requireTipoDocumentoExists(UUID tipoDocumentoId) {
        if (!tiposDocumentoRepository.existsById(tipoDocumentoId)) {
            throw new ResourceNotFoundException("Tipo de documento", tipoDocumentoId);
        }
    }

    private TiposDocumento requireTipoDocumento(UUID tipoDocumentoId) {
        return tiposDocumentoRepository
                .findById(tipoDocumentoId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Tipo de documento",
                        tipoDocumentoId
                ));
    }

    private void requireFechaVencimientoIfNecessary(
            TiposDocumento tipoDocumento,
            LocalDate fechaVencimiento
    ) {
        if (Boolean.TRUE.equals(tipoDocumento.getRequiereVencimiento())
                && fechaVencimiento == null) {
            throw new BusinessException(
                    "FECHA_VENCIMIENTO_REQUIRED",
                    "El tipo de documento '%s' requiere fecha de vencimiento"
                            .formatted(tipoDocumento.getNombre())
            );
        }
    }

    private String requireNormalizedNombre(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < NOMBRE_MIN_LENGTH
                || normalized.length() > NOMBRE_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_DOCUMENTO_NOMBRE",
                    "El nombre debe tener entre %d y %d caracteres"
                            .formatted(NOMBRE_MIN_LENGTH, NOMBRE_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String normalizeDescripcion(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized != null
                && normalized.length() > DESCRIPCION_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_DOCUMENTO_DESCRIPCION",
                    "La descripción no puede superar los %d caracteres"
                            .formatted(DESCRIPCION_MAX_LENGTH)
            );
        }

        return normalized;
    }
}