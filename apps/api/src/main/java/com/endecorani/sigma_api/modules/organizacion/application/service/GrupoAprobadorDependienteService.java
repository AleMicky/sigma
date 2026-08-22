package com.endecorani.sigma_api.modules.organizacion.application.service;

import com.endecorani.sigma_api.modules.organizacion.application.dto.request.GrupoAprobadorDependienteRequest;
import com.endecorani.sigma_api.modules.organizacion.application.dto.response.EmpleadoResumenResponse;
import com.endecorani.sigma_api.modules.organizacion.application.dto.response.GrupoAprobadorDependienteResponse;
import com.endecorani.sigma_api.modules.organizacion.domain.model.GrupoAprobadorDependiente;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Persona;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.GrupoAprobadorDependienteRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.GrupoAprobadorRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.PersonaRepository;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import com.endecorani.sigma_api.shared.application.dto.response.CatalogoResumenResponse;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaMapper;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class GrupoAprobadorDependienteService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "createdAt",
            "updatedAt"
    );

    private final GrupoAprobadorDependienteRepository grupoAprobadorDependienteRepository;

    private final GrupoAprobadorRepository grupoAprobadorRepository;

    private final EmpleadoRepository empleadoRepository;

    private final PersonaRepository personaRepository;

    @Transactional
    public GrupoAprobadorDependienteResponse create(
            UUID grupoAprobadorId,
            GrupoAprobadorDependienteRequest request
    ) {
        requireGrupoAprobadorExists(grupoAprobadorId);
        requireEmpleadoExists(request.empleadoId());
        requireNotDuplicated(grupoAprobadorId, request.empleadoId());

        GrupoAprobadorDependiente dependiente = toDomain(grupoAprobadorId, request);
        return toResponse(grupoAprobadorDependienteRepository.save(dependiente));
    }

    @Transactional
    public GrupoAprobadorDependienteResponse update(
            UUID grupoAprobadorId,
            UUID id,
            GrupoAprobadorDependienteRequest request
    ) {
        GrupoAprobadorDependiente dependiente = findDependienteOfGrupo(grupoAprobadorId, id);
        requireEmpleadoExists(request.empleadoId());

        if (!dependiente.getEmpleadoId().equals(request.empleadoId())) {
            requireNotDuplicatedOnUpdate(grupoAprobadorId, request.empleadoId(), id);
        }

        dependiente.setEmpleadoId(request.empleadoId());

        return toResponse(grupoAprobadorDependienteRepository.save(dependiente));
    }

    @Transactional(readOnly = true)
    public GrupoAprobadorDependienteResponse findById(UUID grupoAprobadorId, UUID id) {
        return toResponse(findDependienteOfGrupo(grupoAprobadorId, id));
    }

    @Transactional(readOnly = true)
    public PageResponse<GrupoAprobadorDependienteResponse> findAllByGrupoAprobador(
            UUID grupoAprobadorId,
            PageRequestDto pageRequest
    ) {
        requireGrupoAprobadorExists(grupoAprobadorId);

        return PageResponse.from(
                grupoAprobadorDependienteRepository.findByGrupoAprobadorId(
                        grupoAprobadorId,
                        pageRequest.toPageable(SORT_FIELDS)
                ),
                this::toResponse
        );
    }

    @Transactional
    public void delete(UUID grupoAprobadorId, UUID id) {
        findDependienteOfGrupo(grupoAprobadorId, id);
        grupoAprobadorDependienteRepository.deleteById(id);
    }

    private GrupoAprobadorDependiente findDependienteOfGrupo(UUID grupoAprobadorId, UUID id) {
        GrupoAprobadorDependiente dependiente = grupoAprobadorDependienteRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("GrupoAprobadorDependiente", id)
                );

        if (!dependiente.getGrupoAprobadorId().equals(grupoAprobadorId)) {
            throw new ResourceNotFoundException("GrupoAprobadorDependiente", id);
        }

        return dependiente;
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

    private void requireNotDuplicated(UUID grupoAprobadorId, UUID empleadoId) {
        if (grupoAprobadorDependienteRepository
                .existsByGrupoAprobadorIdAndEmpleadoId(grupoAprobadorId, empleadoId)) {
            throw new BusinessException(
                    "GRUPO_APROBADOR_DEPENDIENTE_DUPLICADO",
                    "El empleado %s ya pertenece al grupo aprobador %s"
                            .formatted(empleadoId, grupoAprobadorId)
            );
        }
    }

    private void requireNotDuplicatedOnUpdate(UUID grupoAprobadorId, UUID empleadoId, UUID id) {
        if (grupoAprobadorDependienteRepository
                .existsByGrupoAprobadorIdAndEmpleadoIdAndIdNot(grupoAprobadorId, empleadoId, id)) {
            throw new BusinessException(
                    "GRUPO_APROBADOR_DEPENDIENTE_DUPLICADO",
                    "El empleado %s ya pertenece al grupo aprobador %s"
                            .formatted(empleadoId, grupoAprobadorId)
            );
        }
    }

    private GrupoAprobadorDependiente toDomain(UUID grupoAprobadorId, GrupoAprobadorDependienteRequest request) {
        return GrupoAprobadorDependiente.builder()
                .grupoAprobadorId(grupoAprobadorId)
                .empleadoId(request.empleadoId())
                .build();
    }

    private GrupoAprobadorDependienteResponse toResponse(GrupoAprobadorDependiente domain) {
        return new GrupoAprobadorDependienteResponse(
                domain.getId(),
                buildGrupoAprobadorInfo(domain.getGrupoAprobadorId()),
                buildEmpleadoInfo(domain.getEmpleadoId()),
                AuditoriaMapper.from(domain)
        );
    }

    private CatalogoResumenResponse buildGrupoAprobadorInfo(UUID grupoAprobadorId) {
        if (grupoAprobadorId == null) {
            return null;
        }

        return grupoAprobadorRepository.findById(grupoAprobadorId)
                .map(grupo -> new CatalogoResumenResponse(
                        grupo.getId(),
                        grupo.getCodigo(),
                        grupo.getNombre()
                ))
                .orElse(null);
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
}
