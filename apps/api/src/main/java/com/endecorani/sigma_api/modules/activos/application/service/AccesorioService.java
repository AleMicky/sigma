package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.request.AccesorioRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.AccesorioResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.Accesorio;
import com.endecorani.sigma_api.modules.activos.domain.repository.AccesorioRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccesorioService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "tipoActivoId",
            "codigo",
            "nombre",
            "descripcion",
            "createdAt",
            "updatedAt"
    );

    private final AccesorioRepository accesorioRepository;
    private final TipoActivoRepository tipoActivoRepository;

    @Transactional
    public AccesorioResponse create(AccesorioRequest request) {
        requireTipoActivoExists(request.tipoActivoId());

        String codigo = StringUtils.normalize(request.codigo());
        validateUniqueCodigoForCreate(request.tipoActivoId(), codigo);

        Accesorio domain = Accesorio.builder()
                .tipoActivoId(request.tipoActivoId())
                .codigo(codigo)
                .nombre(StringUtils.normalize(request.nombre()))
                .descripcion(StringUtils.normalize(request.descripcion()))
                .build();

        return toResponse(accesorioRepository.save(domain));
    }

    @Transactional
    public AccesorioResponse update(
            UUID id,
            AccesorioRequest request
    ) {
        requireTipoActivoExists(request.tipoActivoId());

        Accesorio domain = findDomainById(id);

        String codigo = StringUtils.normalize(request.codigo());
        validateUniqueCodigoForUpdate(
                request.tipoActivoId(),
                codigo,
                id
        );

        domain.setTipoActivoId(request.tipoActivoId());
        domain.setCodigo(codigo);
        domain.setNombre(StringUtils.normalize(request.nombre()));
        domain.setDescripcion(StringUtils.normalize(request.descripcion()));

        return toResponse(accesorioRepository.save(domain));
    }

    @Transactional(readOnly = true)
    public AccesorioResponse findById(UUID id) {
        return toResponse(findDomainById(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<AccesorioResponse> findAll(
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(query);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        if (normalized == null) {
            return PageResponse.from(
                    accesorioRepository.findAll(pageable),
                    this::toResponse
            );
        }

        return PageResponse.from(
                accesorioRepository.search(normalized, pageable),
                this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<AccesorioResponse> findByTipoActivoId(
            UUID tipoActivoId,
            String query,
            PageRequestDto pageRequest
    ) {
        requireTipoActivoExists(tipoActivoId);

        String normalized = StringUtils.normalize(query);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        if (normalized == null) {
            return PageResponse.from(
                    accesorioRepository.findByTipoActivoId(
                            tipoActivoId,
                            pageable
                    ),
                    this::toResponse
            );
        }

        return PageResponse.from(
                accesorioRepository.searchByTipoActivoId(
                        tipoActivoId,
                        normalized,
                        pageable
                ),
                this::toResponse
        );
    }

    @Transactional
    public void delete(UUID id) {
        findDomainById(id);
        accesorioRepository.deleteById(id);
    }

    private Accesorio findDomainById(UUID id) {
        return accesorioRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Accesorio", id)
                );
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
        if (accesorioRepository.existsByTipoActivoIdAndCodigoIgnoreCase(
                tipoActivoId,
                codigo
        )) {
            throw new ConflictException(
                    "ACCESORIO_ALREADY_EXISTS",
                    "Ya existe un accesorio con el código '%s' para este tipo de activo"
                            .formatted(codigo)
            );
        }
    }

    private void validateUniqueCodigoForUpdate(
            UUID tipoActivoId,
            String codigo,
            UUID currentId
    ) {
        if (accesorioRepository.existsByTipoActivoIdAndCodigoIgnoreCaseAndIdNot(
                tipoActivoId,
                codigo,
                currentId
        )) {
            throw new ConflictException(
                    "ACCESORIO_ALREADY_EXISTS",
                    "Ya existe otro accesorio con el código '%s' para este tipo de activo"
                            .formatted(codigo)
            );
        }
    }

    private AccesorioResponse toResponse(Accesorio domain) {
        AccesorioResponse.CatalogoInfo catalogoInfo = null;
        if (domain.getTipoActivoId() != null) {
            catalogoInfo = tipoActivoRepository.findById(domain.getTipoActivoId())
                    .map(ta -> new AccesorioResponse.CatalogoInfo(
                            ta.getId(),
                            null,
                            ta.getNombre()
                    ))
                    .orElse(null);
        }

        AuditoriaResponse auditoria = new AuditoriaResponse(
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );

        return new AccesorioResponse(
                domain.getId(),
                catalogoInfo,
                domain.getCodigo(),
                domain.getNombre(),
                domain.getDescripcion(),
                auditoria
        );
    }
}
