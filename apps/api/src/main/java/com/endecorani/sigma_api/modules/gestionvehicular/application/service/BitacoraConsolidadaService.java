package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoValorEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringTipoActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.bitacora.response.BitacoraConsolidadaItemResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.bitacora.response.BitacoraConsolidadaReporteResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.reporte.BitacoraSalidaItemReporteDto;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SalidaVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SalidaVehicularEvento;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularEventoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.*;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.*;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.infrastructure.report.JasperReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Bitácora consolidada de vehículos (Formulario Oficial GA-IN7-04).
 * <p>
 * Une dos fuentes de información en un mismo formato de planilla:
 * <ol>
 *     <li><b>Bitácora de salidas</b>: {@code SalidaVehicular} + eventos de odómetro.</li>
 *     <li><b>Solicitudes vehiculares</b>: {@code SolicitudVehicular} → {@code AsignacionVehicular} → {@code ViajeVehicular}.</li>
 * </ol>
 * El combustible se asocia por vínculo directo (salida/viaje) o, en su defecto, por vehículo y fecha.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BitacoraConsolidadaService {

    public static final String ORIGEN_SALIDA = "SALIDA";
    public static final String ORIGEN_SOLICITUD = "SOLICITUD";

    private static final String REPORTE_BITACORA_SALIDAS_PATH = "reports/gestion-vehicular/bitacora_salidas_vehiculares.jrxml";
    private static final Pattern PLACA_PATTERN = Pattern.compile(
            "PLACA(?:\\s*(?:N[°o.]+|NRO\\.?|NUM\\.?|#))?[:\\s#.-]+([0-9A-Za-z]+(?:[\\s-][0-9A-Za-z]+)?)(?:\\s+(?:CHASIS|MOTOR|COLOR|MARCA|MODELO|AÑO|ANIO|TIPO)|[,;.]|\\s*$)",
            Pattern.CASE_INSENSITIVE
    );
    private static final ZoneId ZONA = ZoneId.of("America/La_Paz");
    private static final DateTimeFormatter FECHA_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final SalidaVehicularRepository salidaRepository;
    private final SalidaVehicularEventoRepository eventoRepository;
    private final SpringViajeVehicularRepository viajeVehicularRepository;
    private final SpringAsignacionVehicularRepository asignacionVehicularRepository;
    private final SpringSolicitudVehicularRepository solicitudVehicularRepository;
    private final SpringConductorRepository conductorRepository;
    private final SpringCargaCombustibleRepository cargaCombustibleRepository;
    private final SpringActivoRepository activoRepository;
    private final SpringTipoActivoRepository tipoActivoRepository;
    private final SpringActivoAtributoRepository activoAtributoRepository;
    private final SpringActivoAtributoValorRepository activoAtributoValorRepository;
    private final SpringVEmpleadoRepository vempleadoRepository;
    private final JasperReportService jasperReportService;

    // =====================================================================
    // CONSULTA
    // =====================================================================

    @Transactional(readOnly = true)
    public BitacoraConsolidadaReporteResponse generarReporte(
            UUID activoId,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            String search
    ) {
        validarParametros(fechaInicio, fechaFin);

        String searchNorm = (search != null && !search.isBlank()) ? search.trim() : null;
        LocalDateTime desdeLocal = fechaInicio.atStartOfDay();
        LocalDateTime hastaLocal = fechaFin.atTime(23, 59, 59, 999_999_999);
        Instant desdeInstant = desdeLocal.atZone(ZONA).toInstant();
        Instant hastaInstant = hastaLocal.atZone(ZONA).toInstant();

        // ---------- Fuente 1: Salidas vehiculares ----------
        List<SalidaVehicular> salidas = salidaRepository.findForReporte(
                searchNorm, activoId, null, null, desdeInstant, hastaInstant
        );

        // ---------- Fuente 2: Solicitudes vehiculares (vía viajes) ----------
        List<ViajeVehicularEntity> viajes = viajeVehicularRepository.findBitacoraViajes(
                activoId, desdeLocal, hastaLocal, null
        );

        Set<UUID> asignacionIds = viajes.stream()
                .map(ViajeVehicularEntity::getAsignacionVehicularId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<UUID, AsignacionVehicularEntity> asignacionMap = asignacionIds.isEmpty()
                ? Collections.emptyMap()
                : asignacionVehicularRepository.findAllById(asignacionIds).stream()
                .collect(Collectors.toMap(AsignacionVehicularEntity::getId, a -> a, (a, b) -> a));

        Set<UUID> solicitudIds = asignacionMap.values().stream()
                .map(AsignacionVehicularEntity::getSolicitudVehicularId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<UUID, SolicitudVehicularEntity> solicitudMap = solicitudIds.isEmpty()
                ? Collections.emptyMap()
                : solicitudVehicularRepository.findAllById(solicitudIds).stream()
                .collect(Collectors.toMap(SolicitudVehicularEntity::getId, s -> s, (a, b) -> a));

        // Filtrado por searchNorm si fue provisto
        if (searchNorm != null) {
            String q = searchNorm.toLowerCase(Locale.ROOT);
            viajes = viajes.stream().filter(v -> {
                AsignacionVehicularEntity a = asignacionMap.get(v.getAsignacionVehicularId());
                SolicitudVehicularEntity s = a != null ? solicitudMap.get(a.getSolicitudVehicularId()) : null;
                String desc = s != null ? ((s.getMotivo() != null ? s.getMotivo() : "") + " " + (s.getDestino() != null ? s.getDestino() : "")) : "";
                String obs = v.getObservacion() != null ? v.getObservacion() : "";
                String num = s != null && s.getNumero() != null ? s.getNumero() : "";
                return desc.toLowerCase(Locale.ROOT).contains(q)
                        || obs.toLowerCase(Locale.ROOT).contains(q)
                        || num.toLowerCase(Locale.ROOT).contains(q);
            }).toList();
        }

        Set<UUID> conductorIds = asignacionMap.values().stream()
                .map(AsignacionVehicularEntity::getConductorId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<UUID, ConductorEntity> conductorMap = conductorIds.isEmpty()
                ? Collections.emptyMap()
                : conductorRepository.findAllById(conductorIds).stream()
                .collect(Collectors.toMap(ConductorEntity::getId, c -> c, (a, b) -> a));

        // ---------- Vehículos (placas / códigos) ----------
        Set<UUID> activoIds = new HashSet<>();
        salidas.forEach(s -> { if (s.getActivoId() != null) activoIds.add(s.getActivoId()); });
        asignacionMap.values().forEach(a -> { if (a.getActivoId() != null) activoIds.add(a.getActivoId()); });
        if (activoId != null) activoIds.add(activoId);

        Map<UUID, ActivoEntity> activosMap = activoIds.isEmpty()
                ? Collections.emptyMap()
                : activoRepository.findAllById(activoIds).stream()
                .collect(Collectors.toMap(ActivoEntity::getId, a -> a, (a, b) -> a));
        Map<UUID, Map<String, String>> atributosMap = obtenerAtributosVehiculosBatch(activoIds);
        Map<UUID, String> placasPorActivo = resolverPlacas(activoIds, activosMap, atributosMap);

        // ---------- Empleados (conductores) ----------
        Set<UUID> empleadoIds = new HashSet<>();
        salidas.forEach(s -> { if (s.getEmpleadoId() != null) empleadoIds.add(s.getEmpleadoId()); });
        conductorMap.values().forEach(c -> { if (c.getEmpleadoId() != null) empleadoIds.add(c.getEmpleadoId()); });
        Map<UUID, String> nombresMap = empleadoIds.isEmpty()
                ? Collections.emptyMap()
                : vempleadoRepository.findAllById(empleadoIds).stream()
                .collect(Collectors.toMap(VEmpleadoEntity::getEmpleadoId, VEmpleadoEntity::getNombreCompleto, (a, b) -> a));

        // ---------- Eventos de odómetro de salidas ----------
        List<UUID> salidaIds = salidas.stream().map(SalidaVehicular::getId).toList();
        Map<UUID, List<SalidaVehicularEvento>> eventosPorSalida = salidaIds.isEmpty()
                ? Collections.emptyMap()
                : eventoRepository.findBySalidaVehicularIdIn(salidaIds).stream()
                .collect(Collectors.groupingBy(SalidaVehicularEvento::getSalidaVehicularId));

        // ---------- Combustible ----------
        List<CargaCombustibleEntity> cargas = obtenerCargas(activoId, desdeLocal, hastaLocal, salidaIds);
        Map<UUID, List<CargaCombustibleEntity>> cargasPorSalida = cargas.stream()
                .filter(c -> c.getSalidaVehicularId() != null)
                .collect(Collectors.groupingBy(CargaCombustibleEntity::getSalidaVehicularId));
        Map<UUID, List<CargaCombustibleEntity>> cargasPorViaje = cargas.stream()
                .filter(c -> c.getViajeVehicularId() != null)
                .collect(Collectors.groupingBy(CargaCombustibleEntity::getViajeVehicularId));
        List<CargaCombustibleEntity> cargasSinVinculo = cargas.stream()
                .filter(c -> c.getSalidaVehicularId() == null && c.getViajeVehicularId() == null)
                .toList();
        Set<UUID> cargasLibresUsadas = new HashSet<>();

        List<BitacoraConsolidadaItemResponse> items = new ArrayList<>();

        // ---------- Construcción de filas: SALIDAS ----------
        for (SalidaVehicular s : salidas) {
            Instant fechaInst = s.getFecha() != null ? s.getFecha() : s.getCreatedAt();
            LocalDateTime fechaLocal = fechaInst != null ? LocalDateTime.ofInstant(fechaInst, ZONA) : null;

            Long[] km = calcularKmSalida(eventosPorSalida.getOrDefault(s.getId(), Collections.emptyList()));
            Long kmSalida = km[0];
            Long kmLlegada = km[1];

            List<CargaCombustibleEntity> cargasFila = new ArrayList<>(cargasPorSalida.getOrDefault(s.getId(), Collections.emptyList()));
            if (cargasFila.isEmpty()) {
                cargasFila.addAll(tomarCargasLibres(cargasSinVinculo, cargasLibresUsadas, s.getActivoId(), fechaLocal));
            }

            items.add(construirItem(
                    s.getId(),
                    ORIGEN_SALIDA,
                    s.getNumero(),
                    fechaInst,
                    fechaLocal,
                    s.getDescripcionActividad(),
                    kmSalida,
                    kmLlegada,
                    cargasFila,
                    nombresMap.get(s.getEmpleadoId()),
                    s.getObservaciones(),
                    s.getEstado(),
                    s.getActivoId(),
                    placasPorActivo,
                    activosMap
            ));
        }

        // ---------- Construcción de filas: SOLICITUDES ----------
        for (ViajeVehicularEntity viaje : viajes) {
            AsignacionVehicularEntity asignacion = asignacionMap.get(viaje.getAsignacionVehicularId());
            SolicitudVehicularEntity solicitud = asignacion != null ? solicitudMap.get(asignacion.getSolicitudVehicularId()) : null;
            ConductorEntity conductor = asignacion != null ? conductorMap.get(asignacion.getConductorId()) : null;
            UUID vehiculoId = asignacion != null ? asignacion.getActivoId() : null;

            LocalDateTime fechaLocal = viaje.getFechaSalidaReal() != null
                    ? viaje.getFechaSalidaReal()
                    : (asignacion != null && asignacion.getFechaAsignacion() != null
                    ? asignacion.getFechaAsignacion()
                    : (solicitud != null ? solicitud.getFechaSalida() : null));
            if (fechaLocal == null && viaje.getCreatedAt() != null) {
                fechaLocal = LocalDateTime.ofInstant(viaje.getCreatedAt(), ZONA);
            }
            Instant fechaInst = fechaLocal != null ? fechaLocal.atZone(ZONA).toInstant() : null;

            List<CargaCombustibleEntity> cargasFila = new ArrayList<>(cargasPorViaje.getOrDefault(viaje.getId(), Collections.emptyList()));
            if (cargasFila.isEmpty()) {
                cargasFila.addAll(tomarCargasLibres(cargasSinVinculo, cargasLibresUsadas, vehiculoId, fechaLocal));
            }

            String conductorNombre = (conductor != null && conductor.getEmpleadoId() != null)
                    ? nombresMap.get(conductor.getEmpleadoId())
                    : null;

            String observaciones = primeroNoVacio(
                    viaje.getObservacion(),
                    solicitud != null ? solicitud.getObservacion() : null,
                    asignacion != null ? asignacion.getObservacion() : null
            );

            items.add(construirItem(
                    viaje.getId(),
                    ORIGEN_SOLICITUD,
                    solicitud != null ? solicitud.getNumero() : "S/N",
                    fechaInst,
                    fechaLocal,
                    construirDescripcionSolicitud(solicitud),
                    viaje.getKilometrajeSalida(),
                    viaje.getKilometrajeRetorno(),
                    cargasFila,
                    conductorNombre,
                    observaciones,
                    viaje.getEstado() != null ? viaje.getEstado().name() : (solicitud != null ? solicitud.getEstado() : null),
                    vehiculoId,
                    placasPorActivo,
                    activosMap
            ));
        }

        // Orden cronológico ascendente, igual que la libreta física
        items.sort(Comparator.comparing(
                BitacoraConsolidadaItemResponse::fecha,
                Comparator.nullsLast(Comparator.naturalOrder())
        ));

        long totalKm = items.stream().map(BitacoraConsolidadaItemResponse::kmRecorrido)
                .filter(Objects::nonNull).mapToLong(Long::longValue).sum();
        BigDecimal totalLitros = items.stream().map(BitacoraConsolidadaItemResponse::combustibleLitros)
                .filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);

        return BitacoraConsolidadaReporteResponse.builder()
                .totalRegistros(items.size())
                .totalSalidas(salidas.size())
                .totalSolicitudes(viajes.size())
                .totalKmRecorridos(totalKm)
                .totalLitrosCombustible(totalLitros)
                .items(items)
                .build();
    }

    // =====================================================================
    // PDF (mismo formato oficial GA-IN7-04)
    // =====================================================================

    @Transactional(readOnly = true)
    public byte[] generarReportePdf(
            UUID activoId,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            String search
    ) {
        BitacoraConsolidadaReporteResponse reporte = generarReporte(activoId, fechaInicio, fechaFin, search);

        String tipoVehiculo;
        String placaPrincipal;
        if (activoId != null) {
            ActivoEntity activo = activoRepository.findById(activoId).orElse(null);
            Map<String, String> attrs = obtenerAtributosVehiculosBatch(Set.of(activoId))
                    .getOrDefault(activoId, Collections.emptyMap());
            String placa = attrs.get("PLACA");
            if ((placa == null || placa.isBlank()) && activo != null) {
                placa = extractPlacaFromDescripcion(activo.getDescripcion());
            }
            placaPrincipal = (placa != null && !placa.isBlank()) ? placa : "-";
            String tipoActivoNombre = (activo != null && activo.getTipoActivoId() != null)
                    ? tipoActivoRepository.findById(activo.getTipoActivoId()).map(t -> t.getNombre()).orElse("CAMIONETA")
                    : "CAMIONETA";
            tipoVehiculo = Stream.of(tipoActivoNombre, attrs.get("MARCA"), attrs.get("MODELO"))
                    .filter(s -> s != null && !s.isBlank())
                    .collect(Collectors.joining(" "));
            if (tipoVehiculo.isBlank() && activo != null) {
                tipoVehiculo = activo.getNombre();
            }
        } else {
            tipoVehiculo = "TODOS LOS VEHÍCULOS (CONSOLIDADO)";
            placaPrincipal = "TODAS LAS PLACAS";
        }

        String conductorPrincipal = null;
        List<BitacoraSalidaItemReporteDto> dataSource = new ArrayList<>();
        for (BitacoraConsolidadaItemResponse it : reporte.items()) {
            if (conductorPrincipal == null && it.conductorNombre() != null && !"-".equals(it.conductorNombre())) {
                conductorPrincipal = it.conductorNombre();
            }
            String desc = it.descripcionActividad();
            if (activoId == null && it.vehiculoPlaca() != null && !it.vehiculoPlaca().isBlank() && !"S/P".equals(it.vehiculoPlaca())) {
                desc = "[" + it.vehiculoPlaca() + "] " + desc;
            }
            dataSource.add(BitacoraSalidaItemReporteDto.builder()
                    .id(it.id())
                    .dia(it.dia())
                    .fecha(it.fechaFormateada())
                    .descripcionActividad(desc)
                    .kmSalida(it.kmSalida())
                    .kmLlegada(it.kmLlegada())
                    .kmRecorrido(it.kmRecorrido())
                    .combustibleTexto(it.combustibleTexto())
                    .conductorNombre(it.conductorNombre())
                    .observaciones(it.observaciones())
                    .build());
        }

        Map<String, Object> parameters = new HashMap<>();
        try {
            ClassPathResource logoResource = new ClassPathResource("reports/images/logo-ende-corani.png");
            if (logoResource.exists()) {
                parameters.put("LOGO_EMPRESA", logoResource.getInputStream());
            }
        } catch (Exception e) {
            log.warn("No se pudo cargar el logo institucional: {}", e.getMessage());
        }

        String mes = fechaInicio.getMonth().getDisplayName(TextStyle.FULL, new Locale("es", "BO")).toUpperCase(Locale.ROOT);
        if (fechaInicio.getMonth() != fechaFin.getMonth()) {
            mes = mes + " - " + fechaFin.getMonth().getDisplayName(TextStyle.FULL, new Locale("es", "BO")).toUpperCase(Locale.ROOT);
        }
        BigDecimal totalLitros = reporte.totalLitrosCombustible() != null ? reporte.totalLitrosCombustible() : BigDecimal.ZERO;

        parameters.put("TITULO_REPORTE", "BITACORA DE VEHICULOS");
        parameters.put("FORMULARIO_CODIGO", "GA-IN7-04");
        parameters.put("FORMULARIO_VERSION", "01");
        parameters.put("VEHICULO_TIPO", tipoVehiculo != null && !tipoVehiculo.isBlank() ? tipoVehiculo : "TODOS LOS VEHÍCULOS");
        parameters.put("VEHICULO_PLACA", placaPrincipal);
        parameters.put("RESPONSABLE_VEH", conductorPrincipal != null ? conductorPrincipal : (activoId == null ? "VARIOS" : "-"));
        parameters.put("UBICACION", "CORANI");
        parameters.put("ANIO", String.valueOf(fechaInicio.getYear()));
        parameters.put("MES", mes);
        parameters.put("PERIODO_TEXTO", fechaInicio + " al " + fechaFin);
        parameters.put("TOTAL_SALIDAS", String.valueOf(reporte.totalRegistros()));
        parameters.put("TOTAL_KM", String.format("%,d", reporte.totalKmRecorridos() != null ? reporte.totalKmRecorridos() : 0L));
        parameters.put("TOTAL_LITROS", totalLitros.compareTo(BigDecimal.ZERO) > 0 ? totalLitros.stripTrailingZeros().toPlainString() + " lts" : "-");

        return jasperReportService.generatePdfReport(REPORTE_BITACORA_SALIDAS_PATH, parameters, dataSource);
    }

    // =====================================================================
    // HELPERS
    // =====================================================================

    private void validarParametros(LocalDate fechaInicio, LocalDate fechaFin) {
        if (fechaInicio == null) {
            throw new BusinessException("La fecha de inicio es obligatoria.");
        }
        if (fechaFin == null) {
            throw new BusinessException("La fecha de fin es obligatoria.");
        }
        if (fechaFin.isBefore(fechaInicio)) {
            throw new BusinessException("La fecha de fin no puede ser anterior a la fecha de inicio.");
        }
    }

    private BitacoraConsolidadaItemResponse construirItem(
            UUID id,
            String origen,
            String numero,
            Instant fechaInst,
            LocalDateTime fechaLocal,
            String descripcion,
            Long kmSalida,
            Long kmLlegada,
            List<CargaCombustibleEntity> cargasFila,
            String conductorNombre,
            String observaciones,
            String estado,
            UUID vehiculoId,
            Map<UUID, String> placasPorActivo,
            Map<UUID, ActivoEntity> activosMap
    ) {
        Long kmRecorrido = (kmSalida != null && kmLlegada != null && kmLlegada >= kmSalida)
                ? kmLlegada - kmSalida
                : null;

        String combustibleTexto = "-";
        BigDecimal litros = null;
        String facturas = null;
        if (!cargasFila.isEmpty()) {
            litros = cargasFila.stream()
                    .map(CargaCombustibleEntity::getLitros)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            String facts = cargasFila.stream()
                    .map(CargaCombustibleEntity::getNumeroFactura)
                    .filter(f -> f != null && !f.isBlank())
                    .map(String::trim)
                    .collect(Collectors.joining(", "));
            facturas = facts.isBlank() ? null : facts;
            combustibleTexto = litros.stripTrailingZeros().toPlainString() + " lts" + (facturas != null ? " / " + facturas : "");
        }

        ActivoEntity activo = vehiculoId != null ? activosMap.get(vehiculoId) : null;
        String placa = vehiculoId != null ? placasPorActivo.get(vehiculoId) : null;

        return BitacoraConsolidadaItemResponse.builder()
                .id(id)
                .origen(origen)
                .numero(numero != null ? numero : "-")
                .fecha(fechaInst)
                .dia(fechaLocal != null ? fechaLocal.getDayOfMonth() : null)
                .fechaFormateada(fechaLocal != null ? FECHA_FMT.format(fechaLocal) : "-")
                .descripcionActividad(descripcion != null && !descripcion.isBlank() ? descripcion.trim() : "-")
                .kmSalida(kmSalida)
                .kmLlegada(kmLlegada)
                .kmRecorrido(kmRecorrido)
                .combustibleTexto(combustibleTexto)
                .combustibleLitros(litros)
                .combustibleFactura(facturas)
                .conductorNombre(conductorNombre != null && !conductorNombre.isBlank() ? conductorNombre : "-")
                .observaciones(observaciones != null && !observaciones.isBlank() ? observaciones.trim() : "-")
                .estado(estado)
                .activoId(vehiculoId)
                .vehiculoPlaca(placa != null && !"S/P".equals(placa) ? placa : (activo != null ? activo.getCodigo() : null))
                .vehiculoCodigo(activo != null ? activo.getCodigo() : null)
                .build();
    }

    /**
     * Devuelve [kmSalida, kmLlegada] a partir de los eventos de odómetro de una salida.
     */
    private Long[] calcularKmSalida(List<SalidaVehicularEvento> eventos) {
        List<SalidaVehicularEvento> kmEvents = eventos.stream()
                .filter(e -> e.getKilometraje() != null)
                .sorted(Comparator.comparing(
                        (SalidaVehicularEvento e) -> e.getFechaHora() != null ? e.getFechaHora() : e.getCreatedAt(),
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .toList();

        if (kmEvents.isEmpty()) {
            return new Long[]{null, null};
        }

        Long kmSalida = kmEvents.stream()
                .filter(e -> e.getTipoEvento() != null && e.getTipoEvento().toUpperCase(Locale.ROOT).contains("SALIDA"))
                .findFirst()
                .map(e -> e.getKilometraje().longValue())
                .orElse(kmEvents.getFirst().getKilometraje().longValue());

        Long kmLlegada = kmEvents.stream()
                .filter(e -> e.getTipoEvento() != null && e.getTipoEvento().toUpperCase(Locale.ROOT).contains("LLEGADA"))
                .reduce((first, second) -> second)
                .map(e -> e.getKilometraje().longValue())
                .orElse(kmEvents.size() > 1 ? kmEvents.getLast().getKilometraje().longValue() : null);

        return new Long[]{kmSalida, kmLlegada};
    }

    private List<CargaCombustibleEntity> obtenerCargas(
            UUID activoId,
            LocalDateTime desde,
            LocalDateTime hasta,
            List<UUID> salidaIds
    ) {
        List<CargaCombustibleEntity> cargas = new ArrayList<>(activoId != null
                ? cargaCombustibleRepository.findByActivoIdAndFechaCargaBetween(activoId, desde, hasta)
                : cargaCombustibleRepository.findByFechaCargaBetweenOrderByFechaCargaAsc(desde, hasta));

        if (!salidaIds.isEmpty()) {
            Set<UUID> existentes = cargas.stream().map(CargaCombustibleEntity::getId).collect(Collectors.toSet());
            for (CargaCombustibleEntity c : cargaCombustibleRepository.findBySalidaVehicularIdIn(salidaIds)) {
                if (existentes.add(c.getId())) {
                    cargas.add(c);
                }
            }
        }
        return cargas;
    }

    /**
     * Toma las cargas sin vínculo directo del mismo vehículo y día, evitando reutilizarlas en otra fila.
     */
    private List<CargaCombustibleEntity> tomarCargasLibres(
            List<CargaCombustibleEntity> cargasSinVinculo,
            Set<UUID> usadas,
            UUID vehiculoId,
            LocalDateTime fechaLocal
    ) {
        if (vehiculoId == null || fechaLocal == null) {
            return Collections.emptyList();
        }
        LocalDate dia = fechaLocal.toLocalDate();
        List<CargaCombustibleEntity> encontradas = cargasSinVinculo.stream()
                .filter(c -> !usadas.contains(c.getId()))
                .filter(c -> vehiculoId.equals(c.getActivoId()))
                .filter(c -> c.getFechaCarga() != null && c.getFechaCarga().toLocalDate().isEqual(dia))
                .toList();
        encontradas.forEach(c -> usadas.add(c.getId()));
        return encontradas;
    }

    private String construirDescripcionSolicitud(SolicitudVehicularEntity solicitud) {
        if (solicitud == null) {
            return "Comisión de Servicio";
        }
        String motivo = solicitud.getMotivo() != null ? solicitud.getMotivo().trim() : "";
        String destino = solicitud.getDestino() != null ? solicitud.getDestino().trim() : "";
        if (!motivo.isEmpty() && !destino.isEmpty()) {
            return motivo + " - Destino: " + destino;
        }
        if (!motivo.isEmpty()) return motivo;
        if (!destino.isEmpty()) return destino;
        return "Comisión de Servicio";
    }

    private String primeroNoVacio(String... valores) {
        for (String v : valores) {
            if (v != null && !v.isBlank()) return v;
        }
        return null;
    }

    private Map<UUID, String> resolverPlacas(
            Set<UUID> activoIds,
            Map<UUID, ActivoEntity> activosMap,
            Map<UUID, Map<String, String>> atributosMap
    ) {
        Map<UUID, String> placas = new HashMap<>();
        for (UUID id : activoIds) {
            String pl = atributosMap.getOrDefault(id, Collections.emptyMap()).get("PLACA");
            if (pl == null || pl.isBlank()) {
                ActivoEntity act = activosMap.get(id);
                if (act != null) {
                    pl = extractPlacaFromDescripcion(act.getDescripcion());
                }
            }
            placas.put(id, (pl != null && !pl.isBlank()) ? pl : "S/P");
        }
        return placas;
    }

    private Map<UUID, Map<String, String>> obtenerAtributosVehiculosBatch(Set<UUID> activoIds) {
        if (activoIds == null || activoIds.isEmpty()) {
            return Collections.emptyMap();
        }
        List<ActivoAtributoValorEntity> valores = activoAtributoValorRepository.findByActivoIdIn(new ArrayList<>(activoIds));
        if (valores.isEmpty()) {
            return Collections.emptyMap();
        }

        Set<UUID> attrIds = valores.stream()
                .map(ActivoAtributoValorEntity::getActivoAtributoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<UUID, String> attrCodigos = attrIds.isEmpty()
                ? Collections.emptyMap()
                : activoAtributoRepository.findAllById(attrIds).stream()
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
            String clean = m.group(1).replaceAll("[,.;-]+$", "").trim();
            if (!clean.equalsIgnoreCase("NO") && !clean.equalsIgnoreCase("NRO") && clean.length() >= 2) {
                return clean;
            }
        }
        return null;
    }
}

