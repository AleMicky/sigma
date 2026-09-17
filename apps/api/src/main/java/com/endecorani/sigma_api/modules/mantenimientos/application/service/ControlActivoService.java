package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.AccesorioEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringAccesorioRepository;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.reporte.ControlActivoAccesorioReporteDto;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.request.ControlActivoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.request.ControlActivoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.response.ControlActivoDetalleResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.response.ControlActivoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ControlActivoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ControlActivo;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ControlActivoDetalle;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ControlActivoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoRepository;
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
import java.util.ArrayList;
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
    private final ControlActivoMapper mapper;
    private final SpringAccesorioRepository springAccesorioRepository;
    private final JasperReportService jasperReportService;
    private final SecurityUtils securityUtils;
    private final UsuarioRepository usuarioRepository;
    private final EmpleadoRepository empleadoRepository;
    private final SpringVEmpleadoRepository springVEmpleadoRepository;
    private final SolicitudMantenimientoRepository solicitudRepository;
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
    public List<ControlActivoResponse> findBySolicitudMantenimientoId(UUID solicitudMantenimientoId) {
        return mapToResponses(repository.findBySolicitudMantenimientoId(solicitudMantenimientoId));
    }

    @Transactional(readOnly = true)
    public List<ControlActivoResponse> findByOrdenTrabajoId(UUID ordenTrabajoId) {
        return mapToResponses(repository.findByOrdenTrabajoId(ordenTrabajoId));
    }

    @Transactional(readOnly = true)
    public List<ControlActivoResponse> findByActivoId(UUID activoId) {
        return mapToResponses(repository.findByActivoId(activoId));
    }

    @Transactional(readOnly = true)
    public byte[] generarReportePdf(UUID id) {
        ControlActivoResponse control = findById(id);
        if (control == null) {
            throw new ResourceNotFoundException("Control de activo", id);
        }

        // Consultar solicitud de mantenimiento vinculada
        SolicitudMantenimiento solicitud = null;
        if (control.solicitudMantenimientoId() != null) {
            solicitud = solicitudRepository.findById(control.solicitudMantenimientoId()).orElse(null);
        }

        // Consultar activo vinculado
        UUID activoId = control.activoId();
        if (activoId == null && solicitud != null && solicitud.getActivo() != null) {
            activoId = solicitud.getActivo().getId();
        }
        Activo activo = activoId != null ? activoRepository.findById(activoId).orElse(null) : null;

        // Consultar datos de intervinientes (Entregado por y Recibido por)
        String entregadoPorNombre = "-";
        String entregadoPorCargo = "";
        if (control.entregadoPorId() != null) {
            VEmpleadoEntity ve = springVEmpleadoRepository.findById(control.entregadoPorId()).orElse(null);
            if (ve != null) {
                entregadoPorNombre = ve.getNombreCompleto() != null ? ve.getNombreCompleto() : "-";
                entregadoPorCargo = ve.getCargo() != null ? ve.getCargo() : "";
            } else {
                Empleado emp = empleadoRepository.findById(control.entregadoPorId()).orElse(null);
                if (emp != null) {
                    entregadoPorNombre = emp.getNombreCompleto() != null ? emp.getNombreCompleto() : "-";
                    entregadoPorCargo = emp.getCargo() != null ? emp.getCargo() : "";
                }
            }
        }

        String recibidoPorNombre = "-";
        String recibidoPorCargo = "";
        if (control.recibidoPorId() != null) {
            VEmpleadoEntity ve = springVEmpleadoRepository.findById(control.recibidoPorId()).orElse(null);
            if (ve != null) {
                recibidoPorNombre = ve.getNombreCompleto() != null ? ve.getNombreCompleto() : "-";
                recibidoPorCargo = ve.getCargo() != null ? ve.getCargo() : "";
            } else {
                Empleado emp = empleadoRepository.findById(control.recibidoPorId()).orElse(null);
                if (emp != null) {
                    recibidoPorNombre = emp.getNombreCompleto() != null ? emp.getNombreCompleto() : "-";
                    recibidoPorCargo = emp.getCargo() != null ? emp.getCargo() : "";
                }
            }
        }

        // Determinar títulos según el tipo de control (ENTREGA vs DEVOLUCIÓN)
        boolean isEntrega = control.tipo() == null || control.tipo() == com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoControlActivo.ENTREGA;
        String tipoActa = isEntrega ? "ACTA DE ENTREGA" : "ACTA DE DEVOLUCIÓN";
        String tituloReporte = isEntrega ? "ACTA DE ENTREGA DE CONTROL DE ACTIVO" : "ACTA DE DEVOLUCIÓN DE CONTROL DE ACTIVO";

        // Parámetros JasperReports
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("TITULO_REPORTE", tituloReporte);
        parameters.put("TIPO_ACTA", tipoActa);
        parameters.put("NUMERO_SOLICITUD", solicitud != null && solicitud.getNumero() != null ? solicitud.getNumero() : "S/N");
        parameters.put("TITULO_SOLICITUD", solicitud != null && solicitud.getTitulo() != null ? solicitud.getTitulo() : "-");
        parameters.put("ACTIVO_CODIGO", activo != null && activo.getCodigo() != null ? activo.getCodigo() : (solicitud != null && solicitud.getActivo() != null ? solicitud.getActivo().getCodigo() : "-"));
        parameters.put("ACTIVO_NOMBRE", activo != null && activo.getNombre() != null ? activo.getNombre() : (solicitud != null && solicitud.getActivo() != null ? solicitud.getActivo().getNombre() : "-"));
        parameters.put("FECHA_ACTA", control.fecha() != null ? control.fecha().format(FORMATTER_FECHA_HORA) : "-");
        parameters.put("ESTADO_CONFORMIDAD", Boolean.TRUE.equals(control.conforme()) ? "CONFORME" : "NO CONFORME");
        parameters.put("ENTREGADO_POR", entregadoPorNombre);
        parameters.put("ENTREGADO_CARGO", entregadoPorCargo);
        parameters.put("RECIBIDO_POR", recibidoPorNombre);
        parameters.put("RECIBIDO_CARGO", recibidoPorCargo);
        parameters.put("OBSERVACION_GENERAL", control.observacion() != null ? control.observacion() : "");
        parameters.put("FECHA_EMISION", LocalDateTime.now().format(FORMATTER_FECHA_HORA));

        // Usuario generador
        String usuarioGenerador = securityUtils.getCurrentUsername();
        UUID currentEmpId = obtenerEmpleadoIdActual();
        if (currentEmpId != null) {
            Empleado emp = empleadoRepository.findById(currentEmpId).orElse(null);
            if (emp != null && emp.getNombreCompleto() != null && !emp.getNombreCompleto().isBlank()) {
                usuarioGenerador = emp.getNombreCompleto() + (emp.getCargo() != null && !emp.getCargo().isBlank() ? " - " + emp.getCargo() : "");
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
            log.warn("No se pudo cargar el logo para el reporte de control de activo: {}", e.getMessage());
        }

        // Lista de accesorios para el datasource del reporte
        List<ControlActivoAccesorioReporteDto> dataSourceList = new ArrayList<>();
        if (control.detalles() != null && !control.detalles().isEmpty()) {
            int idx = 1;
            for (ControlActivoDetalleResponse det : control.detalles()) {
                String accCodigo = det.accesorio() != null && det.accesorio().codigo() != null ? det.accesorio().codigo() : "-";
                String accNombre = det.accesorio() != null && det.accesorio().nombre() != null ? det.accesorio().nombre() : "Accesorio";
                dataSourceList.add(ControlActivoAccesorioReporteDto.builder()
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

    private UUID obtenerEmpleadoIdActual() {
        return securityUtils.getCurrentUserId()
                .flatMap(usuarioRepository::findById)
                .map(Usuario::getPersonaId)
                .flatMap(empleadoRepository::findFirstByPersonaId)
                .map(Empleado::getId)
                .orElse(null);
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

    private ControlActivo obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Control de activo", id));
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
                    base.solicitudMantenimientoId(),
                    base.ordenTrabajoId(),
                    base.activoId(),
                    base.tipo(),
                    base.entregadoPorId(),
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
