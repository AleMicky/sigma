package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoValorEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.response.*;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.BitacoraVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SalidaVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SalidaVehicularEvento;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.BitacoraVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularEventoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalidaVehicularReporteService {

    private final SalidaVehicularRepository salidaRepository;
    private final SalidaVehicularEventoRepository eventoRepository;
    private final BitacoraVehicularRepository bitacoraRepository;
    private final SalidaVehicularService salidaService;
    private final SpringActivoRepository activoRepository;
    private final SpringActivoAtributoRepository activoAtributoRepository;
    private final SpringActivoAtributoValorRepository activoAtributoValorRepository;
    private final SpringVEmpleadoRepository vempleadoRepository;

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
            Instant inicio = salida.getCreatedAt();
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
}
