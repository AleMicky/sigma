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
import com.endecorani.sigma_api.modules.parametros.application.service.CorrelativoService;
import com.endecorani.sigma_api.modules.parametros.domain.constant.CorrelativoCodigo;
import com.endecorani.sigma_api.modules.workflow.application.dto.request.CompleteWorkflowTaskRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskActionsResponse;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowApplicationService;
import com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.FlowableClient;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SolicitudVehicularService {

    private static final String ESTADO_BORRADOR = "BORRADOR";
    private static final String ESTADO_SOLICITADO = "SOLICITADO";
    private static final String WORKFLOW_CODIGO = "SOLICITUD_VEHICULAR";

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "numero",
            "tipoSolicitudVehicularId",
            "solicitanteId",
            "responsableAsignacionId",
            "conductorAsignadoId",
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

    @Transactional(readOnly = true)
    public PageResponse<SolicitudVehicularResponse> listar(String search, PageRequestDto pageRequest) {
        return listar(search, null, null, null, null, pageRequest);
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudVehicularResponse> listar(
            String search,
            String estado,
            UUID tipoSolicitudVehicularId,
            UUID solicitanteId,
            UUID conductorAsignadoId,
            PageRequestDto pageRequest) {
        String normalizedSearch = StringUtils.normalize(search);
        String normalizedEstado = StringUtils.normalize(estado);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<SolicitudVehicular> resultado;

        if ((normalizedSearch == null || normalizedSearch.isBlank()) &&
                (normalizedEstado == null || normalizedEstado.isBlank()) &&
                tipoSolicitudVehicularId == null &&
                solicitanteId == null &&
                conductorAsignadoId == null) {
            resultado = repository.findAll(pageable);
        } else {
            resultado = repository.searchWithFilters(
                    normalizedSearch,
                    normalizedEstado,
                    tipoSolicitudVehicularId,
                    solicitanteId,
                    conductorAsignadoId,
                    pageable);
        }

        return toPageResponse(resultado);
    }

    @Transactional(readOnly = true)
    public SolicitudVehicularResponse findById(UUID id) {
        SolicitudVehicular solicitud = obtenerPorId(id);
        List<SolicitudVehicularAdjuntoResponse> adjuntos = adjuntoService.findBySolicitudVehicularId(id);
        return toResponse(solicitud, adjuntos);
    }

    @Transactional
    public SolicitudVehicularResponse create(SolicitudVehicularRequest dto) {
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
            variables.put("solicitanteId", guardado.getSolicitanteId().toString());
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
    public SolicitudVehicularResponse createWithFiles(SolicitudVehicularRequest dto, List<MultipartFile> files) {
        SolicitudVehicularResponse response = create(dto);

        if (files != null && !files.isEmpty()) {
            adjuntoService.uploadMultipleFiles(response.id(), files);
            return findById(response.id());
        }

        return response;
    }

    @Transactional
    public SolicitudVehicularResponse enviar(UUID id, EnviarSolicitudVehicularRequest request) {
        SolicitudVehicular solicitud = obtenerPorId(id);

        String estadoActual = solicitud.getEstado() != null ? solicitud.getEstado().toUpperCase() : "";
        if (!"BORRADOR".equals(estadoActual) && !"PENDIENTE".equals(estadoActual)) {
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
        variables.put("solicitanteId", solicitud.getSolicitanteId().toString());
        variables.put("aprobadorId", aprobadorId.toString());
        variables.put("responsableAsignacionId", aprobadorId.toString());
        if (request.comentario() != null && !request.comentario().isBlank()) {
            variables.put("comentario", request.comentario().trim());
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
        return findById(actualizado.getId());
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

        if (!effectiveVariables.containsKey("conductorAsignadoId") && solicitud.getConductorAsignadoId() != null) {
            effectiveVariables.put("conductorAsignadoId", solicitud.getConductorAsignadoId().toString());
        }
        if (!effectiveVariables.containsKey("responsableAsignacionId")
                && solicitud.getResponsableAsignacionId() != null) {
            effectiveVariables.put("responsableAsignacionId", solicitud.getResponsableAsignacionId().toString());
        }

        if (effectiveVariables.containsKey("responsableAsignacionId")
                && !effectiveVariables.containsKey("aprobadorId")) {
            effectiveVariables.put("aprobadorId", effectiveVariables.get("responsableAsignacionId"));
        } else if (effectiveVariables.containsKey("aprobadorId")
                && !effectiveVariables.containsKey("responsableAsignacionId")) {
            effectiveVariables.put("responsableAsignacionId", effectiveVariables.get("aprobadorId"));
        }

        CompleteWorkflowTaskRequest effectiveRequest = new CompleteWorkflowTaskRequest(effectiveVariables);

        WorkflowTaskActionsResponse resultado = workflowApplicationService.completarTarea(
                solicitud.getProcessInstanceId(),
                effectiveRequest);

        String accionEnviada = effectiveVariables.get("accion") != null
                ? effectiveVariables.get("accion").toString().trim().toUpperCase()
                : "";

        String nuevoEstado = resultado.status() != null ? resultado.status().trim().toUpperCase() : null;
        if ("RECHAZAR".equals(accionEnviada)) {
            solicitud.setEstado("RECHAZADA");
        } else if (nuevoEstado != null) {
            solicitud.setEstado(nuevoEstado);
        } else {
            solicitud.setEstado("FINALIZADA");
        }

        if (effectiveVariables.containsKey("comentario") && effectiveVariables.get("comentario") != null) {
            String com = effectiveVariables.get("comentario").toString().trim();
            if (!com.isBlank()) {
                solicitud.setObservacion(StringUtils.normalize(com));
            }
        }

        if (effectiveVariables.containsKey("responsableAsignacionId")) {
            Object val = effectiveVariables.get("responsableAsignacionId");
            if (val != null && !val.toString().isBlank()) {
                try {
                    solicitud.setResponsableAsignacionId(UUID.fromString(val.toString().trim()));
                } catch (IllegalArgumentException ignored) {
                }
            }
        }
        if (effectiveVariables.containsKey("conductorAsignadoId")) {
            Object val = effectiveVariables.get("conductorAsignadoId");
            if (val != null && !val.toString().isBlank()) {
                try {
                    solicitud.setConductorAsignadoId(UUID.fromString(val.toString().trim()));
                } catch (IllegalArgumentException ignored) {
                }
            }
        } else if (effectiveVariables.containsKey("conductorId")) {
            Object val = effectiveVariables.get("conductorId");
            if (val != null && !val.toString().isBlank()) {
                try {
                    solicitud.setConductorAsignadoId(UUID.fromString(val.toString().trim()));
                } catch (IllegalArgumentException ignored) {
                }
            }
        }

        SolicitudVehicular guardado = repository.save(solicitud);

        // Sincronizar registro de viaje vehicular (asignacionVehicularId, salida, retorno)
        sincronizarViajeVehicular(guardado, effectiveVariables, nuevoEstado);

        return findById(guardado.getId());
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

        AsignacionVehicular asignacion = asignaciones.get(0);
        UUID asignacionId = asignacion.getId();

        ViajeVehicular viaje = viajeVehicularRepository.findByAsignacionVehicularId(asignacionId)
                .orElseGet(() -> ViajeVehicular.builder()
                        .asignacionVehicularId(asignacionId)
                        .estado(EstadoViajeVehicular.PROGRAMADO)
                        .build());

        boolean modificado = false;

        // 1. Datos de salida (Registrar Salida / Estado EN_CURSO o RETORNO)
        boolean hasSalidaData = variables.containsKey("kilometrajeSalida")
                || variables.containsKey("fechaSalidaReal")
                || variables.containsKey("nivelCombustibleSalida")
                || "EN_CURSO".equalsIgnoreCase(nuevoEstado)
                || "EN_VIAJE".equalsIgnoreCase(nuevoEstado)
                || "RETORNO".equalsIgnoreCase(nuevoEstado);

        if (hasSalidaData) {
            if (variables.containsKey("kilometrajeSalida") && variables.get("kilometrajeSalida") != null) {
                try {
                    viaje.setKilometrajeSalida(
                            Long.parseLong(variables.get("kilometrajeSalida").toString().trim()));
                    modificado = true;
                } catch (Exception ignored) {
                }
            }
            if (variables.containsKey("nivelCombustibleSalida") && variables.get("nivelCombustibleSalida") != null) {
                try {
                    viaje.setNivelCombustibleSalida(
                            Integer.parseInt(variables.get("nivelCombustibleSalida").toString().trim()));
                    modificado = true;
                } catch (Exception ignored) {
                }
            }
            if (variables.containsKey("fechaSalidaReal") && variables.get("fechaSalidaReal") != null) {
                try {
                    viaje.setFechaSalidaReal(
                            parseLocalDateTime(variables.get("fechaSalidaReal").toString().trim()));
                    modificado = true;
                } catch (Exception ignored) {
                }
            }
            if (viaje.getFechaSalidaReal() == null && (modificado || "EN_CURSO".equalsIgnoreCase(nuevoEstado))) {
                viaje.setFechaSalidaReal(LocalDateTime.now());
                modificado = true;
            }
            if (viaje.getEstado() == null || viaje.getEstado() == EstadoViajeVehicular.PROGRAMADO) {
                viaje.setEstado(EstadoViajeVehicular.EN_CURSO);
                modificado = true;
            }
        }

        // 2. Datos de retorno (Registrar Retorno / Estado FINALIZADA)
        boolean hasRetornoData = variables.containsKey("kilometrajeRetorno")
                || variables.containsKey("fechaRetornoReal")
                || variables.containsKey("nivelCombustibleRetorno")
                || "FINALIZADA".equalsIgnoreCase(nuevoEstado)
                || "FINALIZADO".equalsIgnoreCase(nuevoEstado);

        if (hasRetornoData) {
            if (variables.containsKey("kilometrajeRetorno") && variables.get("kilometrajeRetorno") != null) {
                try {
                    viaje.setKilometrajeRetorno(
                            Long.parseLong(variables.get("kilometrajeRetorno").toString().trim()));
                    modificado = true;
                } catch (Exception ignored) {
                }
            }
            if (variables.containsKey("nivelCombustibleRetorno") && variables.get("nivelCombustibleRetorno") != null) {
                try {
                    viaje.setNivelCombustibleRetorno(
                            Integer.parseInt(variables.get("nivelCombustibleRetorno").toString().trim()));
                    modificado = true;
                } catch (Exception ignored) {
                }
            }
            if (variables.containsKey("fechaRetornoReal") && variables.get("fechaRetornoReal") != null) {
                try {
                    viaje.setFechaRetornoReal(
                            parseLocalDateTime(variables.get("fechaRetornoReal").toString().trim()));
                    modificado = true;
                } catch (Exception ignored) {
                }
            }
            if (viaje.getKilometrajeSalida() != null && viaje.getKilometrajeRetorno() != null
                    && viaje.getKilometrajeRetorno() < viaje.getKilometrajeSalida()) {
                throw new ConflictException("KILOMETRAJE_RETORNO_INVALIDO",
                        "El kilometraje de retorno (" + viaje.getKilometrajeRetorno()
                                + " km) no puede ser menor al kilometraje de salida ("
                                + viaje.getKilometrajeSalida() + " km)");
            }
            if (viaje.getFechaRetornoReal() == null && (modificado || "FINALIZADA".equalsIgnoreCase(nuevoEstado))) {
                viaje.setFechaRetornoReal(LocalDateTime.now());
                modificado = true;
            }
            if ("FINALIZADA".equalsIgnoreCase(nuevoEstado) || "FINALIZADO".equalsIgnoreCase(nuevoEstado)) {
                viaje.setEstado(EstadoViajeVehicular.FINALIZADO);
                modificado = true;
            }
        }

        // 3. Comentarios / Observaciones
        if (variables.containsKey("comentario") && variables.get("comentario") != null) {
            String com = variables.get("comentario").toString().trim();
            if (!com.isBlank()) {
                viaje.setObservacion(StringUtils.normalize(com));
                modificado = true;
            }
        }

        if (modificado) {
            viajeVehicularRepository.save(viaje);
        }
    }

    private LocalDateTime parseLocalDateTime(String str) {
        if (str == null || str.isBlank()) {
            return LocalDateTime.now();
        }
        try {
            return LocalDateTime.parse(str);
        } catch (Exception e1) {
            try {
                return LocalDateTime.parse(str, DateTimeFormatter.ISO_DATE_TIME);
            } catch (Exception e2) {
                try {
                    return LocalDate.parse(str).atStartOfDay();
                } catch (Exception e3) {
                    return LocalDateTime.now();
                }
            }
        }
    }

    @Transactional
    public SolicitudVehicularResponse update(UUID id, SolicitudVehicularUpdate dto) {
        SolicitudVehicular actual = obtenerPorId(id);

        String estadoActual = actual.getEstado() != null ? actual.getEstado().toUpperCase() : "";
        if (!"BORRADOR".equals(estadoActual) && !"OBSERVADO".equals(estadoActual)
                && !"PENDIENTE".equals(estadoActual)) {
            throw new ConflictException(
                    "SOLICITUD_NO_EDITABLE",
                    "Solo se pueden editar solicitudes en estado BORRADOR u OBSERVADO");
        }

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
        List<SolicitudVehicularAdjuntoResponse> adjuntos = adjuntoService.findBySolicitudVehicularId(id);
        return toResponse(actualizado, tipo, solicitante, adjuntos);
    }

    @Transactional
    public SolicitudVehicularResponse update(UUID id, SolicitudVehicularRequest dto) {
        SolicitudVehicular actual = obtenerPorId(id);

        String estadoActual = actual.getEstado() != null ? actual.getEstado().toUpperCase() : "";
        if (!"BORRADOR".equals(estadoActual) && !"OBSERVADO".equals(estadoActual)
                && !"PENDIENTE".equals(estadoActual)) {
            throw new ConflictException(
                    "SOLICITUD_NO_EDITABLE",
                    "Solo se pueden editar solicitudes en estado BORRADOR u OBSERVADO");
        }

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
        List<SolicitudVehicularAdjuntoResponse> adjuntos = adjuntoService.findBySolicitudVehicularId(id);
        return toResponse(actualizado, tipo, solicitante, adjuntos);
    }

    @Transactional
    public void delete(UUID id) {
        SolicitudVehicular actual = obtenerPorId(id);
        String estadoActual = actual.getEstado() != null ? actual.getEstado().toUpperCase() : "";
        if (!"BORRADOR".equals(estadoActual) && !"PENDIENTE".equals(estadoActual)) {
            throw new ConflictException(
                    "SOLICITUD_NO_ELIMINABLE",
                    "Solo se pueden eliminar solicitudes en estado BORRADOR");
        }

        adjuntoService.deleteBySolicitudVehicularId(id);
        repository.deleteById(id);
    }

    private PageResponse<SolicitudVehicularResponse> toPageResponse(Page<SolicitudVehicular> page) {
        if (page.isEmpty()) {
            return PageResponse.of(List.of(), page);
        }

        List<SolicitudVehicular> content = page.getContent();
        for (SolicitudVehicular item : content) {
            resolverResponsableId(item);
            resolverConductorId(item);
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

        Map<UUID, SolicitudVehicularTipoSolicitudInfo> tipoMap = new HashMap<>();
        for (UUID tipoId : tipoIds) {
            tipoSolicitudVehicularRepository.findById(tipoId)
                    .ifPresent(t -> tipoMap.put(tipoId, new SolicitudVehicularTipoSolicitudInfo(
                            t.getId(),
                            t.getCodigo(),
                            t.getNombre(),
                            t.getDiasAnticipacion(),
                            t.getRequiereRespaldo(),
                            t.getRequiereJustificacion())));
        }

        Set<UUID> todosEmpleadoIds = new HashSet<>(solicitanteIds);
        todosEmpleadoIds.addAll(responsableIds);

        Map<UUID, Conductor> conductorMap = new HashMap<>();
        Set<UUID> conductorEmpleadoIds = new HashSet<>();
        for (UUID cId : conductorIds) {
            conductorRepository.findById(cId).ifPresent(c -> {
                conductorMap.put(cId, c);
                if (c.getEmpleadoId() != null) {
                    conductorEmpleadoIds.add(c.getEmpleadoId());
                }
            });
        }
        todosEmpleadoIds.addAll(conductorEmpleadoIds);

        Map<UUID, VEmpleadoEntity> vempleadoMap = todosEmpleadoIds.isEmpty()
                ? Map.of()
                : springVEmpleadoRepository.findAllById(todosEmpleadoIds).stream()
                        .collect(Collectors.toMap(VEmpleadoEntity::getEmpleadoId, ve -> ve, (a, b) -> a));

        List<SolicitudVehicularResponse> responses = content.stream()
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
                                    cond.getCategoriaLicencia());
                        } else {
                            VEmpleadoEntity condVe = vempleadoMap.get(domain.getConductorAsignadoId());
                            if (condVe != null) {
                                conductorInfo = new SolicitudVehicularConductorInfo(
                                        domain.getConductorAsignadoId(),
                                        condVe.getEmpleadoId(),
                                        condVe.getNombreCompleto(),
                                        null,
                                        null);
                            }
                        }
                    }

                    return mapper.toResponse(domain, tipoInfo, solicitanteInfo, responsableInfo, conductorInfo, null);
                })
                .toList();

        return PageResponse.of(responses, page);
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

    private UUID resolverResponsableId(SolicitudVehicular domain) {
        if (domain.getResponsableAsignacionId() != null) {
            return domain.getResponsableAsignacionId();
        }
        if (domain.getProcessInstanceId() != null && !domain.getProcessInstanceId().isBlank()) {
            try {
                var vars = flowableClient.obtenerVariablesProceso(domain.getProcessInstanceId());
                if (vars != null) {
                    for (var varMap : vars) {
                        Object name = varMap.get("name");
                        Object val = varMap.get("value");
                        if (("responsableAsignacionId".equals(name) || "aprobadorId".equals(name)) && val != null) {
                            try {
                                UUID resolved = UUID.fromString(val.toString().trim());
                                domain.setResponsableAsignacionId(resolved);
                                repository.save(domain);
                                return resolved;
                            } catch (Exception ignored) {
                            }
                        }
                    }
                }
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    private UUID resolverConductorId(SolicitudVehicular domain) {
        if (domain.getConductorAsignadoId() != null) {
            return domain.getConductorAsignadoId();
        }
        if (domain.getProcessInstanceId() != null && !domain.getProcessInstanceId().isBlank()) {
            try {
                var vars = flowableClient.obtenerVariablesProceso(domain.getProcessInstanceId());
                if (vars != null) {
                    for (var varMap : vars) {
                        Object name = varMap.get("name");
                        Object val = varMap.get("value");
                        if (("conductorAsignadoId".equals(name) || "conductorId".equals(name)) && val != null) {
                            try {
                                UUID resolved = UUID.fromString(val.toString().trim());
                                domain.setConductorAsignadoId(resolved);
                                repository.save(domain);
                                return resolved;
                            } catch (Exception ignored) {
                            }
                        }
                    }
                }
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    private SolicitudVehicularTipoSolicitudInfo obtenerTipoInfo(UUID tipoId) {
        return tipoSolicitudVehicularRepository.findById(tipoId)
                .map(mapper::toTipoInfo)
                .orElse(null);
    }

    private SolicitudVehicularSolicitanteInfo obtenerSolicitanteInfo(UUID solicitanteId) {
        if (solicitanteId == null) {
            return null;
        }
        return springVEmpleadoRepository.findById(solicitanteId)
                .map(ve -> new SolicitudVehicularSolicitanteInfo(
                        ve.getEmpleadoId(),
                        ve.getCodigo(),
                        ve.getNombreCompleto(),
                        ve.getCargo(),
                        ve.getArea()))
                .orElseGet(() -> empleadoRepository.findById(solicitanteId)
                        .map(emp -> new SolicitudVehicularSolicitanteInfo(
                                emp.getId(),
                                emp.getCodigo(),
                                emp.getNombreCompleto(),
                                emp.getCargo(),
                                emp.getArea()))
                        .orElse(null));
    }

    private SolicitudVehicularResponsableInfo obtenerResponsableInfo(UUID responsableId) {
        if (responsableId == null) {
            return null;
        }
        return springVEmpleadoRepository.findById(responsableId)
                .map(ve -> new SolicitudVehicularResponsableInfo(
                        ve.getEmpleadoId(),
                        ve.getCodigo(),
                        ve.getNombreCompleto(),
                        ve.getCargo(),
                        ve.getArea()))
                .orElseGet(() -> empleadoRepository.findById(responsableId)
                        .map(emp -> new SolicitudVehicularResponsableInfo(
                                emp.getId(),
                                emp.getCodigo(),
                                emp.getNombreCompleto(),
                                emp.getCargo(),
                                emp.getArea()))
                        .orElse(null));
    }

    private SolicitudVehicularConductorInfo obtenerConductorInfo(UUID conductorId) {
        if (conductorId == null) {
            return null;
        }
        return conductorRepository.findById(conductorId)
                .map(c -> {
                    String nombre = null;
                    if (c.getEmpleadoId() != null) {
                        nombre = springVEmpleadoRepository.findById(c.getEmpleadoId())
                                .map(VEmpleadoEntity::getNombreCompleto)
                                .orElseGet(() -> empleadoRepository.findById(c.getEmpleadoId())
                                        .map(Empleado::getNombreCompleto)
                                        .orElse(null));
                    }
                    return new SolicitudVehicularConductorInfo(
                            c.getId(),
                            c.getEmpleadoId(),
                            nombre,
                            c.getNumeroLicencia(),
                            c.getCategoriaLicencia());
                })
                .orElseGet(() -> springVEmpleadoRepository.findById(conductorId)
                        .map(ve -> new SolicitudVehicularConductorInfo(
                                conductorId,
                                ve.getEmpleadoId(),
                                ve.getNombreCompleto(),
                                null,
                                null))
                        .orElseGet(() -> empleadoRepository.findById(conductorId)
                                .map(emp -> new SolicitudVehicularConductorInfo(
                                        conductorId,
                                        emp.getId(),
                                        emp.getNombreCompleto(),
                                        null,
                                        null))
                                .orElse(null)));
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
