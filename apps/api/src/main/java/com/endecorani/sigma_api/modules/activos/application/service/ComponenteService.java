package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.request.ComponenteRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.ComponenteResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.Componente;
import com.endecorani.sigma_api.modules.activos.domain.repository.ComponenteRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.shared.application.crud.AbstractCrudService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ComponenteService extends AbstractCrudService<
        Componente,
        ComponenteRequest,
        ComponenteResponse,
        UUID
        > {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "nombre",
            "descripcion",
            "activo",
            "createdAt",
            "updatedAt"
    );

    private final ComponenteRepository componenteRepository;
    private final TipoActivoRepository tipoActivoRepository;

    @Override
    protected CrudRepository<Componente, UUID> repository() {
        return componenteRepository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Transactional(readOnly = true)
    public PageResponse<ComponenteResponse> findByTipoActivoId(
            UUID tipoActivoId,
            String query,
            PageRequestDto pageRequest
    ) {
        requireTipoActivoExists(tipoActivoId);

        String normalized = StringUtils.normalize(query);
        var pageable = pageRequest.toPageable(allowedSortFields());

        if (normalized == null) {
            return PageResponse.from(
                    componenteRepository.findByTipoActivoId(
                            tipoActivoId,
                            pageable
                    ),
                    this::toResponse
            );
        }

        return PageResponse.from(
                componenteRepository.searchByTipoActivoId(
                        tipoActivoId,
                        normalized,
                        pageable
                ),
                this::toResponse
        );
    }

    @Override
    protected Componente toDomain(ComponenteRequest request) {
        requireTipoActivoExists(request.tipoActivoId());

        String codigo = StringUtils.normalize(request.codigo());
        validateUniqueCodigoForCreate(request.tipoActivoId(), codigo);

        return Componente.builder()
                .tipoActivoId(request.tipoActivoId())
                .codigo(codigo)
                .nombre(StringUtils.normalize(request.nombre()))
                .descripcion(StringUtils.normalize(request.descripcion()))
                .activo(resolveActivo(request.activo()))
                .build();
    }

    @Override
    protected void updateDomain(
            Componente domain,
            ComponenteRequest request
    ) {
        requireTipoActivoExists(request.tipoActivoId());

        String codigo = StringUtils.normalize(request.codigo());
        validateUniqueCodigoForUpdate(
                request.tipoActivoId(),
                codigo,
                domain.getId()
        );

        domain.setTipoActivoId(request.tipoActivoId());
        domain.setCodigo(codigo);
        domain.setNombre(StringUtils.normalize(request.nombre()));
        domain.setDescripcion(StringUtils.normalize(request.descripcion()));
        domain.setActivo(resolveActivo(request.activo()));
    }

    @Override
    protected ComponenteResponse toResponse(Componente domain) {
        return new ComponenteResponse(
                domain.getId(),
                domain.getTipoActivoId(),
                domain.getCodigo(),
                domain.getNombre(),
                domain.getDescripcion(),
                domain.getActivo(),
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );
    }

    @Override
    protected String resourceName() {
        return "Componente";
    }

    @Transactional
    public ComponenteResponse toggleActivo(UUID id, Boolean activo) {
        Componente domain = findDomainById(id);
        domain.setActivo(activo);
        Componente updated = componenteRepository.save(domain);
        return toResponse(updated);
    }

    private void requireTipoActivoExists(UUID tipoActivoId) {
        if (!tipoActivoRepository.existsById(tipoActivoId)) {
            throw new ResourceNotFoundException("Tipo de activo", tipoActivoId);
        }
    }

    private void validateUniqueCodigoForCreate(
            UUID tipoActivoId,
            String codigo
    ) {
        if (componenteRepository.existsByTipoActivoIdAndCodigoIgnoreCase(
                tipoActivoId,
                codigo
        )) {
            throw new ConflictException(
                    "COMPONENTE_ALREADY_EXISTS",
                    "Ya existe un componente con el código '%s' en este tipo de activo"
                            .formatted(codigo)
            );
        }
    }

    private void validateUniqueCodigoForUpdate(
            UUID tipoActivoId,
            String codigo,
            UUID currentId
    ) {
        if (componenteRepository.existsByTipoActivoIdAndCodigoIgnoreCaseAndIdNot(
                tipoActivoId,
                codigo,
                currentId
        )) {
            throw new ConflictException(
                    "COMPONENTE_ALREADY_EXISTS",
                    "Ya existe otro componente con el código '%s' en este tipo de activo"
                            .formatted(codigo)
            );
        }
    }

    private Boolean resolveActivo(Boolean value) {
        return value != null ? value : Boolean.TRUE;
    }
}
