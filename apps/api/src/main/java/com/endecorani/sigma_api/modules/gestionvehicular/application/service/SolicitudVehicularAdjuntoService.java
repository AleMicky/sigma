package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.request.SolicitudVehicularAdjuntoRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response.SolicitudVehicularAdjuntoResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.mapper.SolicitudVehicularAdjuntoMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.Conductor;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SolicitudVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SolicitudVehicularAdjunto;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ConductorRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SolicitudVehicularAdjuntoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SolicitudVehicularRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.storage.DocumentStorageService;
import com.endecorani.sigma_api.shared.domain.exception.ForbiddenException;
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
    private final SecurityUtils securityUtils;
    private final UsuarioRepository usuarioRepository;
    private final EmpleadoRepository empleadoRepository;
    private final ConductorRepository conductorRepository;

    @Transactional
    public SolicitudVehicularAdjuntoResponse createWithFile(
            UUID solicitudVehicularId,
            SolicitudVehicularAdjuntoRequest request,
            MultipartFile file
    ) {
        obtenerSolicitudAutorizada(solicitudVehicularId);

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

        obtenerSolicitudAutorizada(solicitudVehicularId);

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
        validarSolicitudDelAdjunto(domain);
        String oldUrl = domain.getUrl();

        UUID fileId = UUID.randomUUID();
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

        SolicitudVehicularAdjunto saved = repository.save(domain);

        if (oldUrl != null && !oldUrl.equals(stored.publicUrl())) {
            documentStorageService.delete(oldUrl);
        }

        return mapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public SolicitudVehicularAdjuntoResponse findById(UUID id) {
        SolicitudVehicularAdjunto domain = obtenerPorId(id);
        validarSolicitudDelAdjunto(domain);
        return mapper.toResponse(domain);
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudVehicularAdjuntoResponse> findBySolicitudVehicularId(
            UUID solicitudVehicularId,
            PageRequestDto pageRequest
    ) {
        obtenerSolicitudAutorizada(solicitudVehicularId);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<SolicitudVehicularAdjunto> resultado = repository.findBySolicitudVehicularId(solicitudVehicularId, pageable);
        return PageResponse.from(resultado, mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public List<SolicitudVehicularAdjuntoResponse> findBySolicitudVehicularId(UUID solicitudVehicularId) {
        obtenerSolicitudAutorizada(solicitudVehicularId);
        return repository.findBySolicitudVehicularId(solicitudVehicularId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional
    public void delete(UUID id) {
        SolicitudVehicularAdjunto domain = obtenerPorId(id);
        validarSolicitudDelAdjunto(domain);
        if (domain.getUrl() != null) {
            documentStorageService.delete(domain.getUrl());
        }
        repository.deleteById(id);
    }

    @Transactional
    public void deleteBySolicitudVehicularId(UUID solicitudVehicularId) {
        obtenerSolicitudAutorizada(solicitudVehicularId);
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

    private void validarSolicitudDelAdjunto(SolicitudVehicularAdjunto adjunto) {
        UUID solicitudVehicularId = adjunto.getSolicitudVehicularId();
        if (solicitudVehicularId == null) {
            throw new ForbiddenException("El adjunto no está asociado a una solicitud vehicular.");
        }
        obtenerSolicitudAutorizada(solicitudVehicularId);
    }

    private SolicitudVehicular obtenerSolicitudAutorizada(UUID solicitudVehicularId) {
        SolicitudVehicular solicitud = solicitudVehicularRepository.findById(solicitudVehicularId)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud vehicular", solicitudVehicularId));
        validarAccesoASolicitud(solicitud);
        return solicitud;
    }

    /**
     * REQ-VEH-003: mismo patrón de alcance que {@code SalidaVehicularService.AlcanceArea}.
     * Un usuario sin resolución de usuario/empleado no puede leer ni sobrescribir evidencia.
     */
    private record AlcanceArea(UUID areaId, UUID createdById, boolean unirPorOr, boolean sinAcceso) {
    }

    private AlcanceArea resolverAlcance() {
        if (securityUtils.isAdmin()) {
            return new AlcanceArea(null, null, false, false);
        }
        UUID userId = securityUtils.getCurrentUserId().orElse(null);
        if (userId == null) {
            return new AlcanceArea(null, null, false, true);
        }
        return new AlcanceArea(null, userId, false, false);
    }

    private void validarAccesoASolicitud(SolicitudVehicular solicitud) {
        AlcanceArea alcance = resolverAlcance();
        if (alcance.sinAcceso()) {
            throw new ForbiddenException("No tiene permisos para acceder a los adjuntos de esta solicitud vehicular.");
        }
        if (alcance.createdById() == null) {
            return;
        }
        UUID userId = alcance.createdById();
        if (userId.equals(solicitud.getCreatedById())) {
            return;
        }

        UUID empleadoId = obtenerEmpleadoIdActual();
        if (empleadoId != null) {
            if (empleadoId.equals(solicitud.getSolicitanteId())
                    || empleadoId.equals(solicitud.getResponsableAsignacionId())) {
                return;
            }
            UUID conductorId = conductorRepository.findByEmpleadoId(empleadoId)
                    .map(Conductor::getId)
                    .orElse(null);
            if (conductorId != null && conductorId.equals(solicitud.getConductorAsignadoId())) {
                return;
            }
        }

        throw new ForbiddenException("No tiene permisos para acceder a los adjuntos de esta solicitud vehicular.");
    }

    private UUID obtenerEmpleadoIdActual() {
        try {
            return securityUtils.getCurrentUserId()
                    .flatMap(usuarioRepository::findById)
                    .map(Usuario::getPersonaId)
                    .flatMap(empleadoRepository::findFirstByPersonaId)
                    .map(Empleado::getId)
                    .orElse(null);
        } catch (Exception ex) {
            return null;
        }
    }
}
