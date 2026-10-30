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
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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

    private record InterfazFiltros(UUID solicitanteId, UUID aprobadorId, UUID supervisorId, UUID responsableId) {}

    private InterfazFiltros resolverFiltrosPorInterfaz(String interfaz) {
        if (securityUtils.isAdmin()) {
            return new InterfazFiltros(null, null, null, null);
        }
        UUID empleadoActual = obtenerEmpleadoIdActual();
        if (interfaz == null || interfaz.isBlank() || "SolicitudesPage".equalsIgnoreCase(interfaz.trim())) {
            return new InterfazFiltros(empleadoActual, null, null, null);
        } else if ("AprobacionesPage".equalsIgnoreCase(interfaz.trim())) {
            return new InterfazFiltros(null, empleadoActual, null, null);
        } else if ("SupervisorMantenimientoPage".equalsIgnoreCase(interfaz.trim())) {
            return new InterfazFiltros(null, null, empleadoActual, null);
        } else if ("EncargadoMantenimientoPage".equalsIgnoreCase(interfaz.trim())) {
            return new InterfazFiltros(null, null, null, empleadoActual);
        }
        return new InterfazFiltros(empleadoActual, null, null, null);
    }

    @Transactional(readOnly = true)
    public SolicitudMantenimientoResumenResponse obtenerResumen() {
        return obtenerResumen(null);
    }

    @Transactional(readOnly = true)
    public SolicitudMantenimientoResumenResponse obtenerResumen(String interfaz) {
        InterfazFiltros filtros = resolverFiltrosPorInterfaz(interfaz);

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
        String numero = correlativoService.generar(CorrelativoCodigo.SOLICITUD_MANTENIMIENTO,
                LocalDateTime.now().getYear());

        SolicitudMantenimiento solicitud = mapper.toDomain(dto);

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

        String estadoActual = actual.getEstado() != null ? actual.getEstado().toUpperCase() : "";
        if (!"BORRADOR".equals(estadoActual) && !"OBSERVADO".equals(estadoActual)) {
            throw new ConflictException(
                    "SOLICITUD_NO_EDITABLE",
                    "Solo se pueden editar solicitudes en estado BORRADOR u OBSERVADO");
        }

        mapper.updateDomainFromRequest(dto, actual);

        SolicitudMantenimiento actualizado = repository.save(actual);
        return toResponse(actualizado);
    }

    @Transactional
    public SolicitudMantenimientoResponse enviar(UUID id, EnviarSolicitudMantenimientoRequest request) {

        SolicitudMantenimiento solicitud = obtenerPorId(id);

        if (!ESTADO_BORRADOR.equalsIgnoreCase(solicitud.getEstado())) {
            throw new ConflictException(
                    "SOLICITUD_ESTADO_INVALIDO",
                    "Solo se puede enviar una solicitud en estado BORRADOR");
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
        if (aprobadorId == null) {
            aprobadorId = empleadoRepository.findAll(org.springframework.data.domain.Pageable.ofSize(1))
                    .stream()
                    .findFirst()
                    .map(Empleado::getId)
                    .orElse(null);
        }
        if (aprobadorId == null) {
            throw new BusinessException(
                    "APROBADOR_REQUERIDO",
                    "Debe seleccionar un aprobador");
        }

        final UUID finalAprobadorId = aprobadorId;
        Empleado aprobador = empleadoRepository.findById(finalAprobadorId)
                .orElseThrow(() -> new ResourceNotFoundException("Empleado", finalAprobadorId));
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
        if (solicitud.getSolicitante() != null && solicitud.getSolicitante().getId() != null) {
            variables.put("solicitanteId", solicitud.getSolicitante().getId().toString());
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
        } else {
            variables.putIfAbsent("action", "ENVIAR");
            variables.putIfAbsent("accion", "ENVIAR");
            CompleteWorkflowTaskRequest taskRequest = new CompleteWorkflowTaskRequest(variables);
            workflowApplicationService.completarTarea(
                    solicitud.getProcessInstanceId(),
                    taskRequest);
        }

        solicitud.setEstado(ESTADO_SOLICITADO);

        SolicitudMantenimiento actualizado = repository.save(solicitud);

        UUID actorEmpleadoId = obtenerEmpleadoIdActual();
        if (actorEmpleadoId == null && actualizado.getSolicitante() != null) {
            actorEmpleadoId = actualizado.getSolicitante().getId();
        }
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

        // Validar permisos del actor asignado a la tarea
        UUID currentEmpId = obtenerEmpleadoIdActual();
        if (!securityUtils.isAdmin()) {
            if (currentEmpId == null) {
                throw new BusinessException(
                        "USUARIO_NO_EMPLEADO",
                        "El usuario actual no está vinculado a un empleado para ejecutar acciones del flujo");
            }
            if (tareaActual.assignee() != null && !tareaActual.assignee().isBlank()) {
                if (!currentEmpId.toString().equalsIgnoreCase(tareaActual.assignee().trim())) {
                    throw new ConflictException(
                            "TAREA_NO_ASIGNADA",
                            "No tiene permisos para completar esta tarea de la solicitud. Está asignada a otro usuario.");
                }
            }
        }

        String estadoAnterior = solicitud.getEstado();

        Map<String, Object> effectiveVariables = new HashMap<>();
        if (request != null && request.variables() != null) {
            effectiveVariables.putAll(request.variables());
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

        CompleteWorkflowTaskRequest effectiveRequest = new CompleteWorkflowTaskRequest(effectiveVariables);

        WorkflowTaskActionsResponse resultado = workflowApplicationService.completarTarea(
                solicitud.getProcessInstanceId(),
                effectiveRequest);

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
            if ("borradorSolicitud".equalsIgnoreCase(taskDefKey) || securityUtils.isAdmin()) {
                Object aprobadorIdObj = request.variables().get("aprobadorId");
                if (aprobadorIdObj != null && !aprobadorIdObj.toString().isBlank()) {
                    try {
                        empleadoRepository.findById(UUID.fromString(aprobadorIdObj.toString().trim()))
                                .ifPresent(solicitud::setAprobador);
                    } catch (Exception e) {
                        log.warn("No se pudo asignar aprobadorId={} en solicitud {}: {}", aprobadorIdObj, solicitudId, e.getMessage());
                    }
                }
            }

            if ("revisarSolicitud".equalsIgnoreCase(taskDefKey) || securityUtils.isAdmin()) {
                Object responsableIdObj = request.variables().get("responsableId");
                if (responsableIdObj != null && !responsableIdObj.toString().isBlank()) {
                    try {
                        empleadoRepository.findById(UUID.fromString(responsableIdObj.toString().trim()))
                                .ifPresent(solicitud::setResponsable);
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

    @Transactional
    public void delete(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private SolicitudMantenimiento obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud de mantenimiento", id));
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
