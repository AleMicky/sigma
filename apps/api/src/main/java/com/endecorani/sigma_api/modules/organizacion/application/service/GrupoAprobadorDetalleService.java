package com.endecorani.sigma_api.modules.organizacion.application.service;

import com.endecorani.sigma_api.modules.organizacion.application.dto.request.GrupoAprobadorDetalleRequest;
import com.endecorani.sigma_api.modules.organizacion.application.dto.response.EmpleadoResumenResponse;
import com.endecorani.sigma_api.modules.organizacion.application.dto.response.GrupoAprobadorDetalleResponse;
import com.endecorani.sigma_api.modules.organizacion.domain.enums.TipoAprobador;
import com.endecorani.sigma_api.modules.organizacion.domain.model.GrupoAprobadorDetalle;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Persona;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.CargoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.GrupoAprobadorDetalleRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.GrupoAprobadorRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.PersonaRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.ResponsabilidadRepository;
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
public class GrupoAprobadorDetalleService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "orden",
            "tipoAprobador",
            "createdAt",
            "updatedAt"
    );

    private final GrupoAprobadorDetalleRepository grupoAprobadorDetalleRepository;

    private final GrupoAprobadorRepository grupoAprobadorRepository;

    private final EmpleadoRepository empleadoRepository;

    private final PersonaRepository personaRepository;

    private final CargoRepository cargoRepository;

    private final ResponsabilidadRepository responsabilidadRepository;

    @Transactional
    public GrupoAprobadorDetalleResponse create(
            UUID grupoAprobadorId,
            GrupoAprobadorDetalleRequest request
    ) {
        requireGrupoAprobadorExists(grupoAprobadorId);
        validateRequest(request);

        GrupoAprobadorDetalle detalle = toDomain(grupoAprobadorId, request);
        return toResponse(grupoAprobadorDetalleRepository.save(detalle));
    }

    @Transactional
    public GrupoAprobadorDetalleResponse update(
            UUID grupoAprobadorId,
            UUID id,
            GrupoAprobadorDetalleRequest request
    ) {
        GrupoAprobadorDetalle detalle = findDetalleOfGrupo(grupoAprobadorId, id);
        validateRequest(request);

        detalle.setTipoAprobador(request.tipoAprobador());
        detalle.setEmpleadoId(request.empleadoId());
        detalle.setCargoId(request.cargoId());
        detalle.setResponsabilidadId(request.responsabilidadId());
        detalle.setOrden(request.orden());
        detalle.setRequiereAprobacion(request.requiereAprobacion());

        return toResponse(grupoAprobadorDetalleRepository.save(detalle));
    }

    @Transactional(readOnly = true)
    public GrupoAprobadorDetalleResponse findById(UUID grupoAprobadorId, UUID id) {
        return toResponse(findDetalleOfGrupo(grupoAprobadorId, id));
    }

    @Transactional(readOnly = true)
    public PageResponse<GrupoAprobadorDetalleResponse> findAllByGrupoAprobador(
            UUID grupoAprobadorId,
            PageRequestDto pageRequest
    ) {
        requireGrupoAprobadorExists(grupoAprobadorId);

        return PageResponse.from(
                grupoAprobadorDetalleRepository.findByGrupoAprobadorId(
                        grupoAprobadorId,
                        pageRequest.toPageable(SORT_FIELDS)
                ),
                this::toResponse
        );
    }

    @Transactional
    public void delete(UUID grupoAprobadorId, UUID id) {
        findDetalleOfGrupo(grupoAprobadorId, id);
        grupoAprobadorDetalleRepository.deleteById(id);
    }

    private GrupoAprobadorDetalle findDetalleOfGrupo(UUID grupoAprobadorId, UUID id) {
        GrupoAprobadorDetalle detalle = grupoAprobadorDetalleRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("GrupoAprobadorDetalle", id)
                );

        if (!detalle.getGrupoAprobadorId().equals(grupoAprobadorId)) {
            throw new ResourceNotFoundException("GrupoAprobadorDetalle", id);
        }

        return detalle;
    }

    private void requireGrupoAprobadorExists(UUID grupoAprobadorId) {
        if (!grupoAprobadorRepository.existsById(grupoAprobadorId)) {
            throw new ResourceNotFoundException("GrupoAprobador", grupoAprobadorId);
        }
    }

    private void validateRequest(GrupoAprobadorDetalleRequest request) {
        validateReferenciaPorTipo(request.tipoAprobador(), request);
    }

    private void validateReferenciaPorTipo(
            TipoAprobador tipoAprobador,
            GrupoAprobadorDetalleRequest request
    ) {
        boolean referenciaPresente = switch (tipoAprobador) {
            case EMPLEADO -> request.empleadoId() != null;
            case CARGO -> request.cargoId() != null;
            case RESPONSABILIDAD -> request.responsabilidadId() != null;
        };

        if (!referenciaPresente) {
            throw new BusinessException(
                    "INVALID_GRUPO_APROBADOR_DETALLE_REFERENCIA",
                    "El identificador correspondiente al tipo de aprobador %s es obligatorio"
                            .formatted(tipoAprobador)
            );
        }
    }

    private GrupoAprobadorDetalle toDomain(UUID grupoAprobadorId, GrupoAprobadorDetalleRequest request) {
        return GrupoAprobadorDetalle.builder()
                .grupoAprobadorId(grupoAprobadorId)
                .tipoAprobador(request.tipoAprobador())
                .empleadoId(request.empleadoId())
                .cargoId(request.cargoId())
                .responsabilidadId(request.responsabilidadId())
                .orden(request.orden())
                .requiereAprobacion(request.requiereAprobacion())
                .build();
    }

    private GrupoAprobadorDetalleResponse toResponse(GrupoAprobadorDetalle domain) {


        return new GrupoAprobadorDetalleResponse(
                domain.getId(),
                buildGrupoAprobadorInfo(domain.getGrupoAprobadorId()),
                domain.getTipoAprobador(),
                buildEmpleadoInfo(domain.getEmpleadoId()),
                buildCargoInfo(domain.getCargoId()),
                buildResponsabilidadInfo(domain.getResponsabilidadId()),
                domain.getOrden(),
                domain.getRequiereAprobacion(),
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

    private CatalogoResumenResponse buildCargoInfo(UUID cargoId) {
        if (cargoId == null) {
            return null;
        }

        return cargoRepository.findById(cargoId)
                .map(cargo -> new CatalogoResumenResponse(cargo.getId(), cargo.getCodigo(), cargo.getNombre()))
                .orElse(null);
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
