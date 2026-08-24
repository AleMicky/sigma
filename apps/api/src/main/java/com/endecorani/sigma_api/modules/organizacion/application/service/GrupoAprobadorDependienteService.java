package com.endecorani.sigma_api.modules.organizacion.application.service;

import com.endecorani.sigma_api.modules.organizacion.application.dto.request.GrupoAprobadorDependienteRequest;
import com.endecorani.sigma_api.modules.organizacion.application.dto.response.AprobadorSelectResponse;
import com.endecorani.sigma_api.modules.organizacion.application.dto.response.DependienteSelectResponse;
import com.endecorani.sigma_api.modules.organizacion.application.dto.response.EmpleadoResumenResponse;
import com.endecorani.sigma_api.modules.organizacion.application.dto.response.GrupoAprobadorDependienteResponse;
import com.endecorani.sigma_api.modules.organizacion.domain.model.GrupoAprobadorDependiente;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Persona;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.GrupoAprobadorDependienteRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.GrupoAprobadorRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.PersonaRepository;
import com.endecorani.sigma_api.shared.application.dto.response.CatalogoResumenResponse;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaMapper;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class GrupoAprobadorDependienteService {

    private static final String RESOURCE_NAME = "GrupoAprobadorDependiente";
    private static final String DUPLICATE_ERROR_CODE = "GRUPO_APROBADOR_DEPENDIENTE_DUPLICADO";
    private static final Set<String> SORT_FIELDS = Set.of("id", "createdAt", "updatedAt");

    private final GrupoAprobadorDependienteRepository dependienteRepository;
    private final GrupoAprobadorRepository grupoAprobadorRepository;
    private final EmpleadoRepository empleadoRepository;
    private final PersonaRepository personaRepository;

    @Transactional
    public GrupoAprobadorDependienteResponse create(UUID grupoAprobadorId, GrupoAprobadorDependienteRequest request) {
        requireGrupoAprobadorExists(grupoAprobadorId);
        requireEmpleadoExists(request.empleadoId());
        validateNotDuplicated(grupoAprobadorId, request.empleadoId(), null);

        GrupoAprobadorDependiente dependiente = GrupoAprobadorDependiente.builder()
                .grupoAprobadorId(grupoAprobadorId)
                .empleadoId(request.empleadoId())
                .build();

        return toResponse(dependienteRepository.save(dependiente));
    }

    @Transactional
    public GrupoAprobadorDependienteResponse update(UUID grupoAprobadorId, UUID id, GrupoAprobadorDependienteRequest request) {
        GrupoAprobadorDependiente dependiente = findDependiente(grupoAprobadorId, id);

        if (!Objects.equals(dependiente.getEmpleadoId(), request.empleadoId())) {
            requireEmpleadoExists(request.empleadoId());
            validateNotDuplicated(grupoAprobadorId, request.empleadoId(), id);
            dependiente.setEmpleadoId(request.empleadoId());
        }

        return toResponse(dependienteRepository.save(dependiente));
    }

    @Transactional(readOnly = true)
    public GrupoAprobadorDependienteResponse findById(UUID grupoAprobadorId, UUID id) {
        return toResponse(findDependiente(grupoAprobadorId, id));
    }

    @Transactional(readOnly = true)
    public PageResponse<GrupoAprobadorDependienteResponse> findAllByGrupoAprobador(
            UUID grupoAprobadorId,
            PageRequestDto pageRequest
    ) {
        requireGrupoAprobadorExists(grupoAprobadorId);

        return PageResponse.from(
                dependienteRepository.findByGrupoAprobadorId(
                        grupoAprobadorId,
                        pageRequest.toPageable(SORT_FIELDS)
                ),
                this::toResponse
        );
    }

    @Transactional
    public void delete(UUID grupoAprobadorId, UUID id) {
        if (!dependienteRepository.existsByIdAndGrupoAprobadorId(id, grupoAprobadorId)) {
            throw new ResourceNotFoundException(RESOURCE_NAME, id);
        }
        dependienteRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<AprobadorSelectResponse> findAprobadoresSelectByEmpleadoId(UUID empleadoId) {
        requireEmpleadoExists(empleadoId);
        return dependienteRepository.findAprobadoresSelectByEmpleadoId(empleadoId);
    }

    @Transactional(readOnly = true)
    public List<DependienteSelectResponse> findDependientesSelectByAprobadorId(UUID aprobadorId) {
        requireEmpleadoExists(aprobadorId);
        return dependienteRepository.findDependientesSelectByAprobadorId(aprobadorId);
    }

    // --- Métodos Privados de Validación ---

    private GrupoAprobadorDependiente findDependiente(UUID grupoAprobadorId, UUID id) {
        return dependienteRepository.findByIdAndGrupoAprobadorId(id, grupoAprobadorId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_NAME, id));
    }

    private void requireGrupoAprobadorExists(UUID grupoAprobadorId) {
        if (!grupoAprobadorRepository.existsById(grupoAprobadorId)) {
            throw new ResourceNotFoundException("GrupoAprobador", grupoAprobadorId);
        }
    }

    private void requireEmpleadoExists(UUID empleadoId) {
        if (!empleadoRepository.existsById(empleadoId)) {
            throw new ResourceNotFoundException("Empleado", empleadoId);
        }
    }

    private void validateNotDuplicated(UUID grupoAprobadorId, UUID empleadoId, UUID currentId) {
        boolean isDuplicated = (currentId == null)
                ? dependienteRepository.existsByGrupoAprobadorIdAndEmpleadoId(grupoAprobadorId, empleadoId)
                : dependienteRepository.existsByGrupoAprobadorIdAndEmpleadoIdAndIdNot(grupoAprobadorId, empleadoId, currentId);

        if (isDuplicated) {
            throw new BusinessException(
                    DUPLICATE_ERROR_CODE,
                    "El empleado %s ya pertenece al grupo aprobador %s".formatted(empleadoId, grupoAprobadorId)
            );
        }
    }

    // --- Mapeos a Response ---

    private GrupoAprobadorDependienteResponse toResponse(GrupoAprobadorDependiente domain) {
        return new GrupoAprobadorDependienteResponse(
                domain.getId(),
                buildGrupoAprobadorInfo(domain.getGrupoAprobadorId()),
                buildEmpleadoInfo(domain.getEmpleadoId()),
                AuditoriaMapper.from(domain)
        );
    }

    private CatalogoResumenResponse buildGrupoAprobadorInfo(UUID grupoAprobadorId) {
        if (grupoAprobadorId == null) return null;

        return grupoAprobadorRepository.findById(grupoAprobadorId)
                .map(g -> new CatalogoResumenResponse(g.getId(), g.getCodigo(), g.getNombre()))
                .orElse(null);
    }

    private EmpleadoResumenResponse buildEmpleadoInfo(UUID empleadoId) {
        if (empleadoId == null) return null;

        return empleadoRepository.findById(empleadoId)
                .map(emp -> new EmpleadoResumenResponse(
                        emp.getId(),
                        emp.getCodigo(),
                        buildNombreCompleto(emp.getPersonaId())
                ))
                .orElse(null);
    }

    private String buildNombreCompleto(UUID personaId) {
        if (personaId == null) return null;

        return personaRepository.findById(personaId)
                .map(this::formatNombreCompleto)
                .orElse(null);
    }

    private String formatNombreCompleto(Persona persona) {
        return Stream.of(persona.getNombres(), persona.getPrimerApellido(), persona.getSegundoApellido())
                .filter(s -> s != null && !s.isBlank())
                .map(String::trim)
                .collect(Collectors.joining(" "));
    }
}