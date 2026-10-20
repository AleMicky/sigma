package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.model.TipoActivo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request.PlanMantenimientoActivoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request.PlanMantenimientoActivoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.response.PlanMantenimientoActivoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.PlanMantenimientoActivoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimientoActivo;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PlanMantenimientoActivoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PlanMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringOrdenTrabajoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlanMantenimientoActivoService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "fechaInicio",
            "fechaFin",
            "activo",
            "createdAt",
            "updatedAt"
    );

    private final PlanMantenimientoActivoRepository repository;
    private final PlanMantenimientoRepository planMantenimientoRepository;
    private final ActivoRepository activoRepository;
    private final TipoActivoRepository tipoActivoRepository;
    private final SpringOrdenTrabajoRepository springOrdenTrabajoRepository;
    private final SpringVEmpleadoRepository springVEmpleadoRepository;
    private final PlanMantenimientoActivoMapper mapper;

    @Transactional
    public PlanMantenimientoActivoResponse create(PlanMantenimientoActivoRequest request) {
        log.info("Creando asignación de activo {} al plan {}", request.activoId(), request.planMantenimientoId());

        // Regla 3: fechaFin debe ser igual o posterior a fechaInicio
        if (request.fechaFin() != null && request.fechaFin().isBefore(request.fechaInicio())) {
            throw new BusinessException("La fecha de fin debe ser igual o posterior a la fecha de inicio.");
        }

        // Validar existencia del plan
        PlanMantenimiento plan = planMantenimientoRepository.findById(request.planMantenimientoId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan de mantenimiento no encontrado: " + request.planMantenimientoId()));

        // Validar existencia del activo
        Activo activo = activoRepository.findById(request.activoId())
                .orElseThrow(() -> new ResourceNotFoundException("Activo no encontrado: " + request.activoId()));

        // Regla 1: Validar que el tipo del activo corresponda al tipo de activo permitido por el plan
        if (plan.getTipoActivoId() != null && activo.getTipoActivoId() != null) {
            if (!plan.getTipoActivoId().equals(activo.getTipoActivoId())) {
                String nombreTipoPlan = tipoActivoRepository.findById(plan.getTipoActivoId())
                        .map(TipoActivo::getNombre).orElse("ID: " + plan.getTipoActivoId());
                String nombreTipoActivo = tipoActivoRepository.findById(activo.getTipoActivoId())
                        .map(TipoActivo::getNombre).orElse("ID: " + activo.getTipoActivoId());
                throw new BusinessException(
                        "El tipo de activo (" + nombreTipoActivo + ") no corresponde al tipo de activo permitido por el plan (" + nombreTipoPlan + ")."
                );
            }
        }

        // Regla 2: Evitar asignaciones activas duplicadas del mismo plan al mismo activo
        boolean esActivo = request.activo();
        if (esActivo && repository.existsByPlanMantenimientoIdAndActivoIdAndActivoTrue(request.planMantenimientoId(), request.activoId())) {
            throw new ConflictException(
                    "Ya existe una asignación activa del activo '" + activo.getCodigo() + " - " + activo.getNombre() +
                    "' al plan de mantenimiento seleccionado."
            );
        }

        PlanMantenimientoActivo item = mapper.toDomain(request);
        PlanMantenimientoActivo saved = repository.save(item);
        return toEnrichedResponse(saved);
    }

    @Transactional
    public PlanMantenimientoActivoResponse update(UUID id, PlanMantenimientoActivoUpdate request) {
        log.info("Actualizando asignación de plan-activo {}", id);
        PlanMantenimientoActivo existing = getById(id);

        LocalDate fechaInicio = request.fechaInicio() != null ? request.fechaInicio() : existing.getFechaInicio();
        LocalDate fechaFin = request.fechaFin() != null ? request.fechaFin() : existing.getFechaFin();

        // Regla 3: fechaFin debe ser igual o posterior a fechaInicio
        if (fechaFin != null && fechaInicio != null && fechaFin.isBefore(fechaInicio)) {
            throw new BusinessException("La fecha de fin debe ser igual o posterior a la fecha de inicio.");
        }

        // Regla 2: Evitar asignaciones activas duplicadas si se reactiva o mantiene activo
        boolean nuevoEstadoActivo = request.estadoActivo() != null ? request.estadoActivo() : Boolean.TRUE.equals(existing.getActivo());
        if (nuevoEstadoActivo) {
            if (repository.existsByPlanMantenimientoIdAndActivoIdAndActivoTrueAndIdNot(
                    existing.getPlanMantenimientoId(), existing.getActivoId(), id)) {
                throw new ConflictException("Ya existe otra asignación activa del plan de mantenimiento para este activo.");
            }
        }

        mapper.updateDomain(request, existing);
        PlanMantenimientoActivo saved = repository.save(existing);
        return toEnrichedResponse(saved);
    }

    /**
     * Regla 5: Desactivar una asignación debe impedir la generación de nuevas solicitudes automáticas, sin eliminar su historial.
     */
    @Transactional
    public PlanMantenimientoActivoResponse desactivar(UUID id) {
        log.info("Desactivando asignación de plan-activo {}", id);
        PlanMantenimientoActivo existing = getById(id);

        existing.setActivo(false);
        // Si no tiene fecha de fin o es posterior a hoy, cerramos el período a hoy para registrar el histórico exacto
        if (existing.getFechaFin() == null || existing.getFechaFin().isAfter(LocalDate.now())) {
            existing.setFechaFin(LocalDate.now());
        }

        PlanMantenimientoActivo saved = repository.save(existing);
        return toEnrichedResponse(saved);
    }

    @Transactional
    public PlanMantenimientoActivoResponse activar(UUID id) {
        log.info("Activando asignación de plan-activo {}", id);
        PlanMantenimientoActivo existing = getById(id);

        // Regla 2: Validar que no haya otra activa
        if (repository.existsByPlanMantenimientoIdAndActivoIdAndActivoTrueAndIdNot(
                existing.getPlanMantenimientoId(), existing.getActivoId(), id)) {
            throw new ConflictException("Ya existe otra asignación activa del plan de mantenimiento para este activo.");
        }

        existing.setActivo(true);
        // Si la fechaFin anterior expiró, la limpiamos para permitir continuidad de la asignación
        if (existing.getFechaFin() != null && existing.getFechaFin().isBefore(LocalDate.now())) {
            existing.setFechaFin(null);
        }

        PlanMantenimientoActivo saved = repository.save(existing);
        return toEnrichedResponse(saved);
    }

    /**
     * Regla 4: No eliminar físicamente las asignaciones que ya tengan mantenimientos ejecutados.
     */
    @Transactional
    public void delete(UUID id) {
        log.info("Intentando eliminar físicamente la asignación {}", id);
        PlanMantenimientoActivo existing = getById(id);

        boolean tieneMantenimientos = springOrdenTrabajoRepository.existsByActivoId(existing.getActivoId());
        if (tieneMantenimientos) {
            throw new ConflictException(
                    "No se puede eliminar físicamente la asignación porque el activo ya registra órdenes de trabajo o mantenimientos ejecutados. " +
                    "Desactive la asignación en su lugar para preservar la trazabilidad y el historial."
            );
        }

        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public PlanMantenimientoActivoResponse findById(UUID id) {
        return toEnrichedResponse(getById(id));
    }

    @Transactional(readOnly = true)
    public List<PlanMantenimientoActivoResponse> findByPlanMantenimientoId(UUID planMantenimientoId) {
        List<PlanMantenimientoActivo> list = repository.findByPlanMantenimientoId(planMantenimientoId);
        return enrichList(list);
    }

    @Transactional(readOnly = true)
    public List<PlanMantenimientoActivoResponse> findByPlanMantenimientoIdAndActivo(UUID planMantenimientoId, Boolean activo) {
        List<PlanMantenimientoActivo> list = repository.findByPlanMantenimientoIdAndActivo(planMantenimientoId, activo);
        return enrichList(list);
    }

    @Transactional(readOnly = true)
    public List<PlanMantenimientoActivoResponse> findByActivoId(UUID activoId) {
        List<PlanMantenimientoActivo> list = repository.findByActivoId(activoId);
        return enrichList(list);
    }

    @Transactional(readOnly = true)
    public PageResponse<PlanMantenimientoActivoResponse> listarPaginado(PageRequestDto pageRequest) {
        Pageable pageable = pageRequest != null ? pageRequest.toPageable(SORT_FIELDS) : Pageable.unpaged();
        Page<PlanMantenimientoActivo> page = repository.findAll(pageable);
        List<PlanMantenimientoActivoResponse> content = enrichList(page.getContent());
        return PageResponse.of(content, page);
    }

    @Transactional(readOnly = true)
    public PageResponse<PlanMantenimientoActivoResponse> listarPorPlanPaginado(UUID planMantenimientoId, PageRequestDto pageRequest) {
        Pageable pageable = pageRequest != null ? pageRequest.toPageable(SORT_FIELDS) : Pageable.unpaged();
        Page<PlanMantenimientoActivo> page = repository.findByPlanMantenimientoId(planMantenimientoId, pageable);
        List<PlanMantenimientoActivoResponse> content = enrichList(page.getContent());
        return PageResponse.of(content, page);
    }

    @Transactional(readOnly = true)
    public PageResponse<PlanMantenimientoActivoResponse> listarPorActivoPaginado(UUID activoId, PageRequestDto pageRequest) {
        Pageable pageable = pageRequest != null ? pageRequest.toPageable(SORT_FIELDS) : Pageable.unpaged();
        Page<PlanMantenimientoActivo> page = repository.findByActivoId(activoId, pageable);
        List<PlanMantenimientoActivoResponse> content = enrichList(page.getContent());
        return PageResponse.of(content, page);
    }

    private PlanMantenimientoActivo getById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asignación de plan de mantenimiento a activo no encontrada: " + id));
    }

    private PlanMantenimientoActivoResponse toEnrichedResponse(PlanMantenimientoActivo item) {
        return enrichList(List.of(item)).stream().findFirst().orElse(null);
    }

    private List<PlanMantenimientoActivoResponse> enrichList(List<PlanMantenimientoActivo> items) {
        if (items.isEmpty()) {
            return List.of();
        }

        // 1. Recolectar IDs
        Set<UUID> planIds = items.stream().map(PlanMantenimientoActivo::getPlanMantenimientoId).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<UUID> activoIds = items.stream().map(PlanMantenimientoActivo::getActivoId).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<UUID> responsableIds = items.stream().map(PlanMantenimientoActivo::getResponsableId).filter(Objects::nonNull).collect(Collectors.toSet());

        // 2. Fetch planes
        Map<UUID, PlanMantenimiento> planMap = new HashMap<>();
        for (UUID pid : planIds) {
            planMantenimientoRepository.findById(pid).ifPresent(p -> planMap.put(p.getId(), p));
        }

        // 3. Fetch activos
        Map<UUID, Activo> activoMap = new HashMap<>();
        for (UUID aid : activoIds) {
            activoRepository.findById(aid).ifPresent(a -> activoMap.put(a.getId(), a));
        }

        // 4. Fetch tipos de activo
        Set<UUID> tipoActivoIds = new HashSet<>();
        planMap.values().forEach(p -> {
            if (p.getTipoActivoId() != null) tipoActivoIds.add(p.getTipoActivoId());
        });
        activoMap.values().forEach(a -> {
            if (a.getTipoActivoId() != null) tipoActivoIds.add(a.getTipoActivoId());
        });

        Map<UUID, String> tipoActivoNombreMap = new HashMap<>();
        if (!tipoActivoIds.isEmpty()) {
            tipoActivoRepository.findAllById(tipoActivoIds)
                    .forEach(t -> tipoActivoNombreMap.put(t.getId(), t.getNombre()));
        }

        // 5. Fetch responsables
        Map<UUID, VEmpleadoEntity> responsableMap = new HashMap<>();
        if (!responsableIds.isEmpty()) {
            springVEmpleadoRepository.findAllById(responsableIds)
                    .forEach(ve -> responsableMap.put(ve.getEmpleadoId(), ve));
        }

        // 6. Mappear enriquecido
        return items.stream().map(item -> {
            PlanMantenimiento plan = planMap.get(item.getPlanMantenimientoId());
            Activo activo = activoMap.get(item.getActivoId());
            VEmpleadoEntity resp = item.getResponsableId() != null ? responsableMap.get(item.getResponsableId()) : null;

            PlanMantenimientoActivoResponse.PlanInfo planInfo = null;
            if (plan != null) {
                planInfo = new PlanMantenimientoActivoResponse.PlanInfo(
                        plan.getId(),
                        plan.getCodigo(),
                        plan.getNombre(),
                        plan.getTipoActivoId(),
                        plan.getTipoActivoId() != null ? tipoActivoNombreMap.get(plan.getTipoActivoId()) : null
                );
            }

            PlanMantenimientoActivoResponse.ActivoInfo activoInfo = null;
            if (activo != null) {
                activoInfo = new PlanMantenimientoActivoResponse.ActivoInfo(
                        activo.getId(),
                        activo.getCodigo(),
                        activo.getNombre(),
                        activo.getDescripcion(),
                        activo.getTipoActivoId(),
                        activo.getTipoActivoId() != null ? tipoActivoNombreMap.get(activo.getTipoActivoId()) : null
                );
            }

            PlanMantenimientoActivoResponse.ResponsableInfo respInfo = null;
            if (resp != null) {
                respInfo = new PlanMantenimientoActivoResponse.ResponsableInfo(
                        resp.getEmpleadoId(),
                        resp.getCodigo(),
                        resp.getNombreCompleto()
                );
            }

            return mapper.toResponse(item, planInfo, activoInfo, respInfo);
        }).toList();
    }
}
