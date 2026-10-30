package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoValorEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringTipoActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.bitacora.response.*;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.*;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.*;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BitacoraVehicularService {

    private static final String REPORTE_BITACORA_PATH = "reports/gestion-vehicular/bitacora_vehicular.jrxml";
    private static final Pattern PLACA_PATTERN = Pattern.compile(
            "PLACA(?:\\s*(?:N[°o.]+|NRO\\.?|NUM\\.?|#))?[:\\s#.-]+([0-9A-Za-z]+(?:[\\s-][0-9A-Za-z]+)?)(?:\\s+(?:CHASIS|MOTOR|COLOR|MARCA|MODELO|AÑO|ANIO|TIPO)|[,;.]|\\s*$)",
            Pattern.CASE_INSENSITIVE
    );

    private final SpringActivoRepository activoRepository;
    private final SpringTipoActivoRepository tipoActivoRepository;
    private final SpringActivoAtributoRepository activoAtributoRepository;
    private final SpringActivoAtributoValorRepository activoAtributoValorRepository;
    private final SpringViajeVehicularRepository viajeVehicularRepository;
    private final SpringAsignacionVehicularRepository asignacionVehicularRepository;
    private final SpringSolicitudVehicularRepository solicitudVehicularRepository;
    private final SpringConductorRepository conductorRepository;
    private final SpringConductorLicenciaRepository conductorLicenciaRepository;
    private final SpringCargaCombustibleRepository cargaCombustibleRepository;
    private final SpringVEmpleadoRepository vempleadoRepository;
    private final JasperReportService jasperReportService;

    @Transactional(readOnly = true)
    public BitacoraVehicularReporteResponse generarReporte(
            UUID activoId,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            UUID conductorId
    ) {
        validarParametros(activoId, fechaInicio, fechaFin);

        ActivoEntity activo = activoRepository.findById(activoId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehículo o Activo", activoId));

        BitacoraVehicularVehiculoInfo vehiculoInfo = obtenerVehiculoInfo(activo);
        BitacoraVehicularPeriodoInfo periodoInfo = obtenerPeriodoInfo(fechaInicio, fechaFin);

        LocalDateTime fechaDesde = fechaInicio.atStartOfDay();
        LocalDateTime fechaHasta = fechaFin.atTime(23, 59, 59, 999999999);

        // 1. Obtener viajes del vehículo en el rango
        List<ViajeVehicularEntity> viajes = viajeVehicularRepository.findBitacoraViajes(
                activoId, fechaDesde, fechaHasta, conductorId
        );

        // 2. Obtener cargas de combustible del vehículo en el rango
        List<CargaCombustibleEntity> cargasCombustible = cargaCombustibleRepository.findByActivoIdAndFechaCargaBetween(
                activoId, fechaDesde, fechaHasta
        );

        // 3. Cargar en lote asignaciones, solicitudes, conductores y supervisores
        Set<UUID> asignacionIds = viajes.stream()
                .map(ViajeVehicularEntity::getAsignacionVehicularId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, AsignacionVehicularEntity> asignacionMap = asignacionIds.isEmpty()
                ? Collections.emptyMap()
                : asignacionVehicularRepository.findAllById(asignacionIds).stream()
                .collect(Collectors.toMap(AsignacionVehicularEntity::getId, a -> a));

        Set<UUID> solicitudIds = asignacionMap.values().stream()
                .map(AsignacionVehicularEntity::getSolicitudVehicularId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, SolicitudVehicularEntity> solicitudMap = solicitudIds.isEmpty()
                ? Collections.emptyMap()
                : solicitudVehicularRepository.findAllById(solicitudIds).stream()
                .collect(Collectors.toMap(SolicitudVehicularEntity::getId, s -> s));

        Set<UUID> conductorIds = asignacionMap.values().stream()
                .map(AsignacionVehicularEntity::getConductorId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, ConductorEntity> conductorMap = conductorIds.isEmpty()
                ? Collections.emptyMap()
                : conductorRepository.findAllById(conductorIds).stream()
                .collect(Collectors.toMap(ConductorEntity::getId, c -> c));

        // Licencias de conductores
        Map<UUID, String> licenciasMap = new HashMap<>();
        for (UUID cId : conductorIds) {
            List<ConductorLicenciaEntity> licencias = conductorLicenciaRepository.findByConductorId(cId);
            if (!licencias.isEmpty()) {
                ConductorLicenciaEntity lic = licencias.get(0);
                licenciasMap.put(cId, (lic.getCategoriaLicencia() != null ? "Cat. " + lic.getCategoriaLicencia() + " - " : "") + lic.getNumeroLicencia());
            }
        }

        // Empleados necesarios (conductores, supervisores asignadores, empleados de combustible)
        Set<UUID> empleadoIds = new HashSet<>();
        conductorMap.values().forEach(c -> {
            if (c.getEmpleadoId() != null) empleadoIds.add(c.getEmpleadoId());
        });
        asignacionMap.values().forEach(a -> {
            if (a.getAsignadoPorId() != null) empleadoIds.add(a.getAsignadoPorId());
        });
        cargasCombustible.forEach(cc -> {
            if (cc.getEmpleadoId() != null) empleadoIds.add(cc.getEmpleadoId());
        });

        Map<UUID, VEmpleadoEntity> empleadoMap = empleadoIds.isEmpty()
                ? Collections.emptyMap()
                : vempleadoRepository.findAllById(empleadoIds).stream()
                .collect(Collectors.toMap(VEmpleadoEntity::getEmpleadoId, e -> e));

        // 4. Mapear cargas agrupadas por viajeVehicularId
        Map<UUID, List<CargaCombustibleEntity>> cargasPorViaje = cargasCombustible.stream()
                .filter(c -> c.getViajeVehicularId() != null)
                .collect(Collectors.groupingBy(CargaCombustibleEntity::getViajeVehicularId));

        Set<UUID> cargasVinculadasIds = new HashSet<>();
        List<BitacoraVehicularItemResponse> items = new ArrayList<>();

        // 5. Construir registros a partir de los viajes
        for (ViajeVehicularEntity viaje : viajes) {
            AsignacionVehicularEntity asignacion = asignacionMap.get(viaje.getAsignacionVehicularId());
            SolicitudVehicularEntity solicitud = asignacion != null ? solicitudMap.get(asignacion.getSolicitudVehicularId()) : null;
            ConductorEntity conductor = asignacion != null ? conductorMap.get(asignacion.getConductorId()) : null;
            VEmpleadoEntity conductorEmp = (conductor != null && conductor.getEmpleadoId() != null)
                    ? empleadoMap.get(conductor.getEmpleadoId()) : null;
            VEmpleadoEntity supervisorEmp = (asignacion != null && asignacion.getAsignadoPorId() != null)
                    ? empleadoMap.get(asignacion.getAsignadoPorId()) : null;

            LocalDateTime fechaRegistro = viaje.getFechaSalidaReal() != null
                    ? viaje.getFechaSalidaReal()
                    : (solicitud != null && solicitud.getFechaSalida() != null
                    ? solicitud.getFechaSalida()
                    : (asignacion != null && asignacion.getFechaAsignacion() != null
                    ? asignacion.getFechaAsignacion()
                    : (viaje.getCreatedAt() != null
                    ? LocalDateTime.ofInstant(viaje.getCreatedAt(), java.time.ZoneId.systemDefault())
                    : LocalDateTime.now())));

            Long kmSalida = viaje.getKilometrajeSalida();
            Long kmLlegada = viaje.getKilometrajeRetorno();
            Long kmRecorrido = (kmLlegada != null && kmSalida != null) ? Math.max(0, kmLlegada - kmSalida) : null;

            // Datos de combustible vinculados al viaje
            List<CargaCombustibleEntity> cargasDelViaje = cargasPorViaje.getOrDefault(viaje.getId(), Collections.emptyList());
            cargasDelViaje.forEach(c -> cargasVinculadasIds.add(c.getId()));

            String facturas = null;
            BigDecimal litros = null;
            BigDecimal importe = null;

            if (!cargasDelViaje.isEmpty()) {
                facturas = cargasDelViaje.stream()
                        .map(CargaCombustibleEntity::getNumeroFactura)
                        .filter(Objects::nonNull)
                        .filter(f -> !f.isBlank())
                        .collect(Collectors.joining(", "));
                litros = cargasDelViaje.stream()
                        .map(CargaCombustibleEntity::getLitros)
                        .filter(Objects::nonNull)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                importe = cargasDelViaje.stream()
                        .map(CargaCombustibleEntity::getPrecioTotal)
                        .filter(Objects::nonNull)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
            }

            String descripcionTrabajo = determinarDescripcionTrabajo(viaje, solicitud);
            String conductorNombre = conductorEmp != null ? conductorEmp.getNombreCompleto() : "No asignado";
            String supervisorNombre = supervisorEmp != null ? supervisorEmp.getNombreCompleto() : "Supervisor de Flota";
            String licencia = asignacion != null && asignacion.getConductorId() != null
                    ? licenciasMap.getOrDefault(asignacion.getConductorId(), "") : "";

            items.add(BitacoraVehicularItemResponse.builder()
                    .id(viaje.getId())
                    .fecha(fechaRegistro)
                    .dia(fechaRegistro != null ? fechaRegistro.getDayOfMonth() : 1)
                    .diaSemana(obtenerDiaSemanaAbrev(fechaRegistro))
                    .tipoRegistro("VIAJE")
                    .kmSalida(kmSalida)
                    .kmLlegada(kmLlegada)
                    .kmRecorrido(kmRecorrido)
                    .descripcionTrabajo(descripcionTrabajo)
                    .solicitudId(solicitud != null ? solicitud.getId() : null)
                    .solicitudNumero(solicitud != null ? solicitud.getNumero() : null)
                    .combustibleFactura(facturas)
                    .combustibleLitros(litros)
                    .combustibleImporte(importe)
                    .supervisorNombre(supervisorNombre)
                    .supervisorVoBo(Boolean.TRUE)
                    .observaciones(viaje.getObservacion())
                    .conductorNombre(conductorNombre)
                    .conductorLicencia(licencia)
                    .build());
        }

        // 6. Cargas no vinculadas a un viaje específico (ej. cargas directas o compras)
        for (CargaCombustibleEntity carga : cargasCombustible) {
            if (cargasVinculadasIds.contains(carga.getId())) {
                continue;
            }
            LocalDateTime fechaCarga = carga.getFechaCarga();
            VEmpleadoEntity emp = carga.getEmpleadoId() != null ? empleadoMap.get(carga.getEmpleadoId()) : null;
            String descripcion = "Carga Combustible" + (carga.getNumeroFactura() != null ? " Fac: " + carga.getNumeroFactura() : "");

            items.add(BitacoraVehicularItemResponse.builder()
                    .id(carga.getId())
                    .fecha(fechaCarga)
                    .dia(fechaCarga != null ? fechaCarga.getDayOfMonth() : 1)
                    .diaSemana(obtenerDiaSemanaAbrev(fechaCarga))
                    .tipoRegistro("CARGA_COMBUSTIBLE")
                    .kmSalida(null)
                    .kmLlegada(null)
                    .kmRecorrido(null)
                    .descripcionTrabajo(descripcion)
                    .solicitudId(null)
                    .solicitudNumero(null)
                    .combustibleFactura(carga.getNumeroFactura())
                    .combustibleLitros(carga.getLitros())
                    .combustibleImporte(carga.getPrecioTotal())
                    .supervisorNombre(emp != null ? emp.getNombreCompleto() : "Encargado de Carga")
                    .supervisorVoBo(Boolean.TRUE)
                    .observaciones("Carga independiente de combustible")
                    .conductorNombre(emp != null ? emp.getNombreCompleto() : "Conductor")
                    .conductorLicencia("")
                    .build());
        }

        // 7. Ordenar cronológicamente
        items.sort(Comparator.comparing(
                BitacoraVehicularItemResponse::fecha,
                Comparator.nullsLast(Comparator.naturalOrder())
        ));

        // 8. Calcular resumen de métricas
        BitacoraVehicularResumenResponse resumen = calcularResumen(items, cargasCombustible.size());

        // Actualizar próximo mantenimiento estimado si no estaba fijado
        Long ultimoKm = resumen.kmRetornoFinal() != null ? resumen.kmRetornoFinal() : resumen.kmSalidaInicial();
        Long proximoKm = vehiculoInfo.proximoMantenimientoKm();
        if (proximoKm == null && ultimoKm != null) {
            // Próximo múltiplo de 5000 km
            proximoKm = ((ultimoKm / 5000) + 1) * 5000;
        }

        BitacoraVehicularVehiculoInfo vehiculoFinal = BitacoraVehicularVehiculoInfo.builder()
                .id(vehiculoInfo.id())
                .codigo(vehiculoInfo.codigo())
                .nombre(vehiculoInfo.nombre())
                .placa(vehiculoInfo.placa())
                .marca(vehiculoInfo.marca())
                .modelo(vehiculoInfo.modelo())
                .tipoVehiculo(vehiculoInfo.tipoVehiculo())
                .kilometrajeActual(ultimoKm)
                .proximoMantenimientoKm(proximoKm)
                .build();

        String conductorFiltroNombre = null;
        if (conductorId != null) {
            ConductorEntity c = conductorRepository.findById(conductorId).orElse(null);
            if (c != null && c.getEmpleadoId() != null) {
                VEmpleadoEntity emp = vempleadoRepository.findById(c.getEmpleadoId()).orElse(null);
                conductorFiltroNombre = emp != null ? emp.getNombreCompleto() : "Conductor Seleccionado";
            }
        }

        return BitacoraVehicularReporteResponse.builder()
                .vehiculo(vehiculoFinal)
                .periodo(periodoInfo)
                .conductorFiltroNombre(conductorFiltroNombre)
                .resumen(resumen)
                .items(items)
                .build();
    }

    @Transactional(readOnly = true)
    public byte[] generarReportePdf(
            UUID activoId,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            UUID conductorId
    ) {
        BitacoraVehicularReporteResponse reporte = generarReporte(activoId, fechaInicio, fechaFin, conductorId);

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("TITULO_REPORTE", "BITACORA MENSUAL DE VEHICULOS");
        parameters.put("VEHICULO_TIPO", reporte.vehiculo().tipoVehiculo() != null ? reporte.vehiculo().tipoVehiculo() : reporte.vehiculo().nombre());
        parameters.put("VEHICULO_NOMBRE", reporte.vehiculo().nombre());
        parameters.put("VEHICULO_PLACA", reporte.vehiculo().placa() != null ? reporte.vehiculo().placa() : "-");
        parameters.put("ANIO", String.valueOf(reporte.periodo().anio()));
        parameters.put("MES", reporte.periodo().mes().toUpperCase(Locale.ROOT));
        parameters.put("PERIODO_TEXTO", reporte.periodo().fechaInicio() + " al " + reporte.periodo().fechaFin());
        parameters.put("CONDUCTOR_FILTRO", reporte.conductorFiltroNombre() != null ? reporte.conductorFiltroNombre() : "TODOS");
        parameters.put("TOTAL_KM", reporte.resumen().totalKmRecorridos() != null ? String.valueOf(reporte.resumen().totalKmRecorridos()) : "0");
        parameters.put("TOTAL_LITROS", reporte.resumen().totalLitrosCombustible() != null ? reporte.resumen().totalLitrosCombustible().toPlainString() : "0.00");
        parameters.put("TOTAL_IMPORTE", reporte.resumen().totalImporteCombustible() != null ? reporte.resumen().totalImporteCombustible().toPlainString() : "0.00");
        parameters.put("RENDIMIENTO", reporte.resumen().rendimientoKmPorLitro() != null ? reporte.resumen().rendimientoKmPorLitro().toPlainString() + " Km/L" : "-");
        parameters.put("PROXIMO_MANTENIMIENTO_KM", reporte.vehiculo().proximoMantenimientoKm() != null ? String.valueOf(reporte.vehiculo().proximoMantenimientoKm()) : "-");

        try {
            ClassPathResource logoResource = new ClassPathResource("reports/images/logo-ende-corani.png");
            if (logoResource.exists()) {
                parameters.put("LOGO_EMPRESA", logoResource.getInputStream());
            }
        } catch (Exception e) {
            log.warn("No se pudo cargar el logo institucional para la bitácora: {}", e.getMessage());
        }

        List<com.endecorani.sigma_api.modules.gestionvehicular.application.dto.bitacora.reporte.BitacoraVehicularItemReporteDto> dataSourceList = reporte.items().stream()
                .map(item -> com.endecorani.sigma_api.modules.gestionvehicular.application.dto.bitacora.reporte.BitacoraVehicularItemReporteDto.builder()
                        .id(item.id())
                        .dia(item.dia())
                        .diaSemana(item.diaSemana())
                        .tipoRegistro(item.tipoRegistro())
                        .kmSalida(item.kmSalida())
                        .kmLlegada(item.kmLlegada())
                        .kmRecorrido(item.kmRecorrido())
                        .descripcionTrabajo(item.descripcionTrabajo())
                        .solicitudNumero(item.solicitudNumero())
                        .combustibleFactura(item.combustibleFactura())
                        .combustibleLitros(item.combustibleLitros())
                        .combustibleImporte(item.combustibleImporte())
                        .supervisorNombre(item.supervisorNombre())
                        .supervisorVoBo(item.supervisorVoBo())
                        .observaciones(item.observaciones())
                        .conductorNombre(item.conductorNombre())
                        .conductorLicencia(item.conductorLicencia())
                        .build())
                .toList();

        return jasperReportService.generatePdfReport(REPORTE_BITACORA_PATH, parameters, dataSourceList);
    }

    private void validarParametros(UUID activoId, LocalDate fechaInicio, LocalDate fechaFin) {
        if (activoId == null) {
            throw new BusinessException("El vehículo (activoId) es obligatorio para generar la bitácora.");
        }
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

    private BitacoraVehicularVehiculoInfo obtenerVehiculoInfo(ActivoEntity activo) {
        String placa = null;
        String marca = null;
        String modelo = null;

        // 1. Obtener valores de atributos guardados
        List<ActivoAtributoValorEntity> valores = activoAtributoValorRepository.findByActivoId(activo.getId());
        if (!valores.isEmpty()) {
            Set<UUID> attrIds = valores.stream().map(ActivoAtributoValorEntity::getActivoAtributoId).collect(Collectors.toSet());
            Map<UUID, ActivoAtributoEntity> attrMap = activoAtributoRepository.findAllById(attrIds).stream()
                    .collect(Collectors.toMap(ActivoAtributoEntity::getId, a -> a));

            for (ActivoAtributoValorEntity v : valores) {
                ActivoAtributoEntity def = attrMap.get(v.getActivoAtributoId());
                if (def != null && def.getCodigo() != null) {
                    String cod = def.getCodigo().trim().toUpperCase(Locale.ROOT);
                    if ("PLACA".equals(cod) && v.getValor() != null && !v.getValor().isBlank()) {
                        placa = v.getValor().trim();
                    } else if ("MARCA".equals(cod)) {
                        marca = v.getValor() != null ? v.getValor().trim() : null;
                    } else if ("MODELO".equals(cod)) {
                        modelo = v.getValor() != null ? v.getValor().trim() : null;
                    }
                }
            }
        }

        // 2. Fallback con regex en la descripción si placa sigue nula
        if (placa == null && activo.getDescripcion() != null) {
            Matcher matcher = PLACA_PATTERN.matcher(activo.getDescripcion());
            if (matcher.find()) {
                String clean = matcher.group(1).replaceAll("[,.;-]+$", "").trim();
                if (!clean.equalsIgnoreCase("NO") && !clean.equalsIgnoreCase("NRO") && clean.length() >= 2) {
                    placa = clean;
                }
            }
        }

        String tipoNombre = null;
        if (activo.getTipoActivoId() != null) {
            tipoNombre = tipoActivoRepository.findById(activo.getTipoActivoId())
                    .map(t -> t.getNombre())
                    .orElse(null);
        }

        return BitacoraVehicularVehiculoInfo.builder()
                .id(activo.getId())
                .codigo(activo.getCodigo())
                .nombre(activo.getNombre())
                .placa(placa)
                .marca(marca)
                .modelo(modelo)
                .tipoVehiculo(tipoNombre != null ? tipoNombre : "Vehículo")
                .kilometrajeActual(null)
                .proximoMantenimientoKm(null)
                .build();
    }

    private BitacoraVehicularPeriodoInfo obtenerPeriodoInfo(LocalDate fechaInicio, LocalDate fechaFin) {
        String mes = fechaInicio.getMonth().getDisplayName(TextStyle.FULL, new Locale("es", "ES"));
        // Capitalizar mes
        mes = mes.substring(0, 1).toUpperCase(Locale.ROOT) + mes.substring(1);

        return BitacoraVehicularPeriodoInfo.builder()
                .fechaInicio(fechaInicio)
                .fechaFin(fechaFin)
                .mes(mes)
                .anio(fechaInicio.getYear())
                .build();
    }

    private String determinarDescripcionTrabajo(ViajeVehicularEntity viaje, SolicitudVehicularEntity solicitud) {
        if (solicitud != null) {
            if (solicitud.getDestino() != null && !solicitud.getDestino().isBlank()) {
                return solicitud.getDestino().trim();
            }
            if (solicitud.getMotivo() != null && !solicitud.getMotivo().isBlank()) {
                return solicitud.getMotivo().trim();
            }
        }
        if (viaje.getObservacion() != null && !viaje.getObservacion().isBlank()) {
            return viaje.getObservacion().trim();
        }
        return "Comisión de Servicio";
    }

    private String obtenerDiaSemanaAbrev(LocalDateTime fecha) {
        if (fecha == null) return "-";
        return switch (fecha.getDayOfWeek()) {
            case MONDAY -> "Lun";
            case TUESDAY -> "Mar";
            case WEDNESDAY -> "Mié";
            case THURSDAY -> "Jue";
            case FRIDAY -> "Vie";
            case SATURDAY -> "Sáb";
            case SUNDAY -> "Dom";
        };
    }

    private BitacoraVehicularResumenResponse calcularResumen(List<BitacoraVehicularItemResponse> items, int totalCargasCombustible) {
        int totalViajes = 0;
        Long kmSalidaInicial = null;
        Long kmRetornoFinal = null;
        long sumaKmRecorridos = 0;
        BigDecimal sumaLitros = BigDecimal.ZERO;
        BigDecimal sumaImporte = BigDecimal.ZERO;

        for (BitacoraVehicularItemResponse it : items) {
            if ("VIAJE".equals(it.tipoRegistro())) {
                totalViajes++;
                if (it.kmSalida() != null && kmSalidaInicial == null) {
                    kmSalidaInicial = it.kmSalida();
                }
                if (it.kmLlegada() != null) {
                    kmRetornoFinal = it.kmLlegada();
                }
                if (it.kmRecorrido() != null && it.kmRecorrido() > 0) {
                    sumaKmRecorridos += it.kmRecorrido();
                }
            }

            if (it.combustibleLitros() != null) {
                sumaLitros = sumaLitros.add(it.combustibleLitros());
            }
            if (it.combustibleImporte() != null) {
                sumaImporte = sumaImporte.add(it.combustibleImporte());
            }
        }

        // Si no se sumaron kmRecorridos por tramos pero existen kmSalidaInicial y kmRetornoFinal:
        if (sumaKmRecorridos == 0 && kmSalidaInicial != null && kmRetornoFinal != null && kmRetornoFinal >= kmSalidaInicial) {
            sumaKmRecorridos = kmRetornoFinal - kmSalidaInicial;
        }

        BigDecimal rendimiento = null;
        if (sumaLitros.compareTo(BigDecimal.ZERO) > 0 && sumaKmRecorridos > 0) {
            rendimiento = BigDecimal.valueOf(sumaKmRecorridos)
                    .divide(sumaLitros, 2, RoundingMode.HALF_UP);
        }

        BigDecimal costoPorKm = null;
        if (sumaKmRecorridos > 0 && sumaImporte.compareTo(BigDecimal.ZERO) > 0) {
            costoPorKm = sumaImporte
                    .divide(BigDecimal.valueOf(sumaKmRecorridos), 2, RoundingMode.HALF_UP);
        }

        return BitacoraVehicularResumenResponse.builder()
                .totalViajes(totalViajes)
                .totalCargasCombustible(totalCargasCombustible)
                .kmSalidaInicial(kmSalidaInicial)
                .kmRetornoFinal(kmRetornoFinal)
                .totalKmRecorridos(sumaKmRecorridos)
                .totalLitrosCombustible(sumaLitros)
                .totalImporteCombustible(sumaImporte)
                .rendimientoKmPorLitro(rendimiento)
                .costoPromedioPorKm(costoPorKm)
                .build();
    }
}
