package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoValorEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.request.*;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.response.*;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.BitacoraVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SalidaVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SalidaVehicularEvento;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.BitacoraVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularEventoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.modules.parametros.application.service.CorrelativoService;
import com.endecorani.sigma_api.modules.parametros.domain.constant.CorrelativoCodigo;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.modules.workflow.application.dto.request.CompleteWorkflowTaskRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowActionResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowHistoryResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskActionsResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskResponse;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowApplicationService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SalidaVehicularService {

    private static final String WORKFLOW_CODIGO = "SALIDA_VEHICULAR";
    private static final String ESTADO_SALIDA = "SALIDA";
    private static final String ESTADO_LLEGADA = "LLEGADA";
    private static final String ESTADO_CANCELADA = "CANCELADA";

    private final SalidaVehicularRepository salidaRepository;
    private final SalidaVehicularEventoRepository eventoRepository;
    private final BitacoraVehicularRepository bitacoraRepository;
    private final WorkflowApplicationService workflowApplicationService;
    private final CorrelativoService correlativoService;
    private final SpringActivoRepository activoRepository;
    private final SpringActivoAtributoRepository activoAtributoRepository;
    private final SpringActivoAtributoValorRepository activoAtributoValorRepository;
    private final SpringVEmpleadoRepository vempleadoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmpleadoRepository empleadoRepository;
    private final SecurityUtils securityUtils;

    // ==========================================
    // 1. Gestión de Salidas Vehiculares
    // ==========================================

    @Transactional
    public SalidaVehicularResponse registrar(RegistrarSalidaVehicularRequest request) {
        if (!activoRepository.existsById(request.activoId())) {
            throw new ResourceNotFoundException("Vehículo o Activo", request.activoId());
        }

        UUID empleadoId = request.empleadoId();
        if (empleadoId == null) {
            empleadoId = obtenerEmpleadoIdActual();
            if (empleadoId == null) {
                throw new BusinessException("No se pudo identificar al empleado solicitante. Debe especificar empleadoId.");
            }
        }

        String numero = correlativoService.generar(CorrelativoCodigo.SALIDA_VEHICULAR, LocalDate.now().getYear());

        String observaciones = request.observaciones() != null && !request.observaciones().isBlank()
                ? request.observaciones().trim()
                : null;

        Instant fecha = request.fecha() != null ? request.fecha() : Instant.now();

        SalidaVehicular salida = SalidaVehicular.builder()
                .numero(numero)
                .activoId(request.activoId())
                .empleadoId(empleadoId)
                .fecha(fecha)
                .descripcionActividad(request.descripcionActividad().trim())
                .observaciones(observaciones)
                .estado("SALIDA")
                .build();

        SalidaVehicular guardada = salidaRepository.save(salida);

        // Iniciar proceso Flowable
        Map<String, Object> variables = new HashMap<>();
        variables.put("salidaId", guardada.getId().toString());
        variables.put("empleadoId", empleadoId.toString());
        variables.put("activoId", request.activoId().toString());
        variables.put("fecha", fecha.toString());
        variables.put("descripcionActividad", guardada.getDescripcionActividad());
        if (observaciones != null) {
            variables.put("observaciones", observaciones);
        }

        try {
            String processInstanceId = workflowApplicationService.iniciar(WORKFLOW_CODIGO, guardada.getId().toString(), variables);
            guardada.setProcessInstanceId(processInstanceId);
            guardada.setEstado(ESTADO_SALIDA);
            guardada = salidaRepository.save(guardada);
        } catch (Exception ex) {
            log.warn("No se pudo iniciar el proceso Flowable para la salida vehicular: {}", ex.getMessage());
        }

        return toResponse(guardada);
    }

    @Transactional(readOnly = true)
    public PageResponse<SalidaVehicularResponse> listar(
            String search,
            UUID activoId,
            UUID empleadoId,
            String estado,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta,
            PageRequestDto pageRequest
    ) {
        Pageable pageable = pageRequest.toPageable();
        Instant instantDesde = fechaDesde != null ? fechaDesde.toInstant(ZoneOffset.UTC) : null;
        Instant instantHasta = fechaHasta != null ? fechaHasta.toInstant(ZoneOffset.UTC) : null;

        Page<SalidaVehicular> page = salidaRepository.searchWithFilters(
                search, activoId, empleadoId, estado, instantDesde, instantHasta, pageable
        );

        List<SalidaVehicularResponse> responses = mapListToResponse(page.getContent());
        return PageResponse.of(responses, page);
    }

    @Transactional(readOnly = true)
    public SalidaVehicularResponse obtenerPorId(UUID id) {
        SalidaVehicular salida = salidaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salida Vehicular", id));
        return toResponse(salida);
    }

    @Transactional
    public SalidaVehicularResponse actualizar(UUID id, ActualizarSalidaVehicularRequest request) {
        SalidaVehicular salida = salidaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salida Vehicular", id));

        String estadoActual = salida.getEstado() != null ? salida.getEstado().toUpperCase() : "";
        if (ESTADO_LLEGADA.equals(estadoActual) || "FINALIZADA".equals(estadoActual) || ESTADO_CANCELADA.equals(estadoActual)) {
            throw new BusinessException("No se puede modificar una salida vehicular que ya está en " + estadoActual);
        }

        if (request.fecha() != null) {
            salida.setFecha(request.fecha());
        }
        if (request.descripcionActividad() != null && !request.descripcionActividad().isBlank()) {
            salida.setDescripcionActividad(request.descripcionActividad().trim());
        }
        if (request.observaciones() != null) {
            salida.setObservaciones(request.observaciones().isBlank() ? null : request.observaciones().trim());
        }

        SalidaVehicular guardada = salidaRepository.save(salida);
        return toResponse(guardada);
    }

    @Transactional(readOnly = true)
    public List<SalidaVehicularResponse> listarActivas() {
        List<SalidaVehicular> activas = salidaRepository.findActivas();
        return mapListToResponse(activas);
    }

    @Transactional(readOnly = true)
    public PageResponse<SalidaVehicularResponse> listarMisSalidas(PageRequestDto pageRequest) {
        UUID empleadoId = obtenerEmpleadoIdActual();
        if (empleadoId == null) {
            Page<SalidaVehicular> emptyPage = new org.springframework.data.domain.PageImpl<>(
                    Collections.emptyList(), pageRequest.toPageable(), 0
            );
            return PageResponse.of(Collections.emptyList(), emptyPage);
        }

        Page<SalidaVehicular> page = salidaRepository.findByEmpleadoId(empleadoId, pageRequest.toPageable());
        List<SalidaVehicularResponse> responses = mapListToResponse(page.getContent());
        return PageResponse.of(responses, page);
    }

    @Transactional
    public SalidaVehicularResponse cancelar(UUID id, CancelarSalidaVehicularRequest request) {
        SalidaVehicular salida = salidaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salida Vehicular", id));

        String estadoActual = salida.getEstado() != null ? salida.getEstado().toUpperCase() : "";
        if (ESTADO_LLEGADA.equals(estadoActual) || "FINALIZADA".equals(estadoActual) || ESTADO_CANCELADA.equals(estadoActual)) {
            throw new BusinessException("No se puede cancelar una salida vehicular que ya está en " + estadoActual);
        }

        String motivo = request != null && request.motivo() != null ? request.motivo() : "Cancelada a solicitud del usuario";

        if (salida.getProcessInstanceId() != null) {
            try {
                workflowApplicationService.cancelarProceso(salida.getProcessInstanceId(), motivo);
            } catch (Exception ex) {
                log.warn("Error al cancelar proceso en Flowable para salida {}: {}", id, ex.getMessage());
            }
        }

        salida.setEstado(ESTADO_CANCELADA);
        SalidaVehicular guardada = salidaRepository.save(salida);

        // Registrar evento de cancelación
        UUID empleadoId = obtenerEmpleadoIdActual();
        if (empleadoId == null) {
            empleadoId = salida.getEmpleadoId();
        }

        SalidaVehicularEvento evento = SalidaVehicularEvento.builder()
                .salidaVehicularId(salida.getId())
                .empleadoId(empleadoId)
                .tipoEvento("CANCELACION")
                .fechaHora(Instant.now())
                .observacion(motivo)
                .build();
        eventoRepository.save(evento);

        return toResponse(guardada);
    }

    // ==========================================
    // 2. Integración Dinámica con Flowable
    // ==========================================

    @Transactional(readOnly = true)
    public WorkflowTaskResponse obtenerTareaActual(UUID id) {
        SalidaVehicular salida = salidaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salida Vehicular", id));

        if (salida.getProcessInstanceId() == null) {
            throw new BusinessException("La salida vehicular no tiene un proceso Flowable asociado");
        }

        return workflowApplicationService.obtenerTareaActual(salida.getProcessInstanceId());
    }

    @Transactional(readOnly = true)
    public WorkflowTaskActionsResponse obtenerAcciones(UUID id) {
        SalidaVehicular salida = salidaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salida Vehicular", id));

        if (salida.getProcessInstanceId() == null) {
            throw new BusinessException("La salida vehicular no tiene un proceso Flowable asociado");
        }

        return workflowApplicationService.obtenerAccionesDisponibles(salida.getProcessInstanceId());
    }

    @Transactional
    public SalidaVehicularResponse ejecutarAccion(UUID id, String accionId, EjecutarAccionSalidaRequest request) {
        SalidaVehicular salida = salidaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salida Vehicular", id));

        if (salida.getProcessInstanceId() == null) {
            throw new BusinessException("La salida vehicular no tiene un proceso Flowable activo");
        }

        WorkflowTaskActionsResponse tareaActual = workflowApplicationService.obtenerAccionesDisponibles(salida.getProcessInstanceId());
        if (tareaActual == null || tareaActual.taskId() == null) {
            throw new BusinessException("El proceso Flowable no tiene una tarea activa pendiente para ejecutar acciones");
        }

        // Buscar acción coincidente
        WorkflowActionResponse matchingAction = null;
        if (tareaActual.actions() != null) {
            matchingAction = tareaActual.actions().stream()
                    .filter(a -> a.value().equalsIgnoreCase(accionId)
                            || a.name().equalsIgnoreCase(accionId)
                            || accionId.equalsIgnoreCase(a.value().replaceAll("[^A-Za-z0-9]", "_"))
                            || accionId.equalsIgnoreCase(a.value().replaceAll("_", "-")))
                    .findFirst()
                    .orElse(null);
        }

        if (matchingAction == null && tareaActual.actions() != null && !tareaActual.actions().isEmpty()) {
            matchingAction = tareaActual.actions().getFirst();
        }

        Map<String, Object> effectiveVariables = new HashMap<>();
        if (request != null && request.variables() != null) {
            effectiveVariables.putAll(request.variables());
        }

        String actionValue = matchingAction != null ? matchingAction.value() : accionId.toUpperCase();
        String actionVar = matchingAction != null ? matchingAction.variable() : "action";

        effectiveVariables.put(actionVar, actionValue);
        effectiveVariables.put("action", actionValue);
        effectiveVariables.put("accion", actionValue);

        if (request != null) {
            if (request.kilometraje() != null) {
                effectiveVariables.put("kilometraje", request.kilometraje().longValue());
            }
            if (request.latitud() != null) {
                effectiveVariables.put("latitud", request.latitud().toString());
            }
            if (request.longitud() != null) {
                effectiveVariables.put("longitud", request.longitud().toString());
            }
            if (request.observacion() != null && !request.observacion().isBlank()) {
                effectiveVariables.put("observacion", request.observacion().trim());
                effectiveVariables.put("comentario", request.observacion().trim());
            }
        }

        CompleteWorkflowTaskRequest taskRequest = new CompleteWorkflowTaskRequest(effectiveVariables);
        WorkflowTaskActionsResponse resultado = workflowApplicationService.completarTarea(
                salida.getProcessInstanceId(), taskRequest
        );

        // Registrar automáticamente el evento correspondiente en salidas_vehiculares_eventos
        UUID empleadoId = obtenerEmpleadoIdActual();
        if (empleadoId == null) {
            empleadoId = salida.getEmpleadoId();
        }

        String tipoEvento = resolverTipoEvento(tareaActual, matchingAction, actionValue);
        SalidaVehicularEvento evento = SalidaVehicularEvento.builder()
                .salidaVehicularId(salida.getId())
                .empleadoId(empleadoId)
                .tipoEvento(tipoEvento)
                .fechaHora(Instant.now())
                .kilometraje(request != null ? request.kilometraje() : null)
                .latitud(request != null ? request.latitud() : null)
                .longitud(request != null ? request.longitud() : null)
                .observacion(request != null ? request.observacion() : null)
                .build();
        eventoRepository.save(evento);

        // Registrar automáticamente la entrada en bitácora vehicular con geolocalización y odómetro del hito
        String descripcionBitacora = construirDescripcionBitacoraAutomatica(salida, tipoEvento, actionValue, request);
        BitacoraVehicular bitacora = BitacoraVehicular.builder()
                .salidaVehicularId(salida.getId())
                .empleadoId(empleadoId)
                .tipo(com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.TipoBitacoraVehicular.ACTIVIDAD.name())
                .fechaHora(Instant.now())
                .descripcion(descripcionBitacora)
                .latitud(request != null ? request.latitud() : null)
                .longitud(request != null ? request.longitud() : null)
                .build();
        bitacoraRepository.save(bitacora);

        // Actualizar estado de la salida:
        // - Si completó todas las tareas BPMN (LLEGADA fue la tarea final), el estado final es LLEGADA
        // - Si acaba de completar la primera tarea (SALIDA), permanece en SALIDA en espera de registrar LLEGADA
        if (resultado == null || resultado.taskId() == null) {
            salida.setEstado(ESTADO_LLEGADA);
        } else {
            salida.setEstado(ESTADO_SALIDA);
        }

        SalidaVehicular actualizada = salidaRepository.save(salida);
        return toResponse(actualizada);
    }

    @Transactional(readOnly = true)
    public WorkflowHistoryResponse obtenerHistorialProceso(UUID id) {
        SalidaVehicular salida = salidaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salida Vehicular", id));

        if (salida.getProcessInstanceId() == null) {
            throw new BusinessException("La salida vehicular no tiene un proceso Flowable asociado");
        }

        return workflowApplicationService.obtenerHistorial(salida.getProcessInstanceId());
    }

    // ==========================================
    // 3. Eventos Vehiculares
    // ==========================================

    @Transactional(readOnly = true)
    public List<SalidaVehicularEventoResponse> listarEventos(UUID id) {
        if (!salidaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Salida Vehicular", id);
        }
        List<SalidaVehicularEvento> eventos = eventoRepository.findBySalidaVehicularId(id);
        return mapEventosToResponse(eventos);
    }

    @Transactional(readOnly = true)
    public SalidaVehicularEventoResponse obtenerEvento(UUID id, UUID eventoId) {
        SalidaVehicularEvento evento = eventoRepository.findByIdAndSalidaVehicularId(eventoId, id)
                .orElseThrow(() -> new ResourceNotFoundException("Evento de Salida Vehicular", eventoId));
        return toEventoResponse(evento, resolverNombreEmpleado(evento.getEmpleadoId()));
    }

    // ==========================================
    // 4. Bitácoras Vehiculares
    // ==========================================

    @Transactional
    public BitacoraVehicularResponse registrarBitacora(UUID id, RegistrarBitacoraRequest request) {
        SalidaVehicular salida = salidaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salida Vehicular", id));

        UUID empleadoId = obtenerEmpleadoIdActual();
        if (empleadoId == null) {
            empleadoId = salida.getEmpleadoId();
        }

        BitacoraVehicular bitacora = BitacoraVehicular.builder()
                .salidaVehicularId(salida.getId())
                .empleadoId(empleadoId)
                .tipo(request.tipo().trim().toUpperCase())
                .fechaHora(request.fechaHora() != null ? request.fechaHora() : Instant.now())
                .descripcion(request.descripcion().trim())
                .latitud(request.latitud())
                .longitud(request.longitud())
                .build();

        BitacoraVehicular guardada = bitacoraRepository.save(bitacora);
        return toBitacoraResponse(guardada, resolverNombreEmpleado(empleadoId));
    }

    @Transactional(readOnly = true)
    public List<BitacoraVehicularResponse> listarBitacoras(UUID id) {
        if (!salidaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Salida Vehicular", id);
        }
        List<BitacoraVehicular> bitacoras = bitacoraRepository.findBySalidaVehicularId(id);
        return mapBitacorasToResponse(bitacoras);
    }

    @Transactional(readOnly = true)
    public BitacoraVehicularResponse obtenerBitacora(UUID id, UUID bitacoraId) {
        BitacoraVehicular bitacora = bitacoraRepository.findByIdAndSalidaVehicularId(bitacoraId, id)
                .orElseThrow(() -> new ResourceNotFoundException("Bitácora Vehicular", bitacoraId));
        return toBitacoraResponse(bitacora, resolverNombreEmpleado(bitacora.getEmpleadoId()));
    }

    // ==========================================
    // Mapeos y Métodos Auxiliares
    // ==========================================

    public UUID obtenerEmpleadoIdActual() {
        try {
            return securityUtils.getCurrentUserId()
                    .flatMap(usuarioRepository::findById)
                    .map(Usuario::getPersonaId)
                    .flatMap(empleadoRepository::findFirstByPersonaId)
                    .map(Empleado::getId)
                    .orElse(null);
        } catch (Exception ex) {
            return null;
        }
    }

    private String resolverNombreEmpleado(UUID empleadoId) {
        if (empleadoId == null) {
            return null;
        }
        return vempleadoRepository.findById(empleadoId)
                .map(VEmpleadoEntity::getNombreCompleto)
                .orElse(null);
    }

    private SalidaVehicularResponse toResponse(SalidaVehicular salida) {
        // Enriquecer activo
        ActivoEntity activo = activoRepository.findById(salida.getActivoId()).orElse(null);
        String activoCodigo = activo != null ? activo.getCodigo() : null;
        String activoDescripcion = activo != null ? activo.getDescripcion() : null;

        Map<String, String> atributosVehiculo = obtenerAtributosVehiculo(salida.getActivoId());
        String placa = atributosVehiculo.get("PLACA");
        String marca = atributosVehiculo.get("MARCA");
        String modelo = atributosVehiculo.get("MODELO");

        // Enriquecer empleado
        VEmpleadoEntity emp = vempleadoRepository.findById(salida.getEmpleadoId()).orElse(null);
        String empleadoCodigo = emp != null ? emp.getCodigo() : null;
        String empleadoNombre = emp != null ? emp.getNombreCompleto() : null;

        List<SalidaVehicularEventoResponse> eventos = mapEventosToResponse(
                eventoRepository.findBySalidaVehicularId(salida.getId())
        );

        List<BitacoraVehicularResponse> bitacoras = mapBitacorasToResponse(
                bitacoraRepository.findBySalidaVehicularId(salida.getId())
        );

        return SalidaVehicularResponse.builder()
                .id(salida.getId())
                .numero(salida.getNumero())
                .activoId(salida.getActivoId())
                .activoCodigo(activoCodigo)
                .activoDescripcion(activoDescripcion)
                .placa(placa)
                .marca(marca)
                .modelo(modelo)
                .empleadoId(salida.getEmpleadoId())
                .empleadoCodigo(empleadoCodigo)
                .empleadoNombre(empleadoNombre)
                .fecha(salida.getFecha() != null ? salida.getFecha() : salida.getCreatedAt())
                .descripcionActividad(salida.getDescripcionActividad())
                .observaciones(salida.getObservaciones())
                .estado(salida.getEstado())
                .processInstanceId(salida.getProcessInstanceId())
                .eventos(eventos)
                .bitacoras(bitacoras)
                .createdAt(salida.getCreatedAt())
                .updatedAt(salida.getUpdatedAt())
                .build();
    }

    public List<SalidaVehicularResponse> mapListToResponse(List<SalidaVehicular> salidas) {
        if (salidas == null || salidas.isEmpty()) {
            return Collections.emptyList();
        }

        Set<UUID> salidaIds = salidas.stream().map(SalidaVehicular::getId).collect(Collectors.toSet());
        Set<UUID> activoIds = salidas.stream().map(SalidaVehicular::getActivoId).collect(Collectors.toSet());
        Set<UUID> empleadoIds = salidas.stream().map(SalidaVehicular::getEmpleadoId).collect(Collectors.toSet());

        Map<UUID, ActivoEntity> activoMap = activoRepository.findAllById(activoIds).stream()
                .collect(Collectors.toMap(ActivoEntity::getId, a -> a));

        Map<UUID, VEmpleadoEntity> empleadoMap = vempleadoRepository.findAllById(empleadoIds).stream()
                .collect(Collectors.toMap(VEmpleadoEntity::getEmpleadoId, e -> e));

        Map<UUID, Map<String, String>> atributosMap = obtenerAtributosVehiculosBatch(activoIds);

        List<SalidaVehicularEvento> todosEventos = eventoRepository.findBySalidaVehicularIdIn(new ArrayList<>(salidaIds));
        Map<UUID, List<SalidaVehicularEventoResponse>> eventosPorSalida = mapEventosToResponse(todosEventos).stream()
                .collect(Collectors.groupingBy(SalidaVehicularEventoResponse::salidaVehicularId));

        return salidas.stream().map(salida -> {
            ActivoEntity activo = activoMap.get(salida.getActivoId());
            VEmpleadoEntity emp = empleadoMap.get(salida.getEmpleadoId());
            Map<String, String> attrs = atributosMap.getOrDefault(salida.getActivoId(), Collections.emptyMap());

            return SalidaVehicularResponse.builder()
                    .id(salida.getId())
                    .numero(salida.getNumero())
                    .activoId(salida.getActivoId())
                    .activoCodigo(activo != null ? activo.getCodigo() : null)
                    .activoDescripcion(activo != null ? activo.getDescripcion() : null)
                    .placa(attrs.get("PLACA"))
                    .marca(attrs.get("MARCA"))
                    .modelo(attrs.get("MODELO"))
                    .empleadoId(salida.getEmpleadoId())
                    .empleadoCodigo(emp != null ? emp.getCodigo() : null)
                    .empleadoNombre(emp != null ? emp.getNombreCompleto() : null)
                    .fecha(salida.getFecha() != null ? salida.getFecha() : salida.getCreatedAt())
                    .descripcionActividad(salida.getDescripcionActividad())
                    .observaciones(salida.getObservaciones())
                    .estado(salida.getEstado())
                    .processInstanceId(salida.getProcessInstanceId())
                    .eventos(eventosPorSalida.getOrDefault(salida.getId(), Collections.emptyList()))
                    .createdAt(salida.getCreatedAt())
                    .updatedAt(salida.getUpdatedAt())
                    .build();
        }).toList();
    }

    private List<SalidaVehicularEventoResponse> mapEventosToResponse(List<SalidaVehicularEvento> eventos) {
        if (eventos == null || eventos.isEmpty()) {
            return Collections.emptyList();
        }
        Set<UUID> empIds = eventos.stream().map(SalidaVehicularEvento::getEmpleadoId).collect(Collectors.toSet());
        Map<UUID, String> nombresMap = vempleadoRepository.findAllById(empIds).stream()
                .collect(Collectors.toMap(VEmpleadoEntity::getEmpleadoId, VEmpleadoEntity::getNombreCompleto));

        return eventos.stream()
                .map(e -> toEventoResponse(e, nombresMap.get(e.getEmpleadoId())))
                .toList();
    }

    private SalidaVehicularEventoResponse toEventoResponse(SalidaVehicularEvento evento, String empleadoNombre) {
        return SalidaVehicularEventoResponse.builder()
                .id(evento.getId())
                .salidaVehicularId(evento.getSalidaVehicularId())
                .empleadoId(evento.getEmpleadoId())
                .empleadoNombre(empleadoNombre)
                .tipoEvento(evento.getTipoEvento())
                .fechaHora(evento.getFechaHora())
                .kilometraje(evento.getKilometraje())
                .latitud(evento.getLatitud())
                .longitud(evento.getLongitud())
                .observacion(evento.getObservacion())
                .createdAt(evento.getCreatedAt())
                .build();
    }

    private List<BitacoraVehicularResponse> mapBitacorasToResponse(List<BitacoraVehicular> bitacoras) {
        if (bitacoras == null || bitacoras.isEmpty()) {
            return Collections.emptyList();
        }
        Set<UUID> empIds = bitacoras.stream().map(BitacoraVehicular::getEmpleadoId).collect(Collectors.toSet());
        Map<UUID, String> nombresMap = vempleadoRepository.findAllById(empIds).stream()
                .collect(Collectors.toMap(VEmpleadoEntity::getEmpleadoId, VEmpleadoEntity::getNombreCompleto));

        return bitacoras.stream()
                .map(b -> toBitacoraResponse(b, nombresMap.get(b.getEmpleadoId())))
                .toList();
    }

    private BitacoraVehicularResponse toBitacoraResponse(BitacoraVehicular bitacora, String empleadoNombre) {
        return BitacoraVehicularResponse.builder()
                .id(bitacora.getId())
                .salidaVehicularId(bitacora.getSalidaVehicularId())
                .empleadoId(bitacora.getEmpleadoId())
                .empleadoNombre(empleadoNombre)
                .tipo(bitacora.getTipo())
                .fechaHora(bitacora.getFechaHora())
                .descripcion(bitacora.getDescripcion())
                .latitud(bitacora.getLatitud())
                .longitud(bitacora.getLongitud())
                .createdAt(bitacora.getCreatedAt())
                .build();
    }

    private Map<String, String> obtenerAtributosVehiculo(UUID activoId) {
        Map<UUID, Map<String, String>> batch = obtenerAtributosVehiculosBatch(Set.of(activoId));
        return batch.getOrDefault(activoId, Collections.emptyMap());
    }

    private Map<UUID, Map<String, String>> obtenerAtributosVehiculosBatch(Set<UUID> activoIds) {
        if (activoIds == null || activoIds.isEmpty()) {
            return Collections.emptyMap();
        }
        List<ActivoAtributoValorEntity> valores = activoAtributoValorRepository.findByActivoIdIn(new ArrayList<>(activoIds));
        if (valores.isEmpty()) {
            return Collections.emptyMap();
        }

        Set<UUID> attrIds = valores.stream().map(ActivoAtributoValorEntity::getActivoAtributoId).collect(Collectors.toSet());
        Map<UUID, String> attrCodigos = activoAtributoRepository.findAllById(attrIds).stream()
                .collect(Collectors.toMap(ActivoAtributoEntity::getId, a -> a.getCodigo().toUpperCase(Locale.ROOT)));

        Map<UUID, Map<String, String>> result = new HashMap<>();
        for (ActivoAtributoValorEntity v : valores) {
            String codigo = attrCodigos.get(v.getActivoAtributoId());
            if (codigo != null && v.getValor() != null && !v.getValor().isBlank()) {
                result.computeIfAbsent(v.getActivoId(), k -> new HashMap<>()).put(codigo, v.getValor().trim());
            }
        }
        return result;
    }

    private String resolverTipoEvento(
            WorkflowTaskActionsResponse tareaActual,
            WorkflowActionResponse matchingAction,
            String actionValue
    ) {
        String taskKey = tareaActual != null && tareaActual.taskDefinitionKey() != null
                ? tareaActual.taskDefinitionKey().toUpperCase(Locale.ROOT)
                : "";
        String taskStatus = tareaActual != null && tareaActual.status() != null
                ? tareaActual.status().toUpperCase(Locale.ROOT)
                : "";
        String taskName = tareaActual != null && tareaActual.taskName() != null
                ? tareaActual.taskName().toUpperCase(Locale.ROOT)
                : "";
        String actionName = matchingAction != null && matchingAction.name() != null
                ? matchingAction.name().toUpperCase(Locale.ROOT)
                : "";
        String actVal = actionValue != null ? actionValue.toUpperCase(Locale.ROOT) : "";

        String combined = taskKey + " " + taskStatus + " " + taskName + " " + actionName + " " + actVal;
        if (combined.contains("LLEGAD")) {
            return ESTADO_LLEGADA;
        }
        if (combined.contains("SALIDA")) {
            return ESTADO_SALIDA;
        }
        if (matchingAction != null && matchingAction.name() != null && !matchingAction.name().isBlank()) {
            return matchingAction.name();
        }
        return actionValue != null && !actionValue.isBlank() ? actionValue : ESTADO_SALIDA;
    }

    private String construirDescripcionBitacoraAutomatica(
            SalidaVehicular salida,
            String tipoEvento,
            String actionValue,
            EjecutarAccionSalidaRequest request
    ) {
        String base = (tipoEvento != null && !tipoEvento.isBlank())
                ? tipoEvento.toUpperCase(Locale.ROOT)
                : (actionValue != null ? actionValue.toUpperCase(Locale.ROOT) : "");
        StringBuilder desc = new StringBuilder();

        if (base.contains("SALIDA")) {
            desc.append("Registro de salida vehicular");
            if (salida.getDescripcionActividad() != null && !salida.getDescripcionActividad().isBlank()) {
                desc.append(" (Actividad: ").append(salida.getDescripcionActividad()).append(")");
            }
        } else if (base.contains("LLEGAD")) {
            desc.append("Registro de llegada vehicular");
        } else {
            desc.append(tipoEvento != null ? tipoEvento : "Evento de salida vehicular");
        }

        if (request != null && request.kilometraje() != null) {
            desc.append(" - Odómetro: ").append(request.kilometraje()).append(" km");
        }

        if (request != null && request.observacion() != null && !request.observacion().isBlank()) {
            desc.append(" - Obs: ").append(request.observacion().trim());
        }

        return desc.toString();
    }
}

