package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.activos.application.service.AccesorioLookupService;
import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
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
import com.endecorani.sigma_api.modules.organizacion.application.service.EmpleadoInfoResolver;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.infrastructure.report.controlactivo.ControlActivoAccesorioReporteItem;
import com.endecorani.sigma_api.shared.infrastructure.report.controlactivo.ControlActivoActaReportData;
import com.endecorani.sigma_api.shared.infrastructure.report.controlactivo.ControlActivoActaReportGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service("gestionVehicularControlActivoService")
@RequiredArgsConstructor
public class ControlActivoService {

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
    private final AccesorioLookupService accesorioLookupService;
    private final ControlActivoActaReportGenerator actaReportGenerator;
    private final EmpleadoInfoResolver empleadoInfoResolver;
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

        SolicitudVehicularEntity solicitud = control.solicitudVehicularId() != null
                ? springSolicitudVehicularRepository.findById(control.solicitudVehicularId()).orElse(null)
                : null;

        AsignacionVehicularEntity asignacion = resolverAsignacion(control, solicitud);

        UUID activoId = control.activoId();
        if (activoId == null && asignacion != null) {
            activoId = asignacion.getActivoId();
        }
        Activo activo = activoId != null ? activoRepository.findById(activoId).orElse(null) : null;

        boolean isEntrega = control.tipo() == null || control.tipo() == TipoControlActivo.ENTREGA;
        String tituloReporte = isEntrega
                ? "ACTA DE ENTREGA DE VEHÍCULO"
                : "ACTA DE DEVOLUCIÓN DE VEHÍCULO";

        UUID responsableFlotaId = resolverResponsableFlotaId(control, asignacion);
        UUID receptorConductorId = resolverConductorOSolicitanteId(control, asignacion, solicitud);

        UUID entregadoPorId = isEntrega ? responsableFlotaId : receptorConductorId;
        UUID recibidoPorId = isEntrega ? receptorConductorId : responsableFlotaId;

        EmpleadoInfoResolver.EmpleadoResumen entregado = empleadoInfoResolver.resolveById(entregadoPorId);
        EmpleadoInfoResolver.EmpleadoResumen recibido = empleadoInfoResolver.resolveById(recibidoPorId);

        ControlActivoActaReportData reportData = ControlActivoActaReportData.builder()
                .controlId(id)
                .entrega(isEntrega)
                .tituloReporte(tituloReporte)
                .numeroSolicitud(solicitud != null ? solicitud.getNumero() : null)
                .tituloSolicitud(formatearDetalleSolicitud(solicitud))
                .activoCodigo(activo != null ? activo.getCodigo() : null)
                .activoNombre(activo != null ? activo.getNombre() : null)
                .fechaActa(control.fecha())
                .conforme(control.conforme())
                .entregadoPorNombre(entregado.nombreCompleto())
                .entregadoPorCargo(entregado.cargo())
                .recibidoPorNombre(recibido.nombreCompleto())
                .recibidoPorCargo(recibido.cargo())
                .observacionGeneral(control.observacion())
                .generadoPor(empleadoInfoResolver.resolveCurrentGeneradoPor())
                .accesorios(construirAccesoriosReporte(control.detalles()))
                .build();

        return actaReportGenerator.generarPdf(reportData);
    }

    private AsignacionVehicularEntity resolverAsignacion(
            ControlActivoResponse control,
            SolicitudVehicularEntity solicitud
    ) {
        if (control.asignacionVehicularId() != null) {
            return springAsignacionVehicularRepository.findById(control.asignacionVehicularId()).orElse(null);
        }
        if (solicitud != null) {
            List<AsignacionVehicularEntity> asignaciones =
                    springAsignacionVehicularRepository.findBySolicitudVehicularId(solicitud.getId());
            if (asignaciones != null && !asignaciones.isEmpty()) {
                return asignaciones.getFirst();
            }
        }
        return null;
    }

    private UUID resolverResponsableFlotaId(
            ControlActivoResponse control,
            AsignacionVehicularEntity asignacion
    ) {
        if (asignacion != null && asignacion.getAsignadoPorId() != null) {
            return asignacion.getAsignadoPorId();
        }
        if (control.auditoria() != null && control.auditoria().createdById() != null) {
            return empleadoInfoResolver.resolveEmpleadoIdByUsuarioId(control.auditoria().createdById()).orElse(null);
        }
        return null;
    }

    private UUID resolverConductorOSolicitanteId(
            ControlActivoResponse control,
            AsignacionVehicularEntity asignacion,
            SolicitudVehicularEntity solicitud
    ) {
        if (control.recibidoPorId() != null) {
            return control.recibidoPorId();
        }
        if (asignacion != null && asignacion.getConductorId() != null) {
            ConductorEntity conductor = springConductorRepository.findById(asignacion.getConductorId()).orElse(null);
            if (conductor != null) {
                return conductor.getEmpleadoId();
            }
        }
        if (solicitud != null && solicitud.getSolicitanteId() != null) {
            return solicitud.getSolicitanteId();
        }
        return null;
    }

    private String formatearDetalleSolicitud(SolicitudVehicularEntity solicitud) {
        if (solicitud == null) {
            return "-";
        }
        StringBuilder sb = new StringBuilder();
        if (solicitud.getMotivo() != null && !solicitud.getMotivo().isBlank()) {
            sb.append(solicitud.getMotivo().trim());
        }
        if (solicitud.getDestino() != null && !solicitud.getDestino().isBlank()) {
            if (!sb.isEmpty()) {
                sb.append(" | ");
            }
            sb.append("Destino: ").append(solicitud.getDestino().trim());
        }
        return !sb.isEmpty() ? sb.toString() : "-";
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

        Map<UUID, AccesorioLookupService.AccesorioResumen> accesorioMap = accesorioLookupService.findMapByIds(accesorioIds);

        return controles.stream().map(c -> {
            ControlActivoResponse base = mapper.toResponse(c);
            List<ControlActivoDetalleResponse> detallesResponse = Collections.emptyList();
            if (c.getDetalles() != null && !c.getDetalles().isEmpty()) {
                detallesResponse = c.getDetalles().stream().map(d -> {
                    AccesorioLookupService.AccesorioResumen acc = d.getAccesorioId() != null
                            ? accesorioMap.get(d.getAccesorioId())
                            : null;
                    ControlActivoDetalleResponse.AccesorioInfo accesorioInfo = acc != null
                            ? new ControlActivoDetalleResponse.AccesorioInfo(acc.id(), acc.codigo(), acc.nombre())
                            : null;
                    return new ControlActivoDetalleResponse(
                            d.getId(),
                            d.getControlActivoId(),
                            accesorioInfo,
                            d.getCantidadEsperada(),
                            d.getCantidadEncontrada(),
                            d.isConforme(),
                            d.getObservacion()
                    );
                }).collect(Collectors.toList());
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

    private List<ControlActivoAccesorioReporteItem> construirAccesoriosReporte(List<ControlActivoDetalleResponse> detalles) {
        if (detalles == null || detalles.isEmpty()) {
            return Collections.emptyList();
        }
        List<ControlActivoAccesorioReporteItem> items = new ArrayList<>(detalles.size());
        int idx = 1;
        for (ControlActivoDetalleResponse det : detalles) {
            String accCodigo = det.accesorio() != null && det.accesorio().codigo() != null ? det.accesorio().codigo() : "-";
            String accNombre = det.accesorio() != null && det.accesorio().nombre() != null ? det.accesorio().nombre() : "Accesorio";
            items.add(ControlActivoAccesorioReporteItem.builder()
                    .numero(idx++)
                    .codigo(accCodigo)
                    .nombre(accNombre)
                    .cantidadEsperada(det.cantidadEsperada() != null ? det.cantidadEsperada() : 0)
                    .cantidadEncontrada(det.cantidadEncontrada() != null ? det.cantidadEncontrada() : 0)
                    .estadoConformidad(det.conforme() ? "CONFORME" : "OBSERVADO")
                    .observacion(det.observacion() != null ? det.observacion() : "-")
                    .build());
        }
        return items;
    }
}
