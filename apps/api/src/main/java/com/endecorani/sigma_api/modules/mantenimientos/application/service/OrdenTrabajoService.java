package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.reporte.OrdenTrabajoActividadReporteDto;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.request.OrdenTrabajoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.request.OrdenTrabajoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.response.OrdenTrabajoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.OrdenTrabajoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajo;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoActividad;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.modules.parametros.application.service.CorrelativoService;
import com.endecorani.sigma_api.modules.parametros.domain.constant.CorrelativoCodigo;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.infrastructure.report.BarcodeUtil;
import com.endecorani.sigma_api.shared.infrastructure.report.JasperReportService;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrdenTrabajoService {

    private static final String REPORTE_ORDEN_TRABAJO_PATH = "reports/ordenes-trabajo/orden_trabajo.jrxml";
    private static final DateTimeFormatter FORMATTER_FECHA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "numero",
            "fechaInicio",
            "fechaFin",
            "createdAt",
            "updatedAt"
    );

    private final OrdenTrabajoRepository repository;
    private final OrdenTrabajoMapper mapper;
    private final CorrelativoService correlativoService;
    private final JasperReportService jasperReportService;
    private final SecurityUtils securityUtils;
    private final UsuarioRepository usuarioRepository;
    private final EmpleadoRepository empleadoRepository;
    private final SpringVEmpleadoRepository springVEmpleadoRepository;
    private final SolicitudMantenimientoRepository solicitudRepository;
    private final ActivoRepository activoRepository;

    @Transactional(readOnly = true)
    public PageResponse<OrdenTrabajoResponse> findAll(PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<OrdenTrabajo> resultado = repository.findAll(pageable);
        return PageResponse.from(resultado, mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrdenTrabajoResponse> listar(UUID solicitudMantenimientoId, String search, PageRequestDto pageRequest) {
        String normalized = StringUtils.normalize(search);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<OrdenTrabajo> resultado;

        if (solicitudMantenimientoId != null) {
            resultado = repository.findBySolicitudMantenimientoId(solicitudMantenimientoId, pageable);
        } else if (normalized == null || normalized.isBlank()) {
            resultado = repository.findAll(pageable);
        } else {
            resultado = repository.search(normalized, pageable);
        }

        return PageResponse.from(resultado, mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public OrdenTrabajoResponse findById(UUID id) {
        OrdenTrabajo ordenTrabajo = obtenerPorId(id);
        return mapper.toResponse(ordenTrabajo);
    }

    @Transactional(readOnly = true)
    public OrdenTrabajoResponse findByNumero(String numero) {
        OrdenTrabajo ordenTrabajo = repository.findByNumero(numero)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de trabajo no encontrada con número: " + numero));
        return mapper.toResponse(ordenTrabajo);
    }

    @Transactional(readOnly = true)
    public OrdenTrabajoResponse findBySolicitudMantenimientoId(UUID solicitudMantenimientoId) {
        OrdenTrabajo ordenTrabajo = repository.findBySolicitudMantenimientoId(solicitudMantenimientoId)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de trabajo no encontrada para la solicitud: " + solicitudMantenimientoId));
        return mapper.toResponse(ordenTrabajo);
    }

    @Transactional(readOnly = true)
    public byte[] generarReportePdf(UUID id) {
        OrdenTrabajo ot = obtenerPorId(id);

        // Consultar solicitud de mantenimiento vinculada
        SolicitudMantenimiento solicitud = null;
        if (ot.getSolicitudMantenimientoId() != null) {
            solicitud = solicitudRepository.findById(ot.getSolicitudMantenimientoId()).orElse(null);
        }

        // Consultar activo vinculado
        UUID activoId = ot.getActivoId();
        if (activoId == null && solicitud != null && solicitud.getActivo() != null) {
            activoId = solicitud.getActivo().getId();
        }
        Activo activo = activoId != null ? activoRepository.findById(activoId).orElse(null) : null;

        // Consultar Responsable Técnico
        UUID responsableId = ot.getResponsableId();
        if (responsableId == null && solicitud != null && solicitud.getResponsable() != null) {
            responsableId = solicitud.getResponsable().getId();
        }
        String responsableNombre = "-";
        String responsableCargo = "";
        if (responsableId != null) {
            VEmpleadoEntity ve = springVEmpleadoRepository.findById(responsableId).orElse(null);
            if (ve != null) {
                responsableNombre = ve.getNombreCompleto() != null ? ve.getNombreCompleto() : "-";
                responsableCargo = ve.getCargo() != null ? ve.getCargo() : "";
            } else {
                Empleado emp = empleadoRepository.findById(responsableId).orElse(null);
                if (emp != null) {
                    responsableNombre = emp.getNombreCompleto() != null ? emp.getNombreCompleto() : "-";
                    responsableCargo = emp.getCargo() != null ? emp.getCargo() : "";
                }
            }
        }

        // Consultar Supervisor de Mantenimiento
        String supervisorNombre = "-";
        String supervisorCargo = "";
        if (solicitud != null && solicitud.getSupervisor() != null && solicitud.getSupervisor().getId() != null) {
            VEmpleadoEntity ve = springVEmpleadoRepository.findById(solicitud.getSupervisor().getId()).orElse(null);
            if (ve != null) {
                supervisorNombre = ve.getNombreCompleto() != null ? ve.getNombreCompleto() : "-";
                supervisorCargo = ve.getCargo() != null ? ve.getCargo() : "";
            } else {
                Empleado emp = empleadoRepository.findById(solicitud.getSupervisor().getId()).orElse(null);
                if (emp != null) {
                    supervisorNombre = emp.getNombreCompleto() != null ? emp.getNombreCompleto() : "-";
                    supervisorCargo = emp.getCargo() != null ? emp.getCargo() : "";
                }
            }
        }

        // Usuario generador
        String usuarioGenerador = securityUtils.getCurrentUsername();
        UUID currentEmpId = obtenerEmpleadoIdActual();
        if (currentEmpId != null) {
            Empleado emp = empleadoRepository.findById(currentEmpId).orElse(null);
            if (emp != null && emp.getNombreCompleto() != null && !emp.getNombreCompleto().isBlank()) {
                usuarioGenerador = emp.getNombreCompleto() + (emp.getCargo() != null && !emp.getCargo().isBlank() ? " - " + emp.getCargo() : "");
            }
        }

        // Parámetros JasperReports
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("NUMERO_OT", ot.getNumero() != null ? ot.getNumero() : "OT-S/N");
        parameters.put("NUMERO_SOLICITUD", solicitud != null && solicitud.getNumero() != null ? solicitud.getNumero() : "S/N");
        parameters.put("TITULO_SOLICITUD", solicitud != null && solicitud.getTitulo() != null ? solicitud.getTitulo() : "-");
        parameters.put("TIPO_MANTENIMIENTO", solicitud != null && solicitud.getTipoMantenimiento() != null ? solicitud.getTipoMantenimiento().getNombre() : "-");
        parameters.put("PRIORIDAD", solicitud != null && solicitud.getPrioridad() != null ? solicitud.getPrioridad().getNombre() : "-");
        parameters.put("ESTADO", solicitud != null && solicitud.getEstado() != null ? solicitud.getEstado().toUpperCase() : "EN_PROCESO");
        parameters.put("ACTIVO_CODIGO", activo != null && activo.getCodigo() != null ? activo.getCodigo() : (solicitud != null && solicitud.getActivo() != null ? solicitud.getActivo().getCodigo() : "-"));
        parameters.put("ACTIVO_NOMBRE", activo != null && activo.getNombre() != null ? activo.getNombre() : (solicitud != null && solicitud.getActivo() != null ? solicitud.getActivo().getNombre() : "-"));
        parameters.put("ACTIVO_UBICACION", "-");
        parameters.put("RESPONSABLE_NOMBRE", responsableNombre);
        parameters.put("RESPONSABLE_CARGO", responsableCargo);
        parameters.put("SUPERVISOR_NOMBRE", supervisorNombre);
        parameters.put("SUPERVISOR_CARGO", supervisorCargo);
        parameters.put("FECHA_INICIO", ot.getFechaInicio() != null ? ot.getFechaInicio().format(FORMATTER_FECHA_HORA) : "-");
        parameters.put("FECHA_FIN", ot.getFechaFin() != null ? ot.getFechaFin().format(FORMATTER_FECHA_HORA) : "-");
        parameters.put("DIAGNOSTICO", ot.getDiagnostico() != null ? ot.getDiagnostico() : "");
        parameters.put("TRABAJO_REALIZADO", ot.getTrabajoRealizado() != null ? ot.getTrabajoRealizado() : "");
        parameters.put("OBSERVACION", ot.getObservacion() != null ? ot.getObservacion() : "");
        parameters.put("FECHA_EMISION", LocalDateTime.now().format(FORMATTER_FECHA_HORA));
        parameters.put("GENERADO_POR", usuarioGenerador);

        // Código de barras
        String barcodeValue = (ot.getNumero() != null && !ot.getNumero().isBlank()) ? ot.getNumero() : id.toString();
        java.awt.image.BufferedImage barcodeImage = BarcodeUtil.generateBarcode128(barcodeValue, 320, 60);
        if (barcodeImage != null) {
            parameters.put("BARCODE_IMAGEN", barcodeImage);
        }

        // Logo institucional
        try {
            ClassPathResource logoResource = new ClassPathResource("reports/images/logo-ende-corani.png");
            if (logoResource.exists()) {
                parameters.put("LOGO_EMPRESA", logoResource.getInputStream());
            }
        } catch (Exception e) {
            log.warn("No se pudo cargar el logo para el reporte de orden de trabajo: {}", e.getMessage());
        }

        // Lista de actividades
        List<OrdenTrabajoActividadReporteDto> datasource = new ArrayList<>();
        if (ot.getActividades() != null && !ot.getActividades().isEmpty()) {
            int idx = 1;
            for (OrdenTrabajoActividad act : ot.getActividades()) {
                datasource.add(OrdenTrabajoActividadReporteDto.builder()
                        .numero(idx++)
                        .descripcion(act.getDescripcion() != null ? act.getDescripcion() : "-")
                        .estado(Boolean.TRUE.equals(act.isRealizado()) ? "REALIZADO" : "PENDIENTE")
                        .fechaRealizacion(act.getFechaRealizacion() != null ? act.getFechaRealizacion().format(FORMATTER_FECHA_HORA) : "-")
                        .observacion(act.getObservacion() != null ? act.getObservacion() : "-")
                        .build());
            }
        }

        return jasperReportService.generatePdfReport(REPORTE_ORDEN_TRABAJO_PATH, parameters, datasource);
    }

    private UUID obtenerEmpleadoIdActual() {
        return securityUtils.getCurrentUserId()
                .flatMap(usuarioRepository::findById)
                .map(Usuario::getPersonaId)
                .flatMap(empleadoRepository::findFirstByPersonaId)
                .map(Empleado::getId)
                .orElse(null);
    }

    @Transactional
    public OrdenTrabajoResponse create(OrdenTrabajoRequest dto) {
        if (repository.existsBySolicitudMantenimientoId(dto.solicitudMantenimientoId())) {
            throw new ConflictException(
                    "OT_SOLICITUD_DUPLICADA",
                    "Ya existe una orden de trabajo para esta solicitud de mantenimiento"
            );
        }

        String numero = correlativoService.generar(
                CorrelativoCodigo.ORDEN_TRABAJO,
                LocalDateTime.now().getYear()
        );

        OrdenTrabajo ordenTrabajo = mapper.toDomain(dto);
        ordenTrabajo.setNumero(numero);

        if (ordenTrabajo.getActividades() != null) {
            ordenTrabajo.getActividades().forEach(actividad -> {
                if (actividad.getOrdenTrabajoId() == null) {
                    actividad.setOrdenTrabajoId(ordenTrabajo.getId());
                }
                if (actividad.getEvidencias() != null) {
                    actividad.getEvidencias().forEach(evidencia -> {
                        if (evidencia.getOrdenTrabajoActividadId() == null) {
                            evidencia.setOrdenTrabajoActividadId(actividad.getId());
                        }
                    });
                }
            });
        }

        if (ordenTrabajo.getAdjuntos() != null) {
            ordenTrabajo.getAdjuntos().forEach(adjunto -> {
                if (adjunto.getOrdenTrabajoId() == null) {
                    adjunto.setOrdenTrabajoId(ordenTrabajo.getId());
                }
            });
        }

        OrdenTrabajo guardado = repository.save(ordenTrabajo);
        return mapper.toResponse(guardado);
    }

    @Transactional
    public OrdenTrabajoResponse update(UUID id, OrdenTrabajoUpdate dto) {
        OrdenTrabajo actual = obtenerPorId(id);

        if (repository.existsBySolicitudMantenimientoIdAndIdNot(dto.solicitudMantenimientoId(), id)) {
            throw new ConflictException(
                    "OT_SOLICITUD_DUPLICADA",
                    "Ya existe otra orden de trabajo para esta solicitud de mantenimiento"
            );
        }

        mapper.updateDomain(dto, actual);

        if (actual.getActividades() != null) {
            actual.getActividades().forEach(actividad -> {
                if (actividad.getOrdenTrabajoId() == null) {
                    actividad.setOrdenTrabajoId(actual.getId());
                }
                if (actividad.getEvidencias() != null) {
                    actividad.getEvidencias().forEach(evidencia -> {
                        if (evidencia.getOrdenTrabajoActividadId() == null) {
                            evidencia.setOrdenTrabajoActividadId(actividad.getId());
                        }
                    });
                }
            });
        }

        if (actual.getAdjuntos() != null) {
            actual.getAdjuntos().forEach(adjunto -> {
                if (adjunto.getOrdenTrabajoId() == null) {
                    adjunto.setOrdenTrabajoId(actual.getId());
                }
            });
        }

        OrdenTrabajo actualizado = repository.save(actual);
        return mapper.toResponse(actualizado);
    }

    @Transactional
    public void delete(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private OrdenTrabajo obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de trabajo", id));
    }
}
