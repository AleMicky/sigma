package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.activos.domain.model.TipoActivo;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request.PlanMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request.PlanMantenimientoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.response.PlanMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.PlanMantenimientoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PlanMantenimientoActividadRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PlanMantenimientoRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlanMantenimientoService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "tipoActivoId",
            "codigo",
            "nombre",
            "descripcion",
            "createdAt",
            "updatedAt"
    );

    private final PlanMantenimientoRepository repository;
    private final PlanMantenimientoMapper mapper;
    private final TipoActivoRepository tipoActivoRepository;
    private final PlanMantenimientoActividadRepository actividadRepository;

    @Transactional(readOnly = true)
    public PageResponse<PlanMantenimientoResponse> listar(
            String search,
            UUID tipoActivoId,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(search);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<PlanMantenimiento> page;

        if (tipoActivoId != null) {
            if (normalized == null || normalized.isBlank()) {
                page = repository.findByTipoActivoId(tipoActivoId, pageable);
            } else {
                page = repository.searchByTipoActivoId(tipoActivoId, normalized, pageable);
            }
        } else {
            if (normalized == null || normalized.isBlank()) {
                page = repository.findAll(pageable);
            } else {
                page = repository.search(normalized, pageable);
            }
        }

        return toPageResponse(page);
    }

    @Transactional(readOnly = true)
    public PlanMantenimientoResponse buscarPorId(UUID id) {
        PlanMantenimiento plan = obtenerPorId(id);
        String tipoActivoNombre = obtenerNombreTipoActivo(plan.getTipoActivoId());
        long count = actividadRepository.countByPlanMantenimientoId(plan.getId());
        return mapper.toResponse(plan, tipoActivoNombre, (int) count);
    }

    @Transactional(readOnly = true)
    public PlanMantenimientoResponse buscarPorCodigo(String codigo) {
        PlanMantenimiento plan = repository.findByCodigo(codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Plan de mantenimiento no encontrado con código: " + codigo));
        String tipoActivoNombre = obtenerNombreTipoActivo(plan.getTipoActivoId());
        long count = actividadRepository.countByPlanMantenimientoId(plan.getId());
        return mapper.toResponse(plan, tipoActivoNombre, (int) count);
    }

    @Transactional(readOnly = true)
    public List<PlanMantenimientoResponse> listarPorTipoActivoId(UUID tipoActivoId) {
        List<PlanMantenimiento> planes = repository.findByTipoActivoId(tipoActivoId);
        String tipoActivoNombre = obtenerNombreTipoActivo(tipoActivoId);
        return planes.stream()
                .map(plan -> {
                    long count = actividadRepository.countByPlanMantenimientoId(plan.getId());
                    return mapper.toResponse(plan, tipoActivoNombre, (int) count);
                })
                .toList();
    }

    @Transactional
    public PlanMantenimientoResponse crear(PlanMantenimientoRequest dto) {
        validarTipoActivoExiste(dto.tipoActivoId());

        String codigo = StringUtils.normalize(dto.codigo());
        validateUniqueCodigoForCreate(codigo);

        PlanMantenimiento plan = mapper.toDomain(dto);
        plan.setCodigo(codigo);
        plan.setNombre(StringUtils.normalize(dto.nombre()));
        plan.setDescripcion(StringUtils.normalize(dto.descripcion()));

        PlanMantenimiento guardado = repository.save(plan);
        String tipoActivoNombre = obtenerNombreTipoActivo(guardado.getTipoActivoId());
        return mapper.toResponse(guardado, tipoActivoNombre, 0);
    }

    @Transactional
    public PlanMantenimientoResponse actualizar(UUID id, PlanMantenimientoUpdate dto) {
        PlanMantenimiento actual = obtenerPorId(id);
        validarTipoActivoExiste(dto.tipoActivoId());

        String codigo = StringUtils.normalize(dto.codigo());
        validateUniqueCodigoForUpdate(codigo, id);

        mapper.updateDomain(dto, actual);
        actual.setCodigo(codigo);
        actual.setNombre(StringUtils.normalize(dto.nombre()));
        actual.setDescripcion(StringUtils.normalize(dto.descripcion()));

        PlanMantenimiento actualizado = repository.save(actual);
        String tipoActivoNombre = obtenerNombreTipoActivo(actualizado.getTipoActivoId());
        long count = actividadRepository.countByPlanMantenimientoId(actualizado.getId());
        return mapper.toResponse(actualizado, tipoActivoNombre, (int) count);
    }

    @Transactional
    public void eliminar(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private PlanMantenimiento obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan de mantenimiento", id));
    }

    private void validarTipoActivoExiste(UUID tipoActivoId) {
        if (tipoActivoId == null || !tipoActivoRepository.existsById(tipoActivoId)) {
            throw new ResourceNotFoundException("Tipo de activo", tipoActivoId);
        }
    }

    private String obtenerNombreTipoActivo(UUID tipoActivoId) {
        if (tipoActivoId == null) {
            return null;
        }
        return tipoActivoRepository.findById(tipoActivoId)
                .map(TipoActivo::getNombre)
                .orElse(null);
    }

    private PageResponse<PlanMantenimientoResponse> toPageResponse(Page<PlanMantenimiento> page) {
        if (page.isEmpty()) {
            return PageResponse.of(List.of(), page);
        }

        Set<UUID> tipoActivoIds = page.getContent().stream()
                .map(PlanMantenimiento::getTipoActivoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, String> tipoActivoNombres = tipoActivoIds.isEmpty() ? Map.of() :
                tipoActivoRepository.findAllById(tipoActivoIds).stream()
                        .collect(Collectors.toMap(
                                TipoActivo::getId,
                                TipoActivo::getNombre,
                                (a, b) -> a
                        ));

        List<PlanMantenimientoResponse> content = page.getContent().stream()
                .map(plan -> {
                    long count = actividadRepository.countByPlanMantenimientoId(plan.getId());
                    return mapper.toResponse(
                            plan,
                            plan.getTipoActivoId() != null ? tipoActivoNombres.get(plan.getTipoActivoId()) : null,
                            (int) count
                    );
                })
                .toList();

        return PageResponse.of(content, page);
    }

    private void validateUniqueCodigoForCreate(String codigo) {
        if (codigo != null && repository.existsByCodigoIgnoreCase(codigo)) {
            throw new ConflictException(
                    "PLAN_MANTENIMIENTO_ALREADY_EXISTS",
                    "Ya existe un plan de mantenimiento con el código '%s'".formatted(codigo)
            );
        }
    }

    private void validateUniqueCodigoForUpdate(String codigo, UUID currentId) {
        if (codigo != null && repository.existsByCodigoIgnoreCaseAndIdNot(codigo, currentId)) {
            throw new ConflictException(
                    "PLAN_MANTENIMIENTO_ALREADY_EXISTS",
                    "Ya existe otro plan de mantenimiento con el código '%s'".formatted(codigo)
            );
        }
    }
}
