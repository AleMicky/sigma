package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.response.OrdenTrabajoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.OrdenTrabajoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.*;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.*;
import com.endecorani.sigma_api.modules.parametros.application.service.CorrelativoService;
import com.endecorani.sigma_api.modules.parametros.domain.constant.CorrelativoCodigo;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrdenTrabajoPreventivaService {

    private final ProgramacionMantenimientoRepository programacionRepository;
    private final PlanMantenimientoActivoRepository planActivoRepository;
    private final PlanMantenimientoActividadRepository planActividadRepository;
    private final ActividadMantenimientoAplicacionRepository aplicacionRepository;
    private final ActividadMantenimientoRepository actividadRepository;
    private final OrdenTrabajoRepository ordenTrabajoRepository;
    private final CorrelativoService correlativoService;
    private final OrdenTrabajoMapper ordenTrabajoMapper;
    private final SecurityUtils securityUtils;

    @Transactional
    public OrdenTrabajoResponse generarDesdeProgramacion(UUID programacionId, UUID responsableOverrideId) {
        ProgramacionMantenimiento prog = programacionRepository.findById(programacionId)
                .orElseThrow(() -> new ResourceNotFoundException("Programación de mantenimiento no encontrada: " + programacionId));

        PlanMantenimientoActivo pma = planActivoRepository.findById(prog.getPlanMantenimientoActivoId())
                .orElseThrow(() -> new ResourceNotFoundException("Asignación de activo al plan no encontrada: " + prog.getPlanMantenimientoActivoId()));

        UUID responsableId = responsableOverrideId != null
                ? responsableOverrideId
                : (pma.getResponsableId() != null ? pma.getResponsableId() : securityUtils.getCurrentUserId().orElse(null));

        if (responsableId == null) {
            throw new BusinessException("La programación no tiene un responsable asignado para generar la Orden de Trabajo");
        }

        List<PlanMantenimientoActividad> actividadesPlan = planActividadRepository
                .findByPlanMantenimientoId(pma.getPlanMantenimientoId())
                .stream()
                .sorted(Comparator.comparing(a -> a.getOrden() != null ? a.getOrden() : Integer.MAX_VALUE))
                .toList();

        Set<UUID> appIds = actividadesPlan.stream()
                .map(PlanMantenimientoActividad::getActividadMantenimientoAplicacionId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, ActividadMantenimientoAplicacion> appMap = appIds.isEmpty()
                ? Map.of()
                : aplicacionRepository.findAllByIdIn(appIds).stream()
                        .collect(Collectors.toMap(ActividadMantenimientoAplicacion::getId, a -> a, (a, b) -> a));

        Set<UUID> actIds = appMap.values().stream()
                .map(ActividadMantenimientoAplicacion::getActividadMantenimientoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, ActividadMantenimiento> actMap = actIds.isEmpty()
                ? Map.of()
                : actividadRepository.findAllByIdIn(actIds).stream()
                        .collect(Collectors.toMap(ActividadMantenimiento::getId, a -> a, (a, b) -> a));

        List<OrdenTrabajoActividad> otActividades = new ArrayList<>();
        for (PlanMantenimientoActividad pa : actividadesPlan) {
            ActividadMantenimientoAplicacion app = appMap.get(pa.getActividadMantenimientoAplicacionId());
            ActividadMantenimiento act = app != null ? actMap.get(app.getActividadMantenimientoId()) : null;
            if (act == null) {
                continue;
            }
            String desc = act.getNombre() != null ? act.getNombre() : act.getCodigo();
            if (act.getDescripcion() != null && !act.getDescripcion().isBlank()) {
                desc = desc + " — " + act.getDescripcion();
            }
            otActividades.add(OrdenTrabajoActividad.builder()
                    .actividadMantenimientoId(act.getId())
                    .descripcion(desc)
                    .realizado(false)
                    .build());
        }

        String numero = correlativoService.generar(
                CorrelativoCodigo.ORDEN_TRABAJO,
                LocalDateTime.now(CriterioCalculoService.ZONA_BOLIVIA).getYear()
        );

        OrdenTrabajo ot = OrdenTrabajo.builder()
                .numero(numero)
                .programacionMantenimientoId(prog.getId())
                .activoId(pma.getActivoId())
                .responsableId(responsableId)
                .fechaInicio(LocalDateTime.now(CriterioCalculoService.ZONA_BOLIVIA))
                .diagnostico("Mantenimiento preventivo programado")
                .actividades(otActividades)
                .build();

        return ordenTrabajoMapper.toResponse(ordenTrabajoRepository.save(ot));
    }
}
