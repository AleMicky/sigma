package com.endecorani.sigma_api.modules.inventarios.application.service;

import com.endecorani.sigma_api.modules.inventarios.application.dto.request.CategoriaInsumoRequest;
import com.endecorani.sigma_api.modules.inventarios.application.dto.response.CategoriaInsumoResponse;
import com.endecorani.sigma_api.modules.inventarios.domain.model.CategoriaInsumo;
import com.endecorani.sigma_api.modules.inventarios.domain.repository.CategoriaInsumoRepository;
import com.endecorani.sigma_api.modules.inventarios.domain.repository.TipoInsumoRepository;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaMapper;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoriaInsumoService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "nombre",
            "descripcion",
            "createdAt",
            "updatedAt"
    );

    private final CategoriaInsumoRepository categoriaInsumoRepository;
    private final TipoInsumoRepository tipoInsumoRepository;

    @Transactional(readOnly = true)
    public PageResponse<CategoriaInsumoResponse> findAll(PageRequestDto pageRequest) {
        var page = categoriaInsumoRepository.findAll(pageRequest.toPageable(SORT_FIELDS));
        return PageResponse.from(page, this::toResponse);
    }

    @Transactional(readOnly = true)
    public CategoriaInsumoResponse findById(UUID id) {
        CategoriaInsumo domain = categoriaInsumoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría de insumo", id));
        return toResponse(domain);
    }

    @Transactional(readOnly = true)
    public PageResponse<CategoriaInsumoResponse> find(
            UUID tipoInsumoId,
            String query,
            PageRequestDto pageRequest
    ) {
        if (tipoInsumoId != null) {
            return findByTipoInsumoId(tipoInsumoId, query, pageRequest);
        }

        String normalized = StringUtils.normalize(query);
        if (normalized == null) {
            return findAll(pageRequest);
        }

        return PageResponse.from(
                categoriaInsumoRepository.search(
                        normalized,
                        pageRequest.toPageable(SORT_FIELDS)
                ),
                this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<CategoriaInsumoResponse> findByTipoInsumoId(
            UUID tipoInsumoId,
            String query,
            PageRequestDto pageRequest
    ) {
        requireTipoInsumoExists(tipoInsumoId);

        String normalized = StringUtils.normalize(query);
        var pageable = pageRequest.toPageable(SORT_FIELDS);

        if (normalized == null) {
            return PageResponse.from(
                    categoriaInsumoRepository.findByTipoInsumoId(
                            tipoInsumoId,
                            pageable
                    ),
                    this::toResponse
            );
        }

        return PageResponse.from(
                categoriaInsumoRepository.searchByTipoInsumoId(
                        tipoInsumoId,
                        normalized,
                        pageable
                ),
                this::toResponse
        );
    }

    @Transactional
    public CategoriaInsumoResponse create(CategoriaInsumoRequest request) {
        requireTipoInsumoExists(request.tipoInsumoId());
        String codigo = StringUtils.normalize(request.codigo());
        validateUniqueCodigoForCreate(request.tipoInsumoId(), codigo);

        CategoriaInsumo domain = CategoriaInsumo.builder()
                .tipoInsumoId(request.tipoInsumoId())
                .codigo(codigo)
                .nombre(StringUtils.normalize(request.nombre()))
                .descripcion(StringUtils.normalize(request.descripcion()))
                .build();

        CategoriaInsumo saved = categoriaInsumoRepository.save(domain);
        return toResponse(saved);
    }

    @Transactional
    public CategoriaInsumoResponse update(UUID id, CategoriaInsumoRequest request) {
        CategoriaInsumo domain = categoriaInsumoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría de insumo", id));

        requireTipoInsumoExists(request.tipoInsumoId());
        String codigo = StringUtils.normalize(request.codigo());
        validateUniqueCodigoForUpdate(
                request.tipoInsumoId(),
                codigo,
                id
        );

        domain.setTipoInsumoId(request.tipoInsumoId());
        domain.setCodigo(codigo);
        domain.setNombre(StringUtils.normalize(request.nombre()));
        domain.setDescripcion(StringUtils.normalize(request.descripcion()));

        CategoriaInsumo updated = categoriaInsumoRepository.save(domain);
        return toResponse(updated);
    }

    @Transactional
    public void delete(UUID id) {
        if (!categoriaInsumoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Categoría de insumo", id);
        }
        categoriaInsumoRepository.deleteById(id);
    }

    private CategoriaInsumoResponse toResponse(CategoriaInsumo domain) {
        CategoriaInsumoResponse.TipoInsumoInfo tipoInsumoInfo = null;
        if (domain.getTipoInsumoId() != null) {
            tipoInsumoInfo = tipoInsumoRepository.findById(domain.getTipoInsumoId())
                    .map(ti -> new CategoriaInsumoResponse.TipoInsumoInfo(
                            ti.getId(),
                            ti.getCodigo(),
                            ti.getNombre()
                    ))
                    .orElse(null);
        }

        return new CategoriaInsumoResponse(
                domain.getId(),
                tipoInsumoInfo,
                domain.getCodigo(),
                domain.getNombre(),
                domain.getDescripcion(),
                AuditoriaMapper.from(domain)
        );
    }

    private void requireTipoInsumoExists(UUID tipoInsumoId) {
        if (!tipoInsumoRepository.existsById(tipoInsumoId)) {
            throw new ResourceNotFoundException("Tipo de insumo", tipoInsumoId);
        }
    }

    private void validateUniqueCodigoForCreate(UUID tipoInsumoId, String codigo) {
        if (categoriaInsumoRepository.existsByTipoInsumoIdAndCodigoIgnoreCase(
                tipoInsumoId,
                codigo
        )) {
            throw new ConflictException(
                    "CATEGORIA_INSUMO_ALREADY_EXISTS",
                    "Ya existe una categoría de insumo con el código '%s' para este tipo de insumo"
                            .formatted(codigo)
            );
        }
    }

    private void validateUniqueCodigoForUpdate(
            UUID tipoInsumoId,
            String codigo,
            UUID currentId
    ) {
        if (categoriaInsumoRepository.existsByTipoInsumoIdAndCodigoIgnoreCaseAndIdNot(
                tipoInsumoId,
                codigo,
                currentId
        )) {
            throw new ConflictException(
                    "CATEGORIA_INSUMO_ALREADY_EXISTS",
                    "Ya existe otra categoría de insumo con el código '%s' para este tipo de insumo"
                            .formatted(codigo)
            );
        }
    }
}
