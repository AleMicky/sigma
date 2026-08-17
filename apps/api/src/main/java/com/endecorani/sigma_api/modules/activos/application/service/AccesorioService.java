package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.request.AccesorioRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.AccesorioResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.Accesorio;
import com.endecorani.sigma_api.modules.activos.domain.repository.AccesorioRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.CategoriaRepository;
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
            "categoriaId",
            "codigo",
            "nombre",
            "descripcion",
            "createdAt",
            "updatedAt"
    );

    private final AccesorioRepository accesorioRepository;
    private final CategoriaRepository categoriaRepository;

    @Transactional
    public AccesorioResponse create(AccesorioRequest request) {
        requireCategoriaExists(request.categoriaId());

        String codigo = StringUtils.normalize(request.codigo());
        validateUniqueCodigoForCreate(request.categoriaId(), codigo);

        Accesorio domain = Accesorio.builder()
                .categoriaId(request.categoriaId())
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
        requireCategoriaExists(request.categoriaId());

        Accesorio domain = findDomainById(id);

        String codigo = StringUtils.normalize(request.codigo());
        validateUniqueCodigoForUpdate(
                request.categoriaId(),
                codigo,
                id
        );

        domain.setCategoriaId(request.categoriaId());
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
    public PageResponse<AccesorioResponse> findByCategoriaId(
            UUID categoriaId,
            String query,
            PageRequestDto pageRequest
    ) {
        requireCategoriaExists(categoriaId);

        String normalized = StringUtils.normalize(query);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        if (normalized == null) {
            return PageResponse.from(
                    accesorioRepository.findByCategoriaId(
                            categoriaId,
                            pageable
                    ),
                    this::toResponse
            );
        }

        return PageResponse.from(
                accesorioRepository.searchByCategoriaId(
                        categoriaId,
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

    private void requireCategoriaExists(UUID categoriaId) {
        if (!categoriaRepository.existsById(categoriaId)) {
            throw new ResourceNotFoundException("Categoría", categoriaId);
        }
    }

    private void validateUniqueCodigoForCreate(
            UUID categoriaId,
            String codigo
    ) {
        if (accesorioRepository.existsByCategoriaIdAndCodigoIgnoreCase(
                categoriaId,
                codigo
        )) {
            throw new ConflictException(
                    "ACCESORIO_ALREADY_EXISTS",
                    "Ya existe un accesorio con el código '%s' para esta categoría"
                            .formatted(codigo)
            );
        }
    }

    private void validateUniqueCodigoForUpdate(
            UUID categoriaId,
            String codigo,
            UUID currentId
    ) {
        if (accesorioRepository.existsByCategoriaIdAndCodigoIgnoreCaseAndIdNot(
                categoriaId,
                codigo,
                currentId
        )) {
            throw new ConflictException(
                    "ACCESORIO_ALREADY_EXISTS",
                    "Ya existe otro accesorio con el código '%s' para esta categoría"
                            .formatted(codigo)
            );
        }
    }

    private AccesorioResponse toResponse(Accesorio domain) {
        AccesorioResponse.CatalogoInfo catalogoInfo = null;
        if (domain.getCategoriaId() != null) {
            catalogoInfo = categoriaRepository.findById(domain.getCategoriaId())
                    .map(cat -> new AccesorioResponse.CatalogoInfo(
                            cat.getId(),
                            cat.getCodigo(),
                            cat.getNombre()
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
