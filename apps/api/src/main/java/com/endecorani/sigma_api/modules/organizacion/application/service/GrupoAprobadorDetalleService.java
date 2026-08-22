package com.endecorani.sigma_api.modules.organizacion.application.service;

import com.endecorani.sigma_api.modules.organizacion.application.dto.request.GrupoAprobadorDetalleRequest;
import com.endecorani.sigma_api.modules.organizacion.application.dto.response.GrupoAprobadorDetalleResponse;
import com.endecorani.sigma_api.modules.organizacion.domain.enums.AlcanceAprobador;
import com.endecorani.sigma_api.modules.organizacion.domain.enums.TipoAprobador;
import com.endecorani.sigma_api.modules.organizacion.domain.model.GrupoAprobadorDetalle;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.GrupoAprobadorDetalleRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.GrupoAprobadorRepository;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GrupoAprobadorDetalleService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "orden",
            "tipoAprobador",
            "alcance",
            "createdAt",
            "updatedAt"
    );

    private final GrupoAprobadorDetalleRepository grupoAprobadorDetalleRepository;

    private final GrupoAprobadorRepository grupoAprobadorRepository;

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
        detalle.setUnidadId(request.unidadId());
        detalle.setResponsabilidadId(request.responsabilidadId());
        detalle.setAlcance(request.alcance());
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
        validateAlcance(request.alcance(), request.unidadId());
    }

    private void validateReferenciaPorTipo(
            TipoAprobador tipoAprobador,
            GrupoAprobadorDetalleRequest request
    ) {
        boolean referenciaPresente = switch (tipoAprobador) {
            case EMPLEADO -> request.empleadoId() != null;
            case CARGO -> request.cargoId() != null;
            case UNIDAD -> request.unidadId() != null;
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

    private void validateAlcance(AlcanceAprobador alcance, UUID unidadId) {
        if (alcance == AlcanceAprobador.UNIDAD_ESPECIFICA && unidadId == null) {
            throw new BusinessException(
                    "INVALID_GRUPO_APROBADOR_DETALLE_ALCANCE",
                    "El campo unidadId es obligatorio cuando el alcance es UNIDAD_ESPECIFICA"
            );
        }
    }

    private GrupoAprobadorDetalle toDomain(UUID grupoAprobadorId, GrupoAprobadorDetalleRequest request) {
        return GrupoAprobadorDetalle.builder()
                .grupoAprobadorId(grupoAprobadorId)
                .tipoAprobador(request.tipoAprobador())
                .empleadoId(request.empleadoId())
                .cargoId(request.cargoId())
                .unidadId(request.unidadId())
                .responsabilidadId(request.responsabilidadId())
                .alcance(request.alcance())
                .orden(request.orden())
                .requiereAprobacion(request.requiereAprobacion())
                .build();
    }

    private GrupoAprobadorDetalleResponse toResponse(GrupoAprobadorDetalle domain) {
        AuditoriaResponse auditoria = new AuditoriaResponse(
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );

        return new GrupoAprobadorDetalleResponse(
                domain.getId(),
                domain.getGrupoAprobadorId(),
                domain.getTipoAprobador(),
                domain.getEmpleadoId(),
                domain.getCargoId(),
                domain.getUnidadId(),
                domain.getResponsabilidadId(),
                domain.getAlcance(),
                domain.getOrden(),
                domain.getRequiereAprobacion(),
                auditoria
        );
    }
}
