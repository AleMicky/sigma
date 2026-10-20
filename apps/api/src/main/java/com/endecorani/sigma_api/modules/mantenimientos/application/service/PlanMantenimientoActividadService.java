package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.activos.domain.model.Componente;
import com.endecorani.sigma_api.modules.activos.domain.model.TipoActivo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ComponenteRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request.PlanMantenimientoActividadRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request.PlanMantenimientoActividadUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.response.PlanMantenimientoActividadResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.PlanMantenimientoActividadMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ActividadMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ActividadMantenimientoAplicacion;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimientoActividad;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ActividadMantenimientoAplicacionRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ActividadMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PlanMantenimientoActividadRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PlanMantenimientoRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
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
public class PlanMantenimientoActividadService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "orden",
            "obligatorio",
            "createdAt",
            "updatedAt"
    );

    private final PlanMantenimientoActividadRepository repository;
    private final PlanMantenimientoRepository planRepository;
    private final ActividadMantenimientoAplicacionRepository aplicacionRepository;
    private final ActividadMantenimientoRepository actividadRepository;
    private final TipoActivoRepository tipoActivoRepository;
    private final ComponenteRepository componenteRepository;
    private final PlanMantenimientoActividadMapper mapper;

    @Transactional
    public PlanMantenimientoActividadResponse create(PlanMantenimientoActividadRequest request) {
        PlanMantenimiento plan = planRepository.findById(request.planMantenimientoId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan de mantenimiento", request.planMantenimientoId()));

        ActividadMantenimientoAplicacion aplicacion = aplicacionRepository.findById(request.actividadMantenimientoAplicacionId())
                .orElseThrow(() -> new ResourceNotFoundException("Aplicación de actividad", request.actividadMantenimientoAplicacionId()));

        if (aplicacion.getTipoActivoId() != null && !aplicacion.getTipoActivoId().equals(plan.getTipoActivoId())) {
            throw new ConflictException(
                    "TIPO_ACTIVO_MISMATCH",
                    "La actividad pertenece a un tipo de activo diferente al del plan de mantenimiento"
            );
        }

        if (repository.existsByPlanMantenimientoIdAndActividadMantenimientoAplicacionId(
                request.planMantenimientoId(),
                request.actividadMantenimientoAplicacionId()
        )) {
            throw new ConflictException(
                    "ACTIVIDAD_ALREADY_IN_PLAN",
                    "Esta actividad ya se encuentra asignada al plan de mantenimiento"
            );
        }

        Integer orden = request.orden();
        if (orden == null) {
            List<PlanMantenimientoActividad> existentes = repository.findByPlanMantenimientoId(plan.getId());
            orden = existentes.stream()
                    .mapToInt(a -> a.getOrden() != null ? a.getOrden() : 0)
                    .max()
                    .orElse(-1) + 1;
        }

        PlanMantenimientoActividad domain = PlanMantenimientoActividad.builder()
                .planMantenimientoId(request.planMantenimientoId())
                .actividadMantenimientoAplicacionId(request.actividadMantenimientoAplicacionId())
                .orden(orden)
                .obligatorio(request.obligatorio() != null ? request.obligatorio() : true)
                .build();

        PlanMantenimientoActividad saved = repository.save(domain);
        return toEnrichedResponse(saved, aplicacion);
    }

    @Transactional
    public PlanMantenimientoActividadResponse update(UUID id, PlanMantenimientoActividadUpdate request) {
        PlanMantenimientoActividad domain = obtenerPorId(id);

        if (request.orden() != null) {
            domain.setOrden(request.orden());
        }
        if (request.obligatorio() != null) {
            domain.setObligatorio(request.obligatorio());
        }

        PlanMantenimientoActividad saved = repository.save(domain);
        return findById(saved.getId());
    }

    @Transactional(readOnly = true)
    public PlanMantenimientoActividadResponse findById(UUID id) {
        PlanMantenimientoActividad domain = obtenerPorId(id);
        ActividadMantenimientoAplicacion aplicacion = aplicacionRepository
                .findById(domain.getActividadMantenimientoAplicacionId())
                .orElse(null);
        return toEnrichedResponse(domain, aplicacion);
    }

    @Transactional(readOnly = true)
    public List<PlanMantenimientoActividadResponse> listarPorPlanMantenimientoId(UUID planMantenimientoId) {
        List<PlanMantenimientoActividad> items = repository.findByPlanMantenimientoId(planMantenimientoId);
        return enrichList(items);
    }

    @Transactional(readOnly = true)
    public PageResponse<PlanMantenimientoActividadResponse> findByPlanMantenimientoId(
            UUID planMantenimientoId,
            PageRequestDto pageRequest
    ) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<PlanMantenimientoActividad> page = repository.findByPlanMantenimientoId(planMantenimientoId, pageable);
        List<PlanMantenimientoActividadResponse> content = enrichList(page.getContent());
        return PageResponse.of(content, page);
    }

    @Transactional
    public void delete(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private PlanMantenimientoActividad obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Actividad de plan de mantenimiento", id));
    }

    private PlanMantenimientoActividadResponse toEnrichedResponse(
            PlanMantenimientoActividad item,
            ActividadMantenimientoAplicacion aplicacion
    ) {
        PlanMantenimientoActividadResponse.ActividadInfo actInfo = null;
        PlanMantenimientoActividadResponse.TipoActivoInfo tipoInfo = null;
        PlanMantenimientoActividadResponse.ComponenteInfo compInfo = null;

        if (aplicacion != null) {
            if (aplicacion.getActividadMantenimientoId() != null) {
                actInfo = actividadRepository.findById(aplicacion.getActividadMantenimientoId())
                        .map(a -> new PlanMantenimientoActividadResponse.ActividadInfo(
                                a.getId(),
                                a.getCodigo(),
                                a.getNombre(),
                                a.getDescripcion()
                        ))
                        .orElse(null);
            }
            if (aplicacion.getTipoActivoId() != null) {
                tipoInfo = tipoActivoRepository.findById(aplicacion.getTipoActivoId())
                        .map(t -> new PlanMantenimientoActividadResponse.TipoActivoInfo(
                                t.getId(),
                                t.getNombre()
                        ))
                        .orElse(null);
            }
            if (aplicacion.getComponenteId() != null) {
                compInfo = componenteRepository.findById(aplicacion.getComponenteId())
                        .map(c -> new PlanMantenimientoActividadResponse.ComponenteInfo(
                                c.getId(),
                                c.getNombre()
                        ))
                        .orElse(null);
            }
        }

        return mapper.toResponse(item, actInfo, tipoInfo, compInfo);
    }

    private List<PlanMantenimientoActividadResponse> enrichList(List<PlanMantenimientoActividad> items) {
        if (items.isEmpty()) {
            return List.of();
        }

        Set<UUID> aplicacionIds = items.stream()
                .map(PlanMantenimientoActividad::getActividadMantenimientoAplicacionId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, ActividadMantenimientoAplicacion> appMap = new HashMap<>();
        for (UUID appUuid : aplicacionIds) {
            aplicacionRepository.findById(appUuid).ifPresent(app -> appMap.put(app.getId(), app));
        }

        Set<UUID> actividadIds = appMap.values().stream()
                .map(ActividadMantenimientoAplicacion::getActividadMantenimientoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> tipoActivoIds = appMap.values().stream()
                .map(ActividadMantenimientoAplicacion::getTipoActivoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> componenteIds = appMap.values().stream()
                .map(ActividadMantenimientoAplicacion::getComponenteId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, ActividadMantenimiento> actMap = new HashMap<>();
        for (UUID actUuid : actividadIds) {
            actividadRepository.findById(actUuid).ifPresent(a -> actMap.put(a.getId(), a));
        }

        Map<UUID, TipoActivo> tipoMap = tipoActivoIds.isEmpty() ? Map.of() :
                tipoActivoRepository.findAllById(tipoActivoIds).stream()
                        .collect(Collectors.toMap(TipoActivo::getId, Function.identity(), (a, b) -> a));

        Map<UUID, Componente> compMap = componenteIds.isEmpty() ? Map.of() :
                componenteRepository.findAllById(componenteIds).stream()
                        .collect(Collectors.toMap(Componente::getId, Function.identity(), (a, b) -> a));

        return items.stream()
                .map(item -> {
                    ActividadMantenimientoAplicacion app = appMap.get(item.getActividadMantenimientoAplicacionId());
                    PlanMantenimientoActividadResponse.ActividadInfo actInfo = null;
                    PlanMantenimientoActividadResponse.TipoActivoInfo tipoInfo = null;
                    PlanMantenimientoActividadResponse.ComponenteInfo compInfo = null;

                    if (app != null) {
                        ActividadMantenimiento act = actMap.get(app.getActividadMantenimientoId());
                        if (act != null) {
                            actInfo = new PlanMantenimientoActividadResponse.ActividadInfo(
                                    act.getId(),
                                    act.getCodigo(),
                                    act.getNombre(),
                                    act.getDescripcion()
                            );
                        }
                        TipoActivo tipo = tipoMap.get(app.getTipoActivoId());
                        if (tipo != null) {
                            tipoInfo = new PlanMantenimientoActividadResponse.TipoActivoInfo(
                                    tipo.getId(),
                                    tipo.getNombre()
                            );
                        }
                        Componente comp = compMap.get(app.getComponenteId());
                        if (comp != null) {
                            compInfo = new PlanMantenimientoActividadResponse.ComponenteInfo(
                                    comp.getId(),
                                    comp.getNombre()
                            );
                        }
                    }

                    return mapper.toResponse(item, actInfo, tipoInfo, compInfo);
                })
                .toList();
    }
}
