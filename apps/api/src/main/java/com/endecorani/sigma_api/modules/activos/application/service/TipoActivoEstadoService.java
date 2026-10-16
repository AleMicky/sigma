package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.request.TipoActivoEstadoRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.TipoActivoEstadoResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.TipoActivoEstado;
import com.endecorani.sigma_api.modules.activos.domain.repository.EstadoOperativoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoEstadoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.shared.application.crud.AbstractCrudService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TipoActivoEstadoService extends AbstractCrudService<
        TipoActivoEstado,
        TipoActivoEstadoRequest,
        TipoActivoEstadoResponse,
        UUID
        > {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "tipoActivoId",
            "estadoOperativoId",
            "predeterminado",
            "createdAt",
            "updatedAt"
    );

    private final TipoActivoEstadoRepository tipoActivoEstadoRepository;
    private final TipoActivoRepository tipoActivoRepository;
    private final EstadoOperativoRepository estadoOperativoRepository;

    @Override
    protected CrudRepository<TipoActivoEstado, UUID> repository() {
        return tipoActivoEstadoRepository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Transactional(readOnly = true)
    public PageResponse<TipoActivoEstadoResponse> findByTipoActivoId(
            UUID tipoActivoId,
            PageRequestDto pageRequest
    ) {
        requireTipoActivoExists(tipoActivoId);
        return PageResponse.from(
                tipoActivoEstadoRepository.findByTipoActivoId(
                        tipoActivoId,
                        pageRequest.toPageable(allowedSortFields())
                ),
                this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<TipoActivoEstadoResponse> findByEstadoOperativoId(
            UUID estadoOperativoId,
            PageRequestDto pageRequest
    ) {
        requireEstadoOperativoExists(estadoOperativoId);
        return PageResponse.from(
                tipoActivoEstadoRepository.findByEstadoOperativoId(
                        estadoOperativoId,
                        pageRequest.toPageable(allowedSortFields())
                ),
                this::toResponse
        );
    }

    @Override
    protected TipoActivoEstado toDomain(TipoActivoEstadoRequest request) {
        requireTipoActivoExists(request.tipoActivoId());
        requireEstadoOperativoExists(request.estadoOperativoId());
        validateUniqueRelationForCreate(request.tipoActivoId(), request.estadoOperativoId());

        boolean predeterminado = Boolean.TRUE.equals(request.predeterminado());
        validatePredeterminadoForCreate(request.tipoActivoId(), predeterminado);

        return TipoActivoEstado.builder()
                .tipoActivoId(request.tipoActivoId())
                .estadoOperativoId(request.estadoOperativoId())
                .predeterminado(predeterminado)
                .build();
    }

    @Override
    protected void updateDomain(
            TipoActivoEstado domain,
            TipoActivoEstadoRequest request
    ) {
        requireTipoActivoExists(request.tipoActivoId());
        requireEstadoOperativoExists(request.estadoOperativoId());
        validateUniqueRelationForUpdate(
                request.tipoActivoId(),
                request.estadoOperativoId(),
                domain.getId()
        );

        boolean predeterminado = Boolean.TRUE.equals(request.predeterminado());
        validatePredeterminadoForUpdate(
                request.tipoActivoId(),
                predeterminado,
                domain.getId()
        );

        domain.setTipoActivoId(request.tipoActivoId());
        domain.setEstadoOperativoId(request.estadoOperativoId());
        domain.setPredeterminado(predeterminado);
    }

    @Override
    protected TipoActivoEstadoResponse toResponse(TipoActivoEstado domain) {
        return new TipoActivoEstadoResponse(
                domain.getId(),
                domain.getTipoActivoId(),
                domain.getEstadoOperativoId(),
                domain.getPredeterminado(),
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );
    }

    @Override
    protected String resourceName() {
        return "Relación tipo de activo - estado operativo";
    }

    private void requireTipoActivoExists(UUID tipoActivoId) {
        if (tipoActivoId == null || !tipoActivoRepository.existsById(tipoActivoId)) {
            throw new ResourceNotFoundException("Tipo de activo", tipoActivoId);
        }
    }

    private void requireEstadoOperativoExists(UUID estadoOperativoId) {
        if (estadoOperativoId == null || !estadoOperativoRepository.existsById(estadoOperativoId)) {
            throw new ResourceNotFoundException("Estado operativo", estadoOperativoId);
        }
    }

    private void validateUniqueRelationForCreate(UUID tipoActivoId, UUID estadoOperativoId) {
        if (tipoActivoEstadoRepository.existsByTipoActivoIdAndEstadoOperativoId(tipoActivoId, estadoOperativoId)) {
            throw new ConflictException(
                    "TIPO_ACTIVO_ESTADO_ALREADY_EXISTS",
                    "El estado operativo ya está asociado a este tipo de activo"
            );
        }
    }

    private void validateUniqueRelationForUpdate(
            UUID tipoActivoId,
            UUID estadoOperativoId,
            UUID currentId
    ) {
        if (tipoActivoEstadoRepository.existsByTipoActivoIdAndEstadoOperativoIdAndIdNot(
                tipoActivoId,
                estadoOperativoId,
                currentId
        )) {
            throw new ConflictException(
                    "TIPO_ACTIVO_ESTADO_ALREADY_EXISTS",
                    "El estado operativo ya está asociado a este tipo de activo"
            );
        }
    }

    private void validatePredeterminadoForCreate(UUID tipoActivoId, boolean predeterminado) {
        if (predeterminado && tipoActivoEstadoRepository.existsByTipoActivoIdAndPredeterminadoTrue(tipoActivoId)) {
            throw new ConflictException(
                    "DEFAULT_ESTADO_OPERATIVO_ALREADY_EXISTS",
                    "Ya existe un estado operativo predeterminado para este tipo de activo"
            );
        }
    }

    private void validatePredeterminadoForUpdate(
            UUID tipoActivoId,
            boolean predeterminado,
            UUID currentId
    ) {
        if (predeterminado && tipoActivoEstadoRepository.existsByTipoActivoIdAndPredeterminadoTrueAndIdNot(
                tipoActivoId,
                currentId
        )) {
            throw new ConflictException(
                    "DEFAULT_ESTADO_OPERATIVO_ALREADY_EXISTS",
                    "Ya existe otro estado operativo predeterminado para este tipo de activo"
            );
        }
    }
}
