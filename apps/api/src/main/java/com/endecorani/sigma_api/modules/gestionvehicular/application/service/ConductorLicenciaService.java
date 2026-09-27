package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.request.ConductorLicenciaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.response.ConductorLicenciaResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.mapper.ConductorMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoLicenciaConductor;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.ConductorLicencia;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ConductorRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorLicenciaEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper.ConductorPersistenceMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringConductorLicenciaRepository;
import com.endecorani.sigma_api.shared.application.storage.DocumentStorageService;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConductorLicenciaService {

    private static final String FOLDER_LICENCIAS = "conductor_licencias";

    private final SpringConductorLicenciaRepository licenciaRepository;
    private final ConductorRepository conductorRepository;
    private final ConductorPersistenceMapper persistenceMapper;
    private final ConductorMapper mapper;
    private final DocumentStorageService documentStorageService;

    @Transactional(readOnly = true)
    public List<ConductorLicenciaResponse> findByConductorId(UUID conductorId) {
        validarConductorExiste(conductorId);
        List<ConductorLicenciaEntity> entities = licenciaRepository.findByConductorId(conductorId);
        return entities.stream()
                .map(persistenceMapper::licenciaToDomain)
                .sorted(Comparator.comparing((ConductorLicencia l) -> l.getEstado() == EstadoLicenciaConductor.VIGENTE ? 0 : 1)
                        .thenComparing(ConductorLicencia::getFechaVencimiento, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ConductorLicenciaResponse findById(UUID id) {
        ConductorLicenciaEntity entity = obtenerPorId(id);
        return mapper.toResponse(persistenceMapper.licenciaToDomain(entity));
    }

    @Transactional
    public ConductorLicenciaResponse create(
            UUID conductorId,
            ConductorLicenciaRequest request,
            MultipartFile file
    ) {
        validarConductorExiste(conductorId);

        EstadoLicenciaConductor estado = request.estado() != null ? request.estado() : EstadoLicenciaConductor.VIGENTE;

        // Regla de Negocio: Si la nueva licencia es VIGENTE, las licencias anteriores pasan a VENCIDA (historial)
        if (estado == EstadoLicenciaConductor.VIGENTE) {
            desactivarLicenciasVigentesAnteriores(conductorId, null);
        }

        ConductorLicencia domain = mapper.toDomain(request);
        domain.setConductorId(conductorId);
        domain.setEstado(estado);
        domain.setCategoriaLicencia(StringUtils.normalize(request.categoriaLicencia()));
        domain.setNumeroLicencia(StringUtils.normalize(request.numeroLicencia()));
        domain.setObservacion(StringUtils.normalize(request.observacion()));
        domain.setActivo(request.activo() != null ? request.activo() : true);

        if (file != null && !file.isEmpty()) {
            UUID fileId = UUID.randomUUID();
            DocumentStorageService.StoredFile stored = documentStorageService.store(
                    FOLDER_LICENCIAS,
                    fileId,
                    file
            );
            domain.setNombreArchivo(stored.nombreArchivo() != null ? stored.nombreArchivo() : stored.nombreOriginal());
            domain.setNombreOriginal(stored.nombreOriginal());
            domain.setUrl(stored.publicUrl());
            domain.setMimeType(stored.mimeType());
            domain.setSize(stored.tamanoBytes());
        }

        ConductorLicenciaEntity entity = persistenceMapper.licenciaToEntity(domain);
        ConductorLicenciaEntity guardada = licenciaRepository.save(entity);
        return mapper.toResponse(persistenceMapper.licenciaToDomain(guardada));
    }

    @Transactional
    public ConductorLicenciaResponse update(
            UUID id,
            ConductorLicenciaRequest request,
            MultipartFile file
    ) {
        ConductorLicenciaEntity actual = obtenerPorId(id);
        UUID conductorId = actual.getConductorId();

        EstadoLicenciaConductor estado = request.estado() != null ? request.estado() : actual.getEstado();

        // Regla de Negocio: Si pasa a ser VIGENTE, las demás licencias del conductor pasan a VENCIDA
        if (estado == EstadoLicenciaConductor.VIGENTE) {
            desactivarLicenciasVigentesAnteriores(conductorId, id);
        }

        actual.setCategoriaLicencia(StringUtils.normalize(request.categoriaLicencia()));
        actual.setNumeroLicencia(StringUtils.normalize(request.numeroLicencia()));
        actual.setFechaEmision(request.fechaEmision());
        actual.setFechaVencimiento(request.fechaVencimiento());
        actual.setEstado(estado);
        actual.setObservacion(StringUtils.normalize(request.observacion()));
        if (request.activo() != null) {
            actual.setActivo(request.activo());
        }

        if (file != null && !file.isEmpty()) {
            if (actual.getUrl() != null) {
                documentStorageService.delete(actual.getUrl());
            }

            UUID fileId = actual.getId() != null ? actual.getId() : UUID.randomUUID();
            DocumentStorageService.StoredFile stored = documentStorageService.store(
                    FOLDER_LICENCIAS,
                    fileId,
                    file
            );
            actual.setNombreArchivo(stored.nombreArchivo() != null ? stored.nombreArchivo() : stored.nombreOriginal());
            actual.setNombreOriginal(stored.nombreOriginal());
            actual.setUrl(stored.publicUrl());
            actual.setMimeType(stored.mimeType());
            actual.setSize(stored.tamanoBytes());
        }

        ConductorLicenciaEntity guardada = licenciaRepository.save(actual);
        return mapper.toResponse(persistenceMapper.licenciaToDomain(guardada));
    }

    @Transactional
    public void delete(UUID id) {
        ConductorLicenciaEntity entity = obtenerPorId(id);
        if (entity.getUrl() != null) {
            documentStorageService.delete(entity.getUrl());
        }
        licenciaRepository.deleteById(id);
    }

    private void desactivarLicenciasVigentesAnteriores(UUID conductorId, UUID excludeId) {
        List<ConductorLicenciaEntity> existentes = licenciaRepository.findByConductorId(conductorId);
        for (ConductorLicenciaEntity lic : existentes) {
            if (excludeId != null && lic.getId().equals(excludeId)) {
                continue;
            }
            if (lic.getEstado() == EstadoLicenciaConductor.VIGENTE) {
                lic.setEstado(EstadoLicenciaConductor.VENCIDA);
                licenciaRepository.save(lic);
            }
        }
    }

    private ConductorLicenciaEntity obtenerPorId(UUID id) {
        return licenciaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Licencia de conductor", id));
    }

    private void validarConductorExiste(UUID conductorId) {
        if (conductorRepository.findById(conductorId).isEmpty()) {
            throw new ResourceNotFoundException("Conductor", conductorId);
        }
    }
}
