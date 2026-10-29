package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoValorEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringTipoActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.reporte.BitacoraSalidaItemReporteDto;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.response.*;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.BitacoraVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SalidaVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SalidaVehicularEvento;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.BitacoraVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularEventoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.CargaCombustibleEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringCargaCombustibleRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.infrastructure.report.JasperReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class SalidaVehicularReporteService {

    private static final String REPORTE_BITACORA_SALIDAS_PATH = "reports/gestion-vehicular/bitacora_salidas_vehiculares.jrxml";
    private static final Pattern PLACA_PATTERN = Pattern.compile("PLACA[:\\s#-]+([0-9A-Za-z]+(?:[\\s-][0-9A-Za-z]+)*)", Pattern.CASE_INSENSITIVE);

    private final SalidaVehicularRepository salidaRepository;
    private final SalidaVehicularEventoRepository eventoRepository;
    private final BitacoraVehicularRepository bitacoraRepository;
    private final SalidaVehicularService salidaService;
    private final SpringActivoRepository activoRepository;
    private final SpringTipoActivoRepository tipoActivoRepository;
    private final SpringActivoAtributoRepository activoAtributoRepository;
    private final SpringActivoAtributoValorRepository activoAtributoValorRepository;
    private final SpringVEmpleadoRepository vempleadoRepository;
    private final SpringCargaCombustibleRepository cargaCombustibleRepository;
    private final JasperReportService jasperReportService;

    @Transactional(readOnly = true)
    public ReporteSalidasGeneralResponse generarReporteGeneral(
            String search,
            UUID activoId,
            UUID empleadoId,
            String estado,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta
    ) {
        Instant instantDesde = fechaDesde != null ? fechaDesde.toInstant(ZoneOffset.UTC) : null;
        Instant instantHasta = fechaHasta != null ? fechaHasta.toInstant(ZoneOffset.UTC) : null;

        List<SalidaVehicular> salidas = salidaRepository.findForReporte(
                search, activoId, empleadoId, estado, instantDesde, instantHasta
        );

        long activas = salidas.stream().filter(s -> {
            String est = s.getEstado() != null ? s.getEstado().toUpperCase() : "";
            return !est.contains("LLEGAD") && !est.contains("FINALIZ") && !est.contains("CANCEL");
        }).count();

        long finalizadas = salidas.stream().filter(s -> {
            String est = s.getEstado() != null ? s.getEstado().toUpperCase() : "";
            return est.contains("LLEGAD") || est.contains("FINALIZ");
        }).count();

        long canceladas = salidas.stream().filter(s -> {
            String est = s.getEstado() != null ? s.getEstado().toUpperCase() : "";
            return est.contains("CANCEL");
        }).count();

        List<SalidaVehicularResponse> items = salidaService.mapListToResponse(salidas);

        return ReporteSalidasGeneralResponse.builder()
                .totalSalidas(salidas.size())
                .salidasActivas(activas)
                .salidasFinalizadas(finalizadas)
                .salidasCanceladas(canceladas)
                .items(items)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ReporteVehiculoKilometrajeResponse> generarReporteVehiculosKilometraje(
            UUID activoId,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta
    ) {
        Instant instantDesde = fechaDesde != null ? fechaDesde.toInstant(ZoneOffset.UTC) : null;
        Instant instantHasta = fechaHasta != null ? fechaHasta.toInstant(ZoneOffset.UTC) : null;

        List<SalidaVehicular> salidas = salidaRepository.findForReporte(
                null, activoId, null, null, instantDesde, instantHasta
        );

        if (salidas.isEmpty()) {
            return Collections.emptyList();
        }

        Map<UUID, List<SalidaVehicular>> salidasPorVehiculo = salidas.stream()
                .collect(Collectors.groupingBy(SalidaVehicular::getActivoId));

        Set<UUID> activoIds = salidasPorVehiculo.keySet();
        Map<UUID, ActivoEntity> activosMap = activoRepository.findAllById(activoIds).stream()
                .collect(Collectors.toMap(ActivoEntity::getId, a -> a));
        Map<UUID, Map<String, String>> atributosMap = obtenerAtributosVehiculosBatch(activoIds);

        List<UUID> salidaIds = salidas.stream().map(SalidaVehicular::getId).toList();
        List<SalidaVehicularEvento> eventos = eventoRepository.findBySalidaVehicularIdIn(salidaIds);
        Map<UUID, List<SalidaVehicularEvento>> eventosPorSalida = eventos.stream()
                .collect(Collectors.groupingBy(SalidaVehicularEvento::getSalidaVehicularId));

        List<ReporteVehiculoKilometrajeResponse> result = new ArrayList<>();

        for (Map.Entry<UUID, List<SalidaVehicular>> entry : salidasPorVehiculo.entrySet()) {
            UUID vehiculoId = entry.getKey();
            List<SalidaVehicular> vehiculoSalidas = entry.getValue();
            ActivoEntity activo = activosMap.get(vehiculoId);
            Map<String, String> attrs = atributosMap.getOrDefault(vehiculoId, Collections.emptyMap());

            BigDecimal kmMinimo = null;
            BigDecimal kmMaximo = null;
            BigDecimal kmTotalRecorrido = BigDecimal.ZERO;

            for (SalidaVehicular s : vehiculoSalidas) {
                List<SalidaVehicularEvento> salidaEventos = eventosPorSalida.getOrDefault(s.getId(), Collections.emptyList());
                List<BigDecimal> kms = salidaEventos.stream()
                        .map(SalidaVehicularEvento::getKilometraje)
                        .filter(Objects::nonNull)
                        .toList();

                if (!kms.isEmpty()) {
                    BigDecimal primerKm = kms.getFirst();
                    BigDecimal ultimoKm = kms.getLast();

                    if (kmMinimo == null || primerKm.compareTo(kmMinimo) < 0) {
                        kmMinimo = primerKm;
                    }
                    if (kmMaximo == null || ultimoKm.compareTo(kmMaximo) > 0) {
                        kmMaximo = ultimoKm;
                    }

                    if (ultimoKm.compareTo(primerKm) >= 0) {
                        kmTotalRecorrido = kmTotalRecorrido.add(ultimoKm.subtract(primerKm));
                    }
                }
            }

            result.add(ReporteVehiculoKilometrajeResponse.builder()
                    .activoId(vehiculoId)
                    .activoCodigo(activo != null ? activo.getCodigo() : null)
                    .placa(attrs.get("PLACA"))
                    .marca(attrs.get("MARCA"))
                    .modelo(attrs.get("MODELO"))
                    .activoDescripcion(activo != null ? activo.getDescripcion() : null)
                    .cantidadSalidas(vehiculoSalidas.size())
                    .kilometrajeInicial(kmMinimo)
                    .kilometrajeFinal(kmMaximo)
                    .kilometrajeTotalRecorrido(kmTotalRecorrido)
                    .build());
        }

        return result;
    }

    @Transactional(readOnly = true)
    public List<ReporteEmpleadoSalidasResponse> generarReporteEmpleados(
            UUID empleadoId,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta
    ) {
        Instant instantDesde = fechaDesde != null ? fechaDesde.toInstant(ZoneOffset.UTC) : null;
        Instant instantHasta = fechaHasta != null ? fechaHasta.toInstant(ZoneOffset.UTC) : null;

        List<SalidaVehicular> salidas = salidaRepository.findForReporte(
                null, null, empleadoId, null, instantDesde, instantHasta
        );

        if (salidas.isEmpty()) {
            return Collections.emptyList();
        }

        Map<UUID, List<SalidaVehicular>> salidasPorEmpleado = salidas.stream()
                .collect(Collectors.groupingBy(SalidaVehicular::getEmpleadoId));

        Set<UUID> empIds = salidasPorEmpleado.keySet();
        Map<UUID, VEmpleadoEntity> vempleadosMap = vempleadoRepository.findAllById(empIds).stream()
                .collect(Collectors.toMap(VEmpleadoEntity::getEmpleadoId, e -> e));

        List<BitacoraVehicular> todasBitacoras = bitacoraRepository.findConFiltros(
                null, empleadoId, null, instantDesde, instantHasta
        );
        Map<UUID, List<BitacoraVehicular>> bitacorasPorEmpleado = todasBitacoras.stream()
                .collect(Collectors.groupingBy(BitacoraVehicular::getEmpleadoId));

        List<ReporteEmpleadoSalidasResponse> result = new ArrayList<>();

        for (Map.Entry<UUID, List<SalidaVehicular>> entry : salidasPorEmpleado.entrySet()) {
            UUID empId = entry.getKey();
            List<SalidaVehicular> empSalidas = entry.getValue();
            VEmpleadoEntity emp = vempleadosMap.get(empId);
            List<BitacoraVehicular> empBitacoras = bitacorasPorEmpleado.getOrDefault(empId, Collections.emptyList());

            long activas = empSalidas.stream().filter(s -> {
                String est = s.getEstado() != null ? s.getEstado().toUpperCase() : "";
                return !est.contains("LLEGAD") && !est.contains("FINALIZ") && !est.contains("CANCEL");
            }).count();

            long finalizadas = empSalidas.stream().filter(s -> {
                String est = s.getEstado() != null ? s.getEstado().toUpperCase() : "";
                return est.contains("LLEGAD") || est.contains("FINALIZ");
            }).count();

            long canceladas = empSalidas.stream().filter(s -> {
                String est = s.getEstado() != null ? s.getEstado().toUpperCase() : "";
                return est.contains("CANCEL");
            }).count();

            long incidentes = empBitacoras.stream().filter(b -> {
                String t = b.getTipo() != null ? b.getTipo().toUpperCase() : "";
                return t.contains("INCIDENTE");
            }).count();

            result.add(ReporteEmpleadoSalidasResponse.builder()
                    .empleadoId(empId)
                    .empleadoCodigo(emp != null ? emp.getCodigo() : null)
                    .empleadoNombre(emp != null ? emp.getNombreCompleto() : null)
                    .cargo(emp != null ? emp.getCargo() : null)
                    .area(emp != null ? emp.getArea() : null)
                    .totalSalidas(empSalidas.size())
                    .salidasActivas(activas)
                    .salidasFinalizadas(finalizadas)
                    .salidasCanceladas(canceladas)
                    .totalBitacoras(empBitacoras.size())
                    .totalIncidentes(incidentes)
                    .build());
        }

        return result;
    }

    @Transactional(readOnly = true)
    public ReporteTiemposRecorridoResponse generarReporteTiempos(
            UUID activoId,
            UUID empleadoId,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta
    ) {
        Instant instantDesde = fechaDesde != null ? fechaDesde.toInstant(ZoneOffset.UTC) : null;
        Instant instantHasta = fechaHasta != null ? fechaHasta.toInstant(ZoneOffset.UTC) : null;

        List<SalidaVehicular> salidas = salidaRepository.findForReporte(
                null, activoId, empleadoId, null, instantDesde, instantHasta
        );

        if (salidas.isEmpty()) {
            return ReporteTiemposRecorridoResponse.builder()
                    .totalSalidasAnalizadas(0)
                    .duracionPromedioHoras(0.0)
                    .duracionMinimaMinutos(0L)
                    .duracionMaximaMinutos(0L)
                    .items(Collections.emptyList())
                    .build();
        }

        Set<UUID> activoIds = salidas.stream().map(SalidaVehicular::getActivoId).collect(Collectors.toSet());
        Set<UUID> empleadoIds = salidas.stream().map(SalidaVehicular::getEmpleadoId).collect(Collectors.toSet());

        Map<UUID, ActivoEntity> activosMap = activoRepository.findAllById(activoIds).stream()
                .collect(Collectors.toMap(ActivoEntity::getId, a -> a));
        Map<UUID, VEmpleadoEntity> empleadosMap = vempleadoRepository.findAllById(empleadoIds).stream()
                .collect(Collectors.toMap(VEmpleadoEntity::getEmpleadoId, e -> e));
        Map<UUID, Map<String, String>> atributosMap = obtenerAtributosVehiculosBatch(activoIds);

        List<UUID> salidaIds = salidas.stream().map(SalidaVehicular::getId).toList();
        List<SalidaVehicularEvento> eventos = eventoRepository.findBySalidaVehicularIdIn(salidaIds);
        Map<UUID, List<SalidaVehicularEvento>> eventosPorSalida = eventos.stream()
                .collect(Collectors.groupingBy(SalidaVehicularEvento::getSalidaVehicularId));

        List<ItemTiempoRecorridoResponse> items = new ArrayList<>();
        long totalMinutos = 0;
        long salidasConTiempo = 0;
        Long minMinutos = null;
        Long maxMinutos = null;

        for (SalidaVehicular salida : salidas) {
            ActivoEntity activo = activosMap.get(salida.getActivoId());
            VEmpleadoEntity emp = empleadosMap.get(salida.getEmpleadoId());
            Map<String, String> attrs = atributosMap.getOrDefault(salida.getActivoId(), Collections.emptyMap());

            List<SalidaVehicularEvento> evs = eventosPorSalida.getOrDefault(salida.getId(), Collections.emptyList());
            Instant inicio = salida.getFecha() != null ? salida.getFecha() : salida.getCreatedAt();
            Instant fin = null;

            if (!evs.isEmpty()) {
                inicio = evs.getFirst().getFechaHora();
                if (evs.size() > 1) {
                    fin = evs.getLast().getFechaHora();
                }
            }

            Long duracionMin = null;
            Double duracionHoras = null;

            if (inicio != null && fin != null && fin.isAfter(inicio)) {
                duracionMin = Duration.between(inicio, fin).toMinutes();
                duracionHoras = BigDecimal.valueOf(duracionMin)
                        .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP)
                        .doubleValue();

                totalMinutos += duracionMin;
                salidasConTiempo++;

                if (minMinutos == null || duracionMin < minMinutos) {
                    minMinutos = duracionMin;
                }
                if (maxMinutos == null || duracionMin > maxMinutos) {
                    maxMinutos = duracionMin;
                }
            }

            items.add(ItemTiempoRecorridoResponse.builder()
                    .salidaId(salida.getId())
                    .numero(salida.getNumero())
                    .placa(attrs.get("PLACA"))
                    .vehiculoDescripcion(activo != null ? activo.getDescripcion() : null)
                    .empleadoNombre(emp != null ? emp.getNombreCompleto() : null)
                    .descripcionActividad(salida.getDescripcionActividad())
                    .observaciones(salida.getObservaciones())
                    .estado(salida.getEstado())
                    .fechaInicio(inicio)
                    .fechaFin(fin)
                    .duracionMinutos(duracionMin)
                    .duracionHoras(duracionHoras)
                    .build());
        }

        Double promedioHoras = salidasConTiempo > 0
                ? BigDecimal.valueOf(totalMinutos)
                .divide(BigDecimal.valueOf(salidasConTiempo * 60), 2, RoundingMode.HALF_UP)
                .doubleValue()
                : 0.0;

        return ReporteTiemposRecorridoResponse.builder()
                .totalSalidasAnalizadas(salidas.size())
                .duracionPromedioHoras(promedioHoras)
                .duracionMinimaMinutos(minMinutos != null ? minMinutos : 0L)
                .duracionMaximaMinutos(maxMinutos != null ? maxMinutos : 0L)
                .items(items)
                .build();
    }

    @Transactional(readOnly = true)
    public ReporteBitacorasActividadesIncidentesResponse generarReporteBitacoras(
            UUID salidaId,
            UUID empleadoId,
            String tipo,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta
    ) {
        Instant instantDesde = fechaDesde != null ? fechaDesde.toInstant(ZoneOffset.UTC) : null;
        Instant instantHasta = fechaHasta != null ? fechaHasta.toInstant(ZoneOffset.UTC) : null;

        List<BitacoraVehicular> bitacoras = bitacoraRepository.findConFiltros(
                salidaId, empleadoId, tipo, instantDesde, instantHasta
        );

        long actividades = bitacoras.stream().filter(b -> {
            String t = b.getTipo() != null ? b.getTipo().toUpperCase() : "";
            return t.contains("ACTIVIDAD");
        }).count();

        long novedades = bitacoras.stream().filter(b -> {
            String t = b.getTipo() != null ? b.getTipo().toUpperCase() : "";
            return t.contains("NOVEDAD");
        }).count();

        long incidentes = bitacoras.stream().filter(b -> {
            String t = b.getTipo() != null ? b.getTipo().toUpperCase() : "";
            return t.contains("INCIDENTE");
        }).count();

        Set<UUID> empIds = bitacoras.stream().map(BitacoraVehicular::getEmpleadoId).collect(Collectors.toSet());
        Map<UUID, String> nombresMap = vempleadoRepository.findAllById(empIds).stream()
                .collect(Collectors.toMap(VEmpleadoEntity::getEmpleadoId, VEmpleadoEntity::getNombreCompleto));

        List<BitacoraVehicularResponse> items = bitacoras.stream()
                .map(b -> BitacoraVehicularResponse.builder()
                        .id(b.getId())
                        .salidaVehicularId(b.getSalidaVehicularId())
                        .empleadoId(b.getEmpleadoId())
                        .empleadoNombre(nombresMap.get(b.getEmpleadoId()))
                        .tipo(b.getTipo())
                        .fechaHora(b.getFechaHora())
                        .descripcion(b.getDescripcion())
                        .latitud(b.getLatitud())
                        .longitud(b.getLongitud())
                        .createdAt(b.getCreatedAt())
                        .build())
                .toList();

        return ReporteBitacorasActividadesIncidentesResponse.builder()
                .totalBitacoras(bitacoras.size())
                .totalActividades(actividades)
                .totalNovedades(novedades)
                .totalIncidentes(incidentes)
                .items(items)
                .build();
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

    @Transactional(readOnly = true)
    public byte[] generarReporteBitacoraPdf(
            UUID activoId,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta,
            String search
    ) {
        Instant instantDesde = fechaDesde != null ? fechaDesde.toInstant(ZoneOffset.UTC) : null;
        Instant instantHasta = fechaHasta != null ? fechaHasta.toInstant(ZoneOffset.UTC) : null;

        // 1. Obtener salidas en el rango (con o sin activoId)
        List<SalidaVehicular> salidas = new ArrayList<>(salidaRepository.findForReporte(
                search, activoId, null, null, instantDesde, instantHasta
        ));
        // Orden cronológico ascendente (por fecha o createdAt)
        salidas.sort(Comparator.comparing(s -> s.getFecha() != null ? s.getFecha() : s.getCreatedAt()));

        // 2. Resolver vehículos involucrados y atributos (placas, modelos, etc.)
        Set<UUID> allActivoIds = salidas.stream()
                .map(SalidaVehicular::getActivoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        if (activoId != null) {
            allActivoIds.add(activoId);
        }

        Map<UUID, ActivoEntity> activosMap = allActivoIds.isEmpty()
                ? Collections.emptyMap()
                : activoRepository.findAllById(allActivoIds).stream().collect(Collectors.toMap(ActivoEntity::getId, a -> a));
        Map<UUID, Map<String, String>> atributosMap = obtenerAtributosVehiculosBatch(allActivoIds);

        Map<UUID, String> placasPorActivo = new HashMap<>();
        for (UUID actId : allActivoIds) {
            Map<String, String> attrs = atributosMap.getOrDefault(actId, Collections.emptyMap());
            String pl = attrs.get("PLACA");
            if (pl == null || pl.isBlank()) {
                ActivoEntity act = activosMap.get(actId);
                if (act != null) {
                    pl = extractPlacaFromDescripcion(act.getDescripcion());
                }
            }
            placasPorActivo.put(actId, (pl != null && !pl.isBlank()) ? pl : "S/P");
        }

        String tipoVehiculo;
        String placaPrincipal;

        if (activoId != null) {
            ActivoEntity activo = activosMap.get(activoId);
            Map<String, String> attrs = atributosMap.getOrDefault(activoId, Collections.emptyMap());
            placaPrincipal = placasPorActivo.getOrDefault(activoId, "-");
            String marca = attrs.getOrDefault("MARCA", "");
            String modelo = attrs.getOrDefault("MODELO", "");
            String tipoActivoNombre = (activo != null && activo.getTipoActivoId() != null)
                    ? tipoActivoRepository.findById(activo.getTipoActivoId()).map(t -> t.getNombre()).orElse("CAMIONETA")
                    : "CAMIONETA";
            tipoVehiculo = Stream.of(tipoActivoNombre, marca, modelo)
                    .filter(s -> s != null && !s.isBlank())
                    .collect(Collectors.joining(" "));
            if (tipoVehiculo.isBlank() && activo != null) {
                tipoVehiculo = activo.getNombre();
            }
        } else {
            tipoVehiculo = "TODOS LOS VEHÍCULOS (CONSOLIDADO)";
            placaPrincipal = "TODAS LAS PLACAS";
        }

        // 3. Obtener eventos de las salidas para kmSalida y kmLlegada
        List<UUID> salidaIds = salidas.stream().map(SalidaVehicular::getId).toList();
        List<SalidaVehicularEvento> eventos = salidaIds.isEmpty() ? Collections.emptyList() : eventoRepository.findBySalidaVehicularIdIn(salidaIds);
        Map<UUID, List<SalidaVehicularEvento>> eventosPorSalida = eventos.stream()
                .collect(Collectors.groupingBy(SalidaVehicularEvento::getSalidaVehicularId));

        // 4. Obtener cargas de combustible del período de forma segura y tipada
        List<CargaCombustibleEntity> cargasCombustible = new ArrayList<>();
        if (activoId != null) {
            if (fechaDesde != null && fechaHasta != null) {
                cargasCombustible.addAll(cargaCombustibleRepository.findByActivoIdAndFechaCargaBetween(activoId, fechaDesde, fechaHasta));
            } else {
                cargasCombustible.addAll(cargaCombustibleRepository.findByActivoIdOrderByFechaCargaDesc(activoId));
            }
        } else {
            if (fechaDesde != null && fechaHasta != null) {
                cargasCombustible.addAll(cargaCombustibleRepository.findByFechaCargaBetweenOrderByFechaCargaAsc(fechaDesde, fechaHasta));
            } else {
                cargasCombustible.addAll(cargaCombustibleRepository.findAll());
            }
        }

        if (!salidaIds.isEmpty()) {
            List<CargaCombustibleEntity> cargasPorSalidaIds = cargaCombustibleRepository.findBySalidaVehicularIdIn(salidaIds);
            Set<UUID> cargaIdsExistentes = cargasCombustible.stream().map(CargaCombustibleEntity::getId).collect(Collectors.toSet());
            for (CargaCombustibleEntity c : cargasPorSalidaIds) {
                if (!cargaIdsExistentes.contains(c.getId())) {
                    cargasCombustible.add(c);
                    cargaIdsExistentes.add(c.getId());
                }
            }
        }

        Map<UUID, List<CargaCombustibleEntity>> cargasPorSalida = cargasCombustible.stream()
                .filter(c -> c.getSalidaVehicularId() != null)
                .collect(Collectors.groupingBy(CargaCombustibleEntity::getSalidaVehicularId));

        // Nombres de conductores
        Set<UUID> empIds = salidas.stream().map(SalidaVehicular::getEmpleadoId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<UUID, String> nombresMap = empIds.isEmpty() ? Collections.emptyMap() : vempleadoRepository.findAllById(empIds).stream()
                .collect(Collectors.toMap(VEmpleadoEntity::getEmpleadoId, VEmpleadoEntity::getNombreCompleto));

        DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("d").withZone(ZoneId.of("America/La_Paz"));
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy").withZone(ZoneId.of("America/La_Paz"));

        long totalKmRecorrido = 0;
        BigDecimal totalLitros = BigDecimal.ZERO;
        String conductorPrincipal = null;

        List<BitacoraSalidaItemReporteDto> dataSourceList = new ArrayList<>();

        for (SalidaVehicular s : salidas) {
            Instant fechaInst = s.getFecha() != null ? s.getFecha() : s.getCreatedAt();
            Integer dia = null;
            String fechaStr = "-";
            if (fechaInst != null) {
                try {
                    dia = Integer.parseInt(dayFormatter.format(fechaInst));
                    fechaStr = dateFormatter.format(fechaInst);
                } catch (Exception ignored) {
                }
            }

            // Odómetro
            List<SalidaVehicularEvento> evs = eventosPorSalida.getOrDefault(s.getId(), Collections.emptyList());
            List<SalidaVehicularEvento> kmEvents = evs.stream()
                    .filter(e -> e.getKilometraje() != null)
                    .sorted(Comparator.comparing(e -> e.getFechaHora() != null ? e.getFechaHora() : e.getCreatedAt()))
                    .toList();

            Long kmSalida = null;
            Long kmLlegada = null;

            if (!kmEvents.isEmpty()) {
                Optional<SalidaVehicularEvento> salidaEv = kmEvents.stream()
                        .filter(e -> e.getTipoEvento() != null && e.getTipoEvento().toUpperCase(Locale.ROOT).contains("SALIDA"))
                        .findFirst();
                Optional<SalidaVehicularEvento> llegadaEv = kmEvents.stream()
                        .filter(e -> e.getTipoEvento() != null && e.getTipoEvento().toUpperCase(Locale.ROOT).contains("LLEGADA"))
                        .reduce((first, second) -> second);

                kmSalida = salidaEv.map(e -> e.getKilometraje().longValue())
                        .orElse(kmEvents.getFirst().getKilometraje().longValue());

                if (llegadaEv.isPresent()) {
                    kmLlegada = llegadaEv.get().getKilometraje().longValue();
                } else if (kmEvents.size() > 1) {
                    kmLlegada = kmEvents.getLast().getKilometraje().longValue();
                }
            }

            Long kmRecorrido = (kmSalida != null && kmLlegada != null && kmLlegada >= kmSalida)
                    ? (kmLlegada - kmSalida)
                    : null;
            if (kmRecorrido != null) {
                totalKmRecorrido += kmRecorrido;
            }

            // Combustible
            List<CargaCombustibleEntity> cargas = new ArrayList<>(cargasPorSalida.getOrDefault(s.getId(), Collections.emptyList()));
            if (cargas.isEmpty() && s.getActivoId() != null && fechaInst != null) {
                LocalDate salidaDate = fechaInst.atZone(ZoneId.of("America/La_Paz")).toLocalDate();
                cargas.addAll(cargasCombustible.stream()
                        .filter(c -> c.getSalidaVehicularId() == null
                                && s.getActivoId().equals(c.getActivoId())
                                && c.getFechaCarga() != null
                                && c.getFechaCarga().toLocalDate().isEqual(salidaDate))
                        .toList());
            }
            String combustibleTexto = "-";
            if (!cargas.isEmpty()) {
                BigDecimal sumLitros = cargas.stream()
                        .map(CargaCombustibleEntity::getLitros)
                        .filter(Objects::nonNull)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                totalLitros = totalLitros.add(sumLitros);

                String facts = cargas.stream()
                        .map(CargaCombustibleEntity::getNumeroFactura)
                        .filter(f -> f != null && !f.isBlank())
                        .collect(Collectors.joining(", "));
                combustibleTexto = sumLitros.stripTrailingZeros().toPlainString() + " lts" + (!facts.isBlank() ? " / " + facts : "");
            }

            String conductor = nombresMap.getOrDefault(s.getEmpleadoId(), "-");
            if (conductorPrincipal == null && conductor != null && !conductor.equals("-")) {
                conductorPrincipal = conductor;
            }

            String descActividad = s.getDescripcionActividad() != null ? s.getDescripcionActividad() : "-";
            if (activoId == null && s.getActivoId() != null) {
                String placaItem = placasPorActivo.getOrDefault(s.getActivoId(), "");
                if (!placaItem.isBlank() && !placaItem.equals("S/P")) {
                    descActividad = "[" + placaItem + "] " + descActividad;
                }
            }

            dataSourceList.add(BitacoraSalidaItemReporteDto.builder()
                    .id(s.getId())
                    .dia(dia)
                    .fecha(fechaStr)
                    .descripcionActividad(descActividad)
                    .kmSalida(kmSalida)
                    .kmLlegada(kmLlegada)
                    .kmRecorrido(kmRecorrido)
                    .combustibleTexto(combustibleTexto)
                    .conductorNombre(conductor)
                    .observaciones(s.getObservaciones() != null ? s.getObservaciones() : "-")
                    .build());
        }

        // Parámetros para JasperReports
        Map<String, Object> parameters = new HashMap<>();
        try {
            ClassPathResource logoResource = new ClassPathResource("reports/images/logo-ende-corani.png");
            if (logoResource.exists()) {
                parameters.put("LOGO_EMPRESA", logoResource.getInputStream());
            }
        } catch (Exception e) {
            log.warn("No se pudo cargar el logo institucional: {}", e.getMessage());
        }

        int anio = fechaDesde != null ? fechaDesde.getYear() : LocalDate.now().getYear();
        String mes = fechaDesde != null
                ? fechaDesde.getMonth().getDisplayName(TextStyle.FULL, new Locale("es", "BO")).toUpperCase(Locale.ROOT)
                : "OCTUBRE";
        String periodoTexto = (fechaDesde != null && fechaHasta != null)
                ? fechaDesde.toLocalDate() + " al " + fechaHasta.toLocalDate()
                : "PERIODO ACTUAL";

        parameters.put("TITULO_REPORTE", "BITACORA DE VEHICULOS");
        parameters.put("FORMULARIO_CODIGO", "GA-IN7-04");
        parameters.put("FORMULARIO_VERSION", "01");
        parameters.put("VEHICULO_TIPO", tipoVehiculo != null && !tipoVehiculo.isBlank() ? tipoVehiculo : "TODOS LOS VEHÍCULOS");
        parameters.put("VEHICULO_PLACA", placaPrincipal != null && !placaPrincipal.isBlank() ? placaPrincipal : "-");
        parameters.put("RESPONSABLE_VEH", conductorPrincipal != null ? conductorPrincipal : (activoId == null ? "VARIOS" : "-"));
        parameters.put("UBICACION", "CORANI");
        parameters.put("ANIO", String.valueOf(anio));
        parameters.put("MES", mes);
        parameters.put("PERIODO_TEXTO", periodoTexto);
        parameters.put("TOTAL_SALIDAS", String.valueOf(salidas.size()));
        parameters.put("TOTAL_KM", String.format("%,d", totalKmRecorrido));
        parameters.put("TOTAL_LITROS", totalLitros.compareTo(BigDecimal.ZERO) > 0 ? totalLitros.stripTrailingZeros().toPlainString() + " lts" : "-");

        return jasperReportService.generatePdfReport(REPORTE_BITACORA_SALIDAS_PATH, parameters, dataSourceList);
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
