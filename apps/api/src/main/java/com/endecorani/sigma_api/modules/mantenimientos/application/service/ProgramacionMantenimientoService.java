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

    @Transactional
    public ProgramacionMantenimientoResponse create(ProgramacionMantenimientoRequest request) {
        log.info("Creando programación de mantenimiento para planActivo: {}", request.planMantenimientoActivoId());

        PlanMantenimientoActivo planActivo = planMantenimientoActivoRepository.findById(request.planMantenimientoActivoId())
                .orElseThrow(() -> new ResourceNotFoundException("Asignación de activo al plan no encontrada: " + request.planMantenimientoActivoId()));

        Activo activo = activoRepository.findById(planActivo.getActivoId())
                .orElseThrow(() -> new ResourceNotFoundException("Activo no encontrado: " + planActivo.getActivoId()));

        // Evitar múltiples programaciones activas para la misma asignación de activo
        if (Boolean.TRUE.equals(request.activo()) &&
                repository.existsByPlanMantenimientoActivoIdAndActivoTrue(request.planMantenimientoActivoId())) {
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

        // Guardar la cabecera de la programación
        ProgramacionMantenimiento domain = mapper.toDomain(request);
        ProgramacionMantenimiento saved = repository.save(domain);

        // Guardar los criterios asociados
        List<ProgramacionMantenimientoCriterio> criteriosGuardados = new ArrayList<>();
        for (ProgramacionMantenimientoCriterioRequest cReq : request.criterios()) {
            ProgramacionMantenimientoCriterio cDomain = criterioMapper.toDomain(cReq);
            cDomain.setProgramacionMantenimientoId(saved.getId());
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
                if (cReq.id() != null && mapExistentes.containsKey(cReq.id())) {
                    ProgramacionMantenimientoCriterio exist = mapExistentes.get(cReq.id());
                    exist.setTipoCriterio(cReq.tipoCriterio());
                    exist.setIntervaloDias(cReq.intervaloDias());
                    exist.setIntervaloUso(cReq.intervaloUso());
                    exist.setProximaFecha(cReq.proximaFecha());
                    exist.setProximoValorUso(cReq.proximoValorUso());
                    exist.setActivo(cReq.activo());
                    nuevosCriterios.add(criterioRepository.save(exist));
                    idsEnRequest.add(cReq.id());
                } else {
                    ProgramacionMantenimientoCriterio cDomain = criterioMapper.toDomain(cReq);
                    cDomain.setProgramacionMantenimientoId(id);
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
        Page<ProgramacionMantenimiento> page = repository.search(planMantenimientoActivoId, activoId, activo, q, pageable);
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

    /**
     * Regla 4: Cuando se cumpla cualquier criterio, generar una sola solicitud para esa ejecución.
     * Regla 6: Conservar el historial de los valores que provocaron cada mantenimiento.
     */
    @Transactional
    public EvaluacionProgramacionResponse evaluarProgramacion(UUID id, EvaluarProgramacionRequest request) {
        log.info("Evaluando programación de mantenimiento: {}", id);

        ProgramacionMantenimiento programacion = repository.findById(id)
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
                if (!estado.equals("FINALIZADO") && !estado.equals("CERRADO") && !estado.equals("CANCELADO") && !estado.equals("RECHAZADO")) {
                    return new EvaluacionProgramacionResponse(
                            id, true, criterioDisparador.getTipoCriterio(), motivoDisparo,
                            false, true, openSol.getId(), openSol.getNumero(),
                            "El criterio se cumple, pero ya existe una solicitud activa en trámite (" + openSol.getNumero() + " - " + openSol.getEstado() + ") para esta programación."
                    );
                }
            }
        }

        // Regla 4: Generar una sola solicitud para esa ejecución
        UUID tipoMantenimientoId = springTipoMantenimientoRepository.findByCodigoIgnoreCase("PREVENTIVO")
                .map(TipoMantenimientoEntity::getId)
                .orElseGet(() -> springTipoMantenimientoRepository.findAll().stream()
                        .findFirst()
                        .map(TipoMantenimientoEntity::getId)
                        .orElseThrow(() -> new BusinessException("No se encontró ningún tipo de mantenimiento configurado en el sistema.")));

        UUID prioridadId = springPrioridadRepository.findFirstByPorDefectoTrue()
                .or(() -> springPrioridadRepository.findByCodigoIgnoreCase("NORMAL"))
                .or(() -> springPrioridadRepository.findByCodigoIgnoreCase("MEDIA"))
                .map(PrioridadEntity::getId)
                .orElseGet(() -> springPrioridadRepository.findAll().stream()
                        .findFirst()
                        .map(PrioridadEntity::getId)
                        .orElseThrow(() -> new BusinessException("No se encontró ninguna prioridad configurada en el sistema.")));

        UUID solicitanteId = planActivo.getResponsableId();
        if (solicitanteId == null) {
            solicitanteId = obtenerEmpleadoIdActual();
        }
        if (solicitanteId == null) {
            org.springframework.data.domain.Page<Empleado> page = empleadoRepository.findAll(Pageable.ofSize(1));
            if (page != null && page.hasContent()) {
                solicitanteId = page.getContent().get(0).getId();
            } else {
                throw new BusinessException("No se encontró un empleado solicitante válido para generar la solicitud.");
            }
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
                            : (criterio.getProximoValorUso() != null ? criterio.getProximoValorUso() : BigDecimal.ZERO);
                    criterio.setProximoValorUso(base.add(criterio.getIntervaloUso()));
                }
            } else if (criterio.getTipoCriterio() == TipoCriterioMantenimiento.HORAS_USO) {
                if (criterio.getIntervaloUso() != null) {
                    BigDecimal base = (request != null && request.horasUsoServicio() != null)
                            ? request.horasUsoServicio()
                            : (criterio.getProximoValorUso() != null ? criterio.getProximoValorUso() : BigDecimal.ZERO);
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

        programacion.setCriterios(criterios);
        return toEnrichedResponse(programacion);
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

        if (domain.getPlanMantenimientoActivoId() != null) {
            Optional<PlanMantenimientoActivo> paOpt = planMantenimientoActivoRepository.findById(domain.getPlanMantenimientoActivoId());
            if (paOpt.isPresent()) {
                PlanMantenimientoActivo pa = paOpt.get();
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

        List<ProgramacionMantenimientoCriterioResponse> criteriosResponse = criterioRepository
                .findByProgramacionMantenimientoId(domain.getId()).stream()
                .map(criterioMapper::toResponse)
                .collect(Collectors.toList());

        return mapper.toResponse(domain, planActivoInfo, criteriosResponse);
    }
}
