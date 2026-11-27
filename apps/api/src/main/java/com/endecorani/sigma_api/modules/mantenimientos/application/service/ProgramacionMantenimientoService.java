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
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ReporteSeguimientoFiltros.NivelAlertaReporte;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ReporteSeguimientoFiltros.TipoCriterioReporte;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response.*;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request.EnviarSolicitudMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request.SolicitudMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response.SolicitudMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ProgramacionMantenimientoCriterioMapper;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ProgramacionMantenimientoHistorialMapper;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ProgramacionMantenimientoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ActividadMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ActividadMantenimientoAplicacion;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ChecklistItem;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimientoActividad;
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
import com.endecorani.sigma_api.shared.domain.exception.ForbiddenException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProgramacionMantenimientoService {

    private static final String CODIGO_UNICIDAD_ACTIVA = "PROGRAMACION_ACTIVA_DUPLICADA";
    private static final String CODIGO_PROGRAMACION_COMPLETADA = "PROGRAMACION_YA_COMPLETADA";
    private static final int TAMANO_LOTE = ApiConstants.MAX_PAGE_SIZE;
    private static final Set<String> ESTADOS_FINALES_MANTENIMIENTO =
            Set.of("FINALIZADO", "FINALIZADA", "CERRADO", "CERRADA", "TRABAJO_REALIZADO", "COMPLETADO");
    private static final List<String> CODIGOS_KILOMETRAJE = List.of("KILOMETRAJE", "KM", "ODOMETRO");
    private static final List<String> CODIGOS_HORAS_USO =
            List.of("HORAS_USO", "HOROMETRO", "HORAS", "HORAS_TRABAJO");

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
    private final PlanMantenimientoActividadRepository planMantenimientoActividadRepository;
    private final ActividadMantenimientoAplicacionRepository actividadMantenimientoAplicacionRepository;
    private final ActividadMantenimientoRepository actividadMantenimientoRepository;

    @org.springframework.beans.factory.annotation.Autowired
    @Lazy
    private ProgramacionMantenimientoService self;

    private ConflictException programacionActivaDuplicada() {
        return new ConflictException(CODIGO_UNICIDAD_ACTIVA,
                "Ya existe una programación de mantenimiento activa para esta asignación del activo al plan.");
    }

    /** REQ-MANT-010: el flush forcea la violación del índice parcial de V184. */
    private ProgramacionMantenimiento guardarConUnicidad(ProgramacionMantenimiento item) {
        try {
            return repository.saveAndFlush(item);
        } catch (DataIntegrityViolationException ex) {
            throw programacionActivaDuplicada();
        }
    }

    private boolean tieneRolOperacion() {
        return securityUtils.isAdmin() || tieneRol("ENCARGADO");
    }

    private boolean tieneRol(String rol) {
        org.springframework.security.core.Authentication auth =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }
        return auth.getAuthorities().stream()
                .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                .map(String::toUpperCase)
                .map(a -> a.replaceFirst("^(ROLE_|ROL_)", "").trim())
                .anyMatch(a -> a.equals(rol.toUpperCase()));
    }

    /** REQ-MANT-006: los valores de telemetría enviados por el cliente son un override privilegiado. */
    private void validarOverrideEvaluacion(EvaluarProgramacionRequest request) {
        if (request == null) {
            return;
        }
        boolean hayOverride = request.fechaActual() != null
                || request.kilometrajeActual() != null
                || request.horasUsoActual() != null;
        if (hayOverride && !tieneRolOperacion()) {
            throw new ForbiddenException("TELEMETRIA_OVERRIDE_NO_PERMITIDO",
                    "Solo ENCARGADO o ADMIN pueden enviar valores de telemetría en la evaluación");
        }
        if (request.fechaActual() != null && request.fechaActual().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("FECHA_EVALUACION_FUTURA");
        }
    }

    private void validarOverrideCompletar(CompletarMantenimientoProgramadoRequest request) {
        if (request == null) {
            return;
        }
        boolean hayOverride = request.kilometrajeServicio() != null || request.horasUsoServicio() != null;
        if (hayOverride && !tieneRolOperacion()) {
            throw new ForbiddenException("TELEMETRIA_OVERRIDE_NO_PERMITIDO",
                    "Solo ENCARGADO o ADMIN pueden enviar kilometraje u horas de uso del servicio");
        }
        if (request.fechaServicio() != null && request.fechaServicio().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("FECHA_SERVICIO_FUTURA");
        }
    }

    /**
     * REQ-MANT-032: el aprobador se resuelve entre los empleados con rol SUPERVISOR activo,
     * distinto del responsable del plan y del solicitante. La política de rol se reutiliza
     * de {@link SolicitudMantenimientoService#validarAprobador(UUID)} (REQ-MANT-008) para
     * no duplicar reglas de segregación ni de autorización.
     */
    private UUID resolverAprobadorPreventivo(UUID responsableId, UUID solicitanteId) {
        List<Empleado> candidatos = solicitudMantenimientoService.findAprobadoresSupervisores();
        if (candidatos != null) {
            for (Empleado candidato : candidatos) {
                if (candidato == null || candidato.getId() == null) {
                    continue;
                }
                UUID candidatoId = candidato.getId();
                if (candidatoId.equals(responsableId) || candidatoId.equals(solicitanteId)) {
                    continue;
                }
                try {
                    solicitudMantenimientoService.validarAprobador(candidatoId);
                    return candidatoId;
                } catch (RuntimeException ex) {
                    log.debug("Candidato supervisor {} descartado como aprobador preventivo: {}",
                            candidatoId, ex.getMessage());
                }
            }
        }
        throw new BusinessException("APROBADOR_REQUERIDO",
                "No se encontró un aprobador con rol SUPERVISOR distinto del responsable del plan y del solicitante");
    }

    /** REQ-MANT-018: sustituye {@code Pageable.unpaged()} por lotes de 500. */
    private List<ProgramacionMantenimiento> buscarPorLotes(
            UUID planMantenimientoActivoId, UUID activoId, Boolean activo, String q) {
        List<ProgramacionMantenimiento> resultado = new ArrayList<>();
        int pagina = 0;
        Page<ProgramacionMantenimiento> lote;
        do {
            lote = repository.search(planMantenimientoActivoId, activoId, activo, q,
                    PageRequest.of(pagina, TAMANO_LOTE));
            resultado.addAll(lote.getContent());
            pagina++;
        } while (pagina < lote.getTotalPages());
        return resultado;
    }

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
            throw programacionActivaDuplicada();
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
        ProgramacionMantenimiento saved = guardarConUnicidad(domain);

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
                throw programacionActivaDuplicada();
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

        int creados = 0;
        int actualizados = 0;
        int procesados = 0;
        int pagina = 0;
        Page<Activo> activosPage;

        // REQ-MANT-018: recorrer el tipo de activo en lotes acotados en lugar de Pageable.unpaged().
        do {
            activosPage = activoRepository.findByTipoActivoId(
                    request.tipoActivoId(), PageRequest.of(pagina, TAMANO_LOTE));
            for (Activo a : activosPage.getContent()) {
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
            procesados += activosPage.getContent().size();
            pagina++;
        } while (pagina < activosPage.getTotalPages());

        if (procesados == 0) {
            throw new BusinessException("No se encontraron activos asociados al tipo de activo seleccionado.");
        }

        return new BatchProgramacionTipoResponse(
                creados,
                actualizados,
                procesados,
                "Programación preventiva aplicada exitosamente a " + procesados + " activos (" + creados + " nuevas, " + actualizados + " actualizadas)."
        );
    }

    @Transactional
    public ProgramacionMantenimientoResponse activar(UUID id) {
        ProgramacionMantenimiento programacion = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programación de mantenimiento no encontrada: " + id));

        if (repository.existsByPlanMantenimientoActivoIdAndActivoTrueAndIdNot(programacion.getPlanMantenimientoActivoId(), id)) {
            throw programacionActivaDuplicada();
        }

        // Regla 1: Cada programación debe tener al menos un criterio activo
        long activos = criterioRepository.countByProgramacionMantenimientoIdAndActivoTrue(id);
        if (activos == 0) {
            throw new BusinessException("No se puede activar la programación porque no posee ningún criterio activo.");
        }

        programacion.setActivo(true);
        return toEnrichedResponse(guardarConUnicidad(programacion));
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

        // REQ-MANT-011: V148 mantiene el FK con ON DELETE CASCADE; el servicio impide
        // destruir la auditoría. No se toca la migración ya aplicada.
        if (historialRepository.existsByProgramacionMantenimientoId(id)) {
            throw new ConflictException("PROGRAMACION_CON_HISTORIAL",
                    "No se puede eliminar la programación porque tiene historial de ejecuciones registrado.");
        }

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
        // REQ-MANT-019: una sola tanda de consultas para toda la página.
        List<ProgramacionMantenimientoResponse> content = toEnrichedResponses(page.getContent());

        return PageResponse.of(content, page);
    }

    @Transactional(readOnly = true)
    public List<ProgramacionMantenimientoResponse> findByPlanMantenimientoActivoId(UUID planMantenimientoActivoId) {
        return toEnrichedResponses(repository.findByPlanMantenimientoActivoId(planMantenimientoActivoId));
    }

    /** Contrato anterior del reporte: sin filtros de alerta/criterio. */
    @Transactional(readOnly = true)
    public byte[] generarReporteExcel(
            UUID planMantenimientoActivoId,
            UUID activoId,
            Boolean activo,
            String q
    ) {
        return generarReporteExcel(planMantenimientoActivoId, activoId, activo, q, null, null);
    }

    /**
     * REQ-MANT-015: los filtros se validan antes de consultar y se aplican sobre la misma
     * proyección que usa la tabla Web; la consulta sigue haciéndose por lotes de 500.
     */
    @Transactional(readOnly = true)
    public byte[] generarReporteExcel(
            UUID planMantenimientoActivoId,
            UUID activoId,
            Boolean activo,
            String q,
            String filtroAlerta,
            String filtroCriterio
    ) {
        NivelAlertaReporte alerta = ReporteSeguimientoFiltros.parsearAlerta(filtroAlerta);
        TipoCriterioReporte criterio = ReporteSeguimientoFiltros.parsearCriterio(filtroCriterio);

        log.info("Generando reporte Excel de seguimiento preventivo");
        String searchQ = (q != null && !q.isBlank()) ? q.trim() : null;
        // REQ-MANT-018: el reporte completo se arma por lotes de 500, sin Pageable.unpaged().
        List<ProgramacionMantenimientoResponse> content = new ArrayList<>();
        List<ProgramacionMantenimiento> porLotes =
                buscarPorLotes(planMantenimientoActivoId, activoId, activo, searchQ);
        // REQ-MANT-019: el enriquecimiento también es por lote, sin un findById por fila.
        for (int desde = 0; desde < porLotes.size(); desde += TAMANO_LOTE) {
            content.addAll(toEnrichedResponses(
                    porLotes.subList(desde, Math.min(desde + TAMANO_LOTE, porLotes.size()))));
        }
        return excelService.generarExcel(content, searchQ, alerta, criterio);
    }

    /**
     * Regla 4: Cuando se cumpla cualquier criterio, generar una sola solicitud para esa ejecución.
     * Regla 6: Conservar el historial de los valores que provocaron cada mantenimiento.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public EvaluacionProgramacionResponse evaluarProgramacion(UUID id, EvaluarProgramacionRequest request) {
        log.info("Evaluando programación de mantenimiento: {}", id);
        validarOverrideEvaluacion(request);

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
        // REQ-MANT-009: se eliminó el fallback a "primer empleado". Sin responsable
        // resolvable se falla en cerrado con código de dominio, nunca se elige uno al azar.
        if (solicitanteId == null) {
            throw new BusinessException("SOLICITANTE_NO_ASIGNADO",
                    "No se puede generar la solicitud automática: el plan no tiene responsable asignado para el activo ('" +
                    activo.getCodigo() + " - " + activo.getNombre() + "').");
        }

        // Recopilar actividades y tareas definidas en el plan de mantenimiento
        List<String> tareasNombres = new ArrayList<>();
        StringBuilder detalleTareas = new StringBuilder();
        if (planMantenimientoActividadRepository != null && plan.getId() != null) {
            List<PlanMantenimientoActividad> actividadesPlan =
                    planMantenimientoActividadRepository.findByPlanMantenimientoId(plan.getId());
            if (actividadesPlan != null && !actividadesPlan.isEmpty()) {
                detalleTareas.append("\n\nTareas y Actividades Programadas del Plan:\n");
                // REQ-MANT-019: resolver aplicaciones y actividades en dos lotes, no por fila.
                Set<UUID> aplicacionIds = actividadesPlan.stream()
                        .map(PlanMantenimientoActividad::getActividadMantenimientoAplicacionId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet());
                Map<UUID, ActividadMantenimientoAplicacion> aplicaciones = aplicacionIds.isEmpty()
                        ? Map.of()
                        : actividadMantenimientoAplicacionRepository.findAllByIdIn(aplicacionIds).stream()
                                .collect(Collectors.toMap(
                                        ActividadMantenimientoAplicacion::getId,
                                        Function.identity(), (a, b) -> a));
                Set<UUID> actividadIds = aplicaciones.values().stream()
                        .map(ActividadMantenimientoAplicacion::getActividadMantenimientoId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet());
                Map<UUID, ActividadMantenimiento> actividades = actividadIds.isEmpty()
                        ? Map.of()
                        : actividadMantenimientoRepository.findAllByIdIn(actividadIds).stream()
                                .collect(Collectors.toMap(
                                        ActividadMantenimiento::getId, Function.identity(), (a, b) -> a));
                int idx = 1;
                for (PlanMantenimientoActividad actPlan : actividadesPlan) {
                    if (actPlan.getActividadMantenimientoAplicacionId() == null) continue;
                    ActividadMantenimientoAplicacion app =
                            aplicaciones.get(actPlan.getActividadMantenimientoAplicacionId());
                    if (app == null) continue;
                    String actNombre = null;
                    if (app.getActividadMantenimientoId() != null) {
                        ActividadMantenimiento actInfo = actividades.get(app.getActividadMantenimientoId());
                        if (actInfo != null) {
                            actNombre = actInfo.getNombre();
                        }
                    }
                    if (actNombre == null || actNombre.isBlank()) {
                        actNombre = "Actividad #" + idx;
                    }
                    tareasNombres.add(actNombre);
                    detalleTareas.append(idx++).append(". ").append(actNombre);
                    if (app.getChecklist() != null && !app.getChecklist().isEmpty()) {
                        detalleTareas.append(" (Checklist: ");
                        for (int c = 0; c < app.getChecklist().size(); c++) {
                            if (c > 0) detalleTareas.append(", ");
                            detalleTareas.append(app.getChecklist().get(c).getNombre());
                        }
                        detalleTareas.append(")");
                    }
                    detalleTareas.append("\n");
                }
            }
        }
        if (tareasNombres.isEmpty()) {
            tareasNombres.add("Mantenimiento preventivo programado");
        }

        String titulo = "Mantenimiento Preventivo: " + plan.getNombre() + " (" + activo.getCodigo() + ")";
        String descripcion = "Solicitud automática generada por programación de mantenimiento preventiva.\n"
                + "Plan de Mantenimiento: " + plan.getCodigo() + " - " + plan.getNombre() + ".\n"
                + "Activo: " + activo.getCodigo() + " - " + activo.getNombre() + ".\n"
                + "Disparador: Criterio " + criterioDisparador.getTipoCriterio() + ".\n"
                + "Detalle: " + motivoDisparo + ".\n"
                + "Valores registrados al momento del disparo: " + valorDisparador + "."
                + detalleTareas.toString();

        SolicitudMantenimientoRequest solRequest = new SolicitudMantenimientoRequest(
                activo.getId(),
                tipoMantenimientoId,
                tareasNombres,
                prioridadId,
                solicitanteId,
                titulo,
                descripcion,
                Collections.emptyList()
        );

        SolicitudMantenimientoResponse solResponse = solicitudMantenimientoService.create(solRequest);

        // Regla 6: Conservar el historial de los valores que provocaron cada mantenimiento antes de promover
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

        // REQ-MANT-008/032: la segregación de duties se resuelve antes de enviar. Si no hay
        // supervisor distinto del responsable del plan y del solicitante, falla en cerrado.
        UUID responsableId = planActivo.getResponsableId();
        UUID aprobador = resolverAprobadorPreventivo(responsableId, solicitanteId);
        solicitudMantenimientoService.enviar(
                solResponse.id(),
                new EnviarSolicitudMantenimientoRequest(
                        aprobador,
                        responsableId,
                        responsableId
                )
        );
        log.info("Solicitud preventiva {} promovida automáticamente a SOLICITADO", solResponse.numero());

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
    @Transactional(readOnly = true)
    public BatchEvaluacionProgramacionResponse evaluarTodas() {
        log.info("Iniciando evaluación en lote de todas las programaciones activas");
        List<ProgramacionMantenimiento> activas = repository.findByActivoTrue();

        int solicitudesGeneradas = 0;
        int yaExistiaSolicitudAbierta = 0;
        int cumplieronCriterio = 0;
        int errores = 0;
        List<EvaluacionProgramacionResponse> resultados = new ArrayList<>();
        ProgramacionMantenimientoService executor = self != null ? self : this;

        for (ProgramacionMantenimiento prog : activas) {
            try {
                EvaluacionProgramacionResponse resp = executor.evaluarProgramacion(prog.getId(), null);
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
    /**
     * REQ-MANT-005: valida que la solicitud indicada pertenezca a esta programación, que
     * esté en un estado final y que la ejecución no haya sido cerrada antes. Sin
     * {@code solicitudId} se mantiene la compatibilidad con el historial pendiente más reciente.
     */
    private ProgramacionMantenimientoHistorial validarEjecucionCompletar(
            UUID programacionId, CompletarMantenimientoProgramadoRequest request) {
        if (request == null || request.solicitudId() == null) {
            return historialRepository.findFirstPendingByProgramacionMantenimientoId(programacionId).orElse(null);
        }

        UUID solicitudId = request.solicitudId();
        ProgramacionMantenimientoHistorial historial = historialRepository
                .findBySolicitudMantenimientoId(solicitudId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Historial de programación para la solicitud", solicitudId));

        if (!programacionId.equals(historial.getProgramacionMantenimientoId())) {
            throw new ConflictException("SOLICITUD_NO_PERTENECE_A_PROGRAMACION",
                    "La solicitud " + solicitudId + " no pertenece a la programación " + programacionId + ".");
        }
        if (Boolean.TRUE.equals(historial.getCompletado())) {
            throw new ConflictException(CODIGO_PROGRAMACION_COMPLETADA,
                    "La ejecución de la programación " + programacionId + " ya fue completada el "
                            + historial.getFechaServicio() + ".");
        }

        SolicitudMantenimiento solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud de mantenimiento", solicitudId));
        String estado = solicitud.getEstado();
        String estadoNormalizado = estado == null ? "" : estado.trim().toUpperCase(Locale.ROOT);
        if (!ESTADOS_FINALES_MANTENIMIENTO.contains(estadoNormalizado)) {
            throw new BusinessException("SOLICITUD_NO_FINALIZADA",
                    "La solicitud " + solicitudId + " debe estar finalizada para cerrar la programación (estado actual: "
                            + (estado != null ? estado : "sin estado") + ").");
        }
        return historial;
    }

    @Transactional
    public ProgramacionMantenimientoResponse completarMantenimiento(UUID id, CompletarMantenimientoProgramadoRequest request) {
        return completarMantenimiento(id, request, true);
    }

    /**
     * REQ-MANT-005: una ejecución ya cerrada no se recalcula dos veces. La validación de
     * pertenencia e idempotencia se ejecuta antes de cualquier mutación de criterios/historial.
     * El paso 3 ({@code validarOverride}) se omite en la sincronización interna por evento.
     */
    private ProgramacionMantenimientoResponse completarMantenimiento(
            UUID id, CompletarMantenimientoProgramadoRequest request, boolean validarOverride) {
        log.info("Completando mantenimiento y recalculando criterios para la programación {}", id);
        if (validarOverride) {
            validarOverrideCompletar(request);
        }

        ProgramacionMantenimiento programacion = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programación de mantenimiento no encontrada: " + id));

        ProgramacionMantenimientoHistorial historialSeleccionado = validarEjecucionCompletar(id, request);

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

        // REQ-MANT-005: se cierra exactamente la ejecución validada al inicio del método.
        if (historialSeleccionado != null) {
            ProgramacionMantenimientoHistorial hist = historialSeleccionado;
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

        // La telemetría del evento es real, no un override del cliente: se omite la
        // validación de rol (REQ-MANT-006) pero se mantienen las guardias de REQ-MANT-005.
        completarMantenimiento(programacionId, req, false);
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

    /** REQ-MANT-019: datos ya resueltos para un lote de programaciones. */
    private record EnriquecimientoCache(
            Map<UUID, PlanMantenimientoActivo> planesActivo,
            Map<UUID, PlanMantenimiento> planes,
            Map<UUID, Activo> activos,
            Map<UUID, TipoActivo> tiposActivo,
            Map<UUID, List<ProgramacionMantenimientoCriterio>> criterios) {
    }

    /** REQ-MANT-019: la telemetría se resuelve igual para una fila que para un lote. */
    @FunctionalInterface
    private interface ResolvedorTelemetria {
        BigDecimal valor(UUID activoId, TipoCriterioMantenimiento tipo);
    }

    private ProgramacionMantenimientoResponse toEnrichedResponse(ProgramacionMantenimiento domain) {
        return toEnrichedResponse(
                domain,
                cacheParaUnItem(domain),
                (activoId, tipo) -> {
                    if (tipo == TipoCriterioMantenimiento.KILOMETRAJE) {
                        return obtenerKilometrajeActual(activoId);
                    }
                    if (tipo == TipoCriterioMantenimiento.HORAS_USO) {
                        return obtenerHorasUsoActual(activoId);
                    }
                    return null;
                });
    }

    private ProgramacionMantenimientoResponse toEnrichedResponse(
            ProgramacionMantenimiento domain,
            EnriquecimientoCache cache,
            ResolvedorTelemetria telemetria) {
        ProgramacionMantenimientoResponse.PlanActivoInfo planActivoInfo = null;

        UUID resolvedActivoId = null;
        UUID planActivoId = domain.getPlanMantenimientoActivoId();
        if (planActivoId != null) {
            PlanMantenimientoActivo pa = cache.planesActivo().get(planActivoId);
            if (pa != null) {
                resolvedActivoId = pa.getActivoId();
                PlanMantenimiento plan = cache.planes().get(pa.getPlanMantenimientoId());
                Activo activo = cache.activos().get(pa.getActivoId());
                TipoActivo tipoActivo = activo != null && activo.getTipoActivoId() != null
                        ? cache.tiposActivo().get(activo.getTipoActivoId())
                        : null;

                planActivoInfo = new ProgramacionMantenimientoResponse.PlanActivoInfo(
                        pa.getId(),
                        pa.getPlanMantenimientoId(),
                        plan != null ? plan.getCodigo() : null,
                        plan != null ? plan.getNombre() : null,
                        pa.getActivoId(),
                        activo != null ? activo.getCodigo() : null,
                        activo != null ? activo.getNombre() : null,
                        tipoActivo != null ? tipoActivo.getId() : null,
                        tipoActivo != null ? tipoActivo.getNombre() : null,
                        pa.getFechaInicio(),
                        pa.getFechaFin(),
                        pa.getActivo()
                );
            }
        }

        final UUID targetActivoId = resolvedActivoId;
        List<ProgramacionMantenimientoCriterioResponse> criteriosResponse = cache.criterios()
                .getOrDefault(domain.getId(), List.of()).stream()
                .map(c -> {
                    BigDecimal valorActual = targetActivoId != null
                            ? telemetria.valor(targetActivoId, c.getTipoCriterio())
                            : null;
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

    /** REQ-MANT-019: operaciones de una sola fila conservan sus consultas originales. */
    private EnriquecimientoCache cacheParaUnItem(ProgramacionMantenimiento domain) {
        Map<UUID, PlanMantenimientoActivo> planesActivo = new HashMap<>();
        Map<UUID, PlanMantenimiento> planes = new HashMap<>();
        Map<UUID, Activo> activos = new HashMap<>();
        Map<UUID, TipoActivo> tiposActivo = new HashMap<>();
        Map<UUID, List<ProgramacionMantenimientoCriterio>> criterios = new HashMap<>();

        UUID planActivoId = domain.getPlanMantenimientoActivoId();
        if (planActivoId != null) {
            planMantenimientoActivoRepository.findById(planActivoId).ifPresent(pa -> {
                planesActivo.put(pa.getId(), pa);
                planMantenimientoRepository.findById(pa.getPlanMantenimientoId())
                        .ifPresent(p -> planes.put(p.getId(), p));
                activoRepository.findById(pa.getActivoId()).ifPresent(a -> {
                    activos.put(a.getId(), a);
                    if (a.getTipoActivoId() != null) {
                        tipoActivoRepository.findById(a.getTipoActivoId())
                                .ifPresent(t -> tiposActivo.put(t.getId(), t));
                    }
                });
            });
        }
        if (domain.getId() != null) {
            criterios.put(domain.getId(),
                    criterioRepository.findByProgramacionMantenimientoId(domain.getId()));
        }
        return new EnriquecimientoCache(planesActivo, planes, activos, tiposActivo, criterios);
    }

    /** REQ-MANT-019: número de consultas constante respecto al tamaño de la página. */
    private List<ProgramacionMantenimientoResponse> toEnrichedResponses(
            List<ProgramacionMantenimiento> domains) {
        if (domains.isEmpty()) {
            return List.of();
        }
        EnriquecimientoCache cache = cargarCacheEnLote(domains);
        ResolvedorTelemetria telemetria = telemetriaEnLote(cache);
        return domains.stream()
                .map(d -> toEnrichedResponse(d, cache, telemetria))
                .collect(Collectors.toList());
    }

    private EnriquecimientoCache cargarCacheEnLote(List<ProgramacionMantenimiento> domains) {
        Set<UUID> planesActivoIds = domains.stream()
                .map(ProgramacionMantenimiento::getPlanMantenimientoActivoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        List<PlanMantenimientoActivo> planesActivo = planesActivoIds.isEmpty()
                ? List.of()
                : planMantenimientoActivoRepository.findAllByIdIn(planesActivoIds);

        Set<UUID> planIds = planesActivo.stream()
                .map(PlanMantenimientoActivo::getPlanMantenimientoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Set<UUID> activoIds = planesActivo.stream()
                .map(PlanMantenimientoActivo::getActivoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<PlanMantenimiento> planes = planIds.isEmpty()
                ? List.of()
                : planMantenimientoRepository.findAllByIdIn(planIds);
        List<Activo> activos = activoIds.isEmpty()
                ? List.of()
                : activoRepository.findAllById(activoIds);

        Set<UUID> tipoActivoIds = activos.stream()
                .map(Activo::getTipoActivoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        List<TipoActivo> tiposActivo = tipoActivoIds.isEmpty()
                ? List.of()
                : tipoActivoRepository.findAllById(tipoActivoIds);

        Set<UUID> programacionIds = domains.stream()
                .map(ProgramacionMantenimiento::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        List<ProgramacionMantenimientoCriterio> criterios = programacionIds.isEmpty()
                ? List.of()
                : criterioRepository.findByProgramacionMantenimientoIdIn(programacionIds);

        return new EnriquecimientoCache(
                planesActivo.stream().collect(Collectors.toMap(PlanMantenimientoActivo::getId, Function.identity(), (a, b) -> a)),
                planes.stream().collect(Collectors.toMap(PlanMantenimiento::getId, Function.identity(), (a, b) -> a)),
                activos.stream().collect(Collectors.toMap(Activo::getId, Function.identity(), (a, b) -> a)),
                tiposActivo.stream().collect(Collectors.toMap(TipoActivo::getId, Function.identity(), (a, b) -> a)),
                criterios.stream().collect(Collectors.groupingBy(
                        ProgramacionMantenimientoCriterio::getProgramacionMantenimientoId))
        );
    }

    private ResolvedorTelemetria telemetriaEnLote(EnriquecimientoCache cache) {
        Set<UUID> activoIds = cache.planesActivo().values().stream()
                .map(PlanMantenimientoActivo::getActivoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<UUID, BigDecimal> kilometrajePorActivo = new HashMap<>();
        Map<UUID, BigDecimal> horasPorActivo = new HashMap<>();
        if (!activoIds.isEmpty()) {
            List<ActivoAtributoValorEntity> valores =
                    springActivoAtributoValorRepository.findByActivoIdIn(activoIds);
            Set<UUID> atributoIds = valores.stream()
                    .map(ActivoAtributoValorEntity::getActivoAtributoId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            Map<UUID, ActivoAtributoEntity> definiciones = atributoIds.isEmpty()
                    ? Map.of()
                    : springActivoAtributoRepository.findAllById(atributoIds).stream()
                            .collect(Collectors.toMap(
                                    ActivoAtributoEntity::getId, Function.identity(), (a, b) -> a));
            Map<UUID, List<ActivoAtributoValorEntity>> valoresPorActivo = valores.stream()
                    .collect(Collectors.groupingBy(
                            ActivoAtributoValorEntity::getActivoId,
                            LinkedHashMap::new,
                            Collectors.toList()));
            for (UUID activoId : activoIds) {
                List<ActivoAtributoValorEntity> valoresDelActivo =
                        valoresPorActivo.getOrDefault(activoId, List.of());
                kilometrajePorActivo.put(activoId, primeraTelemetria(
                        activoId, valoresDelActivo, definiciones, CODIGOS_KILOMETRAJE));
                horasPorActivo.put(activoId, primeraTelemetria(
                        activoId, valoresDelActivo, definiciones, CODIGOS_HORAS_USO));
            }
        }
        return (activoId, tipo) -> {
            if (activoId == null) {
                return null;
            }
            if (tipo == TipoCriterioMantenimiento.KILOMETRAJE) {
                return kilometrajePorActivo.get(activoId);
            }
            if (tipo == TipoCriterioMantenimiento.HORAS_USO) {
                return horasPorActivo.get(activoId);
            }
            return null;
        };
    }

    /** Misma precedencia que {@code obtenerKilometrajeActual}/{@code obtenerHorasUsoActual}. */
    private BigDecimal primeraTelemetria(
            UUID activoId,
            List<ActivoAtributoValorEntity> valores,
            Map<UUID, ActivoAtributoEntity> definiciones,
            List<String> codigos) {
        try {
            for (ActivoAtributoValorEntity valor : valores) {
                if (valor.getActivoAtributoId() == null
                        || valor.getValor() == null || valor.getValor().isBlank()) {
                    continue;
                }
                ActivoAtributoEntity definicion = definiciones.get(valor.getActivoAtributoId());
                if (definicion != null
                        && codigos.stream().anyMatch(c -> c.equalsIgnoreCase(definicion.getCodigo()))) {
                    return new BigDecimal(valor.getValor().trim());
                }
            }
        } catch (Exception e) {
            log.warn("No se pudo resolver la telemetría en lote para activo {}: {}", activoId, e.getMessage());
        }
        return null;
    }

    /**
     * Evalúa todas las programaciones preventivas activas asociadas a un activo específico.
     * Genera automáticamente la solicitud de mantenimiento si se alcanza el umbral de odómetro/fecha/horas.
     */
    public List<EvaluacionProgramacionResponse> evaluarPorActivo(UUID activoId) {
        if (activoId == null) {
            return Collections.emptyList();
        }

        List<PlanMantenimientoActivo> planes = planMantenimientoActivoRepository.findByActivoId(activoId);
        List<EvaluacionProgramacionResponse> resultados = new ArrayList<>();
        ProgramacionMantenimientoService executor = self != null ? self : this;

        for (PlanMantenimientoActivo pma : planes) {
            if (Boolean.TRUE.equals(pma.getActivo())) {
                repository.findByPlanMantenimientoActivoIdAndActivoTrue(pma.getId())
                        .ifPresent(prog -> {
                            try {
                                log.info("Evaluando automáticamente programación preventiva {} para activo {}",
                                        prog.getId(), activoId);
                                resultados.add(executor.evaluarProgramacion(prog.getId(), null));
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
        List<ProgramacionMantenimiento> programaciones = new ArrayList<>();
        for (PlanMantenimientoActivo pma : planes) {
            programaciones.addAll(repository.findByPlanMantenimientoActivoId(pma.getId()));
        }
        return toEnrichedResponses(programaciones);
    }
}
