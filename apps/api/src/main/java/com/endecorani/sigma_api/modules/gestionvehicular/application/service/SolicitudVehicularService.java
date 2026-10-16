package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.request.EnviarSolicitudVehicularRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.request.SolicitudVehicularRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.request.SolicitudVehicularUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response.SolicitudVehicularAdjuntoResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response.SolicitudVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response.SolicitudVehicularConductorInfo;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response.SolicitudVehicularResponsableInfo;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response.SolicitudVehicularSolicitanteInfo;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response.SolicitudVehicularTipoSolicitudInfo;
import com.endecorani.sigma_api.modules.gestionvehicular.application.mapper.SolicitudVehicularMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoViajeVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.AsignacionVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.Conductor;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SolicitudVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.TipoSolicitudVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.ViajeVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.AsignacionVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ConductorRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SolicitudVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.TipoSolicitudVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ViajeVehicularRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.modules.activos.application.dto.request.CambiarEstadoOperativoRequest;
import com.endecorani.sigma_api.modules.activos.application.service.ActivoService;
import com.endecorani.sigma_api.modules.parametros.application.service.CorrelativoService;
import com.endecorani.sigma_api.modules.parametros.domain.constant.CorrelativoCodigo;
import com.endecorani.sigma_api.modules.workflow.application.dto.request.CompleteWorkflowTaskRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskActionsResponse;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowApplicationService;
import com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.FlowableClient;
import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SolicitudVehicularService {

    private static final String ESTADO_BORRADOR = "BORRADOR";
    private static final String ESTADO_SOLICITADO = "SOLICITADO";
    private static final String ESTADO_PENDIENTE = "PENDIENTE";
    private static final String ESTADO_OBSERVADO = "OBSERVADO";
    private static final String ESTADO_RECHAZADA = "RECHAZADA";
    private static final String ESTADO_FINALIZADA = "FINALIZADA";
    private static final String ESTADO_FINALIZADO = "FINALIZADO";
    private static final String ESTADO_EN_CURSO = "EN_CURSO";
    private static final String ESTADO_EN_VIAJE = "EN_VIAJE";
    private static final String ESTADO_RETORNO = "RETORNO";
    private static final String ESTADO_OPERATIVO_EN_VIAJE = "EN_VIAJE";
    private static final String ESTADO_OPERATIVO_OPERATIVO = "OPERATIVO";
    private static final String ACCION_RECHAZAR = "RECHAZAR";
    private static final String WORKFLOW_CODIGO = "SOLICITUD_VEHICULAR";
    private static final String SOLICITANTE_ID = "solicitanteId";
    private static final String RESPONSABLE_ASIGNACION_ID = "responsableAsignacionId";
    private static final String CONDUCTOR_ASIGNADO_ID = "conductorAsignadoId";
    private static final String APROBADOR_ID = "aprobadorId";
    private static final String COMENTARIO = "comentario";

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "numero",
            "tipoSolicitudVehicularId",
            SOLICITANTE_ID,
            RESPONSABLE_ASIGNACION_ID,
            CONDUCTOR_ASIGNADO_ID,
            "motivo",
            "destino",
            "fechaSalida",
            "fechaRetornoEstimada",
            "cantidadPasajeros",
            "estado",
            "createdAt",
            "updatedAt");

    private final SolicitudVehicularRepository repository;
    private final TipoSolicitudVehicularRepository tipoSolicitudVehicularRepository;
    private final EmpleadoRepository empleadoRepository;
    private final SpringVEmpleadoRepository springVEmpleadoRepository;
    private final ConductorRepository conductorRepository;
    private final AsignacionVehicularRepository asignacionVehicularRepository;
    private final ViajeVehicularRepository viajeVehicularRepository;
    private final SolicitudVehicularAdjuntoService adjuntoService;
    private final SolicitudVehicularMapper mapper;
    private final CorrelativoService correlativoService;
    private final WorkflowApplicationService workflowApplicationService;
    private final FlowableClient flowableClient;
    private final UsuarioRepository usuarioRepository;
    private final SecurityUtils securityUtils;
    private final ActivoService activoService;

    @Transactional(readOnly = true)
    public PageResponse<SolicitudVehicularResponse> listar(String search, PageRequestDto pageRequest) {
        return listar(search, null, null, null, null, null, pageRequest);
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudVehicularResponse> listar(
            String search,
            String estado,
            UUID tipoSolicitudVehicularId,
            UUID solicitanteId,
            UUID conductorAsignadoId,
            PageRequestDto pageRequest) {
        return listar(search, estado, tipoSolicitudVehicularId, solicitanteId, conductorAsignadoId, null, null,
                pageRequest);
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudVehicularResponse> listar(
            String search,
            String estado,
            UUID tipoSolicitudVehicularId,
            UUID solicitanteId,
            UUID conductorAsignadoId,
            String interfaz,
            PageRequestDto pageRequest) {
        return listar(search, estado, tipoSolicitudVehicularId, solicitanteId, conductorAsignadoId, null, interfaz,
                pageRequest);
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudVehicularResponse> listar(
            String search,
            String estado,
            UUID tipoSolicitudVehicularId,
            UUID solicitanteId,
            UUID conductorAsignadoId,
            UUID responsableAsignacionId,
            String interfaz,
            PageRequestDto pageRequest) {
        InterfazFiltros filtros = resolverFiltrosPorInterfaz(solicitanteId, responsableAsignacionId, conductorAsignadoId, interfaz);
        return listarInternal(search, estado, tipoSolicitudVehicularId, filtros.solicitanteId(), filtros.conductorAsignadoId(),
                filtros.responsableAsignacionId(), pageRequest);
    }

    private UUID obtenerEmpleadoIdActual() {
        return securityUtils.getCurrentUserId()
                .flatMap(usuarioRepository::findById)
                .map(Usuario::getPersonaId)
                .flatMap(empleadoRepository::findFirstByPersonaId)
                .map(Empleado::getId)
                .orElse(null);
    }

    private UUID obtenerConductorIdActual() {
        UUID empleadoId = obtenerEmpleadoIdActual();
        if (empleadoId == null) {
            return null;
        }
        return conductorRepository.findByEmpleadoId(empleadoId)
                .map(Conductor::getId)
                .or(() -> conductorRepository.findById(empleadoId).map(Conductor::getId))
                .orElse(null);
    }

    private record InterfazFiltros(UUID solicitanteId, UUID responsableAsignacionId, UUID conductorAsignadoId) {}

    private InterfazFiltros resolverFiltrosPorInterfaz(
            UUID solicitanteId,
            UUID responsableAsignacionId,
            UUID conductorAsignadoId,
            String interfaz) {
        if (securityUtils.isAdmin()) {
            return new InterfazFiltros(solicitanteId, responsableAsignacionId, conductorAsignadoId);
        }
        if (interfaz != null) {
            String clean = interfaz.trim();
            if ("SolicitudesVehicularesPage".equalsIgnoreCase(clean) || "SolicitudesPage".equalsIgnoreCase(clean)) {
                UUID emp = obtenerEmpleadoIdActual();
                return new InterfazFiltros(
                        emp != null ? emp : UUID.fromString("00000000-0000-0000-0000-000000000000"),
                        responsableAsignacionId,
                        conductorAsignadoId);
            }
            if ("AsignacionVehicularPage".equalsIgnoreCase(clean)) {
                UUID emp = obtenerEmpleadoIdActual();
                return new InterfazFiltros(
                        solicitanteId,
                        emp != null ? emp : UUID.fromString("00000000-0000-0000-0000-000000000000"),
                        conductorAsignadoId);
            }
            if ("ConductorViajesPage".equalsIgnoreCase(clean)) {
                UUID cond = obtenerConductorIdActual();
                return new InterfazFiltros(
                        solicitanteId,
                        responsableAsignacionId,
                        cond != null ? cond : UUID.fromString("00000000-0000-0000-0000-000000000000"));
            }
        }
        return new InterfazFiltros(solicitanteId, responsableAsignacionId, conductorAsignadoId);
    }

    private PageResponse<SolicitudVehicularResponse> listarInternal(
            String search,
            String estado,
            UUID tipoSolicitudVehicularId,
            UUID solicitanteId,
            UUID conductorAsignadoId,
            UUID responsableAsignacionId,
            PageRequestDto pageRequest) {
        String normalizedSearch = StringUtils.normalize(search);
        String normalizedEstado = StringUtils.normalize(estado);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<SolicitudVehicular> resultado;

        if ((normalizedSearch == null || normalizedSearch.isBlank()) &&
                (normalizedEstado == null || normalizedEstado.isBlank()) &&
                tipoSolicitudVehicularId == null &&
                solicitanteId == null &&
                conductorAsignadoId == null &&
                responsableAsignacionId == null) {
            resultado = repository.findAll(pageable);
        } else {
            resultado = repository.searchWithFilters(
                    normalizedSearch,
                    normalizedEstado,
                    tipoSolicitudVehicularId,
                    solicitanteId,
                    conductorAsignadoId,
                    responsableAsignacionId,
                    pageable);
        }

        return toPageResponse(resultado);
    }

    @Transactional(readOnly = true)
    public SolicitudVehicularResponse findById(UUID id) {
        return findByIdInternal(id);
    }

    private SolicitudVehicularResponse findByIdInternal(UUID id) {
        SolicitudVehicular solicitud = obtenerPorId(id);
        List<SolicitudVehicularAdjuntoResponse> adjuntos = adjuntoService.findBySolicitudVehicularId(id);
        return toResponse(solicitud, adjuntos);
    }

    @Transactional
    public SolicitudVehicularResponse create(SolicitudVehicularRequest dto) {
        return createInternal(dto);
    }

    @Transactional
    public SolicitudVehicularResponse createWithFiles(SolicitudVehicularRequest dto, List<MultipartFile> files) {
        SolicitudVehicularResponse response = createInternal(dto);

        if (files != null && !files.isEmpty()) {
            adjuntoService.uploadMultipleFiles(response.id(), files);
            return findByIdInternal(response.id());
        }

        return response;
    }

    private SolicitudVehicularResponse createInternal(SolicitudVehicularRequest dto) {
        String numero = StringUtils.normalize(dto.numero());
        if (numero == null || numero.isBlank()) {
            numero = correlativoService.generar(CorrelativoCodigo.SOLICITUD_VEHICULAR, LocalDateTime.now().getYear());
        } else {
            validarNumeroUnicoParaCrear(numero);
        }

        TipoSolicitudVehicular tipo = obtenerTipoSolicitud(dto.tipoSolicitudVehicularId());
        Empleado solicitante = obtenerEmpleado(dto.solicitanteId());

        validarReglasTipoSolicitud(tipo, dto.fechaSalida(), dto.fechaRetornoEstimada(), dto.justificacion());

        String estado = StringUtils.normalize(dto.estado());
        if (estado == null || estado.isBlank()) {
            estado = ESTADO_BORRADOR;
        }

        SolicitudVehicular domain = mapper.toDomain(dto);
        domain.setNumero(numero);
        domain.setMotivo(StringUtils.normalize(dto.motivo()));
        domain.setJustificacion(StringUtils.normalize(dto.justificacion()));
        domain.setDestino(StringUtils.normalize(dto.destino()));
        domain.setObservacion(StringUtils.normalize(dto.observacion()));
        domain.setEstado(estado);

        SolicitudVehicular guardado = repository.save(domain);

        if (guardado.getId() != null) {
            Map<String, Object> variables = new HashMap<>();
            variables.put("solicitudId", guardado.getId().toString());
            variables.put(SOLICITANTE_ID, guardado.getSolicitanteId().toString());
            variables.put("destino", guardado.getDestino());
            variables.put("cantidadPasajeros", guardado.getCantidadPasajeros());

            try {
                String processInstanceId = workflowApplicationService.iniciar(
                        WORKFLOW_CODIGO,
                        guardado.getId().toString(),
                        variables);
                guardado.setProcessInstanceId(processInstanceId);
                guardado = repository.save(guardado);
            } catch (Exception ex) {
                // Si el workflow aún no está desplegado o en configuración, continuar guardando
                // la solicitud
                if (dto.processInstanceId() != null && !dto.processInstanceId().isBlank()) {
                    guardado.setProcessInstanceId(StringUtils.normalize(dto.processInstanceId()));
                    guardado = repository.save(guardado);
                }
            }
        }

        return toResponse(guardado, tipo, solicitante, List.of());
    }

    @Transactional
    public SolicitudVehicularResponse enviar(UUID id, EnviarSolicitudVehicularRequest request) {
        SolicitudVehicular solicitud = obtenerPorId(id);

        String estadoActual = solicitud.getEstado() != null ? solicitud.getEstado().toUpperCase() : "";
        if (!ESTADO_BORRADOR.equals(estadoActual) && !ESTADO_PENDIENTE.equals(estadoActual)) {
            throw new ConflictException(
                    "SOLICITUD_ESTADO_INVALIDO",
                    "Solo se puede enviar una solicitud en estado BORRADOR o PENDIENTE");
        }

        UUID aprobadorId = request.aprobadorId();
        if (aprobadorId == null) {
            throw new ConflictException(
                    "APROBADOR_REQUERIDO",
                    "Debe seleccionar un aprobador");
        }

        Map<String, Object> variables = new HashMap<>();
        variables.put("solicitudId", solicitud.getId().toString());
        variables.put(SOLICITANTE_ID, solicitud.getSolicitanteId().toString());
        variables.put(APROBADOR_ID, aprobadorId.toString());
        variables.put(RESPONSABLE_ASIGNACION_ID, aprobadorId.toString());
        if (request.comentario() != null && !request.comentario().isBlank()) {
            variables.put(COMENTARIO, request.comentario().trim());
        }

        if (solicitud.getProcessInstanceId() == null) {
            String processInstanceId = workflowApplicationService.iniciar(
                    WORKFLOW_CODIGO,
                    solicitud.getId().toString(),
                    variables);
            solicitud.setProcessInstanceId(processInstanceId);
        } else {
            CompleteWorkflowTaskRequest taskRequest = new CompleteWorkflowTaskRequest(variables);
            workflowApplicationService.completarTarea(
                    solicitud.getProcessInstanceId(),
                    taskRequest);
        }

        solicitud.setResponsableAsignacionId(aprobadorId);
        solicitud.setEstado(ESTADO_SOLICITADO);
        SolicitudVehicular actualizado = repository.save(solicitud);
        return toResponse(actualizado, adjuntoService.findBySolicitudVehicularId(actualizado.getId()));
    }

    @Transactional
    public SolicitudVehicularResponse completarWorkflow(UUID id, CompleteWorkflowTaskRequest request) {
        SolicitudVehicular solicitud = obtenerPorId(id);

        if (solicitud.getProcessInstanceId() == null) {
            throw new ConflictException(
                    "SOLICITUD_SIN_WORKFLOW",
                    "La solicitud no tiene workflow iniciado");
        }

        Map<String, Object> effectiveVariables = new HashMap<>();
        if (request != null && request.variables() != null) {
            effectiveVariables.putAll(request.variables());
        }

        if (!effectiveVariables.containsKey(CONDUCTOR_ASIGNADO_ID) && solicitud.getConductorAsignadoId() != null) {
            effectiveVariables.put(CONDUCTOR_ASIGNADO_ID, solicitud.getConductorAsignadoId().toString());
        }
        if (!effectiveVariables.containsKey(RESPONSABLE_ASIGNACION_ID)
                && solicitud.getResponsableAsignacionId() != null) {
            effectiveVariables.put(RESPONSABLE_ASIGNACION_ID, solicitud.getResponsableAsignacionId().toString());
        }

        if (effectiveVariables.containsKey(RESPONSABLE_ASIGNACION_ID)
                && !effectiveVariables.containsKey(APROBADOR_ID)) {
            effectiveVariables.put(APROBADOR_ID, effectiveVariables.get(RESPONSABLE_ASIGNACION_ID));
        } else if (effectiveVariables.containsKey(APROBADOR_ID)
                && !effectiveVariables.containsKey(RESPONSABLE_ASIGNACION_ID)) {
            effectiveVariables.put(RESPONSABLE_ASIGNACION_ID, effectiveVariables.get(APROBADOR_ID));
        }

        CompleteWorkflowTaskRequest effectiveRequest = new CompleteWorkflowTaskRequest(effectiveVariables);

        WorkflowTaskActionsResponse resultado = workflowApplicationService.completarTarea(
                solicitud.getProcessInstanceId(),
                effectiveRequest);

        String accionEnviada = effectiveVariables.get("accion") != null
                ? effectiveVariables.get("accion").toString().trim().toUpperCase()
                : "";

        String nuevoEstado = resultado.status() != null ? resultado.status().trim().toUpperCase() : null;
        if (ACCION_RECHAZAR.equals(accionEnviada)) {
            solicitud.setEstado(ESTADO_RECHAZADA);
        } else if (nuevoEstado != null) {
            solicitud.setEstado(nuevoEstado);
        } else {
            solicitud.setEstado(ESTADO_FINALIZADA);
        }

        if (effectiveVariables.containsKey(COMENTARIO) && effectiveVariables.get(COMENTARIO) != null) {
            String com = effectiveVariables.get(COMENTARIO).toString().trim();
            if (!com.isBlank()) {
                solicitud.setObservacion(StringUtils.normalize(com));
            }
        }

        UUID respIdVar = parseUuidVariable(effectiveVariables, RESPONSABLE_ASIGNACION_ID, APROBADOR_ID);
        if (respIdVar != null) {
            solicitud.setResponsableAsignacionId(respIdVar);
        }

        UUID condIdVar = parseUuidVariable(effectiveVariables, CONDUCTOR_ASIGNADO_ID, "conductorId");
        if (condIdVar != null) {
            solicitud.setConductorAsignadoId(condIdVar);
        }

        SolicitudVehicular guardado = repository.save(solicitud);

        // Sincronizar registro de viaje vehicular (asignacionVehicularId, salida, retorno)
        sincronizarViajeVehicular(guardado, effectiveVariables, nuevoEstado);

        // Sincronizar estado operativo del activo vehicular (EN_CURSO/RETORNO -> EN_VIAJE, FINALIZADA -> OPERATIVO)
        sincronizarEstadoOperativoActivo(guardado, guardado.getEstado());

        return toResponse(guardado, adjuntoService.findBySolicitudVehicularId(guardado.getId()));
    }

    private void sincronizarViajeVehicular(
            SolicitudVehicular solicitud,
            Map<String, Object> variables,
            String nuevoEstado) {
        if (solicitud == null || solicitud.getId() == null || variables == null) {
            return;
        }

        List<AsignacionVehicular> asignaciones = asignacionVehicularRepository
                .findBySolicitudVehicularId(solicitud.getId());
        if (asignaciones.isEmpty()) {
            return;
        }

        UUID asignacionId = asignaciones.get(0).getId();
        ViajeVehicular viaje = viajeVehicularRepository.findByAsignacionVehicularId(asignacionId)
                .orElseGet(() -> ViajeVehicular.builder()
                        .asignacionVehicularId(asignacionId)
                        .estado(EstadoViajeVehicular.PROGRAMADO)
                        .build());

        boolean modificado = procesarDatosSalida(viaje, variables, nuevoEstado);
        modificado = procesarDatosRetorno(viaje, variables, nuevoEstado) || modificado;
        modificado = procesarObservacion(viaje, variables) || modificado;

        if (modificado) {
            viajeVehicularRepository.save(viaje);
        }
    }

    private void sincronizarEstadoOperativoActivo(SolicitudVehicular solicitud, String nuevoEstado) {
        if (solicitud == null || solicitud.getId() == null || nuevoEstado == null) {
            return;
        }

        List<AsignacionVehicular> asignaciones = asignacionVehicularRepository
                .findBySolicitudVehicularId(solicitud.getId());
        if (asignaciones.isEmpty()) {
            return;
        }

        String estadoNormalizado = nuevoEstado.trim().toUpperCase();

        for (AsignacionVehicular asignacion : asignaciones) {
            UUID activoId = asignacion.getActivoId();
            if (activoId == null) {
                continue;
            }

            try {
                if (isSalidaEstado(estadoNormalizado)) {
                    var activoResp = activoService.findById(activoId);
                    String codigoActual = activoResp != null && activoResp.estadoOperativo() != null
                            ? activoResp.estadoOperativo().codigo()
                            : null;
                    if (!ESTADO_OPERATIVO_EN_VIAJE.equalsIgnoreCase(codigoActual)) {
                        activoService.cambiarEstadoOperativo(
                                activoId,
                                new CambiarEstadoOperativoRequest(
                                        null,
                                        ESTADO_OPERATIVO_EN_VIAJE,
                                        "Salida de viaje por solicitud vehicular " + (solicitud.getNumero() != null ? solicitud.getNumero() : solicitud.getId())));
                        log.info("Activo {} actualizado a estado operativo {} por solicitud {}",
                                activoId, ESTADO_OPERATIVO_EN_VIAJE, solicitud.getId());
                    }
                } else if (isRetornoEstado(estadoNormalizado) || ESTADO_RECHAZADA.equalsIgnoreCase(estadoNormalizado)) {
                    var activoResp = activoService.findById(activoId);
                    String codigoActual = activoResp != null && activoResp.estadoOperativo() != null
                            ? activoResp.estadoOperativo().codigo()
                            : null;
                    if (ESTADO_OPERATIVO_EN_VIAJE.equalsIgnoreCase(codigoActual)) {
                        activoService.cambiarEstadoOperativo(
                                activoId,
                                new CambiarEstadoOperativoRequest(
                                        null,
                                        ESTADO_OPERATIVO_OPERATIVO,
                                        "Retorno de viaje por solicitud vehicular " + (solicitud.getNumero() != null ? solicitud.getNumero() : solicitud.getId())));
                        log.info("Activo {} restaurado a estado operativo {} tras finalizar o rechazar solicitud {}",
                                activoId, ESTADO_OPERATIVO_OPERATIVO, solicitud.getId());
                    }
                }
            } catch (Exception e) {
                log.warn("No se pudo sincronizar el estado operativo del activo {}: {}", activoId, e.getMessage());
            }
        }
    }

    private boolean procesarDatosSalida(ViajeVehicular viaje, Map<String, Object> variables, String nuevoEstado) {
        if (!hasSalidaData(variables, nuevoEstado)) {
            return false;
        }

        boolean modificado = false;
        Long kmSalida = parseLongVariable(variables, "kilometrajeSalida");
        if (kmSalida != null) {
            viaje.setKilometrajeSalida(kmSalida);
            modificado = true;
        }

        LocalDateTime fechaSalida = parseDateVariable(variables, "fechaSalidaReal");
        if (fechaSalida != null) {
            viaje.setFechaSalidaReal(fechaSalida);
            modificado = true;
        }

        if (viaje.getFechaSalidaReal() == null && (modificado || ESTADO_EN_CURSO.equalsIgnoreCase(nuevoEstado))) {
            viaje.setFechaSalidaReal(LocalDateTime.now());
            modificado = true;
        }

        if (viaje.getEstado() == null || viaje.getEstado() == EstadoViajeVehicular.PROGRAMADO) {
            viaje.setEstado(EstadoViajeVehicular.EN_CURSO);
            modificado = true;
        }

        return modificado;
    }

    private boolean procesarDatosRetorno(ViajeVehicular viaje, Map<String, Object> variables, String nuevoEstado) {
        if (!hasRetornoData(variables, nuevoEstado)) {
            return false;
        }

        boolean modificado = false;
        Long kmRetorno = parseLongVariable(variables, "kilometrajeRetorno");
        if (kmRetorno != null) {
            viaje.setKilometrajeRetorno(kmRetorno);
            modificado = true;
        }

        LocalDateTime fechaRetorno = parseDateVariable(variables, "fechaRetornoReal");
        if (fechaRetorno != null) {
            viaje.setFechaRetornoReal(fechaRetorno);
            modificado = true;
        }

        validarKilometraje(viaje);

        if (viaje.getFechaRetornoReal() == null
                && (modificado || ESTADO_FINALIZADA.equalsIgnoreCase(nuevoEstado))) {
            viaje.setFechaRetornoReal(LocalDateTime.now());
            modificado = true;
        }

        if (isRetornoEstado(nuevoEstado)) {
            viaje.setEstado(EstadoViajeVehicular.FINALIZADO);
            modificado = true;
        }

        return modificado;
    }

    private void validarKilometraje(ViajeVehicular viaje) {
        if (viaje.getKilometrajeSalida() != null && viaje.getKilometrajeRetorno() != null
                && viaje.getKilometrajeRetorno() < viaje.getKilometrajeSalida()) {
            throw new ConflictException("KILOMETRAJE_RETORNO_INVALIDO",
                    "El kilometraje de retorno (" + viaje.getKilometrajeRetorno()
                            + " km) no puede ser menor al kilometraje de salida ("
                            + viaje.getKilometrajeSalida() + " km)");
        }
    }

    private boolean procesarObservacion(ViajeVehicular viaje, Map<String, Object> variables) {
        Object comObj = variables.get(COMENTARIO);
        if (comObj == null) {
            return false;
        }
        String com = comObj.toString().trim();
        if (!com.isBlank()) {
            viaje.setObservacion(StringUtils.normalize(com));
            return true;
        }
        return false;
    }

    private boolean isSalidaEstado(String estado) {
        return ESTADO_EN_CURSO.equalsIgnoreCase(estado)
                || ESTADO_EN_VIAJE.equalsIgnoreCase(estado)
                || ESTADO_RETORNO.equalsIgnoreCase(estado);
    }

    private boolean isRetornoEstado(String estado) {
        return ESTADO_FINALIZADA.equalsIgnoreCase(estado)
                || ESTADO_FINALIZADO.equalsIgnoreCase(estado);
    }

    private boolean hasSalidaData(Map<String, Object> variables, String nuevoEstado) {
        return variables.containsKey("kilometrajeSalida")
                || variables.containsKey("fechaSalidaReal")
                || isSalidaEstado(nuevoEstado);
    }

    private boolean hasRetornoData(Map<String, Object> variables, String nuevoEstado) {
        return variables.containsKey("kilometrajeRetorno")
                || variables.containsKey("fechaRetornoReal")
                || isRetornoEstado(nuevoEstado);
    }

    private Long parseLongVariable(Map<String, Object> variables, String key) {
        Object val = variables.get(key);
        if (val == null) {
            return null;
        }
        try {
            return Long.parseLong(val.toString().trim());
        } catch (Exception ignored) {
            return null;
        }
    }

    private Integer parseIntVariable(Map<String, Object> variables, String key) {
        Object val = variables.get(key);
        if (val == null) {
            return null;
        }
        try {
            return Integer.parseInt(val.toString().trim());
        } catch (Exception ignored) {
            return null;
        }
    }

    private LocalDateTime parseDateVariable(Map<String, Object> variables, String key) {
        Object val = variables.get(key);
        if (val == null) {
            return null;
        }
        try {
            return parseLocalDateTime(val.toString().trim());
        } catch (Exception ignored) {
            return null;
        }
    }

    private UUID parseUuidVariable(Map<String, Object> variables, String... keys) {
        for (String key : keys) {
            Object val = variables.get(key);
            if (val != null && !val.toString().isBlank()) {
                try {
                    return UUID.fromString(val.toString().trim());
                } catch (IllegalArgumentException ignored) {
                    // try next key
                }
            }
        }
        return null;
    }

    private LocalDateTime parseLocalDateTime(String str) {
        if (str == null || str.isBlank()) {
            return LocalDateTime.now();
        }
        try {
            return LocalDateTime.parse(str);
        } catch (Exception ignored) {
            // fallback
        }
        try {
            return OffsetDateTime.parse(str).toLocalDateTime();
        } catch (Exception ignored) {
            // fallback
        }
        try {
            return LocalDate.parse(str).atStartOfDay();
        } catch (Exception ignored) {
            return LocalDateTime.now();
        }
    }

    private void validarEstadoEditable(SolicitudVehicular actual) {
        String estadoActual = actual.getEstado() != null ? actual.getEstado().toUpperCase() : "";
        if (!ESTADO_BORRADOR.equals(estadoActual) && !ESTADO_OBSERVADO.equals(estadoActual)
                && !ESTADO_PENDIENTE.equals(estadoActual)) {
            throw new ConflictException(
                    "SOLICITUD_NO_EDITABLE",
                    "Solo se pueden editar solicitudes en estado BORRADOR u OBSERVADO");
        }
    }

    @Transactional
    public SolicitudVehicularResponse update(UUID id, SolicitudVehicularUpdate dto) {
        SolicitudVehicular actual = obtenerPorId(id);
        validarEstadoEditable(actual);

        String numero = StringUtils.normalize(dto.numero());
        if (numero != null && !numero.isBlank()) {
            validarNumeroUnicoParaActualizar(numero, id);
            actual.setNumero(numero);
        }

        TipoSolicitudVehicular tipo = obtenerTipoSolicitud(dto.tipoSolicitudVehicularId());
        Empleado solicitante = obtenerEmpleado(dto.solicitanteId());

        validarReglasTipoSolicitud(tipo, dto.fechaSalida(), dto.fechaRetornoEstimada(), dto.justificacion());

        UUID currentResponsable = actual.getResponsableAsignacionId();
        UUID currentConductor = actual.getConductorAsignadoId();

        mapper.updateDomain(dto, actual);
        actual.setMotivo(StringUtils.normalize(dto.motivo()));
        actual.setJustificacion(StringUtils.normalize(dto.justificacion()));
        actual.setDestino(StringUtils.normalize(dto.destino()));
        actual.setObservacion(StringUtils.normalize(dto.observacion()));
        if (dto.estado() != null && !dto.estado().isBlank()) {
            actual.setEstado(StringUtils.normalize(dto.estado()));
        }
        if (dto.processInstanceId() != null && !dto.processInstanceId().isBlank()) {
            actual.setProcessInstanceId(StringUtils.normalize(dto.processInstanceId()));
        }
        if (dto.responsableAsignacionId() != null) {
            actual.setResponsableAsignacionId(dto.responsableAsignacionId());
        } else if (actual.getResponsableAsignacionId() == null) {
            actual.setResponsableAsignacionId(currentResponsable);
        }
        if (dto.conductorAsignadoId() != null) {
            actual.setConductorAsignadoId(dto.conductorAsignadoId());
        } else if (actual.getConductorAsignadoId() == null) {
            actual.setConductorAsignadoId(currentConductor);
        }

        SolicitudVehicular actualizado = repository.save(actual);
        if (dto.estado() != null && !dto.estado().isBlank()) {
            sincronizarEstadoOperativoActivo(actualizado, actualizado.getEstado());
        }
        List<SolicitudVehicularAdjuntoResponse> adjuntos = adjuntoService.findBySolicitudVehicularId(id);
        return toResponse(actualizado, tipo, solicitante, adjuntos);
    }

    @Transactional
    public SolicitudVehicularResponse update(UUID id, SolicitudVehicularRequest dto) {
        SolicitudVehicular actual = obtenerPorId(id);
        validarEstadoEditable(actual);

        String numero = StringUtils.normalize(dto.numero());
        if (numero != null && !numero.isBlank()) {
            validarNumeroUnicoParaActualizar(numero, id);
            actual.setNumero(numero);
        }

        TipoSolicitudVehicular tipo = obtenerTipoSolicitud(dto.tipoSolicitudVehicularId());
        Empleado solicitante = obtenerEmpleado(dto.solicitanteId());

        validarReglasTipoSolicitud(tipo, dto.fechaSalida(), dto.fechaRetornoEstimada(), dto.justificacion());

        UUID currentResponsable = actual.getResponsableAsignacionId();
        UUID currentConductor = actual.getConductorAsignadoId();

        mapper.updateDomainFromRequest(dto, actual);
        actual.setMotivo(StringUtils.normalize(dto.motivo()));
        actual.setJustificacion(StringUtils.normalize(dto.justificacion()));
        actual.setDestino(StringUtils.normalize(dto.destino()));
        actual.setObservacion(StringUtils.normalize(dto.observacion()));
        if (dto.estado() != null && !dto.estado().isBlank()) {
            actual.setEstado(StringUtils.normalize(dto.estado()));
        }
        if (dto.processInstanceId() != null && !dto.processInstanceId().isBlank()) {
            actual.setProcessInstanceId(StringUtils.normalize(dto.processInstanceId()));
        }
        if (dto.responsableAsignacionId() != null) {
            actual.setResponsableAsignacionId(dto.responsableAsignacionId());
        } else if (actual.getResponsableAsignacionId() == null) {
            actual.setResponsableAsignacionId(currentResponsable);
        }
        if (dto.conductorAsignadoId() != null) {
            actual.setConductorAsignadoId(dto.conductorAsignadoId());
        } else if (actual.getConductorAsignadoId() == null) {
            actual.setConductorAsignadoId(currentConductor);
        }

        SolicitudVehicular actualizado = repository.save(actual);
        if (dto.estado() != null && !dto.estado().isBlank()) {
            sincronizarEstadoOperativoActivo(actualizado, actualizado.getEstado());
        }
        List<SolicitudVehicularAdjuntoResponse> adjuntos = adjuntoService.findBySolicitudVehicularId(id);
        return toResponse(actualizado, tipo, solicitante, adjuntos);
    }

    @Transactional
    public void delete(UUID id) {
        SolicitudVehicular actual = obtenerPorId(id);
        String estadoActual = actual.getEstado() != null ? actual.getEstado().toUpperCase() : "";
        if (!ESTADO_BORRADOR.equals(estadoActual) && !ESTADO_PENDIENTE.equals(estadoActual)) {
            throw new ConflictException(
                    "SOLICITUD_NO_ELIMINABLE",
                    "Solo se pueden eliminar solicitudes en estado BORRADOR");
        }

        adjuntoService.deleteBySolicitudVehicularId(id);
        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<SolicitudVehicularResponse> listarParaCalendario(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        List<SolicitudVehicular> lista = repository.findParaCalendario(fechaInicio, fechaFin);
        return toResponseList(lista);
    }

    private PageResponse<SolicitudVehicularResponse> toPageResponse(Page<SolicitudVehicular> page) {
        if (page.isEmpty()) {
            return PageResponse.of(List.of(), page);
        }
        return PageResponse.of(toResponseList(page.getContent()), page);
    }

    private List<SolicitudVehicularResponse> toResponseList(List<SolicitudVehicular> content) {
        if (content == null || content.isEmpty()) {
            return List.of();
        }

        Set<UUID> tipoIds = content.stream()
                .map(SolicitudVehicular::getTipoSolicitudVehicularId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> solicitanteIds = content.stream()
                .map(SolicitudVehicular::getSolicitanteId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> responsableIds = content.stream()
                .map(SolicitudVehicular::getResponsableAsignacionId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> conductorIds = content.stream()
                .map(SolicitudVehicular::getConductorAsignadoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, SolicitudVehicularTipoSolicitudInfo> tipoMap = tipoIds.isEmpty()
                ? Map.of()
                : tipoSolicitudVehicularRepository.findAllById(tipoIds).stream()
                        .collect(Collectors.toMap(
                                TipoSolicitudVehicular::getId,
                                t -> new SolicitudVehicularTipoSolicitudInfo(
                                        t.getId(),
                                        t.getCodigo(),
                                        t.getNombre(),
                                        t.getDiasAnticipacion(),
                                        t.getRequiereRespaldo(),
                                        t.getRequiereJustificacion()),
                                (a, b) -> a));

        Set<UUID> todosEmpleadoIds = new HashSet<>(solicitanteIds);
        todosEmpleadoIds.addAll(responsableIds);

        Map<UUID, Conductor> conductorMap = conductorIds.isEmpty()
                ? Map.of()
                : conductorRepository.findAllById(conductorIds).stream()
                        .collect(Collectors.toMap(Conductor::getId, c -> c, (a, b) -> a));

        Set<UUID> conductorEmpleadoIds = conductorMap.values().stream()
                .map(Conductor::getEmpleadoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        todosEmpleadoIds.addAll(conductorEmpleadoIds);

        Map<UUID, VEmpleadoEntity> vempleadoMap = todosEmpleadoIds.isEmpty()
                ? Map.of()
                : springVEmpleadoRepository.findAllById(todosEmpleadoIds).stream()
                        .collect(Collectors.toMap(VEmpleadoEntity::getEmpleadoId, ve -> ve, (a, b) -> a));

        return content.stream()
                .map(domain -> {
                    SolicitudVehicularTipoSolicitudInfo tipoInfo = domain.getTipoSolicitudVehicularId() != null
                            ? tipoMap.get(domain.getTipoSolicitudVehicularId())
                            : null;

                    VEmpleadoEntity solVe = domain.getSolicitanteId() != null
                            ? vempleadoMap.get(domain.getSolicitanteId())
                            : null;
                    SolicitudVehicularSolicitanteInfo solicitanteInfo = solVe != null
                            ? new SolicitudVehicularSolicitanteInfo(
                                    solVe.getEmpleadoId(),
                                    solVe.getCodigo(),
                                    solVe.getNombreCompleto(),
                                    solVe.getCargo(),
                                    solVe.getArea())
                            : null;

                    VEmpleadoEntity respVe = domain.getResponsableAsignacionId() != null
                            ? vempleadoMap.get(domain.getResponsableAsignacionId())
                            : null;
                    SolicitudVehicularResponsableInfo responsableInfo = respVe != null
                            ? new SolicitudVehicularResponsableInfo(
                                    respVe.getEmpleadoId(),
                                    respVe.getCodigo(),
                                    respVe.getNombreCompleto(),
                                    respVe.getCargo(),
                                    respVe.getArea())
                            : null;

                    SolicitudVehicularConductorInfo conductorInfo = null;
                    if (domain.getConductorAsignadoId() != null) {
                        Conductor cond = conductorMap.get(domain.getConductorAsignadoId());
                        if (cond != null) {
                            VEmpleadoEntity condVe = cond.getEmpleadoId() != null
                                    ? vempleadoMap.get(cond.getEmpleadoId())
                                    : null;
                            conductorInfo = new SolicitudVehicularConductorInfo(
                                    cond.getId(),
                                    cond.getEmpleadoId(),
                                    condVe != null ? condVe.getNombreCompleto() : null,
                                    cond.getNumeroLicencia(),
                                    cond.getCategoriaLicencia(),
                                    cond.getUrlImagen());
                        } else {
                            VEmpleadoEntity condVe = vempleadoMap.get(domain.getConductorAsignadoId());
                            if (condVe != null) {
                                conductorInfo = new SolicitudVehicularConductorInfo(
                                        domain.getConductorAsignadoId(),
                                        condVe.getEmpleadoId(),
                                        condVe.getNombreCompleto(),
                                        null,
                                        null,
                                        null);
                            }
                        }
                    }

                    return mapper.toResponse(domain, tipoInfo, solicitanteInfo, responsableInfo, conductorInfo, null);
                })
                .toList();
    }

    private SolicitudVehicularResponse toResponse(SolicitudVehicular domain,
            List<SolicitudVehicularAdjuntoResponse> adjuntos) {
        SolicitudVehicularTipoSolicitudInfo tipoInfo = domain.getTipoSolicitudVehicularId() != null
                ? obtenerTipoInfo(domain.getTipoSolicitudVehicularId())
                : null;
        SolicitudVehicularSolicitanteInfo solicitanteInfo = domain.getSolicitanteId() != null
                ? obtenerSolicitanteInfo(domain.getSolicitanteId())
                : null;

        UUID respId = resolverResponsableId(domain);
        SolicitudVehicularResponsableInfo responsableInfo = respId != null
                ? obtenerResponsableInfo(respId)
                : null;

        UUID condId = resolverConductorId(domain);
        SolicitudVehicularConductorInfo conductorInfo = condId != null
                ? obtenerConductorInfo(condId)
                : null;
        return mapper.toResponse(domain, tipoInfo, solicitanteInfo, responsableInfo, conductorInfo, adjuntos);
    }

    private SolicitudVehicularResponse toResponse(
            SolicitudVehicular domain,
            TipoSolicitudVehicular tipo,
            Empleado solicitante,
            List<SolicitudVehicularAdjuntoResponse> adjuntos) {
        SolicitudVehicularTipoSolicitudInfo tipoInfo = tipo != null
                ? mapper.toTipoInfo(tipo)
                : (domain.getTipoSolicitudVehicularId() != null ? obtenerTipoInfo(domain.getTipoSolicitudVehicularId())
                        : null);

        SolicitudVehicularSolicitanteInfo solicitanteInfo = domain.getSolicitanteId() != null
                ? obtenerSolicitanteInfo(domain.getSolicitanteId())
                : (solicitante != null ? mapper.toSolicitanteInfo(solicitante) : null);

        UUID respId = resolverResponsableId(domain);
        SolicitudVehicularResponsableInfo responsableInfo = respId != null
                ? obtenerResponsableInfo(respId)
                : null;

        UUID condId = resolverConductorId(domain);
        SolicitudVehicularConductorInfo conductorInfo = condId != null
                ? obtenerConductorInfo(condId)
                : null;

        return mapper.toResponse(domain, tipoInfo, solicitanteInfo, responsableInfo, conductorInfo, adjuntos);
    }

    private void resolverVariablesProceso(SolicitudVehicular domain) {
        if (domain.getResponsableAsignacionId() != null && domain.getConductorAsignadoId() != null) {
            return;
        }
        if (domain.getProcessInstanceId() == null || domain.getProcessInstanceId().isBlank()) {
            return;
        }

        try {
            var vars = flowableClient.obtenerVariablesProceso(domain.getProcessInstanceId());
            if (vars == null || vars.isEmpty()) {
                return;
            }

            boolean modificado = false;
            for (var varMap : vars) {
                Object name = varMap.get("name");
                Object val = varMap.get("value");
                if (val == null || val.toString().isBlank()) {
                    continue;
                }

                if (domain.getResponsableAsignacionId() == null
                        && (RESPONSABLE_ASIGNACION_ID.equals(name) || APROBADOR_ID.equals(name))) {
                    try {
                        domain.setResponsableAsignacionId(UUID.fromString(val.toString().trim()));
                        modificado = true;
                    } catch (Exception e) {
                        log.debug("No se pudo parsear responsableAsignacionId/aprobadorId '{}': {}", val, e.getMessage());
                    }
                }

                if (domain.getConductorAsignadoId() == null
                        && (CONDUCTOR_ASIGNADO_ID.equals(name) || "conductorId".equals(name))) {
                    try {
                        domain.setConductorAsignadoId(UUID.fromString(val.toString().trim()));
                        modificado = true;
                    } catch (Exception e) {
                        log.debug("No se pudo parsear conductorAsignadoId '{}': {}", val, e.getMessage());
                    }
                }
            }

            if (modificado) {
                repository.save(domain);
            }
        } catch (Exception e) {
            log.warn("Error al consultar variables de proceso en Flowable para instancia {}: {}",
                    domain.getProcessInstanceId(), e.getMessage());
        }
    }

    private UUID resolverResponsableId(SolicitudVehicular domain) {
        if (domain.getResponsableAsignacionId() == null) {
            resolverVariablesProceso(domain);
        }
        return domain.getResponsableAsignacionId();
    }

    private UUID resolverConductorId(SolicitudVehicular domain) {
        if (domain.getConductorAsignadoId() == null) {
            resolverVariablesProceso(domain);
        }
        return domain.getConductorAsignadoId();
    }

    private SolicitudVehicularTipoSolicitudInfo obtenerTipoInfo(UUID tipoId) {
        return tipoSolicitudVehicularRepository.findById(tipoId)
                .map(mapper::toTipoInfo)
                .orElse(null);
    }

    private record EmpleadoDetalle(
            UUID id,
            String codigo,
            String nombreCompleto,
            String cargo,
            String area) {}

    private EmpleadoDetalle obtenerEmpleadoDetalle(UUID empleadoId) {
        if (empleadoId == null) {
            return null;
        }
        return springVEmpleadoRepository.findById(empleadoId)
                .map(ve -> new EmpleadoDetalle(
                        ve.getEmpleadoId(),
                        ve.getCodigo(),
                        ve.getNombreCompleto(),
                        ve.getCargo(),
                        ve.getArea()))
                .orElseGet(() -> empleadoRepository.findById(empleadoId)
                        .map(emp -> new EmpleadoDetalle(
                                emp.getId(),
                                emp.getCodigo(),
                                emp.getNombreCompleto(),
                                emp.getCargo(),
                                emp.getArea()))
                        .orElse(null));
    }

    private SolicitudVehicularSolicitanteInfo obtenerSolicitanteInfo(UUID solicitanteId) {
        EmpleadoDetalle detalle = obtenerEmpleadoDetalle(solicitanteId);
        return detalle != null
                ? new SolicitudVehicularSolicitanteInfo(
                        detalle.id(),
                        detalle.codigo(),
                        detalle.nombreCompleto(),
                        detalle.cargo(),
                        detalle.area())
                : null;
    }

    private SolicitudVehicularResponsableInfo obtenerResponsableInfo(UUID responsableId) {
        EmpleadoDetalle detalle = obtenerEmpleadoDetalle(responsableId);
        return detalle != null
                ? new SolicitudVehicularResponsableInfo(
                        detalle.id(),
                        detalle.codigo(),
                        detalle.nombreCompleto(),
                        detalle.cargo(),
                        detalle.area())
                : null;
    }

    private SolicitudVehicularConductorInfo obtenerConductorInfo(UUID conductorId) {
        if (conductorId == null) {
            return null;
        }
        return conductorRepository.findById(conductorId)
                .map(c -> {
                    String nombre = null;
                    if (c.getEmpleadoId() != null) {
                        EmpleadoDetalle emp = obtenerEmpleadoDetalle(c.getEmpleadoId());
                        if (emp != null) {
                            nombre = emp.nombreCompleto();
                        }
                    }
                    return new SolicitudVehicularConductorInfo(
                            c.getId(),
                            c.getEmpleadoId(),
                            nombre,
                            c.getNumeroLicencia(),
                            c.getCategoriaLicencia(),
                            c.getUrlImagen());
                })
                .orElseGet(() -> {
                    EmpleadoDetalle emp = obtenerEmpleadoDetalle(conductorId);
                    return emp != null
                            ? new SolicitudVehicularConductorInfo(
                                    conductorId,
                                    emp.id(),
                                    emp.nombreCompleto(),
                                    null,
                                    null,
                                    null)
                            : null;
                });
    }

    private SolicitudVehicular obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud vehicular", id));
    }

    private TipoSolicitudVehicular obtenerTipoSolicitud(UUID tipoId) {
        return tipoSolicitudVehicularRepository.findById(tipoId)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de solicitud vehicular", tipoId));
    }

    private Empleado obtenerEmpleado(UUID empleadoId) {
        return empleadoRepository.findById(empleadoId)
                .orElseThrow(() -> new ResourceNotFoundException("Empleado", empleadoId));
    }

    private void validarNumeroUnicoParaCrear(String numero) {
        if (numero != null && repository.existsByNumeroIgnoreCase(numero)) {
            throw new ConflictException(
                    "SOLICITUD_VEHICULAR_NUMERO_ALREADY_EXISTS",
                    "Ya existe una solicitud vehicular con el número '%s'".formatted(numero));
        }
    }

    private void validarNumeroUnicoParaActualizar(String numero, UUID currentId) {
        if (numero != null && repository.existsByNumeroIgnoreCaseAndIdNot(numero, currentId)) {
            throw new ConflictException(
                    "SOLICITUD_VEHICULAR_NUMERO_ALREADY_EXISTS",
                    "Ya existe otra solicitud vehicular con el número '%s'".formatted(numero));
        }
    }

    private void validarReglasTipoSolicitud(
            TipoSolicitudVehicular tipo,
            LocalDateTime fechaSalida,
            LocalDateTime fechaRetornoEstimada,
            String justificacion) {
        if (fechaSalida == null) {
            throw new ConflictException("FECHA_SALIDA_REQUERIDA", "La fecha de salida es obligatoria");
        }
        if (fechaRetornoEstimada == null) {
            throw new ConflictException("FECHA_RETORNO_REQUERIDA", "La fecha de retorno estimada es obligatoria");
        }
        if (fechaRetornoEstimada.isBefore(fechaSalida)) {
            throw new ConflictException(
                    "FECHAS_INVALIDAS",
                    "La fecha de retorno estimada no puede ser anterior a la fecha de salida");
        }

        // Validación de días de anticipación
        if (tipo != null && tipo.getDiasAnticipacion() != null && tipo.getDiasAnticipacion() > 0) {
            LocalDate hoy = LocalDate.now();
            LocalDate fechaMinima = hoy.plusDays(tipo.getDiasAnticipacion());
            if (fechaSalida.toLocalDate().isBefore(fechaMinima)) {
                throw new ConflictException(
                        "SOLICITUD_ANTICIPACION_INSUFICIENTE",
                        "El tipo de solicitud '%s' requiere al menos %d día(s) de anticipación. La fecha mínima de salida permitida es %s."
                                .formatted(tipo.getNombre(), tipo.getDiasAnticipacion(), fechaMinima));
            }
        }

        // Validación de justificación obligatoria
        if (tipo != null && Boolean.TRUE.equals(tipo.getRequiereJustificacion())) {
            if (justificacion == null || justificacion.trim().isBlank()) {
                throw new ConflictException(
                        "SOLICITUD_JUSTIFICACION_REQUERIDA",
                        "La justificación técnica/operativa es obligatoria para el tipo de solicitud '%s'"
                                .formatted(tipo.getNombre()));
            }
        }
    }
}
