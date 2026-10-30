package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoValorEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.TipoActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringTipoActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.reporte.ReporteSolicitudItemDto;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.reporte.ReporteSolicitudesGeneralResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.reporte.SolicitudItemPdfDto;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.AsignacionVehicularEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorLicenciaEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.SolicitudVehicularEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.TipoSolicitudVehicularEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringAsignacionVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringConductorRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringSolicitudVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringTipoSolicitudVehicularRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.shared.infrastructure.report.JasperReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SolicitudVehicularReporteService {

    private static final String REPORTE_SOLICITUDES_PATH = "reports/gestion-vehicular/reporte_solicitudes_vehiculares.jrxml";
    private static final Pattern PLACA_PATTERN = Pattern.compile("PLACA[:\\s#-]+([0-9A-Za-z]+(?:[\\s-][0-9A-Za-z]+)*)", Pattern.CASE_INSENSITIVE);

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter DATE_ONLY_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final SpringSolicitudVehicularRepository solicitudRepository;
    private final SpringAsignacionVehicularRepository asignacionRepository;
    private final SpringTipoSolicitudVehicularRepository tipoSolicitudRepository;
    private final SpringVEmpleadoRepository vempleadoRepository;
    private final SpringActivoRepository activoRepository;
    private final SpringTipoActivoRepository tipoActivoRepository;
    private final SpringActivoAtributoRepository activoAtributoRepository;
    private final SpringActivoAtributoValorRepository activoAtributoValorRepository;
    private final SpringConductorRepository conductorRepository;
    private final JasperReportService jasperReportService;

    @Transactional(readOnly = true)
    public ReporteSolicitudesGeneralResponse generarReporteGeneral(
            String search,
            UUID activoId,
            UUID solicitanteId,
            UUID conductorId,
            UUID tipoSolicitudVehicularId,
            String estado,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta
    ) {
        List<SolicitudVehicularEntity> solicitudes = solicitudRepository.findForReporte(
                search, activoId, solicitanteId, conductorId, tipoSolicitudVehicularId, estado, fechaDesde, fechaHasta
        );

        if (solicitudes.isEmpty()) {
            return ReporteSolicitudesGeneralResponse.builder()
                    .totalSolicitudes(0)
                    .solicitudesBorrador(0)
                    .solicitudesPendientes(0)
                    .solicitudesAsignadas(0)
                    .solicitudesEnCurso(0)
                    .solicitudesFinalizadas(0)
                    .solicitudesRechazadas(0)
                    .totalPasajeros(0)
                    .items(Collections.emptyList())
                    .build();
        }

        // 1. Recolectar IDs de solicitudes para buscar asignaciones
        List<UUID> solicitudIds = solicitudes.stream().map(SolicitudVehicularEntity::getId).toList();
        List<AsignacionVehicularEntity> asignaciones = asignacionRepository.findBySolicitudVehicularIdIn(solicitudIds);

        // Agrupar asignaciones por solicitud (tomando la más reciente si hubiera varias)
        Map<UUID, AsignacionVehicularEntity> asignacionPorSolicitud = new HashMap<>();
        for (AsignacionVehicularEntity asig : asignaciones) {
            AsignacionVehicularEntity actual = asignacionPorSolicitud.get(asig.getSolicitudVehicularId());
            if (actual == null || (asig.getFechaAsignacion() != null && actual.getFechaAsignacion() != null
                    && asig.getFechaAsignacion().isAfter(actual.getFechaAsignacion()))) {
                asignacionPorSolicitud.put(asig.getSolicitudVehicularId(), asig);
            }
        }

        // 2. Recolectar todos los IDs foráneos para resolución en lote
        Set<UUID> tipoSolicitudIds = solicitudes.stream()
                .map(SolicitudVehicularEntity::getTipoSolicitudVehicularId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> solicitanteIds = solicitudes.stream()
                .map(SolicitudVehicularEntity::getSolicitanteId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> responsableIds = solicitudes.stream()
                .map(SolicitudVehicularEntity::getResponsableAsignacionId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> conductorIds = new HashSet<>();
        solicitudes.stream().map(SolicitudVehicularEntity::getConductorAsignadoId).filter(Objects::nonNull).forEach(conductorIds::add);
        asignaciones.stream().map(AsignacionVehicularEntity::getConductorId).filter(Objects::nonNull).forEach(conductorIds::add);

        Set<UUID> activoIds = new HashSet<>();
        solicitudes.stream().map(SolicitudVehicularEntity::getActivoId).filter(Objects::nonNull).forEach(activoIds::add);
        asignaciones.stream().map(AsignacionVehicularEntity::getActivoId).filter(Objects::nonNull).forEach(activoIds::add);

        Set<UUID> asignadoPorIds = asignaciones.stream()
                .map(AsignacionVehicularEntity::getAsignadoPorId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // 3. Consultas en lote
        Map<UUID, TipoSolicitudVehicularEntity> tipoMap = tipoSolicitudIds.isEmpty() ? Collections.emptyMap()
                : tipoSolicitudRepository.findAllById(tipoSolicitudIds).stream()
                .collect(Collectors.toMap(TipoSolicitudVehicularEntity::getId, t -> t, (a, b) -> a));

        Map<UUID, ConductorEntity> conductorMap = conductorIds.isEmpty() ? Collections.emptyMap()
                : conductorRepository.findAllById(conductorIds).stream()
                .collect(Collectors.toMap(ConductorEntity::getId, c -> c, (a, b) -> a));

        Set<UUID> allEmpleadoIds = new HashSet<>(solicitanteIds);
        allEmpleadoIds.addAll(responsableIds);
        allEmpleadoIds.addAll(asignadoPorIds);
        conductorMap.values().stream().map(ConductorEntity::getEmpleadoId).filter(Objects::nonNull).forEach(allEmpleadoIds::add);

        Map<UUID, VEmpleadoEntity> empleadoMap = allEmpleadoIds.isEmpty() ? Collections.emptyMap()
                : vempleadoRepository.findAllById(allEmpleadoIds).stream()
                .collect(Collectors.toMap(VEmpleadoEntity::getEmpleadoId, e -> e, (a, b) -> a));

        Map<UUID, ActivoEntity> activoMap = activoIds.isEmpty() ? Collections.emptyMap()
                : activoRepository.findAllById(activoIds).stream()
                .collect(Collectors.toMap(ActivoEntity::getId, a -> a, (a, b) -> a));

        Set<UUID> tipoActivoIds = activoMap.values().stream().map(ActivoEntity::getTipoActivoId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<UUID, String> tipoActivoNombres = tipoActivoIds.isEmpty() ? Collections.emptyMap()
                : tipoActivoRepository.findAllById(tipoActivoIds).stream()
                .collect(Collectors.toMap(TipoActivoEntity::getId, TipoActivoEntity::getNombre, (a, b) -> a));

        Map<UUID, Map<String, String>> atributosActivos = obtenerAtributosVehiculosBatch(activoIds);

        // 4. Mapear items
        long borrador = 0;
        long pendientes = 0;
        long asignadas = 0;
        long enCurso = 0;
        long finalizadas = 0;
        long rechazadas = 0;
        long totalPasajeros = 0;

        List<ReporteSolicitudItemDto> items = new ArrayList<>();

        for (SolicitudVehicularEntity s : solicitudes) {
            String est = s.getEstado() != null ? s.getEstado().toUpperCase(Locale.ROOT) : "";
            if (est.contains("BORRADOR")) {
                borrador++;
            } else if (est.contains("SOLICITAD") || est.contains("PENDIENTE")) {
                pendientes++;
            } else if (est.contains("ASIGNAD")) {
                asignadas++;
            } else if (est.contains("CURSO") || est.contains("VIAJE")) {
                enCurso++;
            } else if (est.contains("FINALIZ")) {
                finalizadas++;
            } else if (est.contains("RECHAZ") || est.contains("CANCEL") || est.contains("OBSERV")) {
                rechazadas++;
            }

            if (s.getCantidadPasajeros() != null && s.getCantidadPasajeros() > 0) {
                totalPasajeros += s.getCantidadPasajeros();
            }

            // Datos solicitante
            VEmpleadoEntity solEmp = s.getSolicitanteId() != null ? empleadoMap.get(s.getSolicitanteId()) : null;
            TipoSolicitudVehicularEntity tipo = s.getTipoSolicitudVehicularId() != null ? tipoMap.get(s.getTipoSolicitudVehicularId()) : null;

            // Datos asignación
            AsignacionVehicularEntity asig = asignacionPorSolicitud.get(s.getId());
            VEmpleadoEntity asigPorEmp = (asig != null && asig.getAsignadoPorId() != null) ? empleadoMap.get(asig.getAsignadoPorId()) : null;

            // Activo asignado (de asignación o solicitud)
            UUID actId = asig != null && asig.getActivoId() != null ? asig.getActivoId() : s.getActivoId();
            ActivoEntity act = actId != null ? activoMap.get(actId) : null;
            Map<String, String> attrs = actId != null ? atributosActivos.getOrDefault(actId, Collections.emptyMap()) : Collections.emptyMap();
            String placa = attrs.get("PLACA");
            if ((placa == null || placa.isBlank()) && act != null) {
                placa = extractPlacaFromDescripcion(act.getDescripcion());
            }
            String tipoVehiculoNombre = (act != null && act.getTipoActivoId() != null)
                    ? tipoActivoNombres.getOrDefault(act.getTipoActivoId(), "VEHICULO")
                    : "VEHICULO";

            // Conductor asignado (de asignación o solicitud)
            UUID condId = asig != null && asig.getConductorId() != null ? asig.getConductorId() : s.getConductorAsignadoId();
            ConductorEntity cond = condId != null ? conductorMap.get(condId) : null;
            VEmpleadoEntity condEmp = (cond != null && cond.getEmpleadoId() != null) ? empleadoMap.get(cond.getEmpleadoId())
                    : (condId != null ? empleadoMap.get(condId) : null);

            String licencia = null;
            String categoria = null;
            if (cond != null && cond.getLicencias() != null && !cond.getLicencias().isEmpty()) {
                ConductorLicenciaEntity lic = cond.getLicencias().getFirst();
                licencia = lic.getNumeroLicencia();
                categoria = lic.getCategoriaLicencia();
            }

            LocalDateTime fechaSol = s.getCreatedAt() != null
                    ? LocalDateTime.ofInstant(s.getCreatedAt(), ZoneId.of("America/La_Paz"))
                    : null;

            items.add(ReporteSolicitudItemDto.builder()
                    .id(s.getId())
                    .numero(s.getNumero())
                    .fechaSolicitud(fechaSol)
                    .fechaSalida(s.getFechaSalida())
                    .fechaRetornoEstimada(s.getFechaRetornoEstimada())
                    .cantidadPasajeros(s.getCantidadPasajeros())
                    .motivo(s.getMotivo())
                    .justificacion(s.getJustificacion())
                    .destino(s.getDestino())
                    .observacion(s.getObservacion())
                    .estado(s.getEstado())
                    // Solicitante
                    .solicitanteId(s.getSolicitanteId())
                    .solicitanteCodigo(solEmp != null ? solEmp.getCodigo() : null)
                    .solicitanteNombre(solEmp != null ? solEmp.getNombreCompleto() : null)
                    .solicitanteCargo(solEmp != null ? solEmp.getCargo() : null)
                    .solicitanteArea(solEmp != null ? solEmp.getArea() : null)
                    // Tipo
                    .tipoSolicitudId(s.getTipoSolicitudVehicularId())
                    .tipoSolicitudCodigo(tipo != null ? tipo.getCodigo() : null)
                    .tipoSolicitudNombre(tipo != null ? tipo.getNombre() : null)
                    // Asignación
                    .asignacionId(asig != null ? asig.getId() : null)
                    .fechaAsignacion(asig != null ? asig.getFechaAsignacion() : null)
                    .asignadoPorNombre(asigPorEmp != null ? asigPorEmp.getNombreCompleto() : null)
                    .observacionAsignacion(asig != null ? asig.getObservacion() : null)
                    // Activo
                    .activoId(actId)
                    .activoCodigo(act != null ? act.getCodigo() : null)
                    .activoNombre(act != null ? act.getNombre() : null)
                    .activoPlaca(placa)
                    .activoMarca(attrs.get("MARCA"))
                    .activoModelo(attrs.get("MODELO"))
                    .activoTipo(tipoVehiculoNombre)
                    // Conductor
                    .conductorId(condId)
                    .conductorEmpleadoId(cond != null ? cond.getEmpleadoId() : null)
                    .conductorNombre(condEmp != null ? condEmp.getNombreCompleto() : null)
                    .conductorLicencia(licencia)
                    .conductorCategoria(categoria)
                    .build());
        }

        return ReporteSolicitudesGeneralResponse.builder()
                .totalSolicitudes(solicitudes.size())
                .solicitudesBorrador(borrador)
                .solicitudesPendientes(pendientes)
                .solicitudesAsignadas(asignadas)
                .solicitudesEnCurso(enCurso)
                .solicitudesFinalizadas(finalizadas)
                .solicitudesRechazadas(rechazadas)
                .totalPasajeros(totalPasajeros)
                .items(items)
                .build();
    }

    @Transactional(readOnly = true)
    public byte[] generarReportePdf(
            String search,
            UUID activoId,
            UUID solicitanteId,
            UUID conductorId,
            UUID tipoSolicitudVehicularId,
            String estado,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta
    ) {
        ReporteSolicitudesGeneralResponse reporte = generarReporteGeneral(
                search, activoId, solicitanteId, conductorId, tipoSolicitudVehicularId, estado, fechaDesde, fechaHasta
        );

        Map<String, Object> parameters = new HashMap<>();
        try {
            ClassPathResource logoResource = new ClassPathResource("reports/images/logo-ende-corani.png");
            if (logoResource.exists()) {
                parameters.put("LOGO_EMPRESA", logoResource.getInputStream());
            }
        } catch (Exception e) {
            log.warn("No se pudo cargar el logo institucional: {}", e.getMessage());
        }

        String periodoTexto = (fechaDesde != null && fechaHasta != null)
                ? fechaDesde.toLocalDate() + " al " + fechaHasta.toLocalDate()
                : (fechaDesde != null ? "Desde " + fechaDesde.toLocalDate() : "TODOS LOS REGISTROS");

        String vehiculoFiltro = "TODOS LOS VEHÍCULOS";
        if (activoId != null) {
            Optional<ActivoEntity> actOpt = activoRepository.findById(activoId);
            if (actOpt.isPresent()) {
                vehiculoFiltro = actOpt.get().getNombre() + " (" + actOpt.get().getCodigo() + ")";
            }
        }

        parameters.put("TITULO_REPORTE", "REPORTE DE SOLICITUDES Y ASIGNACIONES VEHICULARES");
        parameters.put("FORMULARIO_CODIGO", "GV-REP-01");
        parameters.put("FORMULARIO_VERSION", "01");
        parameters.put("PERIODO_TEXTO", periodoTexto);
        parameters.put("FILTRO_VEHICULO", vehiculoFiltro);
        parameters.put("FILTRO_ESTADO", estado != null && !estado.isBlank() ? estado.toUpperCase(Locale.ROOT) : "TODOS");
        parameters.put("TOTAL_SOLICITUDES", String.valueOf(reporte.getTotalSolicitudes()));
        parameters.put("TOTAL_ASIGNADAS", String.valueOf(reporte.getSolicitudesAsignadas() + reporte.getSolicitudesEnCurso()));
        parameters.put("TOTAL_PASAJEROS", String.valueOf(reporte.getTotalPasajeros()));

        List<SolicitudItemPdfDto> pdfItems = reporte.getItems().stream().map(item -> {
            String fechaSolStr = item.getFechaSolicitud() != null ? DATE_ONLY_FORMATTER.format(item.getFechaSolicitud()) : "-";
            String fechaSalidaStr = item.getFechaSalida() != null ? DATE_TIME_FORMATTER.format(item.getFechaSalida()) : "-";
            String fechaRetornoStr = item.getFechaRetornoEstimada() != null ? DATE_TIME_FORMATTER.format(item.getFechaRetornoEstimada()) : "-";

            String solicitanteStr = (item.getSolicitanteNombre() != null ? item.getSolicitanteNombre() : "-");
            if (item.getSolicitanteArea() != null && !item.getSolicitanteArea().isBlank()) {
                solicitanteStr += "\n(" + item.getSolicitanteArea() + ")";
            }

            String destinoMotivo = (item.getDestino() != null ? item.getDestino() : "-")
                    + (item.getMotivo() != null && !item.getMotivo().isBlank() ? "\n" + item.getMotivo() : "");

            String vehiculoStr = "-";
            if (item.getActivoPlaca() != null && !item.getActivoPlaca().isBlank()) {
                vehiculoStr = item.getActivoPlaca() + (item.getActivoModelo() != null ? " - " + item.getActivoModelo() : "");
            } else if (item.getActivoNombre() != null) {
                vehiculoStr = item.getActivoNombre();
            }

            String conductorStr = item.getConductorNombre() != null ? item.getConductorNombre() : "PENDIENTE";
            if (item.getConductorLicencia() != null && !item.getConductorLicencia().isBlank()) {
                conductorStr += " (" + item.getConductorLicencia() + ")";
            }

            return SolicitudItemPdfDto.builder()
                    .numero(item.getNumero())
                    .fechaSolicitud(fechaSolStr)
                    .fechaSalida(fechaSalidaStr)
                    .fechaRetorno(fechaRetornoStr)
                    .solicitante(solicitanteStr)
                    .tipoSolicitud(item.getTipoSolicitudNombre() != null ? item.getTipoSolicitudNombre() : "-")
                    .destinoMotivo(destinoMotivo)
                    .pasajeros(item.getCantidadPasajeros() != null ? item.getCantidadPasajeros() : 0)
                    .vehiculo(vehiculoStr)
                    .conductor(conductorStr)
                    .estado(item.getEstado() != null ? item.getEstado() : "-")
                    .asignadoPor(item.getAsignadoPorNombre() != null ? item.getAsignadoPorNombre() : "-")
                    .build();
        }).toList();

        return jasperReportService.generatePdfReport(REPORTE_SOLICITUDES_PATH, parameters, pdfItems);
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
                .filter(a -> a.getCodigo() != null)
                .collect(Collectors.toMap(ActivoAtributoEntity::getId, a -> a.getCodigo().toUpperCase(Locale.ROOT), (a, b) -> a));

        Map<UUID, Map<String, String>> result = new HashMap<>();
        for (ActivoAtributoValorEntity v : valores) {
            String codigo = attrCodigos.get(v.getActivoAtributoId());
            if (codigo != null && v.getValor() != null && !v.getValor().isBlank()) {
                result.computeIfAbsent(v.getActivoId(), k -> new HashMap<>()).put(codigo, v.getValor().trim());
            }
        }
        return result;
    }

    private String extractPlacaFromDescripcion(String descripcion) {
        if (descripcion == null || descripcion.isBlank()) return null;
        Matcher m = PLACA_PATTERN.matcher(descripcion);
        if (m.find()) {
            return m.group(1).trim();
        }
        return null;
    }
}

