package com.endecorani.sigma_api.modules.organizacion.application.service;

import com.endecorani.sigma_api.modules.organizacion.application.dto.request.EmpleadoResponsabilidadRequest;
import com.endecorani.sigma_api.modules.organizacion.application.dto.response.EmpleadoResumenResponse;
import com.endecorani.sigma_api.modules.organizacion.application.dto.response.EmpleadoResponsabilidadResponse;
import com.endecorani.sigma_api.modules.organizacion.domain.model.EmpleadoResponsabilidad;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Persona;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoResponsabilidadRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.PersonaRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.ResponsabilidadRepository;
import com.endecorani.sigma_api.shared.application.dto.response.CatalogoResumenResponse;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaMapper;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class EmpleadoResponsabilidadService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "fechaInicio",
            "fechaFin",
            "createdAt",
            "updatedAt"
    );

    private final EmpleadoResponsabilidadRepository empleadoResponsabilidadRepository;

    private final EmpleadoRepository empleadoRepository;

    private final ResponsabilidadRepository responsabilidadRepository;

    private final PersonaRepository personaRepository;

    @Transactional
    public EmpleadoResponsabilidadResponse create(
            EmpleadoResponsabilidadRequest request
    ) {
        requireEmpleadoExists(request.empleadoId());
        validateRequest(request);

        EmpleadoResponsabilidad empleadoResponsabilidad = toDomain(request.empleadoId(), request);
        return toResponse(empleadoResponsabilidadRepository.save(empleadoResponsabilidad));
    }

    @Transactional
    public EmpleadoResponsabilidadResponse update(
            UUID id,
            EmpleadoResponsabilidadRequest request
    ) {
        EmpleadoResponsabilidad empleadoResponsabilidad = findEmpleadoResponsabilidadById(id);
        requireEmpleadoExists(request.empleadoId());
        validateRequest(request);

        empleadoResponsabilidad.setEmpleadoId(request.empleadoId());
        empleadoResponsabilidad.setResponsabilidadId(request.responsabilidadId());
        empleadoResponsabilidad.setFechaInicio(request.fechaInicio());
        empleadoResponsabilidad.setFechaFin(request.fechaFin());

        return toResponse(empleadoResponsabilidadRepository.save(empleadoResponsabilidad));
    }

    @Transactional(readOnly = true)
    public EmpleadoResponsabilidadResponse findById(UUID id) {
        return toResponse(findEmpleadoResponsabilidadById(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<EmpleadoResponsabilidadResponse> findAll(
            UUID responsabilidadId,
            PageRequestDto pageRequest
    ) {
        Page<EmpleadoResponsabilidad> page = (responsabilidadId != null)
                ? empleadoResponsabilidadRepository.findByResponsabilidadId(
                        responsabilidadId,
                        pageRequest.toPageable(SORT_FIELDS)
                )
                : empleadoResponsabilidadRepository.findAll(
                        pageRequest.toPageable(SORT_FIELDS)
                );
        return PageResponse.from(page, this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<EmpleadoResumenResponse> findEmpleadosByResponsabilidadCodigo(String codigo) {
        com.endecorani.sigma_api.modules.organizacion.domain.model.Responsabilidad responsabilidad =
                responsabilidadRepository.findByCodigoIgnoreCase(codigo)
                        .orElseThrow(() -> new ResourceNotFoundException("Responsabilidad", codigo));

        LocalDate hoy = LocalDate.now();

        return empleadoResponsabilidadRepository.findByResponsabilidadId(responsabilidad.getId())
                .stream()
                .filter(er -> er.getFechaFin() == null || !er.getFechaFin().isBefore(hoy))
                .map(er -> buildEmpleadoInfo(er.getEmpleadoId()))
                .filter(java.util.Objects::nonNull)
                .distinct()
                .toList();
    }

    @Transactional
    public void delete(UUID id) {
        findEmpleadoResponsabilidadById(id);
        empleadoResponsabilidadRepository.deleteById(id);
    }

    private EmpleadoResponsabilidad findEmpleadoResponsabilidadById(UUID id) {
        return empleadoResponsabilidadRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("EmpleadoResponsabilidad", id)
                );
    }

    private void requireEmpleadoExists(UUID empleadoId) {
        if (!empleadoRepository.existsById(empleadoId)) {
            throw new ResourceNotFoundException("Empleado", empleadoId);
        }
    }

    private void validateRequest(EmpleadoResponsabilidadRequest request) {
        if (!responsabilidadRepository.existsById(request.responsabilidadId())) {
            throw new ResourceNotFoundException("Responsabilidad", request.responsabilidadId());
        }

        validateFechas(request.fechaInicio(), request.fechaFin());
    }

    private void validateFechas(LocalDate fechaInicio, LocalDate fechaFin) {
        if (fechaFin != null && fechaFin.isBefore(fechaInicio)) {
            throw new BusinessException(
                    "INVALID_EMPLEADO_RESPONSABILIDAD_FECHAS",
                    "La fecha de fin no puede ser anterior a la fecha de inicio"
            );
        }
    }

    private EmpleadoResponsabilidad toDomain(UUID empleadoId, EmpleadoResponsabilidadRequest request) {
        return EmpleadoResponsabilidad.builder()
                .empleadoId(empleadoId)
                .responsabilidadId(request.responsabilidadId())
                .fechaInicio(request.fechaInicio())
                .fechaFin(request.fechaFin())
                .build();
    }

    private EmpleadoResponsabilidadResponse toResponse(EmpleadoResponsabilidad domain) {
        return new EmpleadoResponsabilidadResponse(
                domain.getId(),
                buildEmpleadoInfo(domain.getEmpleadoId()),
                buildResponsabilidadInfo(domain.getResponsabilidadId()),
                domain.getFechaInicio(),
                domain.getFechaFin(),
                AuditoriaMapper.from(domain)
        );
    }

    private EmpleadoResumenResponse buildEmpleadoInfo(UUID empleadoId) {
        if (empleadoId == null) {
            return null;
        }

        return empleadoRepository.findById(empleadoId)
                .map(empleado -> new EmpleadoResumenResponse(
                        empleado.getId(),
                        empleado.getCodigo(),
                        buildNombreCompleto(empleado.getPersonaId())
                ))
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

    private CatalogoResumenResponse buildResponsabilidadInfo(UUID responsabilidadId) {
        if (responsabilidadId == null) {
            return null;
        }

        return responsabilidadRepository.findById(responsabilidadId)
                .map(responsabilidad -> new CatalogoResumenResponse(
                        responsabilidad.getId(),
                        responsabilidad.getCodigo(),
                        responsabilidad.getNombre()
                ))
                .orElse(null);
    }
}
