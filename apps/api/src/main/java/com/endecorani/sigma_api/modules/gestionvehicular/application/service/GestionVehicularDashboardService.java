package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoValorEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.EstadoOperativoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringEstadoOperativoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.dashboard.*;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoViajeVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.*;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.*;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GestionVehicularDashboardService {

    private static final Pattern PLACA_PATTERN = Pattern.compile("(?i)\\b(\\d{3,4}[A-Z]{3}|[A-Z]{2,3}\\d{3,4})\\b");

    private final SpringFlotaVehiculoRepository flotaVehiculoRepository;
    private final SpringViajeVehicularRepository viajeVehicularRepository;
    private final SpringSolicitudVehicularRepository solicitudVehicularRepository;
    private final SpringCargaCombustibleRepository cargaCombustibleRepository;
    private final SpringConductorRepository conductorRepository;
    private final SpringConductorLicenciaRepository conductorLicenciaRepository;
    private final SpringAsignacionVehicularRepository asignacionVehicularRepository;
    private final SpringActivoRepository activoRepository;
    private final SpringActivoAtributoValorRepository activoAtributoValorRepository;
    private final SpringActivoAtributoRepository activoAtributoRepository;
    private final SpringEstadoOperativoRepository estadoOperativoRepository;
    private final SpringVEmpleadoRepository vEmpleadoRepository;

    @Transactional(readOnly = true)
    public GestionVehicularDashboardResponse obtenerDashboard(int meses) {
        return obtenerDashboard(meses, null);
    }

    @Transactional(readOnly = true)
    public GestionVehicularDashboardResponse obtenerDashboard(int meses, UUID flotaId) {
        if (meses < 1) {
            meses = 6;
        }

        LocalDate hoy = LocalDate.now();
        YearMonth mesActual = YearMonth.from(hoy);

        // REQ-VEH-019: todas las lecturas están acotadas por flota/fecha y el
        // número de consultas es constante (no depende del número de meses).
        // 1. Obtener datos clave de flotas y vehículos
        List<FlotaVehiculoEntity> flotaVehiculos = (flotaId != null)
                ? flotaVehiculoRepository.findByFlotaVehicularId(flotaId)
                : flotaVehiculoRepository.findByActivoTrue();
        Set<UUID> vehiculoIds = flotaVehiculos.stream()
                .filter(FlotaVehiculoEntity::isActivo)
                .map(FlotaVehiculoEntity::getActivoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<ActivoEntity> activos = vehiculoIds.isEmpty() ? List.of() : activoRepository.findAllById(vehiculoIds);
        Map<UUID, ActivoEntity> activoMap = activos.stream().collect(Collectors.toMap(ActivoEntity::getId, a -> a));

        // 2. Estados operativos acotados a los activos de la flota
        Set<UUID> estadoOperativoIds = activos.stream()
                .map(ActivoEntity::getEstadoOperativoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<UUID, EstadoOperativoEntity> estadosOperativosMap = estadoOperativoIds.isEmpty()
                ? Map.of()
                : estadoOperativoRepository.findAllById(estadoOperativoIds).stream()
                        .collect(Collectors.toMap(EstadoOperativoEntity::getId, e -> e));

        // 3. Viajes y Asignaciones acotados a los vehículos de la flota
        List<AsignacionVehicularEntity> todasAsignaciones = vehiculoIds.isEmpty()
                ? List.of()
                : asignacionVehicularRepository.findByActivoIdIn(vehiculoIds);
        Map<UUID, AsignacionVehicularEntity> asignacionMap = todasAsignaciones.stream()
                .collect(Collectors.toMap(AsignacionVehicularEntity::getId, a -> a, (a, b) -> a));

        Set<UUID> asignacionIds = todasAsignaciones.stream()
                .map(AsignacionVehicularEntity::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        List<ViajeVehicularEntity> todosLosViajes = asignacionIds.isEmpty()
                ? List.of()
                : viajeVehicularRepository.findByAsignacionVehicularIdIn(asignacionIds);

        // Viajes activos en curso
        List<ViajeVehicularEntity> viajesEnCurso = todosLosViajes.stream()
                .filter(v -> v.getEstado() == EstadoViajeVehicular.EN_CURSO)
                .toList();

        Set<UUID> vehiculosEnViajeIds = viajesEnCurso.stream()
                .map(v -> asignacionMap.get(v.getAsignacionVehicularId()))
                .filter(Objects::nonNull)
                .map(AsignacionVehicularEntity::getActivoId)
                .collect(Collectors.toSet());

        // Asignaciones pendientes de viaje (PROGRAMADO)
        Set<UUID> vehiculosAsignadosProgramados = todosLosViajes.stream()
                .filter(v -> v.getEstado() == EstadoViajeVehicular.PROGRAMADO)
                .map(v -> asignacionMap.get(v.getAsignacionVehicularId()))
                .filter(Objects::nonNull)
                .map(AsignacionVehicularEntity::getActivoId)
                .collect(Collectors.toSet());

        // 4. Resolver metadatos de vehículos (placas, marca, modelo)
        Set<UUID> todosActivoIds = new HashSet<>(vehiculoIds);
        todasAsignaciones.forEach(a -> {
            if (a.getActivoId() != null && (flotaId == null || vehiculoIds.contains(a.getActivoId()))) {
                todosActivoIds.add(a.getActivoId());
            }
        });
        Map<UUID, VehiculoInfo> vehiculosInfoMap = resolverVehiculosInfo(todosActivoIds, activoMap);

        // 5. Conductores y Licencias acotados a la flota y a la ventana de alerta
        Set<UUID> conductorIdsDeFlota = todasAsignaciones.stream()
                .map(AsignacionVehicularEntity::getConductorId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<ConductorEntity> conductores = conductorIdsDeFlota.isEmpty()
                ? List.of()
                : new ArrayList<>(conductorRepository.findAllById(conductorIdsDeFlota));

        List<ConductorLicenciaEntity> licencias = conductorIdsDeFlota.isEmpty()
                ? List.of()
                : conductorLicenciaRepository.findByConductorIdInAndFechaVencimientoLessThanEqual(
                        conductorIdsDeFlota, hoy.plusDays(30));

        Map<UUID, ConductorEntity> conductorMap = conductores.stream()
                .collect(Collectors.toMap(ConductorEntity::getId, c -> c, (a, b) -> a));

        Set<UUID> empleadoIds = conductores.stream().map(ConductorEntity::getEmpleadoId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<UUID, VEmpleadoEntity> empleadoMap = empleadoIds.isEmpty() ? Map.of() :
                vEmpleadoRepository.findAllById(empleadoIds).stream()
                        .collect(Collectors.toMap(VEmpleadoEntity::getEmpleadoId, e -> e, (a, b) -> a));

        // 6. Solicitudes Vehiculares acotadas a las asignaciones de la flota
        Set<UUID> solicitudesDeFlota = todasAsignaciones.stream()
                .map(AsignacionVehicularEntity::getSolicitudVehicularId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<SolicitudVehicularEntity> todasSolicitudes = solicitudesDeFlota.isEmpty()
                ? List.of()
                : new ArrayList<>(solicitudVehicularRepository.findAllById(solicitudesDeFlota));

        Map<UUID, SolicitudVehicularEntity> solicitudMap = todasSolicitudes.stream()
                .collect(Collectors.toMap(SolicitudVehicularEntity::getId, s -> s, (a, b) -> a));

        // 7. Las cargas de combustible no se cargan en memoria: sus agregaciones
        //    se resuelven en SQL (GROUP BY) más abajo.

        // ==========================================
        // CÁLCULO DE KPIS
        // ==========================================
        int totalVehiculos = vehiculoIds.size();
        int vehiculosEnViajeCount = 0;
        int vehiculosEnMantenimientoCount = 0;
        int vehiculosAsignadosCount = 0;
        int vehiculosDisponiblesCount = 0;

        for (UUID activoId : vehiculoIds) {
            if (vehiculosEnViajeIds.contains(activoId)) {
                vehiculosEnViajeCount++;
            } else if (vehiculosAsignadosProgramados.contains(activoId)) {
                vehiculosAsignadosCount++;
            } else {
                ActivoEntity act = activoMap.get(activoId);
                if (act != null && act.getEstadoOperativoId() != null) {
                    EstadoOperativoEntity eo = estadosOperativosMap.get(act.getEstadoOperativoId());
                    String cod = eo != null && eo.getCodigo() != null ? eo.getCodigo().toUpperCase(Locale.ROOT) : "";
                    if (cod.contains("MANTENIMIENTO") || cod.contains("TALLER")) {
                        vehiculosEnMantenimientoCount++;
                        continue;
                    } else if (cod.contains("FUERA") || cod.contains("BAJA")) {
                        // fuera de servicio
                        continue;
                    }
                }
                vehiculosDisponiblesCount++;
            }
        }

        int totalConductores = conductores.size();
        int conductoresActivos = (int) conductores.stream().filter(ConductorEntity::isActivo).count();

        // Licencias por vencer (vencidas o a vencer en <= 30 días)
        List<AlertaLicenciaConductorDto> alertasLicencias = new ArrayList<>();
        int licenciasPorVencerCount = 0;
        for (ConductorLicenciaEntity lic : licencias) {
            if (lic.getFechaVencimiento() != null) {
                long dias = ChronoUnit.DAYS.between(hoy, lic.getFechaVencimiento());
                if (dias <= 30) {
                    licenciasPorVencerCount++;
                    ConductorEntity cond = conductorMap.get(lic.getConductorId());
                    VEmpleadoEntity emp = cond != null && cond.getEmpleadoId() != null ? empleadoMap.get(cond.getEmpleadoId()) : null;

                    String nivel = dias < 0 ? "VENCIDA" : (dias <= 7 ? "CRITICA" : "ADVERTENCIA");

                    alertasLicencias.add(AlertaLicenciaConductorDto.builder()
                            .conductorId(lic.getConductorId())
                            .conductorNombre(emp != null ? emp.getNombreCompleto() : "Conductor S/N")
                            .conductorCodigo(emp != null ? emp.getCodigo() : "-")
                            .numeroLicencia(lic.getNumeroLicencia())
                            .categoria(lic.getCategoriaLicencia())
                            .fechaVencimiento(lic.getFechaVencimiento())
                            .diasRestantes(dias)
                            .nivelAlerta(nivel)
                            .build());
                }
            }
        }
        alertasLicencias.sort(Comparator.comparingLong(AlertaLicenciaConductorDto::getDiasRestantes));

        // REQ-VEH-019: una sola consulta agrupada por periodo para cada módulo y
        // una sola para la distribución de solicitudes; el coste no crece con `meses`.
        List<YearMonth> periodos = new ArrayList<>();
        for (int i = meses - 1; i >= 0; i--) {
            periodos.add(mesActual.minusMonths(i));
        }
        LocalDateTime inicioPeriodos = periodos.get(0).atDay(1).atStartOfDay();
        LocalDateTime finPeriodos = mesActual.atEndOfMonth().atTime(23, 59, 59);
        Map<String, Object[]> viajesPorPeriodo = vehiculoIds.isEmpty() ? Map.of()
                : agruparPorPeriodo(viajeVehicularRepository.resumenMensualPorActivos(vehiculoIds, inicioPeriodos, finPeriodos));
        Map<String, Object[]> cargasPorPeriodo = vehiculoIds.isEmpty() ? Map.of()
                : agruparPorPeriodo(cargaCombustibleRepository.resumenMensualPorActivos(vehiculoIds, inicioPeriodos, finPeriodos));
        Map<String, Long> conteoEstadosSolicitud = solicitudesDeFlota.isEmpty() ? Map.of()
                : agruparConteo(solicitudVehicularRepository.contarPorEstado(solicitudesDeFlota));
        String periodoActual = mesActual.format(DateTimeFormatter.ofPattern("yyyy-MM"));

        int solicitudesPendientes = (int) (contarEn(conteoEstadosSolicitud, "PENDIENTE", "SOLICITADO", "BORRADOR"));
        int solicitudesAprobadas = (int) contarEn(conteoEstadosSolicitud, "APROBADA");
        int solicitudesEnCurso = (int) (contarEn(conteoEstadosSolicitud, "EN_CURSO", "EN_RUTA"));

        Object[] viajesMes = viajesPorPeriodo.getOrDefault(periodoActual, new Object[6]);
        Object[] cargasMes = cargasPorPeriodo.getOrDefault(periodoActual, new Object[4]);
        long kmMesActual = longEn(viajesMes, 5);
        BigDecimal litrosMesActual = decimalEn(cargasMes, 2);
        BigDecimal costoMesActual = decimalEn(cargasMes, 3);

        GestionVehicularKpisDto kpis = GestionVehicularKpisDto.builder()
                .totalVehiculosFlota(totalVehiculos)
                .vehiculosDisponibles(vehiculosDisponiblesCount)
                .vehiculosEnViaje(vehiculosEnViajeCount)
                .vehiculosEnMantenimiento(vehiculosEnMantenimientoCount)
                .vehiculosAsignados(vehiculosAsignadosCount)
                .totalConductores(totalConductores)
                .conductoresActivos(conductoresActivos)
                .licenciasPorVencer(licenciasPorVencerCount)
                .solicitudesPendientes(solicitudesPendientes)
                .solicitudesAprobadas(solicitudesAprobadas)
                .solicitudesEnCurso(solicitudesEnCurso)
                .viajesMesActual((int) longEn(viajesMes, 1))
                .viajesEnCurso(viajesEnCurso.size())
                .kmRecorridosMesActual(kmMesActual)
                .combustibleLitrosMesActual(litrosMesActual.setScale(2, RoundingMode.HALF_UP))
                .combustibleCostoMesActual(costoMesActual.setScale(2, RoundingMode.HALF_UP))
                .build();

        // ==========================================
        // TENDENCIA MENSUAL (ÚLTIMOS N MESES) — aggregates de SQL
        // ==========================================
        List<TendenciaViajesDto> tendenciaViajesYKm = new ArrayList<>();
        List<TendenciaCombustibleDto> tendenciaCombustible = new ArrayList<>();

        for (YearMonth ym : periodos) {
            String label = obtenerMesNombre(ym.getMonthValue()) + " " + ym.getYear();
            String periodoStr = ym.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            Object[] viajes = viajesPorPeriodo.getOrDefault(periodoStr, new Object[6]);
            Object[] cargas = cargasPorPeriodo.getOrDefault(periodoStr, new Object[4]);

            tendenciaViajesYKm.add(TendenciaViajesDto.builder()
                    .periodo(periodoStr)
                    .mesLabel(label)
                    .totalViajes((int) longEn(viajes, 1))
                    .completados((int) longEn(viajes, 2))
                    .cancelados((int) longEn(viajes, 3))
                    .enCurso((int) longEn(viajes, 4))
                    .totalKmRecorridos(longEn(viajes, 5))
                    .build());

            tendenciaCombustible.add(TendenciaCombustibleDto.builder()
                    .periodo(periodoStr)
                    .mesLabel(label)
                    .totalLitros(decimalEn(cargas, 2).setScale(2, RoundingMode.HALF_UP))
                    .totalCosto(decimalEn(cargas, 3).setScale(2, RoundingMode.HALF_UP))
                    .cantidadCargas((int) longEn(cargas, 1))
                    .build());
        }

        // ==========================================
        // DISTRIBUCIÓN ESTADO FLOTA (DONUT)
        // ==========================================
        List<DistribucionEstadoDto> distribucionFlota = new ArrayList<>();
        if (totalVehiculos > 0) {
            distribucionFlota.add(crearDistribucion("DISPONIBLE", "Disponibles", vehiculosDisponiblesCount, totalVehiculos, "#10B981"));
            distribucionFlota.add(crearDistribucion("EN_VIAJE", "En Viaje", vehiculosEnViajeCount, totalVehiculos, "#3B82F6"));
            distribucionFlota.add(crearDistribucion("ASIGNADO", "Asignados / Prog.", vehiculosAsignadosCount, totalVehiculos, "#8B5CF6"));
            distribucionFlota.add(crearDistribucion("MANTENIMIENTO", "Mantenimiento", vehiculosEnMantenimientoCount, totalVehiculos, "#F59E0B"));
            int inactivos = Math.max(0, totalVehiculos - (vehiculosDisponiblesCount + vehiculosEnViajeCount + vehiculosAsignadosCount + vehiculosEnMantenimientoCount));
            if (inactivos > 0) {
                distribucionFlota.add(crearDistribucion("FUERA_SERVICIO", "Fuera de Servicio", inactivos, totalVehiculos, "#EF4444"));
            }
        }

        // ==========================================
        // DISTRIBUCIÓN SOLICITUDES
        // ==========================================
        List<DistribucionEstadoDto> distribucionSolicitudes = new ArrayList<>();
        int totalSol = todasSolicitudes.size();
        if (totalSol > 0) {
            Map<String, Long> agrupadoSol = conteoEstadosSolicitud;

            distribucionSolicitudes.add(crearDistribucion("BORRADOR", "Borradores", agrupadoSol.getOrDefault("BORRADOR", 0L).intValue(), totalSol, "#64748B"));
            distribucionSolicitudes.add(crearDistribucion("PENDIENTE", "Pendientes", (agrupadoSol.getOrDefault("PENDIENTE", 0L).intValue() + agrupadoSol.getOrDefault("SOLICITADO", 0L).intValue()), totalSol, "#F59E0B"));
            distribucionSolicitudes.add(crearDistribucion("APROBADA", "Aprobadas", agrupadoSol.getOrDefault("APROBADA", 0L).intValue(), totalSol, "#6366F1"));
            distribucionSolicitudes.add(crearDistribucion("EN_CURSO", "En Curso", (agrupadoSol.getOrDefault("EN_CURSO", 0L).intValue() + agrupadoSol.getOrDefault("EN_RUTA", 0L).intValue()), totalSol, "#3B82F6"));
            distribucionSolicitudes.add(crearDistribucion("FINALIZADA", "Finalizadas", agrupadoSol.getOrDefault("FINALIZADA", 0L).intValue(), totalSol, "#10B981"));
            distribucionSolicitudes.add(crearDistribucion("RECHAZADA", "Rechazadas/Canc.", (agrupadoSol.getOrDefault("RECHAZADA", 0L).intValue() + agrupadoSol.getOrDefault("CANCELADA", 0L).intValue()), totalSol, "#EF4444"));
        }

        // ==========================================
        // TOP 5 VEHÍCULOS POR RECORRIDO (KM) — GROUP BY en SQL
        // ==========================================
        List<Object[]> topKmRows = vehiculoIds.isEmpty() ? List.of() : viajeVehicularRepository.topActivosPorKm(vehiculoIds);
        List<TopVehiculoKmDto> topVehiculosRecorrido = topKmRows.stream()
                .map(row -> {
                    UUID actId = uuidEn(row[0]);
                    VehiculoInfo info = vehiculosInfoMap.getOrDefault(actId, new VehiculoInfo("-", "-", "Vehículo"));
                    return TopVehiculoKmDto.builder()
                            .activoId(actId)
                            .codigo(info.codigo)
                            .placa(info.placa)
                            .marcaModelo(info.marcaModelo)
                            .totalKmRecorridos(longEn(row, 2))
                            .cantidadViajes((int) longEn(row, 1))
                            .build();
                })
                .toList();

        // ==========================================
        // TOP 5 VEHÍCULOS POR COMBUSTIBLE — GROUP BY en SQL
        // ==========================================
        List<Object[]> topCombustibleRows = vehiculoIds.isEmpty() ? List.of()
                : cargaCombustibleRepository.topActivosPorCosto(vehiculoIds);
        List<TopVehiculoCombustibleDto> topVehiculosCombustible = topCombustibleRows.stream()
                .map(row -> {
                    UUID actId = uuidEn(row[0]);
                    VehiculoInfo info = vehiculosInfoMap.getOrDefault(actId, new VehiculoInfo("-", "-", "Vehículo"));
                    return TopVehiculoCombustibleDto.builder()
                            .activoId(actId)
                            .codigo(info.codigo)
                            .placa(info.placa)
                            .marcaModelo(info.marcaModelo)
                            .totalLitros(decimalEn(row, 2).setScale(2, RoundingMode.HALF_UP))
                            .totalCosto(decimalEn(row, 3).setScale(2, RoundingMode.HALF_UP))
                            .cantidadCargas((int) longEn(row, 1))
                            .build();
                })
                .toList();

        // ==========================================
        // VIAJES ACTIVOS / RECIENTES
        // ==========================================
        List<ViajeVehicularEntity> viajesParaFeed = new ArrayList<>(viajesEnCurso);
        // Si hay pocos viajes en curso, rellenar con los viajes más recientes
        todosLosViajes.stream()
                .filter(v -> v.getEstado() != EstadoViajeVehicular.EN_CURSO)
                .sorted(Comparator.comparing(this::getFechaReferencia).reversed())
                .limit(Math.max(0, 6 - viajesParaFeed.size()))
                .forEach(viajesParaFeed::add);

        List<ViajeActivoRecienteDto> viajesActivosRecientes = viajesParaFeed.stream()
                .map(v -> {
                    AsignacionVehicularEntity asig = asignacionMap.get(v.getAsignacionVehicularId());
                    SolicitudVehicularEntity sol = asig != null && asig.getSolicitudVehicularId() != null
                            ? solicitudMap.get(asig.getSolicitudVehicularId())
                            : null;
                    VehiculoInfo veh = asig != null && asig.getActivoId() != null
                            ? vehiculosInfoMap.getOrDefault(asig.getActivoId(), new VehiculoInfo("-", "-", "Vehículo"))
                            : new VehiculoInfo("-", "-", "Vehículo");
                    ConductorEntity cond = asig != null && asig.getConductorId() != null
                            ? conductorMap.get(asig.getConductorId())
                            : null;
                    VEmpleadoEntity emp = cond != null && cond.getEmpleadoId() != null
                            ? empleadoMap.get(cond.getEmpleadoId())
                            : null;

                    LocalDateTime fechaSalidaCalc = v.getFechaSalidaReal() != null
                            ? v.getFechaSalidaReal()
                            : (sol != null && sol.getFechaSalida() != null ? sol.getFechaSalida() : toLocalDateTime(v.getCreatedAt()));

                    return ViajeActivoRecienteDto.builder()
                            .viajeId(v.getId())
                            .solicitudId(sol != null ? sol.getId() : null)
                            .numeroSolicitud(sol != null ? sol.getNumero() : "-")
                            .motivo(sol != null ? sol.getMotivo() : "-")
                            .destino(sol != null ? sol.getDestino() : "-")
                            .activoId(asig != null ? asig.getActivoId() : null)
                            .vehiculoCodigo(veh.codigo)
                            .placa(veh.placa)
                            .marcaModelo(veh.marcaModelo)
                            .conductorId(cond != null ? cond.getId() : null)
                            .conductorNombre(emp != null ? emp.getNombreCompleto() : "Conductor Asignado")
                            .fechaSalida(fechaSalidaCalc)
                            .fechaRetornoEstimada(sol != null ? sol.getFechaRetornoEstimada() : null)
                            .estado(v.getEstado() != null ? v.getEstado().name() : "PROGRAMADO")
                            .kilometrajeSalida(v.getKilometrajeSalida())
                            .build();
                })
                .toList();

        return GestionVehicularDashboardResponse.builder()
                .kpis(kpis)
                .tendenciaViajesYKm(tendenciaViajesYKm)
                .tendenciaCombustible(tendenciaCombustible)
                .distribucionFlota(distribucionFlota)
                .distribucionSolicitudes(distribucionSolicitudes)
                .topVehiculosRecorrido(topVehiculosRecorrido)
                .topVehiculosCombustible(topVehiculosCombustible)
                .viajesActivosRecientes(viajesActivosRecientes)
                .alertasLicencias(alertasLicencias)
                .build();
    }

    /** REQ-VEH-019: helpers tolerantes a los tipos numéricos devueltos por PostgreSQL. */
    private Map<String, Object[]> agruparPorPeriodo(List<Object[]> rows) {
        Map<String, Object[]> resultado = new HashMap<>();
        for (Object[] row : rows) {
            if (row != null && row.length > 0 && row[0] != null) {
                resultado.put(row[0].toString(), row);
            }
        }
        return resultado;
    }

    private Map<String, Long> agruparConteo(List<Object[]> rows) {
        Map<String, Long> resultado = new HashMap<>();
        for (Object[] row : rows) {
            if (row != null && row.length > 1 && row[0] != null) {
                resultado.merge(row[0].toString(), longEn(row, 1), Long::sum);
            }
        }
        return resultado;
    }

    private long contarEn(Map<String, Long> conteos, String... claves) {
        long total = 0;
        for (String clave : claves) {
            total += conteos.getOrDefault(clave, 0L);
        }
        return total;
    }

    private long longEn(Object[] row, int indice) {
        if (row == null || indice >= row.length || !(row[indice] instanceof Number numero)) {
            return 0L;
        }
        return numero.longValue();
    }

    private BigDecimal decimalEn(Object[] row, int indice) {
        if (row == null || indice >= row.length || row[indice] == null) {
            return BigDecimal.ZERO;
        }
        if (row[indice] instanceof BigDecimal decimal) {
            return decimal;
        }
        if (row[indice] instanceof Number numero) {
            return BigDecimal.valueOf(numero.doubleValue());
        }
        return new BigDecimal(row[indice].toString());
    }

    private UUID uuidEn(Object valor) {
        if (valor instanceof UUID uuid) {
            return uuid;
        }
        return UUID.fromString(valor.toString());
    }

    private LocalDateTime toLocalDateTime(Instant instant) {
        if (instant == null) return null;
        return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
    }

    private LocalDateTime getFechaReferencia(ViajeVehicularEntity v) {
        if (v.getFechaSalidaReal() != null) return v.getFechaSalidaReal();
        if (v.getCreatedAt() != null) return toLocalDateTime(v.getCreatedAt());
        return LocalDateTime.MIN;
    }

    private DistribucionEstadoDto crearDistribucion(String clave, String label, int cantidad, int total, String color) {
        double pct = total > 0 ? (cantidad * 100.0) / total : 0.0;
        return DistribucionEstadoDto.builder()
                .clave(clave)
                .label(label)
                .cantidad(cantidad)
                .porcentaje(Math.round(pct * 10.0) / 10.0)
                .color(color)
                .build();
    }

    private String obtenerMesNombre(int mes) {
        return switch (mes) {
            case 1 -> "Ene";
            case 2 -> "Feb";
            case 3 -> "Mar";
            case 4 -> "Abr";
            case 5 -> "May";
            case 6 -> "Jun";
            case 7 -> "Jul";
            case 8 -> "Ago";
            case 9 -> "Sep";
            case 10 -> "Oct";
            case 11 -> "Nov";
            case 12 -> "Dic";
            default -> "Mes " + mes;
        };
    }

    private Map<UUID, VehiculoInfo> resolverVehiculosInfo(Set<UUID> activoIds, Map<UUID, ActivoEntity> activoMapPreloaded) {
        if (activoIds.isEmpty()) {
            return Map.of();
        }

        Map<UUID, ActivoEntity> activos = new HashMap<>(activoMapPreloaded);
        Set<UUID> faltantes = activoIds.stream().filter(id -> !activos.containsKey(id)).collect(Collectors.toSet());
        if (!faltantes.isEmpty()) {
            activoRepository.findAllById(faltantes).forEach(a -> activos.put(a.getId(), a));
        }

        List<ActivoAtributoValorEntity> valores = activoAtributoValorRepository.findByActivoIdIn(activoIds);
        Map<UUID, List<ActivoAtributoValorEntity>> valoresPorActivo = valores.stream()
                .collect(Collectors.groupingBy(ActivoAtributoValorEntity::getActivoId));

        Set<UUID> attrIds = valores.stream().map(ActivoAtributoValorEntity::getActivoAtributoId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<UUID, ActivoAtributoEntity> defMap = attrIds.isEmpty() ? Map.of() :
                activoAtributoRepository.findAllById(attrIds).stream()
                        .collect(Collectors.toMap(ActivoAtributoEntity::getId, a -> a, (a, b) -> a));

        Map<UUID, VehiculoInfo> result = new HashMap<>();
        for (UUID actId : activoIds) {
            ActivoEntity a = activos.get(actId);
            String codigo = a != null && a.getCodigo() != null ? a.getCodigo() : "ACT-" + actId.toString().substring(0, 6);
            String placa = null;
            String marca = null;
            String modelo = null;

            List<ActivoAtributoValorEntity> listaValores = valoresPorActivo.getOrDefault(actId, List.of());
            for (ActivoAtributoValorEntity v : listaValores) {
                ActivoAtributoEntity def = defMap.get(v.getActivoAtributoId());
                if (def != null && def.getCodigo() != null && v.getValor() != null && !v.getValor().isBlank()) {
                    String cod = def.getCodigo().trim().toUpperCase(Locale.ROOT);
                    if ("PLACA".equals(cod)) {
                        placa = v.getValor().trim();
                    } else if ("MARCA".equals(cod)) {
                        marca = v.getValor().trim();
                    } else if ("MODELO".equals(cod)) {
                        modelo = v.getValor().trim();
                    }
                }
            }

            if (placa == null && a != null && a.getDescripcion() != null) {
                Matcher matcher = PLACA_PATTERN.matcher(a.getDescripcion());
                if (matcher.find()) {
                    placa = matcher.group(1).trim();
                }
            }

            String marcaModelo = (marca != null ? marca : "") + (modelo != null ? (marca != null ? " " : "") + modelo : "");
            if (marcaModelo.isBlank()) {
                marcaModelo = a != null && a.getNombre() != null ? a.getNombre() : "Vehículo";
            }

            result.put(actId, new VehiculoInfo(codigo, placa != null ? placa : codigo, marcaModelo));
        }

        return result;
    }

    private record VehiculoInfo(String codigo, String placa, String marcaModelo) {}
}
