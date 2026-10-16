package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.AccesorioEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringAccesorioRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.controlactivo.reporte.ControlActivoVehicularAccesorioReporteDto;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.controlactivo.request.ControlActivoRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.controlactivo.request.ControlActivoUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.controlactivo.response.ControlActivoDetalleResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.controlactivo.response.ControlActivoResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.mapper.ControlActivoVehicularMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.TipoControlActivo;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.ControlActivo;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.ControlActivoDetalle;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ControlActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.AsignacionVehicularEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.SolicitudVehicularEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringAsignacionVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringConductorRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringSolicitudVehicularRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.infrastructure.report.BarcodeUtil;
import com.endecorani.sigma_api.shared.infrastructure.report.JasperReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service("gestionVehicularControlActivoService")
@RequiredArgsConstructor
public class ControlActivoService {

    private static final String REPORTE_CONTROL_ACTIVO_PATH = "reports/controles-activos/acta_control_activo.jrxml";
    private static final DateTimeFormatter FORMATTER_FECHA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "fecha",
            "tipo",
            "conforme",
            "createdAt",
            "updatedAt"
    );

    private final ControlActivoRepository repository;
    private final ControlActivoVehicularMapper mapper;
    private final SpringAccesorioRepository springAccesorioRepository;
    private final JasperReportService jasperReportService;
    private final SecurityUtils securityUtils;
    private final UsuarioRepository usuarioRepository;
    private final EmpleadoRepository empleadoRepository;
    private final SpringVEmpleadoRepository springVEmpleadoRepository;
    private final SpringSolicitudVehicularRepository springSolicitudVehicularRepository;
    private final SpringAsignacionVehicularRepository springAsignacionVehicularRepository;
    private final SpringConductorRepository springConductorRepository;
    private final ActivoRepository activoRepository;

    @Transactional(readOnly = true)
    public PageResponse<ControlActivoResponse> findAll(PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<ControlActivo> resultado = repository.findAll(pageable);
        List<ControlActivoResponse> content = mapToResponses(resultado.getContent());
        return new PageResponse<>(
                content,
                resultado.getNumber(),
                resultado.getSize(),
                resultado.getTotalElements(),
                resultado.getTotalPages(),
                resultado.isFirst(),
                resultado.isLast(),
                resultado.isEmpty()
        );
    }

    @Transactional(readOnly = true)
    public ControlActivoResponse findById(UUID id) {
        ControlActivo controlActivo = obtenerPorId(id);
        return mapToResponse(controlActivo);
    }

    @Transactional(readOnly = true)
    public List<ControlActivoResponse> findBySolicitudVehicularId(UUID solicitudVehicularId) {
        return mapToResponses(repository.findBySolicitudVehicularId(solicitudVehicularId));
    }

    @Transactional(readOnly = true)
    public List<ControlActivoResponse> findByAsignacionVehicularId(UUID asignacionVehicularId) {
        return mapToResponses(repository.findByAsignacionVehicularId(asignacionVehicularId));
    }

    @Transactional(readOnly = true)
    public List<ControlActivoResponse> findByActivoId(UUID activoId) {
        return mapToResponses(repository.findByActivoId(activoId));
    }

    @Transactional
    public ControlActivoResponse create(ControlActivoRequest dto) {
        ControlActivo controlActivo = mapper.toDomain(dto);
        if (controlActivo.getFecha() == null) {
            controlActivo.setFecha(LocalDateTime.now());
        }

        if (controlActivo.getDetalles() != null) {
            controlActivo.getDetalles().forEach(detalle -> {
                if (detalle.getControlActivoId() == null) {
                    detalle.setControlActivoId(controlActivo.getId());
                }
            });
        }

        ControlActivo guardado = repository.save(controlActivo);
        return mapToResponse(guardado);
    }

    @Transactional
    public ControlActivoResponse update(UUID id, ControlActivoUpdate dto) {
        ControlActivo actual = obtenerPorId(id);
        mapper.updateDomain(dto, actual);

        if (actual.getDetalles() != null) {
            actual.getDetalles().forEach(detalle -> {
                if (detalle.getControlActivoId() == null) {
                    detalle.setControlActivoId(actual.getId());
                }
            });
        }

        ControlActivo actualizado = repository.save(actual);
        return mapToResponse(actualizado);
    }

    @Transactional
    public void delete(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public byte[] generarReportePdf(UUID id) {
        ControlActivoResponse control = findById(id);
        if (control == null) {
            throw new ResourceNotFoundException("Control de activo vehicular", id);
        }

        // Consultar solicitud vehicular vinculada
        SolicitudVehicularEntity solicitud = null;
        if (control.solicitudVehicularId() != null) {
            solicitud = springSolicitudVehicularRepository.findById(control.solicitudVehicularId()).orElse(null);
        }

        // Consultar asignación vehicular vinculada
        AsignacionVehicularEntity asignacion = null;
        if (control.asignacionVehicularId() != null) {
            asignacion = springAsignacionVehicularRepository.findById(control.asignacionVehicularId()).orElse(null);
        } else if (solicitud != null) {
            List<AsignacionVehicularEntity> asignaciones = springAsignacionVehicularRepository.findBySolicitudVehicularId(solicitud.getId());
            if (asignaciones != null && !asignaciones.isEmpty()) {
                asignacion = asignaciones.getFirst();
            }
        }

        // Consultar activo vinculado (vehículo)
        UUID activoId = control.activoId();
        if (activoId == null && asignacion != null) {
            activoId = asignacion.getActivoId();
        }
        Activo activo = activoId != null ? activoRepository.findById(activoId).orElse(null) : null;

        // Determinar títulos según el tipo de control (ENTREGA vs DEVOLUCIÓN)
        boolean isEntrega = control.tipo() == null || control.tipo() == TipoControlActivo.ENTREGA;
        String tipoActa = isEntrega ? "ACTA DE ENTREGA" : "ACTA DE DEVOLUCIÓN";
        String tituloReporte = isEntrega ? "ACTA DE ENTREGA DE VEHÍCULO" : "ACTA DE DEVOLUCIÓN DE VEHÍCULO";

        // Consultar datos de intervinientes (Entregado por y Recibido por)
        UUID entregadoPorId = null;
        UUID recibidoPorId = null;

        if (isEntrega) {
            if (asignacion != null && asignacion.getAsignadoPorId() != null) {
                entregadoPorId = asignacion.getAsignadoPorId();
            } else if (control.auditoria() != null && control.auditoria().createdById() != null) {
                entregadoPorId = obtenerEmpleadoIdPorUsuarioId(control.auditoria().createdById());
            }

            if (control.recibidoPorId() != null) {
                recibidoPorId = control.recibidoPorId();
            } else if (asignacion != null && asignacion.getConductorId() != null) {
                ConductorEntity conductor = springConductorRepository.findById(asignacion.getConductorId()).orElse(null);
                if (conductor != null) {
                    recibidoPorId = conductor.getEmpleadoId();
                }
            } else if (solicitud != null && solicitud.getSolicitanteId() != null) {
                recibidoPorId = solicitud.getSolicitanteId();
            }
        } else {
            // DEVOLUCIÓN: El conductor o solicitante entrega el vehículo y el encargado/responsable lo recibe
            if (control.recibidoPorId() != null) {
                entregadoPorId = control.recibidoPorId();
            } else if (asignacion != null && asignacion.getConductorId() != null) {
                ConductorEntity conductor = springConductorRepository.findById(asignacion.getConductorId()).orElse(null);
                if (conductor != null) {
                    entregadoPorId = conductor.getEmpleadoId();
                }
            } else if (solicitud != null && solicitud.getSolicitanteId() != null) {
                entregadoPorId = solicitud.getSolicitanteId();
            }

            if (asignacion != null && asignacion.getAsignadoPorId() != null) {
                recibidoPorId = asignacion.getAsignadoPorId();
            } else if (control.auditoria() != null && control.auditoria().createdById() != null) {
                recibidoPorId = obtenerEmpleadoIdPorUsuarioId(control.auditoria().createdById());
            }
        }

        String[] entregadoInfo = resolverEmpleadoInfo(entregadoPorId);
        String[] recibidoInfo = resolverEmpleadoInfo(recibidoPorId);

        // Parámetros JasperReports
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("TITULO_REPORTE", tituloReporte);
        parameters.put("TIPO_ACTA", tipoActa);
        parameters.put("NUMERO_SOLICITUD", solicitud != null && solicitud.getNumero() != null ? solicitud.getNumero() : "S/N");

        String detalleSolicitud = "-";
        if (solicitud != null) {
            StringBuilder sb = new StringBuilder();
            if (solicitud.getMotivo() != null && !solicitud.getMotivo().isBlank()) {
                sb.append(solicitud.getMotivo().trim());
            }
            if (solicitud.getDestino() != null && !solicitud.getDestino().isBlank()) {
                if (!sb.isEmpty()) sb.append(" | ");
                sb.append("Destino: ").append(solicitud.getDestino().trim());
            }
            detalleSolicitud = !sb.isEmpty() ? sb.toString() : "-";
        }
        parameters.put("TITULO_SOLICITUD", detalleSolicitud);

        parameters.put("ACTIVO_CODIGO", activo != null && activo.getCodigo() != null ? activo.getCodigo() : "-");
        parameters.put("ACTIVO_NOMBRE", activo != null && activo.getNombre() != null ? activo.getNombre() : "-");
        parameters.put("FECHA_ACTA", control.fecha() != null ? control.fecha().format(FORMATTER_FECHA_HORA) : "-");
        parameters.put("ESTADO_CONFORMIDAD", Boolean.TRUE.equals(control.conforme()) ? "CONFORME" : "NO CONFORME");
        parameters.put("ENTREGADO_POR", entregadoInfo[0]);
        parameters.put("ENTREGADO_CARGO", entregadoInfo[1]);
        parameters.put("RECIBIDO_POR", recibidoInfo[0]);
        parameters.put("RECIBIDO_CARGO", recibidoInfo[1]);
        parameters.put("OBSERVACION_GENERAL", control.observacion() != null ? control.observacion() : "");
        parameters.put("FECHA_EMISION", LocalDateTime.now().format(FORMATTER_FECHA_HORA));

        // Usuario generador
        String usuarioGenerador = securityUtils.getCurrentUsername();
        UUID currentEmpId = obtenerEmpleadoIdActual();
        if (currentEmpId != null) {
            String[] currentEmpInfo = resolverEmpleadoInfo(currentEmpId);
            if (!"-".equals(currentEmpInfo[0])) {
                usuarioGenerador = currentEmpInfo[0] + (!currentEmpInfo[1].isBlank() ? " - " + currentEmpInfo[1] : "");
            }
        }
        parameters.put("GENERADO_POR", usuarioGenerador);

        // Código de barras (usar número de solicitud o ID de control)
        String barcodeValue = (solicitud != null && solicitud.getNumero() != null && !solicitud.getNumero().isBlank())
                ? solicitud.getNumero() + "-" + (isEntrega ? "ENT" : "DEV")
                : id.toString();
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
            log.warn("No se pudo cargar el logo para el reporte de control de activo vehicular: {}", e.getMessage());
        }

        // Lista de accesorios para el datasource del reporte
        List<ControlActivoVehicularAccesorioReporteDto> dataSourceList = new ArrayList<>();
        if (control.detalles() != null && !control.detalles().isEmpty()) {
            int idx = 1;
            for (ControlActivoDetalleResponse det : control.detalles()) {
                String accCodigo = det.accesorio() != null && det.accesorio().codigo() != null ? det.accesorio().codigo() : "-";
                String accNombre = det.accesorio() != null && det.accesorio().nombre() != null ? det.accesorio().nombre() : "Accesorio";
                dataSourceList.add(ControlActivoVehicularAccesorioReporteDto.builder()
                        .numero(idx++)
                        .codigo(accCodigo)
                        .nombre(accNombre)
                        .cantidadEsperada(det.cantidadEsperada() != null ? det.cantidadEsperada() : 0)
                        .cantidadEncontrada(det.cantidadEncontrada() != null ? det.cantidadEncontrada() : 0)
                        .estadoConformidad(det.conforme() ? "CONFORME" : "OBSERVADO")
                        .observacion(det.observacion() != null ? det.observacion() : "-")
                        .build());
            }
        }

        return jasperReportService.generatePdfReport(REPORTE_CONTROL_ACTIVO_PATH, parameters, dataSourceList);
    }

    private String[] resolverEmpleadoInfo(UUID empleadoId) {
        if (empleadoId == null) {
            return new String[]{"-", ""};
        }
        VEmpleadoEntity ve = springVEmpleadoRepository.findById(empleadoId).orElse(null);
        if (ve != null) {
            return new String[]{
                    ve.getNombreCompleto() != null ? ve.getNombreCompleto() : "-",
                    ve.getCargo() != null ? ve.getCargo() : ""
            };
        }
        Empleado emp = empleadoRepository.findById(empleadoId).orElse(null);
        if (emp != null) {
            return new String[]{
                    emp.getNombreCompleto() != null ? emp.getNombreCompleto() : "-",
                    emp.getCargo() != null ? emp.getCargo() : ""
            };
        }
        return new String[]{"-", ""};
    }

    private UUID obtenerEmpleadoIdPorUsuarioId(UUID usuarioId) {
        if (usuarioId == null) return null;
        return usuarioRepository.findById(usuarioId)
                .map(Usuario::getPersonaId)
                .flatMap(empleadoRepository::findFirstByPersonaId)
                .map(Empleado::getId)
                .orElse(null);
    }

    private UUID obtenerEmpleadoIdActual() {
        return securityUtils.getCurrentUserId()
                .flatMap(usuarioRepository::findById)
                .map(Usuario::getPersonaId)
                .flatMap(empleadoRepository::findFirstByPersonaId)
                .map(Empleado::getId)
                .orElse(null);
    }

    private ControlActivo obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Control de activo vehicular", id));
    }

    private ControlActivoResponse mapToResponse(ControlActivo controlActivo) {
        if (controlActivo == null) return null;
        List<ControlActivoResponse> responses = mapToResponses(List.of(controlActivo));
        return responses.isEmpty() ? null : responses.getFirst();
    }

    private List<ControlActivoResponse> mapToResponses(List<ControlActivo> controles) {
        if (controles == null || controles.isEmpty()) {
            return Collections.emptyList();
        }

        Set<UUID> accesorioIds = controles.stream()
                .filter(c -> c.getDetalles() != null)
                .flatMap(c -> c.getDetalles().stream())
                .map(ControlActivoDetalle::getAccesorioId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, ControlActivoDetalleResponse.AccesorioInfo> accesorioMap = Collections.emptyMap();
        if (!accesorioIds.isEmpty()) {
            accesorioMap = springAccesorioRepository.findAllById(accesorioIds).stream()
                    .collect(Collectors.toMap(
                            AccesorioEntity::getId,
                            acc -> new ControlActivoDetalleResponse.AccesorioInfo(acc.getId(), acc.getCodigo(), acc.getNombre()),
                            (a, b) -> a
                    ));
        }

        final Map<UUID, ControlActivoDetalleResponse.AccesorioInfo> finalMap = accesorioMap;

        return controles.stream().map(c -> {
            ControlActivoResponse base = mapper.toResponse(c);
            List<ControlActivoDetalleResponse> detallesResponse = Collections.emptyList();
            if (c.getDetalles() != null && !c.getDetalles().isEmpty()) {
                detallesResponse = c.getDetalles().stream().map(d -> new ControlActivoDetalleResponse(
                        d.getId(),
                        d.getControlActivoId(),
                        d.getAccesorioId() != null ? finalMap.get(d.getAccesorioId()) : null,
                        d.getCantidadEsperada(),
                        d.getCantidadEncontrada(),
                        d.isConforme(),
                        d.getObservacion()
                )).collect(Collectors.toList());
            }

            return new ControlActivoResponse(
                    base.id(),
                    base.solicitudVehicularId(),
                    base.asignacionVehicularId(),
                    base.activoId(),
                    base.tipo(),
                    base.recibidoPorId(),
                    base.fecha(),
                    base.conforme(),
                    base.observacion(),
                    detallesResponse,
                    base.auditoria()
            );
        }).collect(Collectors.toList());
    }
}
