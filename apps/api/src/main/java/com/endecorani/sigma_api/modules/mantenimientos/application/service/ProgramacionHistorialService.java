package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.preventivo.response.PreventivoHistorialItemResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimientoActivo;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimientoHistorial;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PlanMantenimientoActivoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PlanMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ProgramacionMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ProgramacionMantenimientoHistorialEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringProgramacionMantenimientoHistorialRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgramacionHistorialService {

    private final SpringProgramacionMantenimientoHistorialRepository historialRepository;
    private final ProgramacionMantenimientoRepository programacionRepository;
    private final PlanMantenimientoActivoRepository planActivoRepository;
    private final PlanMantenimientoRepository planRepository;
    private final ActivoRepository activoRepository;

    @Transactional(readOnly = true)
    public PageResponse<PreventivoHistorialItemResponse> listarHistorico(
            UUID planId,
            UUID activoId,
            TipoCriterioMantenimiento tipoCriterio,
            Boolean completado,
            String q,
            PageRequestDto pageRequest
    ) {
        List<ProgramacionMantenimientoHistorialEntity> todos = historialRepository.findAll(
                Sort.by(Sort.Direction.DESC, "fechaDisparo")
        );

        Set<UUID> progIds = todos.stream()
                .map(ProgramacionMantenimientoHistorialEntity::getProgramacionMantenimientoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, ProgramacionMantenimiento> progMap = progIds.isEmpty()
                ? Map.of()
                : progIds.stream()
                        .map(programacionRepository::findById)
                        .flatMap(Optional::stream)
                        .collect(Collectors.toMap(ProgramacionMantenimiento::getId, Function.identity(), (a, b) -> a));

        Set<UUID> pmaIds = progMap.values().stream()
                .map(ProgramacionMantenimiento::getPlanMantenimientoActivoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, PlanMantenimientoActivo> pmaMap = pmaIds.isEmpty()
                ? Map.of()
                : planActivoRepository.findAllByIdIn(pmaIds).stream()
                        .collect(Collectors.toMap(PlanMantenimientoActivo::getId, Function.identity(), (a, b) -> a));

        Set<UUID> planIds = pmaMap.values().stream()
                .map(PlanMantenimientoActivo::getPlanMantenimientoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, PlanMantenimiento> planMap = planIds.isEmpty()
                ? Map.of()
                : planRepository.findAllByIdIn(planIds).stream()
                        .collect(Collectors.toMap(PlanMantenimiento::getId, Function.identity(), (a, b) -> a));

        Set<UUID> activoIds = pmaMap.values().stream()
                .map(PlanMantenimientoActivo::getActivoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, Activo> activoMap = activoIds.isEmpty()
                ? Map.of()
                : activoIds.stream()
                        .map(activoRepository::findById)
                        .flatMap(Optional::stream)
                        .collect(Collectors.toMap(Activo::getId, Function.identity(), (a, b) -> a));

        String qNorm = q != null ? q.trim().toLowerCase(Locale.ROOT) : "";

        List<PreventivoHistorialItemResponse> filtrados = new ArrayList<>();
        for (ProgramacionMantenimientoHistorialEntity h : todos) {
            ProgramacionMantenimiento prog = progMap.get(h.getProgramacionMantenimientoId());
            PlanMantenimientoActivo pma = prog != null ? pmaMap.get(prog.getPlanMantenimientoActivoId()) : null;
            PlanMantenimiento plan = pma != null ? planMap.get(pma.getPlanMantenimientoId()) : null;
            Activo activo = pma != null ? activoMap.get(pma.getActivoId()) : null;

            if (planId != null && (plan == null || !planId.equals(plan.getId()))) {
                continue;
            }
            if (activoId != null && (activo == null || !activoId.equals(activo.getId()))) {
                continue;
            }
            if (tipoCriterio != null && tipoCriterio != h.getTipoCriterioDisparador()) {
                continue;
            }
            if (completado != null && !completado.equals(h.getCompletado())) {
                continue;
            }
            if (!qNorm.isEmpty()) {
                String haystack = String.join(" ",
                        plan != null && plan.getCodigo() != null ? plan.getCodigo() : "",
                        plan != null && plan.getNombre() != null ? plan.getNombre() : "",
                        activo != null && activo.getCodigo() != null ? activo.getCodigo() : "",
                        activo != null && activo.getNombre() != null ? activo.getNombre() : "",
                        h.getSolicitudNumero() != null ? h.getSolicitudNumero() : "",
                        h.getObservacion() != null ? h.getObservacion() : ""
                ).toLowerCase(Locale.ROOT);
                if (!haystack.contains(qNorm)) {
                    continue;
                }
            }

            filtrados.add(new PreventivoHistorialItemResponse(
                    h.getId(),
                    h.getProgramacionMantenimientoId(),
                    plan != null ? plan.getId() : null,
                    plan != null ? plan.getCodigo() : null,
                    plan != null ? plan.getNombre() : null,
                    activo != null ? activo.getId() : null,
                    activo != null ? activo.getCodigo() : null,
                    activo != null ? activo.getNombre() : null,
                    h.getSolicitudMantenimientoId(),
                    h.getSolicitudNumero(),
                    h.getOrdenTrabajoId(),
                    h.getTipoCriterioDisparador(),
                    h.getValorDisparador(),
                    h.getValorLimite(),
                    h.getFechaDisparo(),
                    h.getCompletado(),
                    h.getFechaServicio(),
                    h.getValorUsoServicio(),
                    h.getObservacion()
            ));
        }

        int page = Math.max(0, pageRequest.page() != null ? pageRequest.page() : 0);
        int size = Math.max(1, pageRequest.size() != null ? pageRequest.size() : 20);
        int fromIndex = Math.min(page * size, filtrados.size());
        int toIndex = Math.min(fromIndex + size, filtrados.size());
        List<PreventivoHistorialItemResponse> slice = filtrados.subList(fromIndex, toIndex);
        int totalPages = (int) Math.ceil((double) filtrados.size() / size);

        return new PageResponse<>(
                slice,
                page,
                size,
                filtrados.size(),
                totalPages,
                page == 0,
                page >= totalPages - 1 || totalPages == 0,
                slice.isEmpty()
        );
    }
}
