package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoValorEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.reporte.BitacoraPorteriaItemPdfDto;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request.AnularRegistroPorteriaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request.RegistrarLlegadaPorteriaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request.RegistrarSalidaPorteriaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request.RegistroPorteriaActivoLlegadaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request.RegistroPorteriaActivoSalidaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.response.BitacoraPorteriaItemResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.response.RegistroPorteriaActivoResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.response.RegistroPorteriaResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.response.ReporteBitacoraPorteriaResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoRegistroPorteria;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.RegistroPorteria;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.RegistroPorteriaActivo;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SalidaVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.RegistroPorteriaRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.modules.parametros.application.service.CorrelativoService;
import com.endecorani.sigma_api.modules.parametros.domain.constant.CorrelativoCodigo;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.UbicacionEntity;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository.SpringUbicacionRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.infrastructure.report.JasperReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegistroPorteriaService {

    private static final String REPORTE_BITACORA_PORTERIA_PATH = "reports/gestion-vehicular/bitacora_porteria.jrxml";
    private static final ZoneId ZONA = ZoneId.of("America/La_Paz");
    private static final DateTimeFormatter FECHA_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter HORA_FMT = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter FECHA_HORA_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final Pattern PLACA_PATTERN = Pattern.compile(
            "PLACA(?:\\s*(?:N[°o.]+|NRO\\.?|NUM\\.?|#))?[:\\s#.-]+([0-9A-Za-z]+(?:[\\s-][0-9A-Za-z]+)?)(?:\\s+(?:CHASIS|MOTOR|COLOR|MARCA|MODELO|AÑO|ANIO|TIPO)|[,;.]|\\s*$)",
            Pattern.CASE_INSENSITIVE
    );

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "numero",
            "empleadoId",
            "fechaHoraSalida",
            "fechaHoraLlegada",
            "estado",
            "createdAt",
            "updatedAt");

    private final RegistroPorteriaRepository repository;
    private final SalidaVehicularRepository salidaVehicularRepository;
    private final SpringActivoRepository activoRepository;
    private final SpringActivoAtributoRepository activoAtributoRepository;
    private final SpringActivoAtributoValorRepository activoAtributoValorRepository;
    private final SpringVEmpleadoRepository vempleadoRepository;
    private final EmpleadoRepository empleadoRepository;
    private final SpringUbicacionRepository ubicacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final CorrelativoService correlativoService;
    private final SecurityUtils securityUtils;
    private final JasperReportService jasperReportService;

    @Transactional
    public RegistroPorteriaResponse registrarSalida(RegistrarSalidaPorteriaRequest request) {
        boolean esExterno = Boolean.TRUE.equals(request.esExterno());
        String personaExterna = trimToNull(request.personaExterna());
        String placaExterna = trimToNull(request.placaExterna());

        if (esExterno) {
            if (personaExterna == null) {
                throw new BusinessException("El nombre de la persona externa es obligatorio.");
            }
            if (placaExterna == null) {
                throw new BusinessException("La placa del vehículo externo es obligatoria.");
            }
        } else {
            if (request.empleadoId() == null) {
                throw new BusinessException("El funcionario que sale es obligatorio.");
            }
            if (!vempleadoRepository.existsById(request.empleadoId())) {
                throw new ResourceNotFoundException("Empleado", request.empleadoId());
            }
        }

        if (request.salidaVehicularId() != null
                && salidaVehicularRepository.findById(request.salidaVehicularId()).isEmpty()) {
            throw new ResourceNotFoundException("Salida Vehicular", request.salidaVehicularId());
        }

        if (request.origenUbicacionId() != null
                && !ubicacionRepository.existsById(request.origenUbicacionId())) {
            throw new ResourceNotFoundException("Ubicación de origen", request.origenUbicacionId());
        }

        if (request.destinoUbicacionId() != null
                && !ubicacionRepository.existsById(request.destinoUbicacionId())) {
            throw new ResourceNotFoundException("Ubicación de destino", request.destinoUbicacionId());
        }

        List<RegistroPorteriaActivo> items;
        if (esExterno) {
            if (request.activos() != null && !request.activos().isEmpty()) {
                items = construirItemsSalida(request.activos());
            } else {
                items = List.of(RegistroPorteriaActivo.builder()
                        .descripcionItem("Vehículo externo - Placa: " + placaExterna.toUpperCase())
                        .cantidad(1)
                        .observacionSalida(trimToNull(request.observacionSalida()))
                        .build());
            }
        } else {
            if (request.activos() == null || request.activos().isEmpty()) {
                throw new BusinessException("Debe registrar el vehículo o ítem que retira.");
            }
            items = construirItemsSalida(request.activos());
        }

        Instant fechaSalida = request.fechaHoraSalida() != null
                ? request.fechaHoraSalida()
                : Instant.now();

        String numero = correlativoService.generar(
                CorrelativoCodigo.REGISTRO_PORTERIA,
                LocalDate.now().getYear());

        RegistroPorteria registro = RegistroPorteria.builder()
                .numero(numero)
                .esExterno(esExterno)
                .personaExterna(personaExterna)
                .placaExterna(placaExterna != null ? placaExterna.toUpperCase() : null)
                .origenUbicacionId(request.origenUbicacionId())
                .destinoUbicacionId(request.destinoUbicacionId())
                .destinoOtro(trimToNull(request.destinoOtro()))
                .empleadoId(esExterno ? null : request.empleadoId())
                .guardiaSalidaId(obtenerEmpleadoIdActual())
                .salidaVehicularId(request.salidaVehicularId())
                .fechaHoraSalida(fechaSalida)
                .estado(EstadoRegistroPorteria.AFUERA)
                .observacionSalida(trimToNull(request.observacionSalida()))
                .activos(items)
                .build();

        RegistroPorteria guardado = repository.save(registro);
        return toResponse(guardado);
    }

    @Transactional
    public RegistroPorteriaResponse registrarLlegada(UUID id, RegistrarLlegadaPorteriaRequest request) {
        RegistroPorteria registro = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de Portería", id));

        if (registro.getEstado() != EstadoRegistroPorteria.AFUERA) {
            throw new BusinessException(
                    "Solo se puede registrar la llegada de un registro en estado AFUERA. Estado actual: "
                            + registro.getEstado());
        }

        Instant fechaLlegada = (request != null && request.fechaHoraLlegada() != null)
                ? request.fechaHoraLlegada()
                : Instant.now();

        if (fechaLlegada.isBefore(registro.getFechaHoraSalida())) {
            throw new BusinessException("La fecha/hora de llegada no puede ser anterior a la fecha/hora de salida.");
        }

        aplicarDetalleLlegada(registro, request);

        registro.setGuardiaLlegadaId(obtenerEmpleadoIdActual());
        registro.setFechaHoraLlegada(fechaLlegada);
        if (request != null) {
            registro.setObservacionLlegada(trimToNull(request.observacionLlegada()));
        }
        registro.setEstado(EstadoRegistroPorteria.COMPLETADO);

        RegistroPorteria guardado = repository.save(registro);
        return toResponse(guardado);
    }

    @Transactional
    public RegistroPorteriaResponse anular(UUID id, AnularRegistroPorteriaRequest request) {
        RegistroPorteria registro = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de Portería", id));

        if (registro.getEstado() != EstadoRegistroPorteria.AFUERA) {
            throw new BusinessException(
                    "Solo se puede anular un registro en estado AFUERA. Estado actual: " + registro.getEstado());
        }

        registro.setEstado(EstadoRegistroPorteria.ANULADO);
        if (request != null && request.motivo() != null && !request.motivo().isBlank()) {
            registro.setObservacionLlegada(request.motivo().trim());
        }

        RegistroPorteria guardado = repository.save(registro);
        return toResponse(guardado);
    }

    @Transactional(readOnly = true)
    public List<RegistroPorteriaResponse> listarAfuera() {
        AlcanceArea alcance = resolverAlcance(null, null);
        if (alcance.sinAcceso()) {
            return List.of();
        }
        List<RegistroPorteria> registros = repository.findAfuera(alcance.areaId(), alcance.createdById());
        return toResponseList(registros);
    }

    @Transactional(readOnly = true)
    public PageResponse<RegistroPorteriaResponse> listar(
            String search,
            UUID empleadoId,
            UUID activoId,
            UUID areaId,
            UUID createdById,
            EstadoRegistroPorteria estado,
            Instant fechaDesde,
            Instant fechaHasta,
            PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        AlcanceArea alcance = resolverAlcance(areaId, createdById);
        if (alcance.sinAcceso()) {
            return PageResponse.of(List.of(), new PageImpl<>(List.of(), pageable, 0));
        }

        Page<RegistroPorteria> page = repository.findAll(
                search,
                empleadoId,
                activoId,
                alcance.areaId(),
                alcance.createdById(),
                alcance.unirPorOr(),
                estado,
                fechaDesde,
                fechaHasta,
                pageable);
        List<RegistroPorteriaResponse> content = toResponseList(page.getContent());
        return PageResponse.of(content, page);
    }

    @Transactional(readOnly = true)
    public RegistroPorteriaResponse obtenerPorId(UUID id) {
        RegistroPorteria registro = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de Portería", id));

        AlcanceArea alcance = resolverAlcance(null, null);
        if (alcance.sinAcceso() || !tieneAccesoAlRegistro(registro, alcance)) {
            throw new ResourceNotFoundException("Registro de Portería", id);
        }
        return toResponse(registro);
    }

    /**
     * Genera el reporte completo de todos los datos registrados en portería al estilo de bitácora,
     * ordenado cronológicamente por fecha/hora de salida y con métricas consolidadas.
     */
    @Transactional(readOnly = true)
    public ReporteBitacoraPorteriaResponse generarReporteBitacora(
            String search,
            UUID empleadoId,
            UUID activoId,
            UUID areaId,
            UUID createdById,
            Boolean esExterno,
            EstadoRegistroPorteria estado,
            Instant fechaDesde,
            Instant fechaHasta) {
        if (fechaDesde != null && fechaHasta != null && fechaHasta.isBefore(fechaDesde)) {
            throw new BusinessException("La fecha de fin no puede ser anterior a la fecha de inicio.");
        }

        PeriodMeta periodoMeta = construirPeriodoMeta(fechaDesde, fechaHasta);

        AlcanceArea alcance = resolverAlcance(areaId, createdById);
        if (alcance.sinAcceso()) {
            return ReporteBitacoraPorteriaResponse.builder()
                    .periodoTexto(periodoMeta.periodoTexto())
                    .mes(periodoMeta.mes())
                    .anio(periodoMeta.anio())
                    .totalRegistros(0)
                    .totalInternos(0L)
                    .totalExternos(0L)
                    .totalAfuera(0L)
                    .totalCompletados(0L)
                    .totalAnulados(0L)
                    .totalActivosMovilizados(0L)
                    .totalActivosNoRetornados(0L)
                    .duracionPromedioMinutos(0.0)
                    .items(List.of())
                    .build();
        }

        List<RegistroPorteria> registros = new ArrayList<>(repository.findAllForReporte(
                search,
                empleadoId,
                activoId,
                alcance.areaId(),
                alcance.createdById(),
                alcance.unirPorOr(),
                esExterno,
                estado,
                fechaDesde,
                fechaHasta));

        registros.sort(Comparator.comparing(
                RegistroPorteria::getFechaHoraSalida,
                Comparator.nullsLast(Comparator.naturalOrder())));

        List<BitacoraPorteriaItemResponse> items = toBitacoraItemList(registros);

        long totalInternos = items.stream()
                .filter(i -> !Boolean.TRUE.equals(i.esExterno()))
                .count();
        long totalExternos = items.stream()
                .filter(i -> Boolean.TRUE.equals(i.esExterno()))
                .count();
        long totalAfuera = items.stream()
                .filter(i -> i.estado() == EstadoRegistroPorteria.AFUERA)
                .count();
        long totalCompletados = items.stream()
                .filter(i -> i.estado() == EstadoRegistroPorteria.COMPLETADO)
                .count();
        long totalAnulados = items.stream()
                .filter(i -> i.estado() == EstadoRegistroPorteria.ANULADO)
                .count();
        long totalActivosMovilizados = items.stream()
                .map(BitacoraPorteriaItemResponse::totalActivos)
                .filter(Objects::nonNull)
                .mapToLong(Integer::longValue)
                .sum();
        long totalActivosNoRetornados = items.stream()
                .map(BitacoraPorteriaItemResponse::activosPendientesRetorno)
                .filter(Objects::nonNull)
                .mapToLong(Integer::longValue)
                .sum();

        List<Long> duraciones = items.stream()
                .map(BitacoraPorteriaItemResponse::duracionMinutos)
                .filter(Objects::nonNull)
                .toList();
        double duracionPromedio = duraciones.isEmpty()
                ? 0.0
                : BigDecimal.valueOf(duraciones.stream().mapToLong(Long::longValue).sum())
                        .divide(BigDecimal.valueOf(duraciones.size()), 2, RoundingMode.HALF_UP)
                        .doubleValue();

        return ReporteBitacoraPorteriaResponse.builder()
                .periodoTexto(periodoMeta.periodoTexto())
                .mes(periodoMeta.mes())
                .anio(periodoMeta.anio())
                .totalRegistros(items.size())
                .totalInternos(totalInternos)
                .totalExternos(totalExternos)
                .totalAfuera(totalAfuera)
                .totalCompletados(totalCompletados)
                .totalAnulados(totalAnulados)
                .totalActivosMovilizados(totalActivosMovilizados)
                .totalActivosNoRetornados(totalActivosNoRetornados)
                .duracionPromedioMinutos(duracionPromedio)
                .items(items)
                .build();
    }

    /**
     * Genera el reporte oficial en PDF de la bitácora de control de portería en formato institucional ENDE CORANI.
     */
    @Transactional(readOnly = true)
    public byte[] generarReporteBitacoraPdf(
            String search,
            UUID empleadoId,
            UUID activoId,
            UUID areaId,
            UUID createdById,
            Boolean esExterno,
            EstadoRegistroPorteria estado,
            Instant fechaDesde,
            Instant fechaHasta) {
        ReporteBitacoraPorteriaResponse reporte = generarReporteBitacora(
                search, empleadoId, activoId, areaId, createdById, esExterno, estado, fechaDesde, fechaHasta);

        String filtroActivo = "TODOS LOS VEHÍCULOS Y ACTIVOS";
        if (activoId != null && activoRepository != null) {
            ActivoEntity act = activoRepository.findById(activoId).orElse(null);
            if (act != null) {
                Map<String, String> attrs = obtenerAtributosActivosBatch(Set.of(activoId))
                        .getOrDefault(activoId, Collections.emptyMap());
                String placa = attrs.get("PLACA");
                if (placa == null || placa.isBlank()) {
                    placa = extractPlacaFromDescripcion(act.getDescripcion());
                }
                filtroActivo = act.getCodigo() + " - " + act.getNombre()
                        + (placa != null && !placa.isBlank() ? " [" + placa + "]" : "");
            }
        }

        String filtroPersona = "TODOS (INTERNOS Y EXTERNOS)";
        if (empleadoId != null && vempleadoRepository != null) {
            filtroPersona = vempleadoRepository.findById(empleadoId)
                    .map(VEmpleadoEntity::getNombreCompleto)
                    .orElse("FUNCIONARIO SELECCIONADO");
        } else if (Boolean.TRUE.equals(esExterno)) {
            filtroPersona = "SOLO EXTERNOS / VISITAS";
        } else if (Boolean.FALSE.equals(esExterno)) {
            filtroPersona = "SOLO PERSONAL INTERNO";
        }

        List<BitacoraPorteriaItemPdfDto> dataSource = reporte.items().stream()
                .map(it -> {
                    String horaTexto = (it.horaSalidaFormateada() != null ? it.horaSalidaFormateada() : "-")
                            + " -> "
                            + (it.horaLlegadaFormateada() != null ? it.horaLlegadaFormateada() : "Pend.")
                            + (it.duracionTexto() != null && !"-".equals(it.duracionTexto())
                                    ? " (" + it.duracionTexto() + ")"
                                    : "");

                    String funcTexto = it.empleadoNombre() != null ? it.empleadoNombre() : "-";
                    if (Boolean.TRUE.equals(it.esExterno())) {
                        funcTexto = "[EXT] " + funcTexto;
                        if (it.placaExterna() != null && !it.placaExterna().isBlank()) {
                            funcTexto += " (" + it.placaExterna() + ")";
                        }
                    } else if (it.empleadoArea() != null && !it.empleadoArea().isBlank()) {
                        funcTexto += " - " + it.empleadoArea();
                    }

                    String guardiasTexto = "Sal: "
                            + (it.guardiaSalidaNombre() != null ? it.guardiaSalidaNombre() : "-")
                            + (it.guardiaLlegadaNombre() != null ? " / Lleg: " + it.guardiaLlegadaNombre() : "");

                    String estadoObs = "[" + (it.estado() != null ? it.estado().name() : "-") + "]";
                    if (it.observacionesConsolidadas() != null
                            && !it.observacionesConsolidadas().isBlank()
                            && !"-".equals(it.observacionesConsolidadas())) {
                        estadoObs += " " + it.observacionesConsolidadas();
                    }

                    return BitacoraPorteriaItemPdfDto.builder()
                            .id(it.id())
                            .dia(it.dia())
                            .numero(it.numero())
                            .fechaSalidaTexto(it.fechaFormateada())
                            .horaSalidaLlegadaTexto(horaTexto)
                            .funcionarioTexto(funcTexto)
                            .activosTexto(it.activosResumen())
                            .rutaTexto(it.rutaTexto())
                            .guardiasTexto(guardiasTexto)
                            .estadoObservacionesTexto(estadoObs)
                            .build();
                })
                .toList();

        Map<String, Object> parameters = new HashMap<>();
        try {
            ClassPathResource logoResource = new ClassPathResource("reports/images/logo-ende-corani.png");
            if (logoResource.exists()) {
                parameters.put("LOGO_EMPRESA", logoResource.getInputStream());
            }
        } catch (Exception e) {
            log.warn("No se pudo cargar el logo institucional: {}", e.getMessage());
        }

        parameters.put("TITULO_REPORTE", "BITACORA DE CONTROL DE PORTERIA");
        parameters.put("FORMULARIO_CODIGO", "GV-PRT-01");
        parameters.put("FORMULARIO_VERSION", "01");
        parameters.put("FILTRO_ACTIVO", filtroActivo);
        parameters.put("FILTRO_PERSONA", filtroPersona);
        parameters.put("FILTRO_ESTADO", estado != null ? estado.name() : "TODOS");
        parameters.put("PERIODO_TEXTO", reporte.periodoTexto());
        parameters.put("ANIO", String.valueOf(reporte.anio()));
        parameters.put("MES", reporte.mes());
        parameters.put("TOTAL_REGISTROS", String.valueOf(reporte.totalRegistros()));
        parameters.put("TOTAL_INTERNOS", String.valueOf(reporte.totalInternos()));
        parameters.put("TOTAL_EXTERNOS", String.valueOf(reporte.totalExternos()));
        parameters.put("TOTAL_COMPLETADOS", String.valueOf(reporte.totalCompletados()));
        parameters.put("TOTAL_AFUERA", String.valueOf(reporte.totalAfuera()));
        parameters.put("TOTAL_ACTIVOS", String.valueOf(reporte.totalActivosMovilizados()));

        return jasperReportService.generatePdfReport(REPORTE_BITACORA_PORTERIA_PATH, parameters, dataSource);
    }

    /**
     * Determina el alcance (sección y/o usuario creador) al que se restringe la
     * consulta.
     * <ul>
     * <li>Administrador: ve todo; opcionalmente puede filtrar por
     * {@code areaSolicitada} y/o {@code createdBySolicitado}.</li>
     * <li>Otro rol: se restringe a los registros de su área (sección) o los creados
     * por él ({@code createdById}).</li>
     * </ul>
     */
    private AlcanceArea resolverAlcance(UUID areaSolicitada, UUID createdBySolicitado) {
        if (securityUtils.isAdmin()) {
            return new AlcanceArea(areaSolicitada, createdBySolicitado, false, false);
        }
        UUID userId = securityUtils.getCurrentUserId().orElse(null);
        UUID areaActual = obtenerAreaIdPorUsuario(userId);
        if (areaActual == null && userId == null) {
            return new AlcanceArea(null, null, true, true);
        }
        return new AlcanceArea(areaActual, userId, true, false);
    }

    private boolean tieneAccesoAlRegistro(RegistroPorteria registro, AlcanceArea alcance) {
        if (alcance.areaId() == null && alcance.createdById() == null) {
            return true;
        }
        if (alcance.createdById() != null && alcance.createdById().equals(registro.getCreatedById())) {
            return true;
        }
        return alcance.areaId() != null && perteneceAlArea(registro, alcance.areaId());
    }

    private boolean perteneceAlArea(RegistroPorteria registro, UUID areaId) {
        if (areaId == null) {
            return true;
        }
        List<UUID> ids = new ArrayList<>(3);
        if (registro.getEmpleadoId() != null)
            ids.add(registro.getEmpleadoId());
        if (registro.getGuardiaSalidaId() != null)
            ids.add(registro.getGuardiaSalidaId());
        if (registro.getGuardiaLlegadaId() != null)
            ids.add(registro.getGuardiaLlegadaId());

        if (ids.isEmpty()) {
            return false;
        }
        return empleadoRepository.findAllById(ids).stream()
                .map(Empleado::getAreaId)
                .anyMatch(areaId::equals);
    }

    private UUID obtenerAreaIdPorUsuario(UUID userId) {
        if (userId == null) {
            return null;
        }
        try {
            return usuarioRepository.findById(userId)
                    .map(Usuario::getPersonaId)
                    .flatMap(empleadoRepository::findFirstByPersonaId)
                    .map(Empleado::getAreaId)
                    .orElse(null);
        } catch (Exception ex) {
            return null;
        }
    }

    /**
     * @param areaId      área (sección) a filtrar ({@code null} = sin filtro de
     *                    área).
     * @param createdById ID del usuario creador a incluir ({@code null} = sin
     *                    filtro por creador).
     * @param unirPorOr   {@code true} para unir {@code areaId} y
     *                    {@code createdById} con OR (alcance de usuario no-admin).
     * @param sinAcceso   {@code true} si el usuario no debe ver ningún registro.
     */
    private record AlcanceArea(UUID areaId, UUID createdById, boolean unirPorOr, boolean sinAcceso) {
    }

    private List<RegistroPorteriaActivo> construirItemsSalida(List<RegistroPorteriaActivoSalidaRequest> requests) {
        Set<UUID> activoIds = requests.stream()
                .map(RegistroPorteriaActivoSalidaRequest::activoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (!activoIds.isEmpty()) {
            Set<UUID> existentes = activoRepository.findAllById(activoIds).stream()
                    .map(ActivoEntity::getId)
                    .collect(Collectors.toSet());
            for (UUID activoId : activoIds) {
                if (!existentes.contains(activoId)) {
                    throw new ResourceNotFoundException("Activo", activoId);
                }
            }
        }

        List<RegistroPorteriaActivo> items = new ArrayList<>();
        for (RegistroPorteriaActivoSalidaRequest itemReq : requests) {
            String descripcion = trimToNull(itemReq.descripcionItem());
            if (itemReq.activoId() == null && descripcion == null) {
                throw new BusinessException("Cada ítem debe especificar un activoId o una descripcionItem.");
            }
            items.add(RegistroPorteriaActivo.builder()
                    .activoId(itemReq.activoId())
                    .descripcionItem(descripcion)
                    .cantidad(itemReq.cantidad() != null ? itemReq.cantidad() : 1)
                    .observacionSalida(trimToNull(itemReq.observacionSalida()))
                    .build());
        }
        return items;
    }

    private void aplicarDetalleLlegada(RegistroPorteria registro, RegistrarLlegadaPorteriaRequest request) {
        if (request == null || request.activos() == null || request.activos().isEmpty()) {
            for (RegistroPorteriaActivo item : registro.getActivos()) {
                item.setRetornado(Boolean.TRUE);
            }
            return;
        }

        Map<UUID, RegistroPorteriaActivo> itemsPorId = registro.getActivos().stream()
                .collect(Collectors.toMap(RegistroPorteriaActivo::getId, Function.identity()));

        for (RegistroPorteriaActivoLlegadaRequest llegadaItem : request.activos()) {
            RegistroPorteriaActivo item = itemsPorId.get(llegadaItem.itemId());
            if (item == null) {
                throw new BusinessException(
                        "El ítem " + llegadaItem.itemId() + " no pertenece al registro de portería.");
            }
            item.setRetornado(llegadaItem.retornado());
            item.setObservacionLlegada(trimToNull(llegadaItem.observacionLlegada()));
        }

        for (RegistroPorteriaActivo item : registro.getActivos()) {
            if (item.getRetornado() == null) {
                item.setRetornado(Boolean.TRUE);
            }
        }
    }

    private RegistroPorteriaResponse toResponse(RegistroPorteria registro) {
        return toResponseList(List.of(registro)).get(0);
    }

    private List<RegistroPorteriaResponse> toResponseList(List<RegistroPorteria> registros) {
        if (registros.isEmpty()) {
            return List.of();
        }

        Set<UUID> empleadoIds = new HashSet<>();
        Set<UUID> activoIds = new HashSet<>();
        Set<UUID> ubicacionIds = new HashSet<>();

        for (RegistroPorteria r : registros) {
            if (r.getEmpleadoId() != null)
                empleadoIds.add(r.getEmpleadoId());
            if (r.getGuardiaSalidaId() != null)
                empleadoIds.add(r.getGuardiaSalidaId());
            if (r.getGuardiaLlegadaId() != null)
                empleadoIds.add(r.getGuardiaLlegadaId());
            if (r.getOrigenUbicacionId() != null)
                ubicacionIds.add(r.getOrigenUbicacionId());
            if (r.getDestinoUbicacionId() != null)
                ubicacionIds.add(r.getDestinoUbicacionId());
            if (r.getActivos() != null) {
                for (RegistroPorteriaActivo a : r.getActivos()) {
                    if (a.getActivoId() != null)
                        activoIds.add(a.getActivoId());
                }
            }
        }

        Map<UUID, String> empleadosMap = empleadoIds.isEmpty()
                ? Collections.emptyMap()
                : vempleadoRepository.findAllById(empleadoIds).stream()
                        .collect(Collectors.toMap(
                                VEmpleadoEntity::getEmpleadoId,
                                VEmpleadoEntity::getNombreCompleto,
                                (a, b) -> a));

        Map<UUID, ActivoEntity> activosMap = activoIds.isEmpty()
                ? Collections.emptyMap()
                : activoRepository.findAllById(activoIds).stream()
                        .collect(Collectors.toMap(
                                ActivoEntity::getId,
                                Function.identity(),
                                (a, b) -> a));

        Map<UUID, String> ubicacionesMap = ubicacionIds.isEmpty()
                ? Collections.emptyMap()
                : ubicacionRepository.findAllById(ubicacionIds).stream()
                        .collect(Collectors.toMap(
                                UbicacionEntity::getId,
                                UbicacionEntity::getNombre,
                                (a, b) -> a));

        return registros.stream()
                .map(r -> mapToResponse(r, empleadosMap, activosMap, ubicacionesMap))
                .toList();
    }

    private RegistroPorteriaResponse mapToResponse(
            RegistroPorteria r,
            Map<UUID, String> empleadosMap,
            Map<UUID, ActivoEntity> activosMap,
            Map<UUID, String> ubicacionesMap) {
        List<RegistroPorteriaActivoResponse> activosResp = r.getActivos() == null
                ? List.of()
                : r.getActivos().stream()
                        .map(a -> {
                            ActivoEntity activo = a.getActivoId() != null ? activosMap.get(a.getActivoId()) : null;
                            return new RegistroPorteriaActivoResponse(
                                    a.getId(),
                                    a.getActivoId(),
                                    activo != null ? activo.getCodigo() : null,
                                    activo != null ? activo.getNombre() : null,
                                    a.getDescripcionItem(),
                                    a.getCantidad(),
                                    a.getObservacionSalida(),
                                    a.getRetornado(),
                                    a.getObservacionLlegada());
                        })
                        .toList();

        String empleadoNombre = r.getEmpleadoId() != null
                ? empleadosMap.get(r.getEmpleadoId())
                : (Boolean.TRUE.equals(r.getEsExterno()) && r.getPersonaExterna() != null
                        ? r.getPersonaExterna()
                        : null);

        String origenNombre = r.getOrigenUbicacionNombre() != null
                ? r.getOrigenUbicacionNombre()
                : (r.getOrigenUbicacionId() != null ? ubicacionesMap.get(r.getOrigenUbicacionId()) : null);

        String destinoNombre = r.getDestinoUbicacionNombre() != null
                ? r.getDestinoUbicacionNombre()
                : (r.getDestinoUbicacionId() != null ? ubicacionesMap.get(r.getDestinoUbicacionId()) : null);

        return new RegistroPorteriaResponse(
                r.getId(),
                r.getNumero(),
                r.getEsExterno(),
                r.getPersonaExterna(),
                r.getPlacaExterna(),
                r.getOrigenUbicacionId(),
                origenNombre,
                r.getDestinoUbicacionId(),
                destinoNombre,
                r.getDestinoOtro(),
                r.getEmpleadoId(),
                empleadoNombre,
                r.getGuardiaSalidaId(),
                r.getGuardiaSalidaId() != null ? empleadosMap.get(r.getGuardiaSalidaId()) : null,
                r.getGuardiaLlegadaId(),
                r.getGuardiaLlegadaId() != null ? empleadosMap.get(r.getGuardiaLlegadaId()) : null,
                r.getSalidaVehicularId(),
                r.getFechaHoraSalida(),
                r.getFechaHoraLlegada(),
                r.getEstado(),
                r.getObservacionSalida(),
                r.getObservacionLlegada(),
                activosResp,
                r.getCreatedAt(),
                r.getUpdatedAt());
    }

    private UUID obtenerEmpleadoIdActual() {
        try {
            return securityUtils.getCurrentUserId()
                    .flatMap(usuarioRepository::findById)
                    .map(Usuario::getPersonaId)
                    .flatMap(empleadoRepository::findFirstByPersonaId)
                    .map(Empleado::getId)
                    .orElse(null);
        } catch (Exception ex) {
            return null;
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    // =====================================================================
    // HELPERS PARA REPORTE TIPO BITÁCORA
    // =====================================================================

    private record PeriodMeta(String periodoTexto, String mes, Integer anio) {
    }

    private PeriodMeta construirPeriodoMeta(Instant fechaDesde, Instant fechaHasta) {
        Locale esBo = new Locale("es", "BO");
        LocalDate hoy = LocalDate.now(ZONA);
        if (fechaDesde != null && fechaHasta != null) {
            LocalDate desde = LocalDateTime.ofInstant(fechaDesde, ZONA).toLocalDate();
            LocalDate hasta = LocalDateTime.ofInstant(fechaHasta, ZONA).toLocalDate();
            String mes = desde.getMonth().getDisplayName(TextStyle.FULL, esBo).toUpperCase(Locale.ROOT);
            if (desde.getMonth() != hasta.getMonth()) {
                mes = mes + " - " + hasta.getMonth().getDisplayName(TextStyle.FULL, esBo).toUpperCase(Locale.ROOT);
            }
            return new PeriodMeta(desde + " al " + hasta, mes, desde.getYear());
        }
        if (fechaDesde != null) {
            LocalDate desde = LocalDateTime.ofInstant(fechaDesde, ZONA).toLocalDate();
            String mes = desde.getMonth().getDisplayName(TextStyle.FULL, esBo).toUpperCase(Locale.ROOT);
            return new PeriodMeta("Desde " + desde, mes, desde.getYear());
        }
        if (fechaHasta != null) {
            LocalDate hasta = LocalDateTime.ofInstant(fechaHasta, ZONA).toLocalDate();
            String mes = hasta.getMonth().getDisplayName(TextStyle.FULL, esBo).toUpperCase(Locale.ROOT);
            return new PeriodMeta("Hasta " + hasta, mes, hasta.getYear());
        }
        String mesActual = hoy.getMonth().getDisplayName(TextStyle.FULL, esBo).toUpperCase(Locale.ROOT);
        return new PeriodMeta("TODOS LOS REGISTROS", mesActual, hoy.getYear());
    }

    private List<BitacoraPorteriaItemResponse> toBitacoraItemList(List<RegistroPorteria> registros) {
        if (registros.isEmpty()) {
            return List.of();
        }

        Set<UUID> empleadoIds = new HashSet<>();
        Set<UUID> activoIds = new HashSet<>();
        Set<UUID> ubicacionIds = new HashSet<>();
        Set<UUID> salidaIds = new HashSet<>();

        for (RegistroPorteria r : registros) {
            if (r.getEmpleadoId() != null)
                empleadoIds.add(r.getEmpleadoId());
            if (r.getGuardiaSalidaId() != null)
                empleadoIds.add(r.getGuardiaSalidaId());
            if (r.getGuardiaLlegadaId() != null)
                empleadoIds.add(r.getGuardiaLlegadaId());
            if (r.getOrigenUbicacionId() != null)
                ubicacionIds.add(r.getOrigenUbicacionId());
            if (r.getDestinoUbicacionId() != null)
                ubicacionIds.add(r.getDestinoUbicacionId());
            if (r.getSalidaVehicularId() != null)
                salidaIds.add(r.getSalidaVehicularId());
            if (r.getActivos() != null) {
                for (RegistroPorteriaActivo a : r.getActivos()) {
                    if (a.getActivoId() != null)
                        activoIds.add(a.getActivoId());
                }
            }
        }

        Map<UUID, VEmpleadoEntity> empleadosMap = (empleadoIds.isEmpty() || vempleadoRepository == null)
                ? Collections.emptyMap()
                : vempleadoRepository.findAllById(empleadoIds).stream()
                        .collect(Collectors.toMap(
                                VEmpleadoEntity::getEmpleadoId,
                                Function.identity(),
                                (a, b) -> a));

        Map<UUID, ActivoEntity> activosMap = (activoIds.isEmpty() || activoRepository == null)
                ? Collections.emptyMap()
                : activoRepository.findAllById(activoIds).stream()
                        .collect(Collectors.toMap(
                                ActivoEntity::getId,
                                Function.identity(),
                                (a, b) -> a));

        Map<UUID, Map<String, String>> atributosActivosMap = obtenerAtributosActivosBatch(activoIds);

        Map<UUID, String> ubicacionesMap = (ubicacionIds.isEmpty() || ubicacionRepository == null)
                ? Collections.emptyMap()
                : ubicacionRepository.findAllById(ubicacionIds).stream()
                        .collect(Collectors.toMap(
                                UbicacionEntity::getId,
                                UbicacionEntity::getNombre,
                                (a, b) -> a));

        Map<UUID, String> salidaNumerosMap = new HashMap<>();
        if (!salidaIds.isEmpty() && salidaVehicularRepository != null) {
            for (UUID sId : salidaIds) {
                salidaVehicularRepository.findById(sId)
                        .map(SalidaVehicular::getNumero)
                        .ifPresent(num -> salidaNumerosMap.put(sId, num));
            }
        }

        return registros.stream()
                .map(r -> mapToBitacoraItem(
                        r,
                        empleadosMap,
                        activosMap,
                        atributosActivosMap,
                        ubicacionesMap,
                        salidaNumerosMap))
                .toList();
    }

    private BitacoraPorteriaItemResponse mapToBitacoraItem(
            RegistroPorteria r,
            Map<UUID, VEmpleadoEntity> empleadosMap,
            Map<UUID, ActivoEntity> activosMap,
            Map<UUID, Map<String, String>> atributosActivosMap,
            Map<UUID, String> ubicacionesMap,
            Map<UUID, String> salidaNumerosMap) {
        LocalDateTime salidaLocal = r.getFechaHoraSalida() != null
                ? LocalDateTime.ofInstant(r.getFechaHoraSalida(), ZONA)
                : null;
        LocalDateTime llegadaLocal = r.getFechaHoraLlegada() != null
                ? LocalDateTime.ofInstant(r.getFechaHoraLlegada(), ZONA)
                : null;

        Integer dia = salidaLocal != null ? salidaLocal.getDayOfMonth() : null;
        String diaSemana = obtenerDiaSemanaAbrev(salidaLocal);
        String fechaFormateada = salidaLocal != null ? FECHA_FMT.format(salidaLocal) : "-";
        String horaSalidaFormateada = salidaLocal != null ? HORA_FMT.format(salidaLocal) : "-";
        String horaLlegadaFormateada = null;
        if (llegadaLocal != null) {
            boolean mismoDia = salidaLocal != null && salidaLocal.toLocalDate().isEqual(llegadaLocal.toLocalDate());
            horaLlegadaFormateada = mismoDia ? HORA_FMT.format(llegadaLocal) : FECHA_HORA_FMT.format(llegadaLocal);
        }

        Long duracionMinutos = null;
        String duracionTexto = "-";
        if (r.getFechaHoraSalida() != null && r.getFechaHoraLlegada() != null
                && !r.getFechaHoraLlegada().isBefore(r.getFechaHoraSalida())) {
            duracionMinutos = Duration.between(r.getFechaHoraSalida(), r.getFechaHoraLlegada()).toMinutes();
            duracionTexto = formatearDuracion(duracionMinutos);
        } else if (r.getEstado() == EstadoRegistroPorteria.AFUERA) {
            duracionTexto = "En curso";
        }

        VEmpleadoEntity emp = r.getEmpleadoId() != null ? empleadosMap.get(r.getEmpleadoId()) : null;
        VEmpleadoEntity guardiaSal = r.getGuardiaSalidaId() != null ? empleadosMap.get(r.getGuardiaSalidaId()) : null;
        VEmpleadoEntity guardiaLleg = r.getGuardiaLlegadaId() != null ? empleadosMap.get(r.getGuardiaLlegadaId()) : null;

        boolean esExt = Boolean.TRUE.equals(r.getEsExterno());
        String empleadoNombre = emp != null
                ? emp.getNombreCompleto()
                : (esExt && r.getPersonaExterna() != null ? r.getPersonaExterna() : null);

        List<RegistroPorteriaActivoResponse> activosResp = new ArrayList<>();
        List<String> resumenPartes = new ArrayList<>();
        int totalActivos = 0;
        int retornados = 0;
        int pendientes = 0;

        UUID activoPrincipalId = null;
        String vehiculoPlaca = esExt ? r.getPlacaExterna() : null;
        String vehiculoCodigo = null;
        String vehiculoNombre = null;

        if (r.getActivos() != null) {
            for (RegistroPorteriaActivo a : r.getActivos()) {
                ActivoEntity activo = a.getActivoId() != null ? activosMap.get(a.getActivoId()) : null;
                Map<String, String> attrs = a.getActivoId() != null
                        ? atributosActivosMap.getOrDefault(a.getActivoId(), Collections.emptyMap())
                        : Collections.emptyMap();

                String codigo = activo != null ? activo.getCodigo() : null;
                String nombre = activo != null ? activo.getNombre() : null;
                String placa = attrs.get("PLACA");
                if ((placa == null || placa.isBlank()) && activo != null) {
                    placa = extractPlacaFromDescripcion(activo.getDescripcion());
                }
                if ((placa == null || placa.isBlank()) && a.getDescripcionItem() != null) {
                    placa = extractPlacaFromDescripcion(a.getDescripcionItem());
                }

                if (activoPrincipalId == null && a.getActivoId() != null) {
                    activoPrincipalId = a.getActivoId();
                    vehiculoCodigo = codigo;
                    vehiculoNombre = nombre;
                }
                if ((vehiculoPlaca == null || vehiculoPlaca.isBlank()) && placa != null && !placa.isBlank()) {
                    vehiculoPlaca = placa;
                }

                int cant = a.getCantidad() != null ? a.getCantidad() : 1;
                totalActivos += cant;
                if (Boolean.TRUE.equals(a.getRetornado())) {
                    retornados += cant;
                } else if (Boolean.FALSE.equals(a.getRetornado())) {
                    pendientes += cant;
                }

                activosResp.add(new RegistroPorteriaActivoResponse(
                        a.getId(),
                        a.getActivoId(),
                        codigo,
                        nombre,
                        a.getDescripcionItem(),
                        cant,
                        a.getObservacionSalida(),
                        a.getRetornado(),
                        a.getObservacionLlegada()));

                StringBuilder parte = new StringBuilder();
                if (codigo != null && nombre != null) {
                    parte.append(codigo).append(" - ").append(nombre);
                } else if (nombre != null) {
                    parte.append(nombre);
                } else if (a.getDescripcionItem() != null) {
                    parte.append(a.getDescripcionItem());
                } else {
                    parte.append("Ítem");
                }
                if (placa != null && !placa.isBlank() && !parte.toString().contains(placa)) {
                    parte.append(" [").append(placa).append("]");
                }
                if (cant > 1) {
                    parte.append(" x").append(cant);
                }
                if (Boolean.FALSE.equals(a.getRetornado())) {
                    parte.append(" (NO RETORNÓ)");
                }
                resumenPartes.add(parte.toString());
            }
        }

        String activosResumen = resumenPartes.isEmpty()
                ? (esExt && r.getPlacaExterna() != null ? "Vehículo externo - Placa: " + r.getPlacaExterna() : "-")
                : String.join("; ", resumenPartes);

        String origenNombre = r.getOrigenUbicacionNombre() != null
                ? r.getOrigenUbicacionNombre()
                : (r.getOrigenUbicacionId() != null ? ubicacionesMap.get(r.getOrigenUbicacionId()) : null);

        String destinoCatNombre = r.getDestinoUbicacionNombre() != null
                ? r.getDestinoUbicacionNombre()
                : (r.getDestinoUbicacionId() != null ? ubicacionesMap.get(r.getDestinoUbicacionId()) : null);

        String destinoEfectivo = (destinoCatNombre != null && !destinoCatNombre.isBlank())
                ? destinoCatNombre
                : r.getDestinoOtro();

        String rutaTexto;
        if (origenNombre != null && destinoEfectivo != null) {
            rutaTexto = origenNombre + " -> " + destinoEfectivo;
        } else if (destinoEfectivo != null) {
            rutaTexto = "Destino: " + destinoEfectivo;
        } else if (origenNombre != null) {
            rutaTexto = "Origen: " + origenNombre;
        } else {
            rutaTexto = "-";
        }

        // Descripción de actividad estilo bitácora
        List<String> descPartes = new ArrayList<>();
        if (!"-".equals(rutaTexto)) {
            descPartes.add("Ruta: " + rutaTexto);
        }
        if (r.getObservacionSalida() != null && !r.getObservacionSalida().isBlank()) {
            descPartes.add(r.getObservacionSalida());
        }
        if (!"-".equals(activosResumen)) {
            descPartes.add("Activos: " + activosResumen);
        }
        String descripcionActividad = descPartes.isEmpty() ? "Movimiento en portería" : String.join(" | ", descPartes);

        // Observaciones consolidadas
        List<String> obsPartes = new ArrayList<>();
        if (r.getObservacionSalida() != null && !r.getObservacionSalida().isBlank()) {
            obsPartes.add("Sal: " + r.getObservacionSalida());
        }
        if (r.getObservacionLlegada() != null && !r.getObservacionLlegada().isBlank()) {
            obsPartes.add("Lleg: " + r.getObservacionLlegada());
        }
        if (r.getActivos() != null) {
            for (RegistroPorteriaActivo a : r.getActivos()) {
                if (a.getObservacionLlegada() != null && !a.getObservacionLlegada().isBlank()) {
                    obsPartes.add("Ítem: " + a.getObservacionLlegada());
                }
            }
        }
        String observacionesConsolidadas = obsPartes.isEmpty() ? "-" : String.join(" | ", obsPartes);

        return BitacoraPorteriaItemResponse.builder()
                .id(r.getId())
                .numero(r.getNumero())
                .dia(dia)
                .diaSemana(diaSemana)
                .fechaFormateada(fechaFormateada)
                .horaSalidaFormateada(horaSalidaFormateada)
                .horaLlegadaFormateada(horaLlegadaFormateada)
                .fechaHoraSalida(r.getFechaHoraSalida())
                .fechaHoraLlegada(r.getFechaHoraLlegada())
                .duracionMinutos(duracionMinutos)
                .duracionTexto(duracionTexto)
                .esExterno(esExt)
                .tipoRegistro(esExt ? "EXTERNO" : "INTERNO")
                .empleadoId(r.getEmpleadoId())
                .empleadoCodigo(emp != null ? emp.getCodigo() : null)
                .empleadoNombre(empleadoNombre)
                .empleadoCargo(emp != null ? emp.getCargo() : null)
                .empleadoArea(emp != null ? emp.getArea() : null)
                .personaExterna(r.getPersonaExterna())
                .placaExterna(r.getPlacaExterna())
                .activoPrincipalId(activoPrincipalId)
                .vehiculoPlaca(vehiculoPlaca)
                .vehiculoCodigo(vehiculoCodigo)
                .vehiculoNombre(vehiculoNombre)
                .activosResumen(activosResumen)
                .totalActivos(totalActivos)
                .activosRetornados(retornados)
                .activosPendientesRetorno(pendientes)
                .activos(activosResp)
                .origenUbicacionId(r.getOrigenUbicacionId())
                .origenUbicacionNombre(origenNombre)
                .destinoUbicacionId(r.getDestinoUbicacionId())
                .destinoUbicacionNombre(destinoCatNombre)
                .destinoOtro(r.getDestinoOtro())
                .rutaTexto(rutaTexto)
                .descripcionActividad(descripcionActividad)
                .guardiaSalidaId(r.getGuardiaSalidaId())
                .guardiaSalidaNombre(guardiaSal != null ? guardiaSal.getNombreCompleto() : null)
                .guardiaLlegadaId(r.getGuardiaLlegadaId())
                .guardiaLlegadaNombre(guardiaLleg != null ? guardiaLleg.getNombreCompleto() : null)
                .salidaVehicularId(r.getSalidaVehicularId())
                .salidaVehicularNumero(r.getSalidaVehicularId() != null ? salidaNumerosMap.get(r.getSalidaVehicularId()) : null)
                .observacionSalida(r.getObservacionSalida())
                .observacionLlegada(r.getObservacionLlegada())
                .observacionesConsolidadas(observacionesConsolidadas)
                .estado(r.getEstado())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .createdBy(r.getCreatedBy())
                .updatedBy(r.getUpdatedBy())
                .build();
    }

    private Map<UUID, Map<String, String>> obtenerAtributosActivosBatch(Set<UUID> activoIds) {
        if (activoIds == null || activoIds.isEmpty()
                || activoAtributoValorRepository == null || activoAtributoRepository == null) {
            return Collections.emptyMap();
        }
        List<ActivoAtributoValorEntity> valores = activoAtributoValorRepository.findByActivoIdIn(new ArrayList<>(activoIds));
        if (valores == null || valores.isEmpty()) {
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
                        .collect(Collectors.toMap(
                                ActivoAtributoEntity::getId,
                                a -> a.getCodigo().toUpperCase(Locale.ROOT),
                                (a, b) -> a));

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
        if (descripcion == null || descripcion.isBlank()) {
            return null;
        }
        Matcher m = PLACA_PATTERN.matcher(descripcion);
        if (m.find()) {
            String clean = m.group(1).replaceAll("[,.;-]+$", "").trim();
            if (!clean.equalsIgnoreCase("NO") && !clean.equalsIgnoreCase("NRO") && clean.length() >= 2) {
                return clean;
            }
        }
        return null;
    }

    private String formatearDuracion(long totalMin) {
        if (totalMin < 1) {
            return "< 1 min";
        }
        long d = totalMin / 1440;
        long h = (totalMin % 1440) / 60;
        long m = totalMin % 60;
        if (d > 0) {
            return d + "d " + h + "h";
        }
        if (h > 0) {
            return String.format("%dh %02dm", h, m);
        }
        return m + " min";
    }

    private String obtenerDiaSemanaAbrev(LocalDateTime fecha) {
        if (fecha == null) {
            return "-";
        }
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
}
