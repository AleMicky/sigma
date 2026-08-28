package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.ControlActivoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.ControlActivoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ControlActivo;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ControlActivoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Persona;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.PersonaRepository;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaMapper;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ControlActivoService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "fecha",
            "tipo",
            "conforme",
            "createdAt",
            "updatedAt"
    );

    private final ControlActivoRepository controlActivoRepository;
    private final ActivoRepository activoRepository;
    private final EmpleadoRepository empleadoRepository;
    private final PersonaRepository personaRepository;

    @Transactional
    public ControlActivoResponse create(ControlActivoRequest request) {
        ControlActivo domain = toDomain(request);
        ControlActivo saved = controlActivoRepository.save(domain);
        return toResponse(saved);
    }

    @Transactional
    public ControlActivoResponse update(UUID id, ControlActivoRequest request) {
        ControlActivo domain = findDomainById(id);
        updateDomain(domain, request);
        ControlActivo updated = controlActivoRepository.save(domain);
        return toResponse(updated);
    }

    @Transactional(readOnly = true)
    public ControlActivoResponse findById(UUID id) {
        return toResponse(findDomainById(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<ControlActivoResponse> findAll(PageRequestDto pageRequest) {
        return PageResponse.from(
                controlActivoRepository.findAll(
                        pageRequest.toPageable(SORT_FIELDS)
                ),
                this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<ControlActivoResponse> findAll(
            UUID solicitudMantenimientoId,
            PageRequestDto pageRequest
    ) {
        return PageResponse.from(
                controlActivoRepository.findBySolicitudMantenimientoId(
                        solicitudMantenimientoId,
                        pageRequest.toPageable(SORT_FIELDS)
                ),
                this::toResponse
        );
    }

    @Transactional
    public void delete(UUID id) {
        findDomainById(id);
        controlActivoRepository.deleteById(id);
    }

    private ControlActivo findDomainById(UUID id) {
        return controlActivoRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "ControlActivo",
                                id
                        )
                );
    }

    private ControlActivo toDomain(ControlActivoRequest request) {
        return ControlActivo.builder()
                .solicitudMantenimientoId(request.solicitudMantenimientoId())
                .ordenTrabajoId(request.ordenTrabajoId())
                .activoId(request.activoId())
                .tipo(request.tipo())
                .entregadoPorId(request.entregadoPorId())
                .recibidoPorId(request.recibidoPorId())
                .fecha(request.fecha())
                .conforme(request.conforme())
                .observacion(StringUtils.normalize(request.observacion()))
                .build();
    }

    private void updateDomain(
            ControlActivo domain,
            ControlActivoRequest request
    ) {
        domain.setSolicitudMantenimientoId(request.solicitudMantenimientoId());
        domain.setOrdenTrabajoId(request.ordenTrabajoId());
        domain.setActivoId(request.activoId());
        domain.setTipo(request.tipo());
        domain.setEntregadoPorId(request.entregadoPorId());
        domain.setRecibidoPorId(request.recibidoPorId());
        domain.setFecha(request.fecha());
        domain.setConforme(request.conforme());
        domain.setObservacion(StringUtils.normalize(request.observacion()));
    }

    private ControlActivoResponse toResponse(ControlActivo domain) {
        var activoInfo = domain.getActivoId() != null
                ? activoRepository.findById(domain.getActivoId())
                .map(a -> new ControlActivoResponse.ActivoInfo(
                        a.getId(),
                        a.getCodigo(),
                        a.getNombre()
                ))
                .orElse(null)
                : null;

        var entregadoPorInfo = buildUserInfo(domain.getEntregadoPorId());
        var recibidoPorInfo = buildUserInfo(domain.getRecibidoPorId());

        return new ControlActivoResponse(
                domain.getId(),
                domain.getSolicitudMantenimientoId(),
                domain.getOrdenTrabajoId(),
                activoInfo,
                domain.getTipo(),
                entregadoPorInfo,
                recibidoPorInfo,
                domain.getFecha(),
                domain.isConforme(),
                domain.getObservacion(),
                AuditoriaMapper.from(domain)
        );
    }

    private ControlActivoResponse.UserInfo buildUserInfo(UUID empleadoId) {
        if (empleadoId == null) {
            return null;
        }

        return empleadoRepository.findById(empleadoId)
                .map(empleado -> {
                    String nombre = buildNombreCompleto(empleado.getPersonaId());
                    if (nombre == null || nombre.isBlank()) {
                        nombre = empleado.getCodigo();
                    }
                    return new ControlActivoResponse.UserInfo(
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
