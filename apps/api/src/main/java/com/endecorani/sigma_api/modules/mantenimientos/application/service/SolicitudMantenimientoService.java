package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request.EnviarSolicitudMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request.SolicitudMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response.SolicitudMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response.SolicitudMantenimientoResumenResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response.SolicitudMantenimientoTrazabilidadResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.SolicitudMantenimientoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.criteria.SolicitudMantenimientoSearchCriteria;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimientoAdjunto;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimientoTrazabilidad;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ProgramacionMantenimientoHistorialRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoResumenProjection;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoTrazabilidadRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.activos.application.dto.request.CambiarEstadoOperativoRequest;
import com.endecorani.sigma_api.modules.activos.application.service.ActivoService;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.modules.parametros.application.service.CorrelativoService;
import com.endecorani.sigma_api.modules.parametros.domain.constant.CorrelativoCodigo;
import com.endecorani.sigma_api.modules.mantenimientos.domain.event.SolicitudMantenimientoEstadoCambiadoEvent;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.modules.workflow.application.dto.request.CompleteWorkflowTaskRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskActionsResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskResponse;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowApplicationService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.storage.DocumentStorageService;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ForbiddenException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SolicitudMantenimientoService {

    private static final String ESTADO_BORRADOR = "borrador";
    private static final String ESTADO_SOLICITADO = "solicitado";
    private static final String ESTADO_OPERATIVO_MANTENIMIENTO = "MANTENIMIENTO";
    private static final String ESTADO_OPERATIVO_OPERATIVO = "OPERATIVO";
    private static final String WORKFLOW_CODIGO = "SOLICITUD_MANTENIMIENTO";
    private static final String ADJUNTO_FOLDER = "solicitud_mantenimiento_adjuntos";
    private static final String REPORTE_SOLICITUD_PATH = "reports/solicitudes/solicitud_mantenimiento.jrxml";
    private static final java.time.format.DateTimeFormatter FORMATTER_FECHA_HORA = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "numero",
            "titulo",
            "fechaSolicitud",
            "estado",
            "createdAt",
            "updatedAt");

    private final SolicitudMantenimientoRepository repository;
    private final SolicitudMantenimientoTrazabilidadRepository trazabilidadRepository;
    private final ProgramacionMantenimientoHistorialRepository programacionHistorialRepository;
    private final OrdenTrabajoRepository ordenTrabajoRepository;
    private final EmpleadoRepository empleadoRepository;
    private final SpringVEmpleadoRepository vEmpleadoRepository;
    private final UsuarioRepository usuarioRepository;
    private final SecurityUtils securityUtils;
    private final SolicitudMantenimientoMapper mapper;
    private final CorrelativoService correlativoService;
    private final WorkflowApplicationService workflowApplicationService;
    private final DocumentStorageService documentStorageService;
    private final com.endecorani.sigma_api.shared.infrastructure.report.JasperReportService jasperReportService;
    private final ActivoService activoService;
    private final ApplicationEventPublisher eventPublisher;
    private final org.springframework.jdbc.core.simple.JdbcClient jdbcClient;

    private record InterfazFiltros(
            UUID solicitanteId,
            UUID aprobadorId,
            UUID supervisorId,
            UUID responsableId,
            boolean sinAcceso
    ) {
        static InterfazFiltros sinFiltro() {
            return new InterfazFiltros(null, null, null, null, false);
        }

        static InterfazFiltros denegado() {
            return new InterfazFiltros(null, null, null, null, true);
        }
    }

    private InterfazFiltros resolverFiltrosPorInterfaz(String interfaz) {
        if (securityUtils.isAdmin()) {
            return InterfazFiltros.sinFiltro();
        }
        UUID empleadoActual = obtenerEmpleadoIdActual();
        if (empleadoActual == null) {
            return InterfazFiltros.denegado();
        }
        if (interfaz == null || interfaz.isBlank() || "SolicitudesPage".equalsIgnoreCase(interfaz.trim())) {
            return new InterfazFiltros(empleadoActual, null, null, null, false);
        } else if ("AprobacionesPage".equalsIgnoreCase(interfaz.trim())) {
            return new InterfazFiltros(null, empleadoActual, null, null, false);
        } else if ("SupervisorMantenimientoPage".equalsIgnoreCase(interfaz.trim())) {
            return new InterfazFiltros(null, null, empleadoActual, null, false);
        } else if ("EncargadoMantenimientoPage".equalsIgnoreCase(interfaz.trim())) {
            return new InterfazFiltros(null, null, null, empleadoActual, false);
        }
        return new InterfazFiltros(empleadoActual, null, null, null, false);
    }

    /** REQ-MANT-002: roles con lectura global de solicitudes; SOLICITANTE queda limitado a su ámbito. */
    private boolean esRolLecturaPrivilegiada() {
        return securityUtils.isAdmin() || tieneRol("SUPERVISOR") || tieneRol("ENCARGADO");
    }

    private boolean tieneRol(String rol) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(String::toUpperCase)
                .map(a -> a.replaceFirst("^(ROLE_|ROL_)", "").trim())
                .anyMatch(a -> a.equals(rol.toUpperCase()));
    }

    /**
     * REQ-MANT-002: un SOLICITANTE solo ve sus solicitudes o las de su área.
     * Sin empleado vinculado se niega el acceso (fail-closed).
     */
    private void validarAcceso(SolicitudMantenimiento solicitud) {
        if (solicitud == null || esRolLecturaPrivilegiada()) {
            return;
        }
        UUID empleadoActualId = obtenerEmpleadoIdActual();
        if (empleadoActualId == null) {
            throw new ForbiddenException("El usuario actual no está vinculado a un empleado para acceder a la solicitud");
        }
        UUID solicitanteId = solicitud.getSolicitante() != null ? solicitud.getSolicitante().getId() : null;
        if (empleadoActualId.equals(solicitanteId)) {
            return;
        }

        Empleado empleadoActual = empleadoRepository.findById(empleadoActualId).orElse(null);
        UUID areaActual = empleadoActual != null ? empleadoActual.getAreaId() : null;
        UUID areaSolicitante = null;
        if (solicitanteId != null) {
            areaSolicitante = empleadoRepository.findById(solicitanteId)
                    .map(Empleado::getAreaId)
                    .orElse(null);
        }
        if (areaActual != null && areaActual.equals(areaSolicitante)) {
            return;
        }
        throw new ForbiddenException("No tiene permisos para acceder a esta solicitud de mantenimiento");
    }

    /** REQ-MANT-003: el actor/solicitante siempre se deriva del JWT; cualquier ID distinto se rechaza. */
    private void validarActorDeclarado(Map<String, Object> variables, UUID empleadoAutenticadoId) {
        // El bypass auditado aplica solo a ADMIN; SUPERVISOR/ENCARGADO también deben declarar el actor real.
        if (variables == null || securityUtils.isAdmin()) {
            return;
        }
        for (String key : List.of("solicitanteId", "actorId", "empleadoId")) {
            Object declarado = variables.get(key);
            if (declarado == null || declarado.toString().isBlank()) {
                continue;
            }
            if (empleadoAutenticadoId == null
                    || !empleadoAutenticadoId.toString().equalsIgnoreCase(declarado.toString().trim())) {
                throw new ForbiddenException("El " + key + " declarado no coincide con el usuario autenticado");
            }
        }
    }

    /** Valida que el aprobador exista y tenga rol SUPERVISOR o ADMIN.
     * REQ-MANT-008: también lo reutiliza la programación preventiva para no duplicar la política. */
    public Empleado validarAprobador(UUID aprobadorId) {
        if (aprobadorId == null) {
            throw new BusinessException(
                    "APROBADOR_REQUERIDO",
                    "Debe seleccionar un aprobador con rol SUPERVISOR o ADMIN");
        }
        Empleado aprobador = empleadoRepository.findById(aprobadorId)
                .orElseThrow(() -> new ResourceNotFoundException("Empleado", aprobadorId));
        if (!empleadoTieneRolAprobador(aprobador)) {
            throw new BusinessException(
                    "APROBADOR_ROL_INVALIDO",
                    "El aprobador seleccionado debe tener rol SUPERVISOR o ADMIN");
        }
        return aprobador;
    }

    /**
     * REQ-MANT-032: candidatos reales a aprobador de la programación preventiva.
     * Se consultan solo los empleados cuyo usuario tiene el rol SUPERVISOR activo;
     * nunca se recorre el catálogo completo ni se elige un empleado al azar.
     */
    @Transactional(readOnly = true)
    public List<Empleado> findAprobadoresSupervisores() {
        List<UUID> personaIds;
        try {
            personaIds = jdbcClient.sql("""
                            SELECT DISTINCT u.persona_id
                            FROM seguridad.usuarios u
                            JOIN seguridad.usuarios_roles ur ON ur.usuario_id = u.id AND ur.activo
                            JOIN seguridad.roles r ON r.id = ur.rol_id AND r.activo
                            WHERE upper(r.codigo) IN ('SUPERVISOR', 'ROLE_SUPERVISOR')
                              AND u.persona_id IS NOT NULL
                            """)
                    .query(UUID.class)
                    .list();
        } catch (Exception ex) {
            log.warn("No se pudieron resolver los supervisores candidatos a aprobador: {}", ex.getMessage());
            return List.of();
        }
        if (personaIds == null || personaIds.isEmpty()) {
            return List.of();
        }
        return personaIds.stream()
                .map(empleadoRepository::findFirstByPersonaId)
                .flatMap(Optional::stream)
                .toList();
    }

    /**
     * REQ-MANT-028: valida el aprobador en las transiciones de aprobación de la ruta por ID.
     * En {@code borradorSolicitud} el aprobador viene del formulario Web; en
     * {@code revisarSolicitud} Web no lo envía, por lo que se deriva del contexto persistido
     * (o del assignee de la tarea) sin forzar un 422 al cliente real.
     */
    private void validarAprobadorEnTransicion(
            String taskDefinitionKey,
            UUID actorEmpleadoId,
            Map<String, Object> variables,
            String assignee,
            SolicitudMantenimiento solicitud) {

        boolean esBorrador = "borradorSolicitud".equalsIgnoreCase(taskDefinitionKey);
        boolean esRevision = "revisarSolicitud".equalsIgnoreCase(taskDefinitionKey);
        if (!esBorrador && !esRevision) {
            return;
        }

        UUID aprobadorId = null;
        if (variables != null) {
            Object declarado = variables.get("aprobadorId");
            if (declarado != null && !declarado.toString().isBlank()) {
                try {
                    aprobadorId = UUID.fromString(declarado.toString().trim());
                } catch (IllegalArgumentException ex) {
                    throw new BusinessException(
                            "APROBADOR_ID_INVALIDO",
                            "El aprobador indicado no tiene un identificador válido");
                }
            }
        }
        if (aprobadorId == null && solicitud.getAprobador() != null) {
            aprobadorId = solicitud.getAprobador().getId();
        }
        if (aprobadorId == null && esRevision && assignee != null && !assignee.isBlank()) {
            try {
                aprobadorId = UUID.fromString(assignee.trim());
            } catch (IllegalArgumentException ex) {
                throw new BusinessException(
                        "APROBADOR_ID_INVALIDO",
                        "El responsable asignado a la tarea no tiene un identificador válido");
            }
        }

        Empleado aprobador = validarAprobador(aprobadorId);
        UUID solicitanteId = solicitud.getSolicitante() != null ? solicitud.getSolicitante().getId() : null;

        if (securityUtils.isAdmin()) {
            log.info("REQ-MANT-028 ADMIN bypass en validación de aprobador: solicitud {} tarea {} usuario {} aprobador {}",
                    solicitud.getId(), taskDefinitionKey, securityUtils.getCurrentUsername(), aprobadorId);
        } else if (esBorrador && actorEmpleadoId != null && aprobadorId.equals(actorEmpleadoId)) {
            throw new ForbiddenException("El aprobador debe ser distinto del solicitante que completa la tarea");
        } else if (solicitanteId != null && aprobadorId.equals(solicitanteId)) {
            throw new ForbiddenException("El aprobador debe ser distinto del solicitante de la solicitud");
        }

        // REQ-MANT-008: segregación de duties; quien ejecuta el mantenimiento no puede aprobarlo.
        UUID responsableId = solicitud.getResponsable() != null ? solicitud.getResponsable().getId() : null;
        if (!securityUtils.isAdmin() && responsableId != null && responsableId.equals(aprobadorId)) {
            throw new ForbiddenException("APROBADOR_ES_RESPONSABLE",
                    "El responsable de la ejecución no puede aprobar su propio mantenimiento");
        }

        solicitud.setAprobador(aprobador);
        if (variables != null) {
            variables.put("aprobadorId", aprobador.getId().toString());
        }
    }

    private boolean empleadoTieneRolAprobador(Empleado empleado) {
        if (empleado == null || empleado.getPersonaId() == null) {
            return false;
        }
        try {
            List<String> codigos = jdbcClient.sql("""
                            SELECT upper(r.codigo)
                            FROM seguridad.usuarios u
                            JOIN seguridad.usuarios_roles ur ON ur.usuario_id = u.id AND ur.activo
                            JOIN seguridad.roles r ON r.id = ur.rol_id AND r.activo
                            WHERE u.persona_id = :personaId
                            """)
                    .param("personaId", empleado.getPersonaId())
                    .query(String.class)
                    .list();
            if (codigos == null) {
                return false;
            }
            return codigos.stream()
                    .map(c -> c != null ? c.toUpperCase().replaceFirst("^ROLE_", "") : "")
                    .anyMatch(c -> c.equals("SUPERVISOR") || c.equals("ADMIN"));
        } catch (Exception ex) {
            log.warn("No se pudieron resolver los roles del aprobador {}: {}", empleado.getId(), ex.getMessage());
            return false;
        }
    }

    @Transactional(readOnly = true)
    public SolicitudMantenimientoResumenResponse obtenerResumen() {
        return obtenerResumen(null);
    }

    @Transactional(readOnly = true)
    public SolicitudMantenimientoResumenResponse obtenerResumen(String interfaz) {
        InterfazFiltros filtros = resolverFiltrosPorInterfaz(interfaz);
        if (filtros.sinAcceso()) {
            return SolicitudMantenimientoResumenResponse.from(null, interfaz);
        }

        SolicitudMantenimientoResumenProjection projection = repository.obtenerResumen(
                filtros.solicitanteId(),
                filtros.aprobadorId(),
                filtros.supervisorId(),
                filtros.responsableId()
        );
        return SolicitudMantenimientoResumenResponse.from(projection, interfaz);
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudMantenimientoResponse> findAll(String q, String estado, PageRequestDto pageRequest) {
        return findAll(q, estado, null, pageRequest);
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudMantenimientoResponse> findAll(String q, String estado, String interfaz,
            PageRequestDto pageRequest) {
        InterfazFiltros filtros = resolverFiltrosPorInterfaz(interfaz);
        if (filtros.sinAcceso()) {
            Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
            return PageResponse.of(
                    Collections.emptyList(),
                    new org.springframework.data.domain.PageImpl<>(Collections.emptyList(), pageable, 0)
            );
        }
        List<String> estados = resolverEstados(estado, interfaz);

        SolicitudMantenimientoSearchCriteria criteria = new SolicitudMantenimientoSearchCriteria(
                q,
                estados,
                filtros.solicitanteId(),
                filtros.responsableId(),
                filtros.supervisorId(),
                null,
                filtros.aprobadorId());
        return findAll(criteria, pageRequest);
    }

    // Estados del BPMN (solicitudMantenimientoProcess.bpmn20.xml)
    public static final String ESTADO_BPMN_BORRADOR = "BORRADOR";
    public static final String ESTADO_BPMN_SOLICITADO = "SOLICITADO";
    public static final String ESTADO_BPMN_OBSERVADO = "OBSERVADO";
    public static final String ESTADO_BPMN_ASIGNADO = "ASIGNADO";
    public static final String ESTADO_BPMN_EN_MANTENIMIENTO = "EN_MANTENIMIENTO";
    public static final String ESTADO_BPMN_EN_REVISION = "EN_REVISION";
    public static final String ESTADO_BPMN_OBSERVADO_MANTENIMIENTO = "OBSERVADO_MANTENIMIENTO";
    public static final String ESTADO_BPMN_VALIDADO = "VALIDADO";
    public static final String ESTADO_BPMN_TRABAJO_REALIZADO = "TRABAJO_REALIZADO";
    public static final String ESTADO_BPMN_FINALIZADO = "FINALIZADO";

    public static final List<String> ESTADOS_SOLICITUD_EN_PROCESO = List.of(
            ESTADO_BPMN_SOLICITADO,
            ESTADO_BPMN_OBSERVADO,
            ESTADO_BPMN_ASIGNADO,
            ESTADO_BPMN_EN_MANTENIMIENTO,
            ESTADO_BPMN_EN_REVISION,
            ESTADO_BPMN_OBSERVADO_MANTENIMIENTO,
            ESTADO_BPMN_VALIDADO
    );

    @Transactional(readOnly = true)
    public PageResponse<com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoResponse> listarActivosParaSolicitud(
            String q,
            UUID tipoActivoId,
            UUID solicitudIdExcluir,
            PageRequestDto pageRequest) {
        PageResponse<com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoResponse> page =
                activoService.findAll(q, tipoActivoId, true, pageRequest);

        if (page.content() == null || page.content().isEmpty()) {
            return page;
        }

        Set<UUID> activoIds = page.content().stream()
                .map(com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoResponse::id)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<SolicitudMantenimiento> solicitudesActivas = repository.findActivasByActivoIds(
                activoIds,
                ESTADOS_SOLICITUD_EN_PROCESO,
                solicitudIdExcluir
        );

        Map<UUID, SolicitudMantenimiento> activaPorActivoMap = new HashMap<>();
        for (SolicitudMantenimiento sm : solicitudesActivas) {
            if (sm.getActivo() != null && sm.getActivo().getId() != null) {
                activaPorActivoMap.putIfAbsent(sm.getActivo().getId(), sm);
            }
        }

        List<com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoResponse> enrichedContent =
                page.content().stream()
                        .map(activo -> {
                            SolicitudMantenimiento smActiva = activaPorActivoMap.get(activo.id());
                            if (smActiva != null) {
                                return activo.withSolicitudActiva(true, smActiva.getNumero(), smActiva.getEstado());
                            }
                            return activo.withSolicitudActiva(false, null, null);
                        })
                        .toList();

        return new PageResponse<>(
                enrichedContent,
                page.page(),
                page.size(),
                page.totalElements(),
                page.totalPages(),
                page.first(),
                page.last(),
                page.empty()
        );
    }

    private void validarActivoSinSolicitudEnProceso(UUID activoId, UUID solicitudIdExcluir) {
        if (activoId == null) {
            return;
        }
        boolean existeActiva = repository.existsActivaByActivoId(
                activoId,
                ESTADOS_SOLICITUD_EN_PROCESO,
                solicitudIdExcluir
        );
        if (existeActiva) {
            throw new ConflictException(
                    "ACTIVO_CON_SOLICITUD_EN_PROCESO",
                    "El activo seleccionado ya tiene una solicitud de mantenimiento en proceso de revisión o ejecución y no puede solaparse."
            );
        }
    }

    public static List<String> resolverEstados(String estado) {
        return resolverEstados(estado, null);
    }

    public static List<String> resolverEstados(String estado, String interfaz) {
        if (estado == null || estado.isBlank()) {
            return Collections.emptyList();
        }
        String normalized = estado.trim().toUpperCase().replace("-", "_");

        // Para la bandeja de ejecución del técnico/encargado, EN_MANTENIMIENTO incluye estados activos de ejecución técnica
        if ("EncargadoMantenimientoPage".equalsIgnoreCase(interfaz != null ? interfaz.trim() : "")) {
            if ("EN_MANTENIMIENTO".equals(normalized)) {
                return List.of(
                        ESTADO_BPMN_EN_MANTENIMIENTO,
                        ESTADO_BPMN_OBSERVADO_MANTENIMIENTO,
                        ESTADO_BPMN_VALIDADO
                );
            }
        }

        return switch (normalized) {
            // Grupos de estados para las tarjetas de resumen y filtros
            case "BORRADOR", "BORRADORES" -> List.of(
                    ESTADO_BPMN_BORRADOR
            );
            case "ENREVISION", "REVISION", "REVISIONES" -> List.of(
                    ESTADO_BPMN_SOLICITADO,
                    ESTADO_BPMN_OBSERVADO
            );
            case "EN_PROCESO", "ENPROCESO", "PROCESO" -> List.of(
                    ESTADO_BPMN_SOLICITADO,
                    ESTADO_BPMN_OBSERVADO,
                    ESTADO_BPMN_ASIGNADO,
                    ESTADO_BPMN_EN_MANTENIMIENTO,
                    ESTADO_BPMN_EN_REVISION,
                    ESTADO_BPMN_OBSERVADO_MANTENIMIENTO,
                    ESTADO_BPMN_VALIDADO
            );
            case "FINALIZADA", "FINALIZADO", "FINALIZADAS", "FINALIZADOS" -> List.of(
                    ESTADO_BPMN_TRABAJO_REALIZADO,
                    ESTADO_BPMN_FINALIZADO,
                    "CERRADO"
            );

            // Estados directos individuales del BPMN
            case "SOLICITADO" -> List.of(ESTADO_BPMN_SOLICITADO);
            case "OBSERVADO" -> List.of(ESTADO_BPMN_OBSERVADO);
            case "ASIGNADO" -> List.of(ESTADO_BPMN_ASIGNADO);
            // EN_MANTENIMIENTO filtra todos los estados posteriores a ASIGNADO
            case "EN_MANTENIMIENTO" -> List.of(
                    ESTADO_BPMN_EN_MANTENIMIENTO,
                    ESTADO_BPMN_EN_REVISION,
                    ESTADO_BPMN_OBSERVADO_MANTENIMIENTO,
                    ESTADO_BPMN_VALIDADO,
                    ESTADO_BPMN_TRABAJO_REALIZADO,
                    ESTADO_BPMN_FINALIZADO,
                    "CERRADO"
            );
            case "EN_REVISION" -> List.of(ESTADO_BPMN_EN_REVISION);
            case "OBSERVADO_MANTENIMIENTO" -> List.of(ESTADO_BPMN_OBSERVADO_MANTENIMIENTO);
            case "VALIDADO" -> List.of(ESTADO_BPMN_VALIDADO);
            case "TRABAJO_REALIZADO", "TRABAJO_CONCLUIDO" -> List.of(
                    ESTADO_BPMN_TRABAJO_REALIZADO,
                    ESTADO_BPMN_FINALIZADO,
                    "CERRADO"
            );

            default -> List.of(normalized);
        };
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudMantenimientoResponse> findAll(SolicitudMantenimientoSearchCriteria criteria,
            PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<SolicitudMantenimiento> resultado = repository.findAll(criteria, pageable);
        return PageResponse.from(resultado, mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudMantenimientoResponse> listar(String search, PageRequestDto pageRequest) {
        String normalized = StringUtils.normalize(search);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<SolicitudMantenimiento> resultado;

        if (normalized == null || normalized.isBlank()) {
            resultado = repository.findAll(pageable);
        } else {
            resultado = repository.search(normalized, pageable);
        }

        return PageResponse.from(resultado, mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public SolicitudMantenimientoResponse findById(UUID id) {
        SolicitudMantenimiento solicitud = obtenerPorId(id);
        return mapper.toResponse(solicitud);
    }

    @Transactional(readOnly = true)
    public byte[] generarReportePdf(UUID id) {
        SolicitudMantenimientoResponse response = findById(id);

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("NUMERO_SOLICITUD", response.numero() != null ? response.numero() : "S/N");
        parameters.put("FECHA_SOLICITUD", response.fechaSolicitud() != null ? response.fechaSolicitud().format(FORMATTER_FECHA_HORA) : "-");
        parameters.put("ESTADO", response.estado() != null ? response.estado().toUpperCase() : "BORRADOR");
        parameters.put("PRIORIDAD", response.prioridad() != null ? response.prioridad().nombre() : "-");
        parameters.put("TIPO_MANTENIMIENTO", response.tipoMantenimiento() != null ? response.tipoMantenimiento().nombre() : "-");
        parameters.put("TIPO_FALLAS", response.tipoFallas() != null && !response.tipoFallas().isEmpty()
                ? String.join(", ", response.tipoFallas())
                : "-");

        parameters.put("SOLICITANTE_NOMBRE", response.solicitante() != null ? response.solicitante().nombreCompleto() : "-");
        parameters.put("SOLICITANTE_CARGO", response.solicitante() != null && response.solicitante().cargo() != null ? response.solicitante().cargo() : "-");

        parameters.put("ACTIVO_CODIGO", response.activo() != null ? response.activo().codigo() : "-");
        parameters.put("ACTIVO_NOMBRE", response.activo() != null ? response.activo().nombre() : "-");
        parameters.put("ACTIVO_CATEGORIA", "-");
        parameters.put("ACTIVO_UBICACION", "-");

        parameters.put("TITULO", response.titulo() != null ? response.titulo() : "-");
        parameters.put("DESCRIPCION", response.descripcion() != null ? response.descripcion() : "-");

        parameters.put("APROBADOR_NOMBRE", response.aprobador() != null ? response.aprobador().nombreCompleto() : "Pendiente de aprobación");
        parameters.put("RESPONSABLE_NOMBRE", response.responsable() != null ? response.responsable().nombreCompleto() : "No asignado");
        parameters.put("SUPERVISOR_NOMBRE", response.supervisor() != null ? response.supervisor().nombreCompleto() : "No asignado");

        parameters.put("FECHA_INICIO", response.fechaInicioMantenimiento() != null ? response.fechaInicioMantenimiento().format(FORMATTER_FECHA_HORA) : "-");
        parameters.put("FECHA_FIN", response.fechaFinMantenimiento() != null ? response.fechaFinMantenimiento().format(FORMATTER_FECHA_HORA) : "-");
        parameters.put("FECHA_CIERRE", response.fechaCierre() != null ? response.fechaCierre().format(FORMATTER_FECHA_HORA) : "-");
        parameters.put("FECHA_EMISION", LocalDateTime.now().format(FORMATTER_FECHA_HORA));

        // Usuario generador del reporte
        String usuarioGenerador = securityUtils.getCurrentUsername();
        UUID currentEmpId = obtenerEmpleadoIdActual();
        if (currentEmpId != null) {
            Empleado emp = empleadoRepository.findById(currentEmpId).orElse(null);
            if (emp != null && emp.getNombreCompleto() != null && !emp.getNombreCompleto().isBlank()) {
                usuarioGenerador = emp.getNombreCompleto() + (emp.getCargo() != null && !emp.getCargo().isBlank() ? " - " + emp.getCargo() : "");
            }
        }
        parameters.put("GENERADO_POR", usuarioGenerador);

        // Código de barras
        String codigoBarras = response.numero() != null && !response.numero().isBlank() ? response.numero() : id.toString();
        java.awt.image.BufferedImage barcodeImage = com.endecorani.sigma_api.shared.infrastructure.report.BarcodeUtil.generateBarcode128(codigoBarras, 320, 60);
        if (barcodeImage != null) {
            parameters.put("BARCODE_IMAGEN", barcodeImage);
        }

        try {
            org.springframework.core.io.ClassPathResource logoResource = new org.springframework.core.io.ClassPathResource("reports/images/logo-ende-corani.png");
            if (logoResource.exists()) {
                try (java.io.InputStream is = logoResource.getInputStream()) {
                    parameters.put("LOGO_EMPRESA", is.readAllBytes());
                }
            }
        } catch (Exception e) {
            log.warn("No se pudo cargar el logo para el reporte: {}", e.getMessage());
        }

        return jasperReportService.generatePdfReport(REPORTE_SOLICITUD_PATH, parameters);
    }

    @Transactional
    public SolicitudMantenimientoResponse create(SolicitudMantenimientoRequest dto) {
        return createInternal(dto, Collections.emptyList());
    }

    @Transactional
    public SolicitudMantenimientoResponse createWithFiles(SolicitudMantenimientoRequest request,
            List<MultipartFile> files) {
        return createInternal(request, files != null ? files : Collections.emptyList());
    }

    private SolicitudMantenimientoResponse createInternal(SolicitudMantenimientoRequest dto, List<MultipartFile> files) {
        UUID empleadoAutenticadoId = obtenerEmpleadoIdActual();
        if (!securityUtils.isAdmin()) {
            if (empleadoAutenticadoId == null) {
                throw new ForbiddenException("El usuario actual no está vinculado a un empleado para crear solicitudes");
            }
            if (dto.solicitanteId() != null && !empleadoAutenticadoId.equals(dto.solicitanteId())) {
                throw new ForbiddenException("El solicitante declarado no coincide con el usuario autenticado");
            }
        }

        validarActivoSinSolicitudEnProceso(dto.activoId(), null);

        String numero = correlativoService.generar(CorrelativoCodigo.SOLICITUD_MANTENIMIENTO,
                LocalDateTime.now().getYear());

        SolicitudMantenimiento solicitud = mapper.toDomain(dto);
        if (!securityUtils.isAdmin() && empleadoAutenticadoId != null
                && (solicitud.getSolicitante() == null || solicitud.getSolicitante().getId() == null)) {
            empleadoRepository.findById(empleadoAutenticadoId).ifPresent(solicitud::setSolicitante);
        }

        solicitud.setNumero(numero);
        solicitud.setFechaSolicitud(LocalDateTime.now());
        solicitud.setEstado(ESTADO_BORRADOR);

        SolicitudMantenimiento guardado = repository.save(solicitud);

        if (files != null && !files.isEmpty() && guardado.getId() != null) {
            if (guardado.getAdjuntos() == null) {
                guardado.setAdjuntos(new java.util.ArrayList<>());
            }
            for (MultipartFile file : files) {
                if (file != null && !file.isEmpty()) {
                    DocumentStorageService.StoredFile stored = documentStorageService.store(ADJUNTO_FOLDER,
                            UUID.randomUUID(), file);
                    SolicitudMantenimientoAdjunto adjunto = SolicitudMantenimientoAdjunto.builder()
                            .solicitudMantenimientoId(guardado.getId())
                            .nombreArchivo(stored.nombreOriginal())
                            .tipoContenido(stored.mimeType())
                            .size(stored.tamanoBytes())
                            .url(stored.publicUrl())
                            .build();
                    guardado.getAdjuntos().add(adjunto);
                }
            }
        }

        if (guardado.getId() != null) {
            Map<String, Object> variables = new HashMap<>();
            variables.put("solicitudId", guardado.getId().toString());
            if (guardado.getSolicitante() != null && guardado.getSolicitante().getId() != null) {
                variables.put("solicitanteId", guardado.getSolicitante().getId().toString());
            }

            String processInstanceId = workflowApplicationService.iniciar(
                    WORKFLOW_CODIGO,
                    guardado.getId().toString(),
                    variables);

            guardado.setProcessInstanceId(processInstanceId);
            guardado = repository.save(guardado);
        }

        UUID creadorEmpleadoId = obtenerEmpleadoIdActual();
        if (creadorEmpleadoId == null && guardado.getSolicitante() != null) {
            creadorEmpleadoId = guardado.getSolicitante().getId();
        }
        registrarTrazabilidad(
                guardado.getId(),
                null,
                guardado.getEstado(),
                "Creación de la solicitud en borrador",
                creadorEmpleadoId);

        return toResponse(guardado);
    }

    @Transactional
    public SolicitudMantenimientoResponse update(UUID id, SolicitudMantenimientoRequest dto) {
        SolicitudMantenimiento actual = obtenerPorId(id);

        UUID solicitanteActual = actual.getSolicitante() != null ? actual.getSolicitante().getId() : null;
        if (!securityUtils.isAdmin() && dto.solicitanteId() != null && !dto.solicitanteId().equals(solicitanteActual)) {
            throw new ForbiddenException("No puede cambiar el solicitante de una solicitud ajena");
        }

        String estadoActual = actual.getEstado() != null ? actual.getEstado().toUpperCase() : "";
        if (!"BORRADOR".equals(estadoActual) && !"OBSERVADO".equals(estadoActual)) {
            throw new ConflictException(
                    "SOLICITUD_NO_EDITABLE",
                    "Solo se pueden editar solicitudes en estado BORRADOR u OBSERVADO");
        }

        validarActivoSinSolicitudEnProceso(dto.activoId(), id);

        mapper.updateDomainFromRequest(dto, actual);

        SolicitudMantenimiento actualizado = repository.save(actual);
        return toResponse(actualizado);
    }

    @Transactional
    public SolicitudMantenimientoResponse enviar(UUID id, EnviarSolicitudMantenimientoRequest request) {

        SolicitudMantenimiento solicitud = obtenerPorId(id);

        // REQ-MANT-003: el actor se deriva del JWT, nunca del cuerpo ni del primer empleado disponible.
        UUID actorEmpleadoId = obtenerEmpleadoIdActual();
        UUID solicitanteId = solicitud.getSolicitante() != null ? solicitud.getSolicitante().getId() : null;
        if (!securityUtils.isAdmin()) {
            if (actorEmpleadoId == null) {
                throw new ForbiddenException("El usuario actual no está vinculado a un empleado para enviar la solicitud");
            }
            if (!actorEmpleadoId.equals(solicitanteId)) {
                throw new ForbiddenException("Solo el solicitante puede enviar su solicitud de mantenimiento");
            }
        } else {
            log.info("ADMIN bypass en enviar: solicitud {} ejecutada por usuario {}", id, securityUtils.getCurrentUsername());
        }

        if (!ESTADO_BORRADOR.equalsIgnoreCase(solicitud.getEstado())) {
            throw new ConflictException(
                    "SOLICITUD_ESTADO_INVALIDO",
                    "Solo se puede enviar una solicitud en estado BORRADOR");
        }

        if (solicitud.getActivo() != null) {
            validarActivoSinSolicitudEnProceso(solicitud.getActivo().getId(), id);
        }

        String estadoAnterior = solicitud.getEstado();

        UUID aprobadorId = request != null ? request.aprobadorId() : null;
        if (aprobadorId == null && request != null) {
            if (request.supervisorId() != null) {
                aprobadorId = request.supervisorId();
            } else if (request.responsableId() != null) {
                aprobadorId = request.responsableId();
            }
        }
        if (aprobadorId == null && solicitud.getSupervisor() != null) {
            aprobadorId = solicitud.getSupervisor().getId();
        }
        if (aprobadorId == null && solicitud.getResponsable() != null) {
            aprobadorId = solicitud.getResponsable().getId();
        }

        // Ya no se usa "primer empleado" como aprobador por defecto (REQ-MANT-003).
        Empleado aprobador = validarAprobador(aprobadorId);
        aprobadorId = aprobador.getId();
        solicitud.setAprobador(aprobador);

        if (request != null && request.responsableId() != null) {
            Empleado responsable = empleadoRepository.findById(request.responsableId())
                    .orElseThrow(() -> new ResourceNotFoundException("Empleado responsable", request.responsableId()));
            solicitud.setResponsable(responsable);
        }

        if (request != null && request.supervisorId() != null) {
            Empleado supervisor = empleadoRepository.findById(request.supervisorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Empleado supervisor", request.supervisorId()));
            solicitud.setSupervisor(supervisor);
        }

        Map<String, Object> variables = new HashMap<>();
        variables.put("solicitudId", solicitud.getId().toString());
        if (solicitanteId != null) {
            variables.put("solicitanteId", solicitanteId.toString());
        }
        variables.put("aprobadorId", aprobadorId.toString());

        if (request != null && request.responsableId() != null) {
            variables.put("responsableId", request.responsableId().toString());
        }

        String supervisorIdStr = solicitud.getSupervisor() != null && solicitud.getSupervisor().getId() != null
                ? solicitud.getSupervisor().getId().toString()
                : aprobadorId.toString();
        variables.put("supervisorId", supervisorIdStr);

        if (solicitud.getProcessInstanceId() == null) {
            String processInstanceId = workflowApplicationService.iniciar(
                    WORKFLOW_CODIGO,
                    solicitud.getId().toString(),
                    variables);
            solicitud.setProcessInstanceId(processInstanceId);
        }

        variables.putIfAbsent("action", "ENVIAR");
        variables.putIfAbsent("accion", "ENVIAR");
        CompleteWorkflowTaskRequest taskRequest = new CompleteWorkflowTaskRequest(variables);
        workflowApplicationService.completarTarea(
                solicitud.getProcessInstanceId(),
                taskRequest,
                true);

        solicitud.setEstado(ESTADO_SOLICITADO);

        SolicitudMantenimiento actualizado = repository.save(solicitud);

        registrarTrazabilidad(
                actualizado.getId(),
                estadoAnterior,
                ESTADO_SOLICITADO,
                "Envío de la solicitud para aprobación",
                actorEmpleadoId);

        eventPublisher.publishEvent(new SolicitudMantenimientoEstadoCambiadoEvent(
                actualizado.getId(),
                actualizado.getActivo() != null ? actualizado.getActivo().getId() : null,
                estadoAnterior,
                ESTADO_SOLICITADO,
                LocalDateTime.now()
        ));

        return toResponse(actualizado);
    }

    @Transactional
    public SolicitudMantenimientoResponse completarWorkflow(UUID solicitudId, CompleteWorkflowTaskRequest request) {

        SolicitudMantenimiento solicitud = obtenerPorId(solicitudId);

        if (solicitud.getProcessInstanceId() == null) {
            throw new ConflictException(
                    "SOLICITUD_SIN_WORKFLOW",
                    "La solicitud no tiene workflow iniciado");
        }

        // Validar que exista una tarea activa en el proceso
        WorkflowTaskResponse tareaActual = workflowApplicationService.obtenerTareaActual(solicitud.getProcessInstanceId());
        if (tareaActual == null || tareaActual.id() == null) {
            throw new ConflictException(
                    "SOLICITUD_SIN_TAREA_ACTIVA",
                    "La solicitud no tiene una tarea activa en el flujo de trabajo");
        }

        // REQ-MANT-003: una tarea sin responsable no puede completarse ni por ADMIN.
        String assignee = tareaActual.assignee() != null ? tareaActual.assignee().trim() : null;
        if (assignee == null || assignee.isBlank()) {
            throw new ConflictException(
                    "TAREA_NO_ASIGNADA",
                    "La tarea activa no tiene un responsable asignado");
        }

        // Validar permisos del actor asignado a la tarea
        UUID currentEmpId = obtenerEmpleadoIdActual();
        if (securityUtils.isAdmin()) {
            log.info("ADMIN bypass en completarWorkflow: solicitud {} tarea {} ejecutada por usuario {} (assignee {})",
                    solicitudId, tareaActual.id(), securityUtils.getCurrentUsername(), assignee);
        } else {
            if (currentEmpId == null) {
                throw new BusinessException(
                        "USUARIO_NO_EMPLEADO",
                        "El usuario actual no está vinculado a un empleado para ejecutar acciones del flujo");
            }
            if (!currentEmpId.toString().equalsIgnoreCase(assignee)) {
                throw new ConflictException(
                        "TAREA_NO_ASIGNADA",
                        "No tiene permisos para completar esta tarea de la solicitud. Está asignada a otro usuario.");
            }
        }

        String estadoAnterior = solicitud.getEstado();

        if ("borradorSolicitud".equalsIgnoreCase(tareaActual.taskDefinitionKey()) && solicitud.getActivo() != null) {
            validarActivoSinSolicitudEnProceso(solicitud.getActivo().getId(), solicitudId);
        }

        Map<String, Object> effectiveVariables = new HashMap<>();
        if (request != null && request.variables() != null) {
            validarActorDeclarado(request.variables(), currentEmpId);
            effectiveVariables.putAll(request.variables());
        }
        if (!securityUtils.isAdmin() && currentEmpId != null) {
            // El valor de solicitud/actor siempre se deriva del JWT; se ignora cualquier valor del cuerpo.
            effectiveVariables.put("solicitanteId", currentEmpId.toString());
        }

        if (!effectiveVariables.containsKey("supervisorId")) {
            if (solicitud.getSupervisor() != null && solicitud.getSupervisor().getId() != null) {
                effectiveVariables.put("supervisorId", solicitud.getSupervisor().getId().toString());
            } else if (solicitud.getAprobador() != null && solicitud.getAprobador().getId() != null) {
                effectiveVariables.put("supervisorId", solicitud.getAprobador().getId().toString());
            }
        }

        if (!effectiveVariables.containsKey("responsableId") && solicitud.getResponsable() != null
                && solicitud.getResponsable().getId() != null) {
            effectiveVariables.put("responsableId", solicitud.getResponsable().getId().toString());
        }

        validarAprobadorEnTransicion(
                tareaActual.taskDefinitionKey(),
                currentEmpId,
                effectiveVariables,
                assignee,
                solicitud);

        CompleteWorkflowTaskRequest effectiveRequest = new CompleteWorkflowTaskRequest(effectiveVariables);

        WorkflowTaskActionsResponse resultado = workflowApplicationService.completarTarea(
                solicitud.getProcessInstanceId(),
                effectiveRequest,
                true);

        String nuevoEstado = resultado.status() != null ? resultado.status().toLowerCase().trim() : null;
        if (nuevoEstado != null) {
            solicitud.setEstado(nuevoEstado);
        } else {
            solicitud.setEstado(ESTADO_BPMN_FINALIZADO.toLowerCase());
            nuevoEstado = ESTADO_BPMN_FINALIZADO.toLowerCase();
        }

        LocalDateTime ahora = LocalDateTime.now();

        // Controlar que variables de asignación solo se actualicen en las tareas correspondientes del BPMN
        String taskDefKey = tareaActual.taskDefinitionKey() != null ? tareaActual.taskDefinitionKey().trim() : "";
        if (request != null && request.variables() != null) {
            // REQ-MANT-028: el aprobador ya fue validado y persistido antes de completar la tarea.
            if ("revisarSolicitud".equalsIgnoreCase(taskDefKey) || securityUtils.isAdmin()) {
                Object responsableIdObj = request.variables().get("responsableId");
                if (responsableIdObj != null && !responsableIdObj.toString().isBlank()) {
                    try {
                        UUID targetId = UUID.fromString(responsableIdObj.toString().trim());
                        Optional<Empleado> empleadoOpt = empleadoRepository.findById(targetId);
                        if (empleadoOpt.isPresent()) {
                            solicitud.setResponsable(empleadoOpt.get());
                        } else {
                            jdbcClient.sql("SELECT empleado_id FROM gestion_vehicular.conductores WHERE id = :conductorId LIMIT 1")
                                    .param("conductorId", targetId)
                                    .query(UUID.class)
                                    .optional()
                                    .flatMap(empleadoRepository::findById)
                                    .ifPresent(solicitud::setResponsable);
                        }
                    } catch (Exception e) {
                        log.warn("No se pudo asignar responsableId={} en solicitud {}: {}", responsableIdObj, solicitudId, e.getMessage());
                    }
                }
            }

            if ("enviarRevision".equalsIgnoreCase(taskDefKey) || securityUtils.isAdmin()) {
                Object supervisorIdObj = request.variables().get("supervisorId");
                if (supervisorIdObj != null && !supervisorIdObj.toString().isBlank()) {
                    try {
                        empleadoRepository.findById(UUID.fromString(supervisorIdObj.toString().trim()))
                                .ifPresent(solicitud::setSupervisor);
                    } catch (Exception e) {
                        log.warn("No se pudo asignar supervisorId={} en solicitud {}: {}", supervisorIdObj, solicitudId, e.getMessage());
                    }
                }
            }
        }

        if (nuevoEstado != null) {
            switch (nuevoEstado.toUpperCase()) {
                case "EN_MANTENIMIENTO":
                    if (solicitud.getFechaInicioMantenimiento() == null) {
                        solicitud.setFechaInicioMantenimiento(ahora);
                    }
                    break;
                case "EN_REVISION", "OBSERVADO_MANTENIMIENTO", "VALIDADO":
                    if (solicitud.getFechaInicioMantenimiento() == null) {
                        solicitud.setFechaInicioMantenimiento(ahora);
                    }
                    if (solicitud.getFechaFinMantenimiento() == null) {
                        solicitud.setFechaFinMantenimiento(ahora);
                    }
                    break;
                case "TRABAJO_REALIZADO", "FINALIZADO", "CERRADO":
                    if (solicitud.getFechaInicioMantenimiento() == null) {
                        solicitud.setFechaInicioMantenimiento(ahora);
                    }
                    if (solicitud.getFechaFinMantenimiento() == null) {
                        solicitud.setFechaFinMantenimiento(ahora);
                    }
                    if (solicitud.getFechaCierre() == null) {
                        solicitud.setFechaCierre(ahora);
                    }
                    break;
            }
        }

        SolicitudMantenimiento guardado = repository.save(solicitud);

        // Sincronizar estado operativo del activo (EN_MANTENIMIENTO -> MANTENIMIENTO, TRABAJO_REALIZADO -> OPERATIVO)
        sincronizarEstadoOperativoActivo(guardado, guardado.getEstado());

        // Notificar cambio de estado a otros módulos (p.ej. recálculo de programaciones preventivas)
        eventPublisher.publishEvent(new SolicitudMantenimientoEstadoCambiadoEvent(
                guardado.getId(),
                guardado.getActivo() != null ? guardado.getActivo().getId() : null,
                estadoAnterior,
                guardado.getEstado(),
                ahora
        ));

        if (nuevoEstado != null && !nuevoEstado.equalsIgnoreCase(estadoAnterior)) {
            String comentario = "Cambio de estado en el flujo de trabajo";
            if (request != null && request.variables() != null) {
                if (request.variables().get("comentario") != null
                        && !request.variables().get("comentario").toString().isBlank()) {
                    comentario = request.variables().get("comentario").toString().trim();
                } else if (request.variables().get("observacion") != null
                        && !request.variables().get("observacion").toString().isBlank()) {
                    comentario = request.variables().get("observacion").toString().trim();
                } else if (request.variables().get("motivo") != null
                        && !request.variables().get("motivo").toString().isBlank()) {
                    comentario = request.variables().get("motivo").toString().trim();
                }
            }
            UUID actorEmpleadoId = currentEmpId != null ? currentEmpId : resolverEmpleadoIdParaWorkflow(tareaActual, guardado);
            registrarTrazabilidad(
                    guardado.getId(),
                    estadoAnterior,
                    nuevoEstado,
                    comentario,
                    actorEmpleadoId);
        }

        return toResponse(guardado);
    }

    @Transactional(readOnly = true)
    public List<SolicitudMantenimientoTrazabilidadResponse> obtenerTrazabilidad(UUID solicitudId) {
        obtenerPorId(solicitudId);
        List<SolicitudMantenimientoTrazabilidad> trazabilidades = trazabilidadRepository
                .findBySolicitudMantenimientoId(solicitudId);
        if (trazabilidades.isEmpty()) {
            return List.of();
        }

        Set<UUID> empleadoIds = trazabilidades.stream()
                .map(SolicitudMantenimientoTrazabilidad::getEmpleadoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, VEmpleadoEntity> vEmpleadosMap = empleadoIds.isEmpty()
                ? Collections.emptyMap()
                : vEmpleadoRepository.findAllById(empleadoIds).stream()
                        .collect(Collectors.toMap(VEmpleadoEntity::getEmpleadoId, e -> e, (a, b) -> a));

        return trazabilidades.stream()
                .map(t -> {
                    VEmpleadoEntity ve = vEmpleadosMap.get(t.getEmpleadoId());
                    SolicitudMantenimientoResponse.EmpleadoInfo info = ve != null
                            ? new SolicitudMantenimientoResponse.EmpleadoInfo(ve.getEmpleadoId(), ve.getNombreCompleto(), ve.getCargo())
                            : new SolicitudMantenimientoResponse.EmpleadoInfo(t.getEmpleadoId(), null, null);
                    return new SolicitudMantenimientoTrazabilidadResponse(
                            t.getId(),
                            t.getSolicitudMantenimientoId(),
                            t.getEstadoAnterior(),
                            t.getEstadoNuevo(),
                            t.getComentario(),
                            t.getEmpleadoId(),
                            info,
                            t.getFecha());
                })
                .toList();
    }

    /**
     * REQ-MANT-004: borrado con alcance (REQ-MANT-002) y sin borrar registros en uso.
     * REQ-MANT-031: la limpieza de archivos se registra en {@code afterCommit}, nunca
     * antes del borrado en BD, para que un 409/rollback no deje el storage sin archivos.
     * Nunca se deja escapar un {@code DATA_INTEGRITY_VIOLATION} genérico: cualquier uso
     * se reporta como {@code 409 SOLICITUD_EN_USO}.
     */
    @Transactional
    public void delete(UUID id) {
        SolicitudMantenimiento solicitud = obtenerPorId(id);
        validarSinUsosParaBorrado(solicitud);

        try {
            repository.deleteById(id);
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException("SOLICITUD_EN_USO",
                    "No se puede eliminar la solicitud porque tiene registros dependientes");
        }

        programarLimpiezaDeAdjuntos(solicitud);
    }

    /** REQ-MANT-031: solo las URLs de los adjuntos de la solicitud borrada, tras el commit. */
    private void programarLimpiezaDeAdjuntos(SolicitudMantenimiento solicitud) {
        if (solicitud.getAdjuntos() == null) {
            return;
        }
        List<String> urls = solicitud.getAdjuntos().stream()
                .filter(Objects::nonNull)
                .map(SolicitudMantenimientoAdjunto::getUrl)
                .filter(url -> url != null && !url.isBlank())
                .distinct()
                .toList();
        if (urls.isEmpty()) {
            return;
        }

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    eliminarAdjuntos(urls);
                }
            });
        } else {
            // Sin sincronización activa no hay transacción que pueda hacer rollback.
            eliminarAdjuntos(urls);
        }
    }

    private void eliminarAdjuntos(List<String> urls) {
        for (String url : urls) {
            try {
                documentStorageService.delete(url);
            } catch (RuntimeException ex) {
                log.warn("No se pudo eliminar el adjunto {} tras borrar la solicitud: {}", url, ex.getMessage());
            }
        }
    }

    private void validarSinUsosParaBorrado(SolicitudMantenimiento solicitud) {
        UUID id = solicitud.getId();
        String motivo = null;
        if (solicitud.getProcessInstanceId() != null && !solicitud.getProcessInstanceId().isBlank()) {
            motivo = "tiene una instancia de workflow activa";
        } else if (ordenTrabajoRepository.existsBySolicitudMantenimientoId(id)) {
            motivo = "tiene una orden de trabajo asociada";
        } else if (!trazabilidadRepository.findBySolicitudMantenimientoId(id).isEmpty()) {
            motivo = "tiene historial de trazabilidad";
        } else if (programacionHistorialRepository.existsBySolicitudMantenimientoId(id)) {
            motivo = "es el disparador de una programación preventiva";
        }
        if (motivo != null) {
            throw new ConflictException("SOLICITUD_EN_USO",
                    "No se puede eliminar la solicitud " + solicitud.getNumero() + " porque " + motivo + ".");
        }
    }

    private SolicitudMantenimiento obtenerPorId(UUID id) {
        SolicitudMantenimiento solicitud = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud de mantenimiento", id));
        validarAcceso(solicitud);
        return solicitud;
    }

    private void registrarTrazabilidad(UUID solicitudId, String estadoAnterior, String estadoNuevo, String comentario,
            UUID empleadoId) {
        if (solicitudId == null || estadoNuevo == null) {
            return;
        }

        if (empleadoId == null) {
            SolicitudMantenimiento s = repository.findById(solicitudId).orElse(null);
            if (s != null && s.getSolicitante() != null && s.getSolicitante().getId() != null) {
                empleadoId = s.getSolicitante().getId();
            }
        }

        if (empleadoId == null) {
            log.warn("No se pudo registrar trazabilidad para solicitud {} porque no se encontró empleadoId asociado",
                    solicitudId);
            return;
        }

        SolicitudMantenimientoTrazabilidad trazabilidad = SolicitudMantenimientoTrazabilidad.builder()
                .solicitudMantenimientoId(solicitudId)
                .estadoAnterior(estadoAnterior)
                .estadoNuevo(estadoNuevo)
                .comentario(comentario)
                .empleadoId(empleadoId)
                .fecha(LocalDateTime.now())
                .build();

        trazabilidadRepository.save(trazabilidad);
    }

    private UUID obtenerEmpleadoIdActual() {
        return securityUtils.getCurrentUserId()
                .flatMap(usuarioRepository::findById)
                .map(Usuario::getPersonaId)
                .flatMap(empleadoRepository::findFirstByPersonaId)
                .map(Empleado::getId)
                .orElse(null);
    }

    private UUID resolverEmpleadoIdParaWorkflow(WorkflowTaskResponse tareaActual, SolicitudMantenimiento solicitud) {
        UUID currentEmpId = obtenerEmpleadoIdActual();
        if (currentEmpId != null) {
            return currentEmpId;
        }

        if (tareaActual != null && tareaActual.assignee() != null && !tareaActual.assignee().isBlank()) {
            try {
                return UUID.fromString(tareaActual.assignee().trim());
            } catch (Exception ignored) {
            }
        }

        if (solicitud.getResponsable() != null && solicitud.getResponsable().getId() != null) {
            return solicitud.getResponsable().getId();
        }
        if (solicitud.getSupervisor() != null && solicitud.getSupervisor().getId() != null) {
            return solicitud.getSupervisor().getId();
        }
        if (solicitud.getAprobador() != null && solicitud.getAprobador().getId() != null) {
            return solicitud.getAprobador().getId();
        }
        if (solicitud.getSolicitante() != null && solicitud.getSolicitante().getId() != null) {
            return solicitud.getSolicitante().getId();
        }

        return null;
    }

    private boolean isEstadoEnMantenimiento(String estado) {
        if (estado == null) {
            return false;
        }
        String upper = estado.trim().toUpperCase();
        return "EN_MANTENIMIENTO".equals(upper)
                || "EN_REVISION".equals(upper)
                || "OBSERVADO_MANTENIMIENTO".equals(upper)
                || "VALIDADO".equals(upper);
    }

    private boolean isEstadoTrabajoRealizado(String estado) {
        if (estado == null) {
            return false;
        }
        String upper = estado.trim().toUpperCase();
        return "TRABAJO_REALIZADO".equals(upper)
                || "FINALIZADO".equals(upper)
                || "FINALIZADA".equals(upper)
                || "CERRADO".equals(upper);
    }

    private void sincronizarEstadoOperativoActivo(SolicitudMantenimiento solicitud, String nuevoEstado) {
        if (solicitud == null || solicitud.getActivo() == null || solicitud.getActivo().getId() == null || nuevoEstado == null) {
            return;
        }

        UUID activoId = solicitud.getActivo().getId();
        String estadoNormalizado = nuevoEstado.trim().toUpperCase();

        try {
            if (isEstadoEnMantenimiento(estadoNormalizado)) {
                var activoResp = activoService.findById(activoId);
                String codigoActual = activoResp != null && activoResp.estadoOperativo() != null
                        ? activoResp.estadoOperativo().codigo()
                        : null;
                if (!ESTADO_OPERATIVO_MANTENIMIENTO.equalsIgnoreCase(codigoActual)) {
                    activoService.cambiarEstadoOperativo(
                            activoId,
                            new CambiarEstadoOperativoRequest(
                                    null,
                                    ESTADO_OPERATIVO_MANTENIMIENTO,
                                    "Ingreso a mantenimiento por solicitud " + (solicitud.getNumero() != null ? solicitud.getNumero() : solicitud.getId())));
                    log.info("Activo {} actualizado a estado operativo {} por solicitud de mantenimiento {}",
                            activoId, ESTADO_OPERATIVO_MANTENIMIENTO, solicitud.getId());
                }
            } else if (isEstadoTrabajoRealizado(estadoNormalizado)) {
                var activoResp = activoService.findById(activoId);
                String codigoActual = activoResp != null && activoResp.estadoOperativo() != null
                        ? activoResp.estadoOperativo().codigo()
                        : null;
                if (ESTADO_OPERATIVO_MANTENIMIENTO.equalsIgnoreCase(codigoActual)) {
                    activoService.cambiarEstadoOperativo(
                            activoId,
                            new CambiarEstadoOperativoRequest(
                                    null,
                                    ESTADO_OPERATIVO_OPERATIVO,
                                    "Trabajo realizado / retorno a operativo por solicitud de mantenimiento " + (solicitud.getNumero() != null ? solicitud.getNumero() : solicitud.getId())));
                    log.info("Activo {} restaurado a estado operativo {} por conclusión de solicitud {}",
                            activoId, ESTADO_OPERATIVO_OPERATIVO, solicitud.getId());
                }
            }
        } catch (Exception e) {
            log.warn("No se pudo sincronizar el estado operativo del activo {}: {}", activoId, e.getMessage());
        }
    }

    public SolicitudMantenimientoResponse toResponse(SolicitudMantenimiento domain) {
        if (domain == null) {
            return null;
        }
        if (domain.getId() != null && (domain.getSolicitante() == null || domain.getSolicitante().getNombreCompleto() == null)) {
            return repository.findById(domain.getId()).map(mapper::toResponse).orElseGet(() -> mapper.toResponse(domain));
        }
        return mapper.toResponse(domain);
    }
}
