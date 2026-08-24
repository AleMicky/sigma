package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.OrdenTrabajoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.OrdenTrabajoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajo;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Persona;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.PersonaRepository;
import com.endecorani.sigma_api.modules.parametros.application.service.CorrelativoService;
import com.endecorani.sigma_api.modules.parametros.domain.constant.CorrelativoCodigo;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaMapper;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class OrdenTrabajoService {

    private static final Set<String> SORT_FIELDS = Set.copyOf(Arrays.asList(
            "id", "numero", "solicitudMantenimientoId", "activoId",
            "responsableId", "fechaInicio", "fechaFin", "createdAt", "updatedAt"
    ));

    private final OrdenTrabajoRepository repository;
    private final SolicitudMantenimientoRepository solicitudMantenimientoRepository;
    private final ActivoRepository activoRepository;
    private final EmpleadoRepository empleadoRepository;
    private final PersonaRepository personaRepository;
    private final CorrelativoService correlativoService;

    @Transactional
    public OrdenTrabajoResponse create(OrdenTrabajoRequest request) {
        validateForeignEntities(
                request.solicitudMantenimientoId(),
                request.activoId(),
                request.responsableId()
        );

        if (repository.existsBySolicitudMantenimientoId(request.solicitudMantenimientoId())) {
            throw new ConflictException(
                    "ORDEN_TRABAJO_SOLICITUD_DUPLICADA",
                    "Ya existe una orden de trabajo para la solicitud indicada"
            );
        }

        String numero = correlativoService.generar(
                CorrelativoCodigo.ORDEN_TRABAJO,
                LocalDateTime.now().getYear()
        );

        OrdenTrabajo domain = OrdenTrabajo.builder()
                .numero(numero)
                .solicitudMantenimientoId(request.solicitudMantenimientoId())
                .activoId(request.activoId())
                .responsableId(request.responsableId())
                .fechaInicio(request.fechaInicio())
                .fechaFin(request.fechaFin())
                .diagnostico(StringUtils.normalize(request.diagnostico()))
                .trabajoRealizado(StringUtils.normalize(request.trabajoRealizado()))
                .observacion(StringUtils.normalize(request.observacion()))
                .build();

        return toResponse(repository.save(domain));
    }

    @Transactional
    public OrdenTrabajoResponse update(UUID id, OrdenTrabajoRequest request) {
        validateForeignEntities(
                request.solicitudMantenimientoId(),
                request.activoId(),
                request.responsableId()
        );

        OrdenTrabajo domain = findDomainById(id);

        if (repository.existsBySolicitudMantenimientoIdAndIdNot(
                request.solicitudMantenimientoId(),
                id
        )) {
            throw new ConflictException(
                    "ORDEN_TRABAJO_SOLICITUD_DUPLICADA",
                    "Ya existe una orden de trabajo para la solicitud indicada"
            );
        }

        domain.setSolicitudMantenimientoId(request.solicitudMantenimientoId());
        domain.setActivoId(request.activoId());
        domain.setResponsableId(request.responsableId());
        domain.setFechaInicio(request.fechaInicio());
        domain.setFechaFin(request.fechaFin());
        domain.setDiagnostico(StringUtils.normalize(request.diagnostico()));
        domain.setTrabajoRealizado(StringUtils.normalize(request.trabajoRealizado()));
        domain.setObservacion(StringUtils.normalize(request.observacion()));

        return toResponse(repository.save(domain));
    }

    @Transactional(readOnly = true)
    public OrdenTrabajoResponse findById(UUID id) {
        return toResponse(findDomainById(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<OrdenTrabajoResponse> findAll(
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(query);

        return PageResponse.from(
                normalized == null
                        ? repository.findAll(pageRequest.toPageable(SORT_FIELDS))
                        : repository.search(normalized, pageRequest.toPageable(SORT_FIELDS)),
                this::toResponse
        );
    }

    @Transactional
    public void delete(UUID id) {
        findDomainById(id);
        repository.deleteById(id);
    }

    private OrdenTrabajo findDomainById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de trabajo", id));
    }

    private void validateForeignEntities(
            UUID solicitudMantenimientoId,
            UUID activoId,
            UUID responsableId
    ) {
        requireSolicitudExists(solicitudMantenimientoId);
        requireActivoExists(activoId);
        requireResponsableExists(responsableId);
    }

    private void requireSolicitudExists(UUID id) {
        if (!solicitudMantenimientoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Solicitud de mantenimiento", id);
        }
    }

    private void requireActivoExists(UUID id) {
        if (!activoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Activo", id);
        }
    }

    private void requireResponsableExists(UUID id) {
        if (!empleadoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Empleado responsable", id);
        }
    }

    private OrdenTrabajoResponse toResponse(OrdenTrabajo domain) {
        var activoInfo = domain.getActivoId() != null
                ? activoRepository.findById(domain.getActivoId())
                .map(a -> new OrdenTrabajoResponse.ActivoInfo(
                        a.getId(),
                        a.getCodigo(),
                        a.getNombre()
                ))
                .orElse(null)
                : null;

        var responsableInfo = buildUserInfo(domain.getResponsableId());

        return new OrdenTrabajoResponse(
                domain.getId(),
                domain.getNumero(),
                domain.getSolicitudMantenimientoId(),
                activoInfo,
                responsableInfo,
                domain.getFechaInicio(),
                domain.getFechaFin(),
                domain.getDiagnostico(),
                domain.getTrabajoRealizado(),
                domain.getObservacion(),
                AuditoriaMapper.from(domain)
        );
    }

    private OrdenTrabajoResponse.UserInfo buildUserInfo(UUID empleadoId) {
        if (empleadoId == null) {
            return null;
        }

        return empleadoRepository.findById(empleadoId)
                .map(empleado -> {
                    String nombre = buildNombreCompleto(empleado.getPersonaId());
                    if (nombre == null || nombre.isBlank()) {
                        nombre = empleado.getCodigo();
                    }
                    return new OrdenTrabajoResponse.UserInfo(
                            empleado.getId(),
                            nombre
                    );
                })
                .orElse(null);
    }

    private String buildNombreCompleto(UUID personaId) {
        if (personaId == null) {
            return null;
        }

        return personaRepository.findById(personaId)
                .map(this::buildNombreCompleto)
                .orElse(null);
    }

    private String buildNombreCompleto(Persona persona) {
        return Stream.of(
                        persona.getNombres(),
                        persona.getPrimerApellido(),
                        persona.getSegundoApellido()
                )
                .filter(value -> value != null && !value.isBlank())
                .map(String::trim)
                .collect(Collectors.joining(" "));
    }
}
