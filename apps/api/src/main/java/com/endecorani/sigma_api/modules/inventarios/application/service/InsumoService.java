package com.endecorani.sigma_api.modules.inventarios.application.service;

import com.endecorani.sigma_api.modules.inventarios.application.dto.request.InsumoRequest;
import com.endecorani.sigma_api.modules.inventarios.application.dto.response.InsumoResponse;
import com.endecorani.sigma_api.modules.inventarios.domain.model.CategoriaInsumo;
import com.endecorani.sigma_api.modules.inventarios.domain.model.Insumo;
import com.endecorani.sigma_api.modules.inventarios.domain.repository.CategoriaInsumoRepository;
import com.endecorani.sigma_api.modules.inventarios.domain.repository.InsumoRepository;
import com.endecorani.sigma_api.modules.parametros.domain.model.UnidadMedida;
import com.endecorani.sigma_api.modules.parametros.domain.repository.UnidadMedidaRepository;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaMapper;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InsumoService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "nombre",
            "descripcion",
            "marca",
            "createdAt",
            "updatedAt"
    );

    private final InsumoRepository insumoRepository;
    private final CategoriaInsumoRepository categoriaInsumoRepository;
    private final UnidadMedidaRepository unidadMedidaRepository;

    @Transactional(readOnly = true)
    public PageResponse<InsumoResponse> findAll(PageRequestDto pageRequest) {
        Page<Insumo> page = insumoRepository.findAll(pageRequest.toPageable(SORT_FIELDS));
        return toPageResponse(page);
    }

    @Transactional(readOnly = true)
    public InsumoResponse findById(UUID id) {
        Insumo domain = insumoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Insumo", id));
        return toResponse(domain);
    }

    @Transactional(readOnly = true)
    public PageResponse<InsumoResponse> search(
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(query);

        if (normalized == null) {
            return findAll(pageRequest);
        }

        Page<Insumo> page = insumoRepository.search(
                normalized,
                pageRequest.toPageable(SORT_FIELDS)
        );
        return toPageResponse(page);
    }

    @Transactional
    public InsumoResponse create(InsumoRequest request) {
        requireCategoriaInsumoExists(request.categoriaInsumoId());
        requireUnidadMedidaExists(request.unidadMedidaId());

        String codigo = StringUtils.normalize(request.codigo());
        validateUniqueCodigoForCreate(codigo);

        Insumo domain = Insumo.builder()
                .codigo(codigo)
                .nombre(StringUtils.normalize(request.nombre()))
                .descripcion(StringUtils.normalize(request.descripcion()))
                .categoriaInsumoId(request.categoriaInsumoId())
                .unidadMedidaId(request.unidadMedidaId())
                .marca(StringUtils.normalize(request.marca()))
                .build();

        Insumo saved = insumoRepository.save(domain);
        return toResponse(saved);
    }

    @Transactional
    public InsumoResponse update(UUID id, InsumoRequest request) {
        Insumo domain = insumoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Insumo", id));

        requireCategoriaInsumoExists(request.categoriaInsumoId());
        requireUnidadMedidaExists(request.unidadMedidaId());

        String codigo = StringUtils.normalize(request.codigo());
        validateUniqueCodigoForUpdate(codigo, id);

        domain.setCodigo(codigo);
        domain.setNombre(StringUtils.normalize(request.nombre()));
        domain.setDescripcion(StringUtils.normalize(request.descripcion()));
        domain.setCategoriaInsumoId(request.categoriaInsumoId());
        domain.setUnidadMedidaId(request.unidadMedidaId());
        domain.setMarca(StringUtils.normalize(request.marca()));

        Insumo updated = insumoRepository.save(domain);
        return toResponse(updated);
    }

    @Transactional
    public void delete(UUID id) {
        if (!insumoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Insumo", id);
        }
        insumoRepository.deleteById(id);
    }

    private PageResponse<InsumoResponse> toPageResponse(Page<Insumo> page) {
        if (page.isEmpty()) {
            return PageResponse.of(List.of(), page);
        }

        List<Insumo> content = page.getContent();
        Set<UUID> categoriaIds = content.stream()
                .map(Insumo::getCategoriaInsumoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> unidadIds = content.stream()
                .map(Insumo::getUnidadMedidaId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, CategoriaInsumo> categoriaMap = categoriaIds.isEmpty()
                ? Map.of()
                : categoriaInsumoRepository.findAllById(categoriaIds).stream()
                .collect(Collectors.toMap(CategoriaInsumo::getId, Function.identity(), (a, b) -> a));

        Map<UUID, UnidadMedida> unidadMap = unidadIds.isEmpty()
                ? Map.of()
                : unidadMedidaRepository.findAllById(unidadIds).stream()
                .collect(Collectors.toMap(UnidadMedida::getId, Function.identity(), (a, b) -> a));

        List<InsumoResponse> responses = content.stream()
                .map(domain -> {
                    CategoriaInsumo categoria = domain.getCategoriaInsumoId() != null ? categoriaMap.get(domain.getCategoriaInsumoId()) : null;
                    UnidadMedida unidad = domain.getUnidadMedidaId() != null ? unidadMap.get(domain.getUnidadMedidaId()) : null;
                    return toResponse(domain, categoria, unidad);
                })
                .toList();

        return PageResponse.of(responses, page);
    }

    private InsumoResponse toResponse(Insumo domain) {
        CategoriaInsumo categoria = domain.getCategoriaInsumoId() != null
                ? categoriaInsumoRepository.findById(domain.getCategoriaInsumoId()).orElse(null)
                : null;
        UnidadMedida unidad = domain.getUnidadMedidaId() != null
                ? unidadMedidaRepository.findById(domain.getUnidadMedidaId()).orElse(null)
                : null;
        return toResponse(domain, categoria, unidad);
    }

    private InsumoResponse toResponse(Insumo domain, CategoriaInsumo categoria, UnidadMedida unidad) {
        InsumoResponse.BaseInfo categoriaInsumoInfo = categoria != null
                ? new InsumoResponse.BaseInfo(
                categoria.getId(),
                categoria.getCodigo(),
                categoria.getNombre()
        )
                : null;

        InsumoResponse.BaseInfo unidadMedidaInfo = unidad != null
                ? new InsumoResponse.BaseInfo(
                unidad.getId(),
                unidad.getCodigo(),
                unidad.getNombre()
        )
                : null;

        return new InsumoResponse(
                domain.getId(),
                domain.getCodigo(),
                domain.getNombre(),
                domain.getDescripcion(),
                categoriaInsumoInfo,
                unidadMedidaInfo,
                domain.getMarca(),
                AuditoriaMapper.from(domain)
        );
    }

    private void requireCategoriaInsumoExists(UUID categoriaInsumoId) {
        if (!categoriaInsumoRepository.existsById(categoriaInsumoId)) {
            throw new ResourceNotFoundException("Categoría de insumo", categoriaInsumoId);
        }
    }

    private void requireUnidadMedidaExists(UUID unidadMedidaId) {
        if (!unidadMedidaRepository.existsById(unidadMedidaId)) {
            throw new ResourceNotFoundException("Unidad de medida", unidadMedidaId);
        }
    }

    private void validateUniqueCodigoForCreate(String codigo) {
        if (insumoRepository.existsByCodigoIgnoreCase(codigo)) {
            throw new ConflictException(
                    "INSUMO_ALREADY_EXISTS",
                    "Ya existe un insumo con el código '%s'".formatted(codigo)
            );
        }
    }

    private void validateUniqueCodigoForUpdate(String codigo, UUID currentId) {
        if (insumoRepository.existsByCodigoIgnoreCaseAndIdNot(codigo, currentId)) {
            throw new ConflictException(
                    "INSUMO_ALREADY_EXISTS",
                    "Ya existe otro insumo con el código '%s'".formatted(codigo)
            );
        }
    }
}
