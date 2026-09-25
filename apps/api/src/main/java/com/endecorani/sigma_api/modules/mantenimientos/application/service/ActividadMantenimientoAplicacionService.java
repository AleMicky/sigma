package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.activos.domain.model.Componente;
import com.endecorani.sigma_api.modules.activos.domain.repository.ComponenteRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.request.ActividadMantenimientoAplicacionRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.response.ActividadMantenimientoAplicacionResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.response.ChecklistItemResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ActividadMantenimientoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ActividadMantenimientoAplicacion;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ActividadMantenimientoAplicacionRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ActividadMantenimientoRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActividadMantenimientoAplicacionService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "tipoActivoId",
            "componenteId",
            "createdAt",
            "updatedAt");

    private final ActividadMantenimientoAplicacionRepository repository;
    private final ActividadMantenimientoRepository actividadRepository;
    private final TipoActivoRepository tipoActivoRepository;
    private final ComponenteRepository componenteRepository;
    private final ActividadMantenimientoMapper mapper;

    @Transactional
    public ActividadMantenimientoAplicacionResponse create(ActividadMantenimientoAplicacionRequest dto) {
        if (dto.actividadMantenimientoId() != null
                && !actividadRepository.findById(dto.actividadMantenimientoId()).isPresent()) {
            throw new ResourceNotFoundException("Actividad de mantenimiento", dto.actividadMantenimientoId());
        }

        if (dto.actividadMantenimientoId() != null
                && repository.existsByActividadMantenimientoId(dto.actividadMantenimientoId())) {
            throw new ConflictException("ACTIVIDAD_YA_CONFIGURADA",
                    "La actividad de mantenimiento ya tiene una aplicación/alcance configurado. Solo se permite una aplicación por actividad.");
        }

        ActividadMantenimientoAplicacion domain = mapper.toAplicacionDomain(dto);
        if (domain.getChecklist() != null) {
            domain.getChecklist().forEach(item -> {
                if (item.getActividadMantenimientoAplicacionId() == null) {
                    item.setActividadMantenimientoAplicacionId(domain.getId());
                }
            });
        }

        ActividadMantenimientoAplicacion saved = repository.save(domain);
        return toResponse(saved);
    }

    @Transactional
    public ActividadMantenimientoAplicacionResponse update(UUID id, ActividadMantenimientoAplicacionRequest dto) {
        ActividadMantenimientoAplicacion domain = obtenerPorId(id);

        if (dto.actividadMantenimientoId() != null
                && !actividadRepository.findById(dto.actividadMantenimientoId()).isPresent()) {
            throw new ResourceNotFoundException("Actividad de mantenimiento", dto.actividadMantenimientoId());
        }

        mapper.updateAplicacionFromRequest(dto, domain);

        if (dto.actividadMantenimientoId() != null) {
            domain.setActividadMantenimientoId(dto.actividadMantenimientoId());
        }

        if (domain.getChecklist() != null) {
            domain.getChecklist().forEach(item -> {
                if (item.getActividadMantenimientoAplicacionId() == null) {
                    item.setActividadMantenimientoAplicacionId(domain.getId());
                }
            });
        }

        ActividadMantenimientoAplicacion saved = repository.save(domain);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public ActividadMantenimientoAplicacionResponse findById(UUID id) {
        ActividadMantenimientoAplicacion domain = obtenerPorId(id);
        return toResponse(domain);
    }

    @Transactional(readOnly = true)
    public PageResponse<ActividadMantenimientoAplicacionResponse> findByActividadMantenimientoId(
            UUID actividadMantenimientoId,
            PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<ActividadMantenimientoAplicacion> resultado = repository
                .findByActividadMantenimientoId(actividadMantenimientoId, pageable);
        return toPageResponse(resultado);
    }

    @Transactional(readOnly = true)
    public PageResponse<ActividadMantenimientoAplicacionResponse> findAll(PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<ActividadMantenimientoAplicacion> resultado = repository.findAll(pageable);
        return toPageResponse(resultado);
    }

    @Transactional
    public void delete(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private ActividadMantenimientoAplicacion obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aplicación de actividad de mantenimiento", id));
    }

    private PageResponse<ActividadMantenimientoAplicacionResponse> toPageResponse(Page<ActividadMantenimientoAplicacion> page) {
        if (page.isEmpty()) {
            return PageResponse.of(List.of(), page);
        }

        Set<UUID> tipoActivoIds = page.getContent().stream()
                .map(ActividadMantenimientoAplicacion::getTipoActivoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> componenteIds = page.getContent().stream()
                .map(ActividadMantenimientoAplicacion::getComponenteId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, com.endecorani.sigma_api.modules.activos.domain.model.TipoActivo> tipoActivoMap = tipoActivoIds.isEmpty() ? Map.of() :
                tipoActivoRepository.findAllById(tipoActivoIds).stream()
                        .collect(Collectors.toMap(com.endecorani.sigma_api.modules.activos.domain.model.TipoActivo::getId, Function.identity(), (a, b) -> a));

        Map<UUID, Componente> componenteMap = componenteIds.isEmpty() ? Map.of() :
                componenteRepository.findAllById(componenteIds).stream()
                        .collect(Collectors.toMap(Componente::getId, Function.identity(), (a, b) -> a));

        List<ActividadMantenimientoAplicacionResponse> content = page.getContent().stream()
                .map(a -> toResponse(
                        a,
                        a.getTipoActivoId() != null ? tipoActivoMap.get(a.getTipoActivoId()) : null,
                        a.getComponenteId() != null ? componenteMap.get(a.getComponenteId()) : null
                ))
                .toList();

        return PageResponse.of(content, page);
    }

    private ActividadMantenimientoAplicacionResponse toResponse(ActividadMantenimientoAplicacion domain) {
        return toResponse(domain, null, null);
    }

    private ActividadMantenimientoAplicacionResponse toResponse(
            ActividadMantenimientoAplicacion domain,
            com.endecorani.sigma_api.modules.activos.domain.model.TipoActivo tipoActivoDomain,
            Componente componenteDomain) {

        ActividadMantenimientoAplicacionResponse.TipoActivoInfo tipoActivo = null;
        if (tipoActivoDomain != null) {
            tipoActivo = new ActividadMantenimientoAplicacionResponse.TipoActivoInfo(
                    tipoActivoDomain.getId(),
                    tipoActivoDomain.getNombre()
            );
        } else if (domain.getTipoActivoId() != null) {
            tipoActivo = tipoActivoRepository.findById(domain.getTipoActivoId())
                    .map(t -> new ActividadMantenimientoAplicacionResponse.TipoActivoInfo(t.getId(), t.getNombre()))
                    .orElse(null);
        }

        ActividadMantenimientoAplicacionResponse.ComponenteInfo componente = null;
        if (componenteDomain != null) {
            componente = new ActividadMantenimientoAplicacionResponse.ComponenteInfo(
                    componenteDomain.getId(),
                    componenteDomain.getNombre()
            );
        } else if (domain.getComponenteId() != null) {
            Optional<Componente> comp = componenteRepository.findById(domain.getComponenteId());
            componente = comp
                    .map(c -> new ActividadMantenimientoAplicacionResponse.ComponenteInfo(c.getId(), c.getNombre()))
                    .orElse(null);
        }

        List<ChecklistItemResponse> checklist = domain.getChecklist() != null
                ? domain.getChecklist().stream().map(mapper::toChecklistItemResponse).toList()
                : List.of();

        return new ActividadMantenimientoAplicacionResponse(
                domain.getId(),
                domain.getActividadMantenimientoId(),
                tipoActivo,
                componente,
                checklist);
    }
}
