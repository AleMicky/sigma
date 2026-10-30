package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.model.TipoActivo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoValorEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.*;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response.*;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request.SolicitudMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response.SolicitudMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ProgramacionMantenimientoCriterioMapper;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ProgramacionMantenimientoHistorialMapper;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ProgramacionMantenimientoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimientoActivo;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimientoCriterio;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimientoHistorial;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.*;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.PrioridadEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.TipoMantenimientoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringPrioridadRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringTipoMantenimientoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProgramacionMantenimientoService {

    private final ProgramacionMantenimientoRepository repository;
    private final ProgramacionMantenimientoCriterioRepository criterioRepository;
    private final ProgramacionMantenimientoHistorialRepository historialRepository;
    private final PlanMantenimientoActivoRepository planMantenimientoActivoRepository;
    private final PlanMantenimientoRepository planMantenimientoRepository;
    private final ActivoRepository activoRepository;
    private final TipoActivoRepository tipoActivoRepository;
    private final ProgramacionMantenimientoCriterioService criterioService;
    private final SolicitudMantenimientoService solicitudMantenimientoService;
    private final SolicitudMantenimientoRepository solicitudRepository;
    private final SpringTipoMantenimientoRepository springTipoMantenimientoRepository;
    private final SpringPrioridadRepository springPrioridadRepository;
    private final SpringActivoAtributoRepository springActivoAtributoRepository;
    private final SpringActivoAtributoValorRepository springActivoAtributoValorRepository;
    private final EmpleadoRepository empleadoRepository;
    private final UsuarioRepository usuarioRepository;
    private final SecurityUtils securityUtils;
    private final ProgramacionMantenimientoMapper mapper;
    private final ProgramacionMantenimientoCriterioMapper criterioMapper;
    private final ProgramacionMantenimientoHistorialMapper historialMapper;
    private final ProgramacionSeguimientoExcelService excelService;

    private UUID resolverOCrearPlanActivo(ProgramacionMantenimientoRequest request) {
        if (request.activoId() == null || request.planMantenimientoId() == null) {
            throw new BusinessException("Debe especificar la asignación (planMantenimientoActivoId) o indicar el activo y el plan de mantenimiento.");
        }
        List<PlanMantenimientoActivo> asignaciones = planMantenimientoActivoRepository.findByActivoId(request.activoId());
        PlanMantenimientoActivo pma = asignaciones.stream()
                .filter(a -> Boolean.TRUE.equals(a.getActivo()) && request.planMantenimientoId().equals(a.getPlanMantenimientoId()))
                .findFirst()
                .orElseGet(() -> {
                    PlanMantenimientoActivo nueva = new PlanMantenimientoActivo();
                    nueva.setActivoId(request.activoId());
                    nueva.setPlanMantenimientoId(request.planMantenimientoId());
                    nueva.setResponsableId(obtenerEmpleadoIdActual());
                    nueva.setFechaInicio(LocalDate.now());
                    nueva.setActivo(true);
                    return planMantenimientoActivoRepository.save(nueva);
                });
        return pma.getId();
    }

    @Transactional
    public ProgramacionMantenimientoResponse create(ProgramacionMantenimientoRequest request) {
        final UUID planActivoId = request.planMantenimientoActivoId() != null
                ? request.planMantenimientoActivoId()
                : resolverOCrearPlanActivo(request);

        log.info("Creando programación de mantenimiento para planActivo: {}", planActivoId);

        PlanMantenimientoActivo planActivo = planMantenimientoActivoRepository.findById(planActivoId)
                .orElseThrow(() -> new ResourceNotFoundException("Asignación de activo al plan no encontrada: " + planActivoId));

        Activo activo = activoRepository.findById(planActivo.getActivoId())
                .orElseThrow(() -> new ResourceNotFoundException("Activo no encontrado: " + planActivo.getActivoId()));

        // Evitar múltiples programaciones activas para la misma asignación de activo
        if (Boolean.TRUE.equals(request.activo()) &&
                repository.existsByPlanMantenimientoActivoIdAndActivoTrue(planActivoId)) {
            throw new ConflictException("Ya existe una programación de mantenimiento activa para esta asignación del activo al plan.");
        }

        // Regla 1: Cada programación debe tener al menos un criterio activo.
        if (request.criterios() == null || request.criterios().isEmpty()) {
            throw new BusinessException("Cada programación debe tener al menos un criterio activo.");
        }

        boolean tieneCriterioActivo = request.criterios().stream()
                .anyMatch(c -> Boolean.TRUE.equals(c.activo()));
        if (!tieneCriterioActivo) {
            throw new BusinessException("Cada programación debe tener al menos un criterio activo.");
        }

        // Regla 2: No permitir dos criterios del mismo tipo dentro de una misma programación
        Set<TipoCriterioMantenimiento> tiposVistos = new HashSet<>();
        for (ProgramacionMantenimientoCriterioRequest c : request.criterios()) {
            if (c.tipoCriterio() == null) {
                throw new BusinessException("El tipo de criterio no puede ser nulo.");
            }
            if (!tiposVistos.add(c.tipoCriterio())) {
                throw new ConflictException(
                        "No se permite más de un criterio del tipo " + c.tipoCriterio() + " en la misma programación."
                );
            }

            // Regla 3: Validar que el activo pueda proporcionar el dato requerido: kilometraje u horas de uso.
            criterioService.validarCapacidadActivo(activo, c.tipoCriterio());
        }

        // Actualizar telemetría inicial del activo si viene proporcionada
        if (request.kilometrajeInicial() != null || request.horasUsoInicial() != null) {
            actualizarTelemetriaActivo(activo.getId(), request.kilometrajeInicial(), request.horasUsoInicial());
        }

        BigDecimal kmActual = request.kilometrajeInicial() != null ? request.kilometrajeInicial() : obtenerKilometrajeActual(activo.getId());
        BigDecimal horasActual = request.horasUsoInicial() != null ? request.horasUsoInicial() : obtenerHorasUsoActual(activo.getId());

        // Guardar la cabecera de la programación
        ProgramacionMantenimiento domain = mapper.toDomain(request);
        domain.setPlanMantenimientoActivoId(planActivoId);
        ProgramacionMantenimiento saved = repository.save(domain);

        // Guardar los criterios asociados
        List<ProgramacionMantenimientoCriterio> criteriosGuardados = new ArrayList<>();
        for (ProgramacionMantenimientoCriterioRequest cReq : request.criterios()) {
            ProgramacionMantenimientoCriterio cDomain = criterioMapper.toDomain(cReq);
            cDomain.setProgramacionMantenimientoId(saved.getId());

            // Auto-calcular proximoValorUso o proximaFecha si no fueron enviados explícitamente
            if (cReq.tipoCriterio() == TipoCriterioMantenimiento.KILOMETRAJE) {
                if (cDomain.getProximoValorUso() == null && cDomain.getIntervaloUso() != null) {
                    BigDecimal base = kmActual != null ? kmActual : BigDecimal.ZERO;
                    cDomain.setProximoValorUso(base.add(cDomain.getIntervaloUso()));
                }
            } else if (cReq.tipoCriterio() == TipoCriterioMantenimiento.HORAS_USO) {
                if (cDomain.getProximoValorUso() == null && cDomain.getIntervaloUso() != null) {
                    BigDecimal base = horasActual != null ? horasActual : BigDecimal.ZERO;
                    cDomain.setProximoValorUso(base.add(cDomain.getIntervaloUso()));
                }
            } else if (cReq.tipoCriterio() == TipoCriterioMantenimiento.TIEMPO) {
                if (cDomain.getProximaFecha() == null && cDomain.getIntervaloDias() != null) {
                    cDomain.setProximaFecha(LocalDate.now().plusDays(cDomain.getIntervaloDias()));
                }
            }

            criteriosGuardados.add(criterioRepository.save(cDomain));
        }

        saved.setCriterios(criteriosGuardados);
        return toEnrichedResponse(saved);
    }

    @Transactional
    public ProgramacionMantenimientoResponse update(UUID id, ProgramacionMantenimientoUpdate request) {
        log.info("Actualizando programación de mantenimiento {}", id);

        ProgramacionMantenimiento programacion = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programación de mantenimiento no encontrada: " + id));

        PlanMantenimientoActivo planActivo = planMantenimientoActivoRepository.findById(programacion.getPlanMantenimientoActivoId())
                .orElseThrow(() -> new ResourceNotFoundException("Asignación de activo al plan no encontrada"));

        Activo activo = activoRepository.findById(planActivo.getActivoId())
                .orElseThrow(() -> new ResourceNotFoundException("Activo no encontrado"));

        if (request.kilometrajeInicial() != null || request.horasUsoInicial() != null) {
            actualizarTelemetriaActivo(activo.getId(), request.kilometrajeInicial(), request.horasUsoInicial());
        }

        BigDecimal kmActual = request.kilometrajeInicial() != null ? request.kilometrajeInicial() : obtenerKilometrajeActual(activo.getId());
        BigDecimal horasActual = request.horasUsoInicial() != null ? request.horasUsoInicial() : obtenerHorasUsoActual(activo.getId());

        if (request.activo() != null) {
            if (Boolean.TRUE.equals(request.activo()) &&
                    repository.existsByPlanMantenimientoActivoIdAndActivoTrueAndIdNot(programacion.getPlanMantenimientoActivoId(), id)) {
                throw new ConflictException("Ya existe otra programación activa para esta asignación del activo al plan.");
            }
            programacion.setActivo(request.activo());
        }

        if (request.criterios() != null) {
            // Regla 1: Cada programación debe tener al menos un criterio activo
            boolean tieneActivo = request.criterios().stream().anyMatch(c -> Boolean.TRUE.equals(c.activo()));
            if (!tieneActivo) {
                throw new BusinessException("Cada programación debe tener al menos un criterio activo.");
            }

            // Regla 2: Unicidad de tipos
            Set<TipoCriterioMantenimiento> tipos = new HashSet<>();
            for (ProgramacionMantenimientoCriterioRequest c : request.criterios()) {
                if (!tipos.add(c.tipoCriterio())) {
                    throw new ConflictException("No se permite más de un criterio del tipo " + c.tipoCriterio() + " en la misma programación.");
                }
                // Regla 3: Validar que el activo pueda proporcionar el dato requerido
                criterioService.validarCapacidadActivo(activo, c.tipoCriterio());
            }

            // Actualizar criterios existentes o agregar nuevos
            List<ProgramacionMantenimientoCriterio> existentes = criterioRepository.findByProgramacionMantenimientoId(id);
            Map<UUID, ProgramacionMantenimientoCriterio> mapExistentes = existentes.stream()
                    .collect(Collectors.toMap(ProgramacionMantenimientoCriterio::getId, c -> c));

            List<ProgramacionMantenimientoCriterio> nuevosCriterios = new ArrayList<>();
            Set<UUID> idsEnRequest = new HashSet<>();

            for (ProgramacionMantenimientoCriterioRequest cReq : request.criterios()) {
                BigDecimal nextVal = cReq.proximoValorUso();
                LocalDate nextDate = cReq.proximaFecha();

                if (cReq.tipoCriterio() == TipoCriterioMantenimiento.KILOMETRAJE && nextVal == null && cReq.intervaloUso() != null) {
                    BigDecimal base = kmActual != null ? kmActual : BigDecimal.ZERO;
                    nextVal = base.add(cReq.intervaloUso());
                } else if (cReq.tipoCriterio() == TipoCriterioMantenimiento.HORAS_USO && nextVal == null && cReq.intervaloUso() != null) {
                    BigDecimal base = horasActual != null ? horasActual : BigDecimal.ZERO;
                    nextVal = base.add(cReq.intervaloUso());
                } else if (cReq.tipoCriterio() == TipoCriterioMantenimiento.TIEMPO && nextDate == null && cReq.intervaloDias() != null) {
                    nextDate = LocalDate.now().plusDays(cReq.intervaloDias());
                }

                if (cReq.id() != null && mapExistentes.containsKey(cReq.id())) {
                    ProgramacionMantenimientoCriterio exist = mapExistentes.get(cReq.id());
                    exist.setTipoCriterio(cReq.tipoCriterio());
                    exist.setIntervaloDias(cReq.intervaloDias());
                    exist.setIntervaloUso(cReq.intervaloUso());
                    exist.setProximaFecha(nextDate);
                    exist.setProximoValorUso(nextVal);
                    exist.setActivo(cReq.activo());
                    nuevosCriterios.add(criterioRepository.save(exist));
                    idsEnRequest.add(cReq.id());
                } else {
                    ProgramacionMantenimientoCriterio cDomain = criterioMapper.toDomain(cReq);
                    cDomain.setProgramacionMantenimientoId(id);
                    cDomain.setProximoValorUso(nextVal);
                    cDomain.setProximaFecha(nextDate);
                    nuevosCriterios.add(criterioRepository.save(cDomain));
                }
            }

            // Eliminar los que ya no están en la lista
            for (ProgramacionMantenimientoCriterio exist : existentes) {
                if (!idsEnRequest.contains(exist.getId())) {
                    criterioRepository.deleteById(exist.getId());
                }
            }
            programacion.setCriterios(nuevosCriterios);
        }

        ProgramacionMantenimiento saved = repository.save(programacion);
        return toEnrichedResponse(saved);
    }

    /**
     * Aplica la programación preventiva a todos los activos pertenecientes a un tipo de activo en lote.
     */
    @Transactional
    public BatchProgramacionTipoResponse crearPorTipoActivo(ProgramacionTipoActivoBatchRequest request) {
        log.info("Creando programación preventiva masiva por tipo de activo: tipoActivoId={}, planId={}",
                request.tipoActivoId(), request.planMantenimientoId());

        if (request.criterios() == null || request.criterios().isEmpty()) {
            throw new BusinessException("Debe configurar al menos un criterio para la programación.");
        }

        PlanMantenimiento plan = planMantenimientoRepository.findById(request.planMantenimientoId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan de mantenimiento no encontrado: " + request.planMantenimientoId()));

        Page<Activo> activosPage = activoRepository.findByTipoActivoId(request.tipoActivoId(), Pageable.unpaged());
        List<Activo> activos = activosPage.getContent();
        if (activos.isEmpty()) {
            throw new BusinessException("No se encontraron activos asociados al tipo de activo seleccionado.");
        }

        int creados = 0;
        int actualizados = 0;

        for (Activo a : activos) {
            // Asignar al plan si no está asignado
            List<PlanMantenimientoActivo> asigs = planMantenimientoActivoRepository.findByActivoId(a.getId());
            PlanMantenimientoActivo pma = asigs.stream()
                    .filter(x -> Boolean.TRUE.equals(x.getActivo()) && request.planMantenimientoId().equals(x.getPlanMantenimientoId()))
                    .findFirst()
                    .orElseGet(() -> {
                        PlanMantenimientoActivo nuevo = new PlanMantenimientoActivo();
                        nuevo.setActivoId(a.getId());
                        nuevo.setPlanMantenimientoId(request.planMantenimientoId());
                        nuevo.setResponsableId(obtenerEmpleadoIdActual());
                        nuevo.setFechaInicio(LocalDate.now());
                        nuevo.setActivo(true);
                        return planMantenimientoActivoRepository.save(nuevo);
                    });

            Optional<ProgramacionMantenimiento> existProg = repository.findByPlanMantenimientoActivoIdAndActivoTrue(pma.getId());
            if (existProg.isPresent()) {
                ProgramacionMantenimientoUpdate updateDto = new ProgramacionMantenimientoUpdate(
                        true,
                        null,
                        null,
                        request.criterios()
                );
                update(existProg.get().getId(), updateDto);
                actualizados++;
            } else {
                ProgramacionMantenimientoRequest req = new ProgramacionMantenimientoRequest(
                        pma.getId(),
                        a.getId(),
                        request.planMantenimientoId(),
                        true,
                        null,
                        null,
                        request.criterios()
                );
                create(req);
                creados++;
            }
        }

        return new BatchProgramacionTipoResponse(
                creados,
                actualizados,
                activos.size(),
                "Programación preventiva aplicada exitosamente a " + activos.size() + " activos (" + creados + " nuevas, " + actualizados + " actualizadas)."
        );
    }

    @Transactional
    public ProgramacionMantenimientoResponse activar(UUID id) {
        ProgramacionMantenimiento programacion = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programación de mantenimiento no encontrada: " + id));

        if (repository.existsByPlanMantenimientoActivoIdAndActivoTrueAndIdNot(programacion.getPlanMantenimientoActivoId(), id)) {
            throw new ConflictException("Ya existe una programación activa para esta asignación del activo.");
        }

        // Regla 1: Cada programación debe tener al menos un criterio activo
        long activos = criterioRepository.countByProgramacionMantenimientoIdAndActivoTrue(id);
        if (activos == 0) {
            throw new BusinessException("No se puede activar la programación porque no posee ningún criterio activo.");
        }

        programacion.setActivo(true);
        return toEnrichedResponse(repository.save(programacion));
    }

    @Transactional
    public ProgramacionMantenimientoResponse desactivar(UUID id) {
        ProgramacionMantenimiento programacion = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programación de mantenimiento no encontrada: " + id));
        programacion.setActivo(false);
        return toEnrichedResponse(repository.save(programacion));
    }

    @Transactional
    public void delete(UUID id) {
        ProgramacionMantenimiento programacion = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programación de mantenimiento no encontrada: " + id));

        // Eliminar criterios asociados y la programación
        List<ProgramacionMantenimientoCriterio> criterios = criterioRepository.findByProgramacionMantenimientoId(id);
        for (ProgramacionMantenimientoCriterio c : criterios) {
            criterioRepository.deleteById(c.getId());
        }

        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public ProgramacionMantenimientoResponse findById(UUID id) {
        ProgramacionMantenimiento programacion = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programación de mantenimiento no encontrada: " + id));
        return toEnrichedResponse(programacion);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProgramacionMantenimientoResponse> findAll(
            UUID planMantenimientoActivoId,
            UUID activoId,
            Boolean activo,
            String q,
            PageRequestDto pageRequest
    ) {
        Pageable pageable = pageRequest.toPageable(Set.of("id", "createdAt", "updatedAt", "activo"));
        String searchQ = (q != null && !q.isBlank()) ? q.trim() : null;
        Page<ProgramacionMantenimiento> page = repository.search(planMantenimientoActivoId, activoId, activo, searchQ, pageable);
        List<ProgramacionMantenimientoResponse> content = page.getContent().stream()
                .map(this::toEnrichedResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, page);
    }

    @Transactional(readOnly = true)
    public List<ProgramacionMantenimientoResponse> findByPlanMantenimientoActivoId(UUID planMantenimientoActivoId) {
        return repository.findByPlanMantenimientoActivoId(planMantenimientoActivoId).stream()
                .map(this::toEnrichedResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public byte[] generarReporteExcel(
            UUID planMantenimientoActivoId,
            UUID activoId,
            Boolean activo,
            String q
    ) {
        log.info("Generando reporte Excel de seguimiento preventivo");
        String searchQ = (q != null && !q.isBlank()) ? q.trim() : null;
        Page<ProgramacionMantenimiento> page = repository.search(planMantenimientoActivoId, activoId, activo, searchQ, Pageable.unpaged());
        List<ProgramacionMantenimientoResponse> content = page.getContent().stream()
                .map(this::toEnrichedResponse)
                .collect(Collectors.toList());
        return excelService.generarExcel(content);
    }

    /**
     * Regla 4: Cuando se cumpla cualquier criterio, generar una sola solicitud para esa ejecución.
     * Regla 6: Conservar el historial de los valores que provocaron cada mantenimiento.
     */
    @Transactional
    public EvaluacionProgramacionResponse evaluarProgramacion(UUID id, EvaluarProgramacionRequest request) {
        log.info("Evaluando programación de mantenimiento: {}", id);

        ProgramacionMantenimiento programacion = repository.findByIdWithLock(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programación de mantenimiento no encontrada: " + id));

        if (!Boolean.TRUE.equals(programacion.getActivo())) {
            return new EvaluacionProgramacionResponse(
                    id, false, null, "La programación se encuentra inactiva.",
                    false, false, null, null, "Programación inactiva"
            );
        }

        PlanMantenimientoActivo planActivo = planMantenimientoActivoRepository.findById(programacion.getPlanMantenimientoActivoId())
                .orElseThrow(() -> new ResourceNotFoundException("Asignación de activo al plan no encontrada"));

        if (!Boolean.TRUE.equals(planActivo.getActivo())) {
            return new EvaluacionProgramacionResponse(
                    id, false, null, "La asignación del activo al plan de mantenimiento se encuentra inactiva.",
                    false, false, null, null, "Asignación inactiva"
            );
        }

        Activo activo = activoRepository.findById(planActivo.getActivoId())
                .orElseThrow(() -> new ResourceNotFoundException("Activo no encontrado: " + planActivo.getActivoId()));

        PlanMantenimiento plan = planMantenimientoRepository.findById(planActivo.getPlanMantenimientoId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan de mantenimiento no encontrado: " + planActivo.getPlanMantenimientoId()));

        List<ProgramacionMantenimientoCriterio> criteriosActivos =
                criterioRepository.findByProgramacionMantenimientoIdAndActivoTrue(id);

        if (criteriosActivos.isEmpty()) {
            return new EvaluacionProgramacionResponse(
                    id, false, null, "La programación no tiene criterios activos configurados.",
                    false, false, null, null, "Sin criterios activos"
            );
        }

        LocalDate fechaActual = (request != null && request.fechaActual() != null)
                ? request.fechaActual()
                : LocalDate.now();

        BigDecimal kmActual = (request != null && request.kilometrajeActual() != null)
                ? request.kilometrajeActual()
                : obtenerKilometrajeActual(activo.getId());

        BigDecimal horasActual = (request != null && request.horasUsoActual() != null)
                ? request.horasUsoActual()
                : obtenerHorasUsoActual(activo.getId());

        ProgramacionMantenimientoCriterio criterioDisparador = null;
        String motivoDisparo = null;
        String valorDisparador = null;
        String valorLimite = null;

        for (ProgramacionMantenimientoCriterio criterio : criteriosActivos) {
            if (criterio.getTipoCriterio() == TipoCriterioMantenimiento.TIEMPO) {
                if (criterio.getProximaFecha() != null && !fechaActual.isBefore(criterio.getProximaFecha())) {
                    criterioDisparador = criterio;
                    motivoDisparo = "Fecha programada alcanzada (" + criterio.getProximaFecha() + " <= " + fechaActual + ")";
                    valorDisparador = "Fecha actual: " + fechaActual;
                    valorLimite = "Fecha programada: " + criterio.getProximaFecha();
                    break;
                }
            } else if (criterio.getTipoCriterio() == TipoCriterioMantenimiento.KILOMETRAJE) {
                if (criterio.getProximoValorUso() != null && kmActual != null && kmActual.compareTo(criterio.getProximoValorUso()) >= 0) {
                    criterioDisparador = criterio;
                    motivoDisparo = "Kilometraje límite alcanzado (" + kmActual + " km >= " + criterio.getProximoValorUso() + " km)";
                    valorDisparador = "Odómetro actual: " + kmActual + " km";
                    valorLimite = "Límite programado: " + criterio.getProximoValorUso() + " km";
                    break;
                }
            } else if (criterio.getTipoCriterio() == TipoCriterioMantenimiento.HORAS_USO) {
                if (criterio.getProximoValorUso() != null && horasActual != null && horasActual.compareTo(criterio.getProximoValorUso()) >= 0) {
                    criterioDisparador = criterio;
                    motivoDisparo = "Horas de uso límite alcanzadas (" + horasActual + " hrs >= " + criterio.getProximoValorUso() + " hrs)";
                    valorDisparador = "Horas actuales: " + horasActual + " hrs";
                    valorLimite = "Límite programado: " + criterio.getProximoValorUso() + " hrs";
                    break;
                }
            }
        }

        boolean forzar = request != null && Boolean.TRUE.equals(request.forzarGeneracion());
        if (criterioDisparador == null && !forzar) {
            return new EvaluacionProgramacionResponse(
                    id, false, null, "Ningún criterio ha cumplido su condición de ejecución preventiva.",
                    false, false, null, null, "Condiciones de mantenimiento no alcanzadas aún."
            );
        }

        if (criterioDisparador == null) {
            criterioDisparador = criteriosActivos.get(0);
            motivoDisparo = "Generación forzada manualmente por el usuario";
            valorDisparador = "Evaluado el " + fechaActual;
            valorLimite = "Forzado";
        }

        // Regla 4: Verificar si ya existe una solicitud abierta generada para esta ejecución
        Optional<ProgramacionMantenimientoHistorial> pendingHistorial =
                historialRepository.findFirstPendingByProgramacionMantenimientoId(id);

        if (pendingHistorial.isPresent() && pendingHistorial.get().getSolicitudMantenimientoId() != null) {
            UUID openSolId = pendingHistorial.get().getSolicitudMantenimientoId();
            Optional<SolicitudMantenimiento> openSolOpt = solicitudRepository.findById(openSolId);
            if (openSolOpt.isPresent()) {
                SolicitudMantenimiento openSol = openSolOpt.get();
                String estado = openSol.getEstado() != null ? openSol.getEstado().toUpperCase() : "";
                boolean esTerminado = estado.equals("FINALIZADO") || estado.equals("CERRADO")
                        || estado.equals("CANCELADO") || estado.equals("RECHAZADO")
                        || estado.equals("TRABAJO_REALIZADO");

                if (!esTerminado) {
                    return new EvaluacionProgramacionResponse(
                            id, true, criterioDisparador.getTipoCriterio(), motivoDisparo,
                            false, true, openSol.getId(), openSol.getNumero(),
                            "El criterio se cumple, pero ya existe una solicitud activa en trámite (" + openSol.getNumero() + " - " + openSol.getEstado() + ") para esta programación."
                    );
                } else if (estado.equals("FINALIZADO") || estado.equals("CERRADO") || estado.equals("TRABAJO_REALIZADO")) {
                    ProgramacionMantenimientoHistorial h = pendingHistorial.get();
                    h.setCompletado(true);
                    h.setFechaServicio(LocalDate.now());
                    historialRepository.save(h);
                }
            }
        }

        // Regla 4: Generar una sola solicitud para esa ejecución
        UUID tipoMantenimientoId = springTipoMantenimientoRepository.findByCodigoIgnoreCase("PREVENTIVO")
                .map(TipoMantenimientoEntity::getId)
                .orElseThrow(() -> new BusinessException("TIPO_MANTENIMIENTO_NO_CONFIGURADO",
                        "No se encontró el tipo de mantenimiento 'PREVENTIVO' configurado en el sistema."));

        UUID prioridadId = springPrioridadRepository.findFirstByPorDefectoTrue()
                .or(() -> springPrioridadRepository.findByCodigoIgnoreCase("NORMAL"))
                .or(() -> springPrioridadRepository.findByCodigoIgnoreCase("MEDIA"))
                .map(PrioridadEntity::getId)
                .orElseThrow(() -> new BusinessException("PRIORIDAD_NO_CONFIGURADA",
                        "No se encontró una prioridad por defecto ('NORMAL' o 'MEDIA') configurada en el sistema."));

        UUID solicitanteId = planActivo.getResponsableId();
        if (solicitanteId == null) {
            solicitanteId = obtenerEmpleadoIdActual();
        }
        if (solicitanteId == null && planActivo.getCreatedById() != null) {
            solicitanteId = usuarioRepository.findById(planActivo.getCreatedById())
                    .map(Usuario::getPersonaId)
                    .flatMap(empleadoRepository::findFirstByPersonaId)
                    .map(Empleado::getId)
                    .orElse(null);
        }
        if (solicitanteId == null && programacion.getCreatedById() != null) {
            solicitanteId = usuarioRepository.findById(programacion.getCreatedById())
                    .map(Usuario::getPersonaId)
                    .flatMap(empleadoRepository::findFirstByPersonaId)
                    .map(Empleado::getId)
                    .orElse(null);
        }
        if (solicitanteId == null) {
            solicitanteId = empleadoRepository.findAll(Pageable.ofSize(1)).stream()
                    .findFirst()
                    .map(Empleado::getId)
                    .orElse(null);
        }
        if (solicitanteId == null) {
            throw new BusinessException("SOLICITANTE_NO_ASIGNADO",
                    "No se puede generar la solicitud automática: no se encontró un empleado responsable o disponible para el activo ('" +
                    activo.getCodigo() + " - " + activo.getNombre() + "').");
        }

        String titulo = "Mantenimiento Preventivo: " + plan.getNombre() + " (" + activo.getCodigo() + ")";
        String descripcion = "Solicitud automática generada por programación de mantenimiento preventiva.\n"
                + "Plan de Mantenimiento: " + plan.getCodigo() + " - " + plan.getNombre() + ".\n"
                + "Activo: " + activo.getCodigo() + " - " + activo.getNombre() + ".\n"
                + "Disparador: Criterio " + criterioDisparador.getTipoCriterio() + ".\n"
                + "Detalle: " + motivoDisparo + ".\n"
                + "Valores registrados al momento del disparo: " + valorDisparador + ".";

        SolicitudMantenimientoRequest solRequest = new SolicitudMantenimientoRequest(
                activo.getId(),
                tipoMantenimientoId,
                List.of("Mantenimiento preventivo programado"),
                prioridadId,
                solicitanteId,
                titulo,
                descripcion,
                Collections.emptyList()
        );

        SolicitudMantenimientoResponse solResponse = solicitudMantenimientoService.create(solRequest);

        // Promover automáticamente la solicitud preventiva a estado SOLICITADO para ingresar al flujo de aprobación
        try {
            UUID aprobador = planActivo.getResponsableId() != null ? planActivo.getResponsableId() : solicitanteId;
            solicitudMantenimientoService.enviar(
                    solResponse.id(),
                    new EnviarSolicitudMantenimientoRequest(
                            aprobador,
                            planActivo.getResponsableId(),
                            planActivo.getResponsableId()
                    )
            );
            log.info("Solicitud preventiva {} promovida automáticamente a SOLICITADO", solResponse.numero());
        } catch (Exception e) {
            log.warn("Solicitud preventiva {} creada en BORRADOR (no se pudo auto-enviar a aprobación: {})",
                    solResponse.numero(), e.getMessage());
        }

        // Regla 6: Conservar el historial de los valores que provocaron cada mantenimiento
        StringBuilder snapshot = new StringBuilder();
        for (ProgramacionMantenimientoCriterio c : criteriosActivos) {
            snapshot.append("[").append(c.getTipoCriterio()).append("]: ");
            if (c.getTipoCriterio() == TipoCriterioMantenimiento.TIEMPO) {
                snapshot.append("Intervalo=").append(c.getIntervaloDias()).append(" días, PróximaFecha=").append(c.getProximaFecha());
            } else {
                snapshot.append("Intervalo=").append(c.getIntervaloUso()).append(", PróximoValor=").append(c.getProximoValorUso());
            }
            snapshot.append("; ");
        }

        ProgramacionMantenimientoHistorial historial = ProgramacionMantenimientoHistorial.builder()
                .programacionMantenimientoId(id)
                .solicitudMantenimientoId(solResponse.id())
                .solicitudNumero(solResponse.numero())
                .tipoCriterioDisparador(criterioDisparador.getTipoCriterio())
                .valorDisparador(valorDisparador)
                .valorLimite(valorLimite)
                .fechaDisparo(LocalDateTime.now())
                .snapshotValores(snapshot.toString())
                .completado(false)
                .build();

        historialRepository.save(historial);

        return new EvaluacionProgramacionResponse(
                id,
                true,
                criterioDisparador.getTipoCriterio(),
                motivoDisparo,
                true,
                false,
                solResponse.id(),
                solResponse.numero(),
                "Solicitud de mantenimiento preventivo " + solResponse.numero() + " generada exitosamente."
        );
    }

    /**
     * Evalúa todas las programaciones de mantenimiento activas en lote.
     * Útil para ejecución manual por el planificador o invocación masiva.
     */
    @Transactional
    public BatchEvaluacionProgramacionResponse evaluarTodas() {
        log.info("Iniciando evaluación en lote de todas las programaciones activas");
        List<ProgramacionMantenimiento> activas = repository.findByActivoTrue();

        int solicitudesGeneradas = 0;
        int yaExistiaSolicitudAbierta = 0;
        int cumplieronCriterio = 0;
        int errores = 0;
        List<EvaluacionProgramacionResponse> resultados = new ArrayList<>();

        for (ProgramacionMantenimiento prog : activas) {
            try {
                EvaluacionProgramacionResponse resp = evaluarProgramacion(prog.getId(), null);
                resultados.add(resp);
                if (resp.solicitudGenerada()) {
                    solicitudesGeneradas++;
                }
                if (resp.yaExistiaSolicitudAbierta()) {
                    yaExistiaSolicitudAbierta++;
                }
                if (resp.cumpleCriterio()) {
                    cumplieronCriterio++;
                }
            } catch (Exception e) {
                log.error("Error al evaluar programación en lote {}: {}", prog.getId(), e.getMessage());
                errores++;
                resultados.add(new EvaluacionProgramacionResponse(
                        prog.getId(),
                        false,
                        null,
                        "Error al evaluar: " + e.getMessage(),
                        false,
                        false,
                        null,
                        null,
                        "Error durante la evaluación de la programación: " + e.getMessage()
                ));
            }
        }

        log.info("Evaluación en lote finalizada. Total: {}, Solicitudes generadas: {}, Ya abiertas: {}, Errores: {}",
                activas.size(), solicitudesGeneradas, yaExistiaSolicitudAbierta, errores);

        return new BatchEvaluacionProgramacionResponse(
                activas.size(),
                solicitudesGeneradas,
                yaExistiaSolicitudAbierta,
                cumplieronCriterio,
                errores,
                resultados
        );
    }

    /**
     * Regla 5: Una vez completado el mantenimiento, recalcular todos los criterios de la programación tomando como referencia el servicio realizado.
     * Regla 6: Conservar el historial de los valores que provocaron cada mantenimiento y registrar la culminación del servicio.
     */
    @Transactional
    public ProgramacionMantenimientoResponse completarMantenimiento(UUID id, CompletarMantenimientoProgramadoRequest request) {
        log.info("Completando mantenimiento y recalculando criterios para la programación {}", id);

        ProgramacionMantenimiento programacion = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programación de mantenimiento no encontrada: " + id));

        LocalDate fechaServicio = (request != null && request.fechaServicio() != null)
                ? request.fechaServicio()
                : LocalDate.now();

        PlanMantenimientoActivo planActivo = null;
        if (programacion.getPlanMantenimientoActivoId() != null) {
            planActivo = planMantenimientoActivoRepository.findById(programacion.getPlanMantenimientoActivoId()).orElse(null);
        }
        UUID activoId = planActivo != null ? planActivo.getActivoId() : null;

        List<ProgramacionMantenimientoCriterio> criterios = criterioRepository.findByProgramacionMantenimientoId(id);

        for (ProgramacionMantenimientoCriterio criterio : criterios) {
            if (criterio.getTipoCriterio() == TipoCriterioMantenimiento.TIEMPO) {
                if (criterio.getIntervaloDias() != null) {
                    criterio.setProximaFecha(fechaServicio.plusDays(criterio.getIntervaloDias()));
                }
            } else if (criterio.getTipoCriterio() == TipoCriterioMantenimiento.KILOMETRAJE) {
                if (criterio.getIntervaloUso() != null) {
                    BigDecimal base = (request != null && request.kilometrajeServicio() != null)
                            ? request.kilometrajeServicio()
                            : (activoId != null ? obtenerKilometrajeActual(activoId) : null);
                    if (base == null) {
                        base = criterio.getProximoValorUso() != null ? criterio.getProximoValorUso() : BigDecimal.ZERO;
                    }
                    criterio.setProximoValorUso(base.add(criterio.getIntervaloUso()));
                }
            } else if (criterio.getTipoCriterio() == TipoCriterioMantenimiento.HORAS_USO) {
                if (criterio.getIntervaloUso() != null) {
                    BigDecimal base = (request != null && request.horasUsoServicio() != null)
                            ? request.horasUsoServicio()
                            : (activoId != null ? obtenerHorasUsoActual(activoId) : null);
                    if (base == null) {
                        base = criterio.getProximoValorUso() != null ? criterio.getProximoValorUso() : BigDecimal.ZERO;
                    }
                    criterio.setProximoValorUso(base.add(criterio.getIntervaloUso()));
                }
            }
            criterioRepository.save(criterio);
        }

        // Actualizar historial si existía registro pendiente
        Optional<ProgramacionMantenimientoHistorial> histOpt = (request != null && request.solicitudId() != null)
                ? historialRepository.findBySolicitudMantenimientoId(request.solicitudId())
                : historialRepository.findFirstPendingByProgramacionMantenimientoId(id);

        if (histOpt.isPresent()) {
            ProgramacionMantenimientoHistorial hist = histOpt.get();
            hist.setCompletado(true);
            hist.setFechaServicio(fechaServicio);
            if (request != null) {
                hist.setValorUsoServicio(request.kilometrajeServicio() != null ? request.kilometrajeServicio() : request.horasUsoServicio());
                if (request.observacion() != null) {
                    hist.setObservacion(request.observacion());
                }
            }
            historialRepository.save(hist);
        }

        // Actualizar telemetría del activo en activo_atributo_valores si se registró nuevo odómetro/horómetro
        if (activoId != null && request != null && (request.kilometrajeServicio() != null || request.horasUsoServicio() != null)) {
            actualizarTelemetriaActivo(activoId, request.kilometrajeServicio(), request.horasUsoServicio());
        }

        programacion.setCriterios(criterios);
        return toEnrichedResponse(programacion);
    }

    /**
     * Cierra el ciclo preventivo recalculando los criterios de la programación asociada a una solicitud concluida.
     */
    @Transactional
    public void sincronizarFinMantenimientoPorSolicitud(UUID solicitudId, UUID activoId) {
        if (solicitudId == null) {
            return;
        }

        Optional<ProgramacionMantenimientoHistorial> histOpt = historialRepository.findBySolicitudMantenimientoId(solicitudId);
        if (histOpt.isEmpty()) {
            return;
        }

        ProgramacionMantenimientoHistorial hist = histOpt.get();
        if (Boolean.TRUE.equals(hist.getCompletado())) {
            log.debug("El historial de la solicitud {} ya se encuentra marcado como completado.", solicitudId);
            return;
        }

        UUID programacionId = hist.getProgramacionMantenimientoId();
        if (programacionId == null) {
            return;
        }

        BigDecimal kmActual = activoId != null ? obtenerKilometrajeActual(activoId) : null;
        BigDecimal horasActual = activoId != null ? obtenerHorasUsoActual(activoId) : null;

        CompletarMantenimientoProgramadoRequest req = new CompletarMantenimientoProgramadoRequest(
                LocalDate.now(),
                kmActual,
                horasActual,
                solicitudId,
                "Mantenimiento preventivo completado automáticamente al finalizar solicitud " +
                        (hist.getSolicitudNumero() != null ? hist.getSolicitudNumero() : solicitudId)
        );

        completarMantenimiento(programacionId, req);
        log.info("Programación {} recalculada exitosamente por finalización de solicitud {}", programacionId, solicitudId);
    }

    @Transactional(readOnly = true)
    public List<ProgramacionMantenimientoHistorialResponse> obtenerHistorial(UUID programacionId) {
        return historialRepository.findByProgramacionMantenimientoId(programacionId).stream()
                .map(historialMapper::toResponse)
                .collect(Collectors.toList());
    }

    private BigDecimal obtenerKilometrajeActual(UUID activoId) {
        try {
            List<ActivoAtributoValorEntity> valores = springActivoAtributoValorRepository.findByActivoId(activoId);
            for (ActivoAtributoValorEntity v : valores) {
                if (v.getActivoAtributoId() != null && v.getValor() != null && !v.getValor().isBlank()) {
                    Optional<ActivoAtributoEntity> def = springActivoAtributoRepository.findById(v.getActivoAtributoId());
                    if (def.isPresent()) {
                        String codigo = def.get().getCodigo();
                        if ("KILOMETRAJE".equalsIgnoreCase(codigo) || "KM".equalsIgnoreCase(codigo) || "ODOMETRO".equalsIgnoreCase(codigo)) {
                            return new BigDecimal(v.getValor().trim());
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("No se pudo obtener el kilometraje automático para activo {}: {}", activoId, e.getMessage());
        }
        return null;
    }

    private BigDecimal obtenerHorasUsoActual(UUID activoId) {
        try {
            List<ActivoAtributoValorEntity> valores = springActivoAtributoValorRepository.findByActivoId(activoId);
            for (ActivoAtributoValorEntity v : valores) {
                if (v.getActivoAtributoId() != null && v.getValor() != null && !v.getValor().isBlank()) {
                    Optional<ActivoAtributoEntity> def = springActivoAtributoRepository.findById(v.getActivoAtributoId());
                    if (def.isPresent()) {
                        String codigo = def.get().getCodigo();
                        if ("HORAS_USO".equalsIgnoreCase(codigo) || "HOROMETRO".equalsIgnoreCase(codigo)
                                || "HORAS".equalsIgnoreCase(codigo) || "HORAS_TRABAJO".equalsIgnoreCase(codigo)) {
                            return new BigDecimal(v.getValor().trim());
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("No se pudo obtener las horas de uso automáticas para activo {}: {}", activoId, e.getMessage());
        }
        return null;
    }

    /**
     * Sincroniza y actualiza los valores de telemetría (odómetro y horómetro) del activo.
     * Solo actualiza si el valor nuevo es mayor al registrado previamente.
     */
    @Transactional
    public void actualizarTelemetriaActivo(UUID activoId, BigDecimal kilometraje, BigDecimal horasUso) {
        if (activoId == null) {
            return;
        }

        try {
            Activo activo = activoRepository.findById(activoId).orElse(null);
            if (activo == null || activo.getTipoActivoId() == null) {
                return;
            }
            UUID tipoActivoId = activo.getTipoActivoId();

            List<ActivoAtributoValorEntity> valoresExistentes = springActivoAtributoValorRepository.findByActivoId(activoId);

            if (kilometraje != null && kilometraje.compareTo(BigDecimal.ZERO) >= 0) {
                actualizarOInsertarAtributo(
                        activoId,
                        tipoActivoId,
                        valoresExistentes,
                        List.of("KILOMETRAJE", "KM", "ODOMETRO"),
                        kilometraje
                );
            }

            if (horasUso != null && horasUso.compareTo(BigDecimal.ZERO) >= 0) {
                actualizarOInsertarAtributo(
                        activoId,
                        tipoActivoId,
                        valoresExistentes,
                        List.of("HORAS_USO", "HOROMETRO", "HORAS", "HORAS_TRABAJO"),
                        horasUso
                );
            }
        } catch (Exception e) {
            log.warn("Error al actualizar telemetría para activo {}: {}", activoId, e.getMessage());
        }
    }

    private void actualizarOInsertarAtributo(
            UUID activoId,
            UUID tipoActivoId,
            List<ActivoAtributoValorEntity> valoresExistentes,
            List<String> codigosCandidatos,
            BigDecimal nuevoValor
    ) {
        for (ActivoAtributoValorEntity v : valoresExistentes) {
            if (v.getActivoAtributoId() != null) {
                Optional<ActivoAtributoEntity> attrOpt = springActivoAtributoRepository.findById(v.getActivoAtributoId());
                if (attrOpt.isPresent() && codigosCandidatos.stream().anyMatch(c -> c.equalsIgnoreCase(attrOpt.get().getCodigo()))) {
                    BigDecimal valorActual = null;
                    try {
                        if (v.getValor() != null && !v.getValor().isBlank()) {
                            valorActual = new BigDecimal(v.getValor().trim());
                        }
                    } catch (Exception ignored) {
                    }

                    if (valorActual == null || nuevoValor.compareTo(valorActual) > 0) {
                        v.setValor(nuevoValor.stripTrailingZeros().toPlainString());
                        springActivoAtributoValorRepository.save(v);
                        log.info("Telemetría actualizada para activo {} en atributo {}: de {} a {}",
                                activoId, attrOpt.get().getCodigo(), valorActual, nuevoValor);
                    }
                    return;
                }
            }
        }

        if (tipoActivoId != null) {
            List<ActivoAtributoEntity> definiciones = springActivoAtributoRepository.findByTipoActivoId(tipoActivoId);
            for (ActivoAtributoEntity def : definiciones) {
                if (codigosCandidatos.stream().anyMatch(c -> c.equalsIgnoreCase(def.getCodigo()))) {
                    ActivoAtributoValorEntity nuevo = new ActivoAtributoValorEntity();
                    nuevo.setActivoId(activoId);
                    nuevo.setActivoAtributoId(def.getId());
                    nuevo.setValor(nuevoValor.stripTrailingZeros().toPlainString());
                    springActivoAtributoValorRepository.save(nuevo);
                    log.info("Nuevo valor de telemetría registrado para activo {} en atributo {}: {}",
                            activoId, def.getCodigo(), nuevoValor);
                    return;
                }
            }
        }
    }

    private UUID obtenerEmpleadoIdActual() {
        return securityUtils.getCurrentUserId()
                .flatMap(usuarioRepository::findById)
                .map(Usuario::getPersonaId)
                .flatMap(empleadoRepository::findFirstByPersonaId)
                .map(Empleado::getId)
                .orElse(null);
    }

    private ProgramacionMantenimientoResponse toEnrichedResponse(ProgramacionMantenimiento domain) {
        ProgramacionMantenimientoResponse.PlanActivoInfo planActivoInfo = null;

        UUID resolvedActivoId = null;
        if (domain.getPlanMantenimientoActivoId() != null) {
            Optional<PlanMantenimientoActivo> paOpt = planMantenimientoActivoRepository.findById(domain.getPlanMantenimientoActivoId());
            if (paOpt.isPresent()) {
                PlanMantenimientoActivo pa = paOpt.get();
                resolvedActivoId = pa.getActivoId();
                Optional<PlanMantenimiento> planOpt = planMantenimientoRepository.findById(pa.getPlanMantenimientoId());
                Optional<Activo> activoOpt = activoRepository.findById(pa.getActivoId());
                Optional<TipoActivo> tipoActivoOpt = activoOpt.flatMap(a -> a.getTipoActivoId() != null
                        ? tipoActivoRepository.findById(a.getTipoActivoId())
                        : Optional.empty());

                planActivoInfo = new ProgramacionMantenimientoResponse.PlanActivoInfo(
                        pa.getId(),
                        pa.getPlanMantenimientoId(),
                        planOpt.map(PlanMantenimiento::getCodigo).orElse(null),
                        planOpt.map(PlanMantenimiento::getNombre).orElse(null),
                        pa.getActivoId(),
                        activoOpt.map(Activo::getCodigo).orElse(null),
                        activoOpt.map(Activo::getNombre).orElse(null),
                        tipoActivoOpt.map(TipoActivo::getId).orElse(null),
                        tipoActivoOpt.map(TipoActivo::getNombre).orElse(null),
                        pa.getFechaInicio(),
                        pa.getFechaFin(),
                        pa.getActivo()
                );
            }
        }

        final UUID targetActivoId = resolvedActivoId;
        List<ProgramacionMantenimientoCriterioResponse> criteriosResponse = criterioRepository
                .findByProgramacionMantenimientoId(domain.getId()).stream()
                .map(c -> {
                    BigDecimal valorActual = null;
                    if (targetActivoId != null) {
                        if (c.getTipoCriterio() == TipoCriterioMantenimiento.KILOMETRAJE) {
                            valorActual = obtenerKilometrajeActual(targetActivoId);
                        } else if (c.getTipoCriterio() == TipoCriterioMantenimiento.HORAS_USO) {
                            valorActual = obtenerHorasUsoActual(targetActivoId);
                        }
                    }
                    ProgramacionMantenimientoCriterioResponse base = criterioMapper.toResponse(c);
                    if (base == null) {
                        return new ProgramacionMantenimientoCriterioResponse(
                                c.getId(),
                                c.getProgramacionMantenimientoId(),
                                c.getTipoCriterio(),
                                c.getIntervaloDias(),
                                c.getIntervaloUso(),
                                c.getProximaFecha(),
                                c.getProximoValorUso(),
                                valorActual,
                                c.getActivo(),
                                null
                        );
                    }
                    return new ProgramacionMantenimientoCriterioResponse(
                            base.id(),
                            base.programacionMantenimientoId(),
                            base.tipoCriterio(),
                            base.intervaloDias(),
                            base.intervaloUso(),
                            base.proximaFecha(),
                            base.proximoValorUso(),
                            valorActual,
                            base.activo(),
                            base.auditoria()
                    );
                })
                .collect(Collectors.toList());

        return mapper.toResponse(domain, planActivoInfo, criteriosResponse);
    }

    /**
     * Evalúa todas las programaciones preventivas activas asociadas a un activo específico.
     * Genera automáticamente la solicitud de mantenimiento si se alcanza el umbral de odómetro/fecha/horas.
     */
    @Transactional
    public List<EvaluacionProgramacionResponse> evaluarPorActivo(UUID activoId) {
        if (activoId == null) {
            return Collections.emptyList();
        }

        List<PlanMantenimientoActivo> planes = planMantenimientoActivoRepository.findByActivoId(activoId);
        List<EvaluacionProgramacionResponse> resultados = new ArrayList<>();

        for (PlanMantenimientoActivo pma : planes) {
            if (Boolean.TRUE.equals(pma.getActivo())) {
                repository.findByPlanMantenimientoActivoIdAndActivoTrue(pma.getId())
                        .ifPresent(prog -> {
                            try {
                                log.info("Evaluando automáticamente programación preventiva {} para activo {}",
                                        prog.getId(), activoId);
                                resultados.add(evaluarProgramacion(prog.getId(), null));
                            } catch (Exception e) {
                                log.error("Error al evaluar programación preventiva {} para activo {}: {}",
                                        prog.getId(), activoId, e.getMessage());
                            }
                        });
            }
        }

        return resultados;
    }

    /**
     * Obtiene las programaciones de mantenimiento preventivo asociadas a un activo.
     */
    @Transactional(readOnly = true)
    public List<ProgramacionMantenimientoResponse> findByActivoId(UUID activoId) {
        if (activoId == null) {
            return Collections.emptyList();
        }
        List<PlanMantenimientoActivo> planes = planMantenimientoActivoRepository.findByActivoId(activoId);
        List<ProgramacionMantenimientoResponse> responses = new ArrayList<>();
        for (PlanMantenimientoActivo pma : planes) {
            repository.findByPlanMantenimientoActivoId(pma.getId())
                    .forEach(prog -> responses.add(toEnrichedResponse(prog)));
        }
        return responses;
    }
}
