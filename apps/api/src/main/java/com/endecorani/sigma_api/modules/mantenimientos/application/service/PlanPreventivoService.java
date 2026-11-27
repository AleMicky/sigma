package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.model.TipoActivo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request.PlanPreventivoCompletoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.response.PlanMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.response.PlanPreventivoCompletoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.PlanMantenimientoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.application.port.out.ActivoUsoQueryPort;
import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.EstadoPlanMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimientoActividad;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimientoActivo;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimientoCriterio;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PlanMantenimientoActividadRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PlanMantenimientoActivoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PlanMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ProgramacionMantenimientoCriterioRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ProgramacionMantenimientoRepository;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlanPreventivoService {

    private final PlanMantenimientoRepository planRepository;
    private final PlanMantenimientoActividadRepository planActividadRepository;
    private final PlanMantenimientoActivoRepository planActivoRepository;
    private final ProgramacionMantenimientoRepository programacionRepository;
    private final ProgramacionMantenimientoCriterioRepository criterioRepository;
    private final TipoActivoRepository tipoActivoRepository;
    private final ActivoRepository activoRepository;
    private final ActivoUsoQueryPort activoUsoQueryPort;
    private final CriterioCalculoService criterioCalculoService;
    private final PlanMantenimientoMapper planMapper;

    @Transactional(readOnly = true)
    public PlanPreventivoCompletoResponse obtenerCompleto(UUID planId) {
        PlanMantenimiento plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan de mantenimiento no encontrado: " + planId));
        return construirResponse(plan);
    }

    @Transactional
    public PlanPreventivoCompletoResponse crearCompleto(PlanPreventivoCompletoRequest request) {
        String codigoNorm = request.codigo().trim();
        if (planRepository.existsByCodigoIgnoreCase(codigoNorm)) {
            throw new ConflictException("Ya existe un plan de mantenimiento con código: " + codigoNorm);
        }
        validarTipoActivo(request.tipoActivoId());

        PlanMantenimiento plan = PlanMantenimiento.builder()
                .tipoActivoId(request.tipoActivoId())
                .tipoMantenimientoId(request.tipoMantenimientoId())
                .codigo(codigoNorm)
                .nombre(request.nombre().trim())
                .descripcion(request.descripcion() != null ? request.descripcion().trim() : null)
                .estado(request.estado() != null ? request.estado() : EstadoPlanMantenimiento.ACTIVO)
                .criterioDefaultTipo(request.criterioDefaultTipo())
                .criterioDefaultDias(request.criterioDefaultDias())
                .criterioDefaultUso(request.criterioDefaultUso())
                .build();

        PlanMantenimiento savedPlan = planRepository.save(plan);
        sincronizarActividades(savedPlan.getId(), request.actividades());
        sincronizarActivosYProgramaciones(savedPlan, request.activos());
        return construirResponse(savedPlan);
    }

    @Transactional
    public PlanPreventivoCompletoResponse actualizarCompleto(UUID planId, PlanPreventivoCompletoRequest request) {
        PlanMantenimiento plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan de mantenimiento no encontrado: " + planId));

        String codigoNorm = request.codigo().trim();
        if (!codigoNorm.equalsIgnoreCase(plan.getCodigo()) && planRepository.existsByCodigoIgnoreCaseAndIdNot(codigoNorm, planId)) {
            throw new ConflictException("Ya existe otro plan de mantenimiento con código: " + codigoNorm);
        }
        validarTipoActivo(request.tipoActivoId());

        plan.setTipoActivoId(request.tipoActivoId());
        plan.setTipoMantenimientoId(request.tipoMantenimientoId());
        plan.setCodigo(codigoNorm);
        plan.setNombre(request.nombre().trim());
        plan.setDescripcion(request.descripcion() != null ? request.descripcion().trim() : null);
        if (request.estado() != null) {
            plan.setEstado(request.estado());
        }
        plan.setCriterioDefaultTipo(request.criterioDefaultTipo());
        plan.setCriterioDefaultDias(request.criterioDefaultDias());
        plan.setCriterioDefaultUso(request.criterioDefaultUso());

        PlanMantenimiento savedPlan = planRepository.save(plan);
        sincronizarActividades(savedPlan.getId(), request.actividades());
        sincronizarActivosYProgramaciones(savedPlan, request.activos());
        return construirResponse(savedPlan);
    }

    private void validarTipoActivo(UUID tipoActivoId) {
        if (!tipoActivoRepository.existsById(tipoActivoId)) {
            throw new ResourceNotFoundException("Tipo de activo no encontrado: " + tipoActivoId);
        }
    }

    private void sincronizarActividades(
            UUID planId,
            List<PlanPreventivoCompletoRequest.ActividadItem> items
    ) {
        List<PlanMantenimientoActividad> existentes = planActividadRepository.findByPlanMantenimientoId(planId);
        if (items == null) {
            return;
        }
        Map<UUID, PlanMantenimientoActividad> porAplicacion = existentes.stream()
                .collect(Collectors.toMap(
                        PlanMantenimientoActividad::getActividadMantenimientoAplicacionId,
                        Function.identity(),
                        (a, b) -> a
                ));

        Set<UUID> vistas = new HashSet<>();
        int ordenAuto = 1;
        for (PlanPreventivoCompletoRequest.ActividadItem item : items) {
            if (!vistas.add(item.actividadMantenimientoAplicacionId())) {
                continue;
            }
            int orden = item.orden() != null ? item.orden() : ordenAuto;
            boolean obligatorio = item.obligatorio() == null || item.obligatorio();
            PlanMantenimientoActividad entity = porAplicacion.getOrDefault(
                    item.actividadMantenimientoAplicacionId(),
                    PlanMantenimientoActividad.builder()
                            .planMantenimientoId(planId)
                            .actividadMantenimientoAplicacionId(item.actividadMantenimientoAplicacionId())
                            .build()
            );
            entity.setOrden(orden);
            entity.setObligatorio(obligatorio);
            planActividadRepository.save(entity);
            ordenAuto++;
        }

        for (PlanMantenimientoActividad existente : existentes) {
            if (!vistas.contains(existente.getActividadMantenimientoAplicacionId())) {
                planActividadRepository.deleteById(existente.getId());
            }
        }
    }

    private void sincronizarActivosYProgramaciones(
            PlanMantenimiento plan,
            List<PlanPreventivoCompletoRequest.ActivoItem> items
    ) {
        if (items == null) {
            return;
        }
        List<UUID> activoIds = items.stream()
                .map(PlanPreventivoCompletoRequest.ActivoItem::activoId)
                .distinct()
                .toList();
        Map<UUID, ActivoUsoQueryPort.LecturaUso> lecturas = activoUsoQueryPort.obtenerLecturasUsoPorActivos(activoIds);

        List<PlanMantenimientoActivo> existentes = planActivoRepository.findByPlanMantenimientoId(plan.getId());
        Map<UUID, PlanMantenimientoActivo> porActivo = existentes.stream()
                .collect(Collectors.toMap(PlanMantenimientoActivo::getActivoId, Function.identity(), (a, b) -> a));

        Set<UUID> activosEnRequest = new HashSet<>();
        for (PlanPreventivoCompletoRequest.ActivoItem item : items) {
            if (!activosEnRequest.add(item.activoId())) {
                continue;
            }
            Activo activo = activoRepository.findById(item.activoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Activo no encontrado: " + item.activoId()));
            if (!plan.getTipoActivoId().equals(activo.getTipoActivoId())) {
                throw new BusinessException("El activo " + activo.getCodigo() + " no corresponde al tipo de activo del plan");
            }

            PlanMantenimientoActivo pma = porActivo.getOrDefault(
                    item.activoId(),
                    PlanMantenimientoActivo.builder()
                            .planMantenimientoId(plan.getId())
                            .activoId(item.activoId())
                            .build()
            );
            pma.setResponsableId(item.responsableId());
            pma.setFechaInicio(item.fechaInicio() != null ? item.fechaInicio() : LocalDate.now(CriterioCalculoService.ZONA_BOLIVIA));
            pma.setFechaFin(item.fechaFin());
            pma.setActivo(item.activo() == null || item.activo());
            PlanMantenimientoActivo savedPma = planActivoRepository.save(pma);

            List<PlanPreventivoCompletoRequest.CriterioItem> criteriosItem = resolverCriterios(plan, item);
            if (!criteriosItem.isEmpty()) {
                sincronizarProgramacion(savedPma, item, criteriosItem, lecturas.getOrDefault(item.activoId(), ActivoUsoQueryPort.LecturaUso.vacia()));
            }
        }
    }

    private List<PlanPreventivoCompletoRequest.CriterioItem> resolverCriterios(
            PlanMantenimiento plan,
            PlanPreventivoCompletoRequest.ActivoItem item
    ) {
        if (item.criterios() != null && !item.criterios().isEmpty()) {
            return item.criterios();
        }
        if (plan.getCriterioDefaultTipo() == null) {
            return List.of();
        }
        return List.of(new PlanPreventivoCompletoRequest.CriterioItem(
                plan.getCriterioDefaultTipo(),
                plan.getCriterioDefaultDias(),
                plan.getCriterioDefaultUso(),
                null,
                null,
                true
        ));
    }

    private void sincronizarProgramacion(
            PlanMantenimientoActivo pma,
            PlanPreventivoCompletoRequest.ActivoItem item,
            List<PlanPreventivoCompletoRequest.CriterioItem> criteriosItem,
            ActivoUsoQueryPort.LecturaUso lectura
    ) {
        ProgramacionMantenimiento prog = programacionRepository
                .findByPlanMantenimientoActivoIdAndActivoTrue(pma.getId())
                .orElseGet(() -> programacionRepository.saveAndFlush(ProgramacionMantenimiento.builder()
                        .planMantenimientoActivoId(pma.getId())
                        .activo(Boolean.TRUE.equals(pma.getActivo()))
                        .build()));

        List<ProgramacionMantenimientoCriterio> existentes = criterioRepository.findByProgramacionMantenimientoId(prog.getId());
        Map<TipoCriterioMantenimiento, ProgramacionMantenimientoCriterio> porTipo = existentes.stream()
                .collect(Collectors.toMap(ProgramacionMantenimientoCriterio::getTipoCriterio, Function.identity(), (a, b) -> a));

        Set<TipoCriterioMantenimiento> tiposEnRequest = new HashSet<>();
        BigDecimal kmBase = item.kilometrajeInicial() != null ? item.kilometrajeInicial() : lectura.kilometrajeActual();
        BigDecimal horasBase = item.horasUsoInicial() != null ? item.horasUsoInicial() : lectura.horasUsoActual();

        for (PlanPreventivoCompletoRequest.CriterioItem c : criteriosItem) {
            if (!tiposEnRequest.add(c.tipoCriterio())) {
                continue;
            }
            LocalDate proximaFecha = c.proximaFecha();
            BigDecimal proximoUso = c.proximoValorUso();

            if (c.tipoCriterio() == TipoCriterioMantenimiento.TIEMPO && proximaFecha == null) {
                proximaFecha = criterioCalculoService.calcularProximaFecha(pma.getFechaInicio(), c.intervaloDias());
            } else if (c.tipoCriterio() == TipoCriterioMantenimiento.KILOMETRAJE && proximoUso == null) {
                proximoUso = criterioCalculoService.calcularProximoValorUso(kmBase, c.intervaloUso());
            } else if (c.tipoCriterio() == TipoCriterioMantenimiento.HORAS_USO && proximoUso == null) {
                proximoUso = criterioCalculoService.calcularProximoValorUso(horasBase, c.intervaloUso());
            }

            ProgramacionMantenimientoCriterio crit = porTipo.getOrDefault(
                    c.tipoCriterio(),
                    ProgramacionMantenimientoCriterio.builder()
                            .programacionMantenimientoId(prog.getId())
                            .tipoCriterio(c.tipoCriterio())
                            .build()
            );
            crit.setIntervaloDias(c.intervaloDias());
            crit.setIntervaloUso(c.intervaloUso());
            crit.setProximaFecha(proximaFecha);
            crit.setProximoValorUso(proximoUso);
            crit.setActivo(c.activo() == null || c.activo());
            criterioRepository.save(crit);
        }

        for (ProgramacionMantenimientoCriterio exist : existentes) {
            if (!tiposEnRequest.contains(exist.getTipoCriterio())) {
                criterioRepository.deleteById(exist.getId());
            }
        }
    }

    private PlanPreventivoCompletoResponse construirResponse(PlanMantenimiento plan) {
        String tipoActivoNombre = tipoActivoRepository.findById(plan.getTipoActivoId())
                .map(TipoActivo::getNombre)
                .orElse(null);

        List<PlanMantenimientoActividad> actividades = planActividadRepository.findByPlanMantenimientoId(plan.getId()).stream()
                .sorted(Comparator.comparing(a -> a.getOrden() != null ? a.getOrden() : Integer.MAX_VALUE))
                .toList();

        PlanMantenimientoResponse planResp = planMapper.toResponse(plan, tipoActivoNombre, actividades.size());

        List<PlanPreventivoCompletoResponse.ActividadItemResponse> actResp = actividades.stream()
                .map(a -> new PlanPreventivoCompletoResponse.ActividadItemResponse(
                        a.getId(),
                        a.getActividadMantenimientoAplicacionId(),
                        a.getOrden(),
                        a.getObligatorio()
                ))
                .toList();

        List<PlanMantenimientoActivo> activos = planActivoRepository.findByPlanMantenimientoId(plan.getId());
        List<PlanPreventivoCompletoResponse.ActivoItemResponse> actvResp = new ArrayList<>();
        for (PlanMantenimientoActivo pma : activos) {
            Optional<ProgramacionMantenimiento> progOpt = programacionRepository.findByPlanMantenimientoActivoIdAndActivoTrue(pma.getId());
            UUID progId = progOpt.map(ProgramacionMantenimiento::getId).orElse(null);
            List<PlanPreventivoCompletoResponse.CriterioItemResponse> critResp = progId != null
                    ? criterioRepository.findByProgramacionMantenimientoId(progId).stream()
                            .map(c -> new PlanPreventivoCompletoResponse.CriterioItemResponse(
                                    c.getId(),
                                    c.getTipoCriterio(),
                                    c.getIntervaloDias(),
                                    c.getIntervaloUso(),
                                    c.getProximaFecha(),
                                    c.getProximoValorUso(),
                                    c.getActivo()
                            ))
                            .toList()
                    : List.of();
            actvResp.add(new PlanPreventivoCompletoResponse.ActivoItemResponse(
                    pma.getId(),
                    progId,
                    pma.getActivoId(),
                    pma.getResponsableId(),
                    pma.getFechaInicio(),
                    pma.getFechaFin(),
                    pma.getActivo(),
                    critResp
            ));
        }

        return new PlanPreventivoCompletoResponse(
                planResp,
                plan.getEstado(),
                plan.getTipoMantenimientoId(),
                plan.getCriterioDefaultTipo(),
                plan.getCriterioDefaultDias(),
                plan.getCriterioDefaultUso(),
                actResp,
                actvResp
        );
    }
}
