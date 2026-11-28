package com.endecorani.sigma_api.modules.cuestionarios.application.service;

import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.AsignacionCuestionarioResponse;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.CuestionarioReporteResumenResponse;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.DistribucionOpcionResponse;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.ReportePorEvaluadoResponse;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.ReportePorPreguntaResponse;
import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.EstadoAsignacionCuestionario;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.Cuestionario;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioAsignacion;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioPregunta;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioPreguntaOpcion;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioRespuestaDetalle;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioAsignacionRepository;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioRepository;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioRespuestaDetalleRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CuestionarioReporteService {

    public static final ZoneId ZONA_OPERATIVA = ZoneId.of("America/La_Paz");
    private static final BigDecimal CIEN = BigDecimal.valueOf(100);

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "fechaRespuesta",
            "fechaHabilitacion",
            "puntajeTotal",
            "porcentaje",
            "createdAt",
            "updatedAt"
    );

    private final CuestionarioRepository cuestionarioRepository;
    private final CuestionarioAsignacionRepository asignacionRepository;
    private final CuestionarioRespuestaDetalleRepository respuestaDetalleRepository;
    private final CuestionarioService cuestionarioService;
    private final CuestionarioAsignacionService asignacionService;

    @Transactional(readOnly = true)
    public CuestionarioReporteResumenResponse obtenerResumen(
            UUID cuestionarioId,
            UUID evaluadoId,
            LocalDate fechaDesde,
            LocalDate fechaHasta
    ) {
        Cuestionario cuestionario = cuestionarioRepository.findById(cuestionarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Cuestionario", cuestionarioId));

        Instant desde = fechaDesde != null ? fechaDesde.atStartOfDay(ZONA_OPERATIVA).toInstant() : null;
        Instant hastaExclusivo = fechaHasta != null ? fechaHasta.plusDays(1).atStartOfDay(ZONA_OPERATIVA).toInstant() : null;

        List<CuestionarioAsignacion> asignaciones = asignacionRepository.findForReporteResumen(
                cuestionarioId, evaluadoId, desde, hastaExclusivo
        );

        long totalAsignadas = asignaciones.size();
        List<CuestionarioAsignacion> respondidas = asignaciones.stream()
                .filter(a -> a.getEstado() == EstadoAsignacionCuestionario.RESPONDIDO)
                .toList();
        long totalRespondidas = respondidas.size();
        long totalPendientes = asignaciones.stream()
                .filter(a -> a.getEstado() == EstadoAsignacionCuestionario.PENDIENTE)
                .count();

        BigDecimal tasaParticipacion = totalAsignadas > 0
                ? BigDecimal.valueOf(totalRespondidas).multiply(CIEN)
                        .divide(BigDecimal.valueOf(totalAsignadas), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        BigDecimal promedioPuntaje = promedio(respondidas.stream()
                .map(CuestionarioAsignacion::getPuntajeTotal)
                .filter(Objects::nonNull)
                .toList());

        BigDecimal promedioPorcentaje = promedio(respondidas.stream()
                .map(CuestionarioAsignacion::getPorcentaje)
                .filter(Objects::nonNull)
                .toList());

        List<CuestionarioPregunta> preguntas = cuestionarioService.cargarPreguntasConOpciones(cuestionarioId, false);
        List<UUID> respondidasIds = respondidas.stream().map(CuestionarioAsignacion::getId).toList();
        List<CuestionarioRespuestaDetalle> detalles = respondidasIds.isEmpty()
                ? List.of()
                : respuestaDetalleRepository.findByAsignacionIdIn(respondidasIds);

        Map<UUID, List<CuestionarioRespuestaDetalle>> detallesPorPregunta = detalles.stream()
                .collect(Collectors.groupingBy(CuestionarioRespuestaDetalle::getPreguntaId));

        List<ReportePorPreguntaResponse> porPregunta = preguntas.stream()
                .map(p -> construirReportePregunta(p, detallesPorPregunta.getOrDefault(p.getId(), List.of())))
                .toList();

        List<ReportePorEvaluadoResponse> porEvaluado = construirReportePorEvaluado(respondidas);

        return new CuestionarioReporteResumenResponse(
                cuestionario.getId(),
                cuestionario.getNombre(),
                cuestionario.getAnonimoEnReportes(),
                totalAsignadas,
                totalRespondidas,
                totalPendientes,
                tasaParticipacion,
                promedioPuntaje,
                promedioPorcentaje,
                porPregunta,
                porEvaluado
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<AsignacionCuestionarioResponse> listarRespuestas(
            UUID cuestionarioId,
            UUID evaluadoId,
            LocalDate fechaDesde,
            LocalDate fechaHasta,
            PageRequestDto pageRequest
    ) {
        cuestionarioRepository.findById(cuestionarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Cuestionario", cuestionarioId));

        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Instant desde = fechaDesde != null ? fechaDesde.atStartOfDay(ZONA_OPERATIVA).toInstant() : null;
        Instant hastaExclusivo = fechaHasta != null ? fechaHasta.plusDays(1).atStartOfDay(ZONA_OPERATIVA).toInstant() : null;

        Page<CuestionarioAsignacion> page = asignacionRepository.findRespuestasForReporte(
                cuestionarioId, evaluadoId, desde, hastaExclusivo, pageable
        );

        if (page.isEmpty()) {
            return PageResponse.of(List.of(), page);
        }

        List<AsignacionCuestionarioResponse> content = asignacionService.mapearAsignaciones(
                page.getContent(),
                null,
                true
        );

        return PageResponse.of(content, page);
    }

    private ReportePorPreguntaResponse construirReportePregunta(
            CuestionarioPregunta pregunta,
            List<CuestionarioRespuestaDetalle> respuestas
    ) {
        long total = respuestas.size();
        BigDecimal promedioValor = promedio(respuestas.stream()
                .map(CuestionarioRespuestaDetalle::getValorNumerico)
                .filter(Objects::nonNull)
                .toList());
        BigDecimal promedioPuntaje = promedio(respuestas.stream()
                .map(CuestionarioRespuestaDetalle::getPuntajeObtenido)
                .filter(Objects::nonNull)
                .toList());

        List<DistribucionOpcionResponse> distribucion = calcularDistribucion(pregunta, respuestas, total);

        return new ReportePorPreguntaResponse(
                pregunta.getId(),
                pregunta.getOrden(),
                pregunta.getSeccion(),
                pregunta.getEnunciado(),
                pregunta.getTipoPregunta(),
                total,
                promedioValor,
                promedioPuntaje,
                distribucion
        );
    }

    private List<DistribucionOpcionResponse> calcularDistribucion(
            CuestionarioPregunta pregunta,
            List<CuestionarioRespuestaDetalle> respuestas,
            long total
    ) {
        return switch (pregunta.getTipoPregunta()) {
            case ESTRELLAS_1_5, ESCALA_1_5 -> {
                Map<String, Long> conteos = new LinkedHashMap<>();
                for (int i = 1; i <= 5; i++) {
                    conteos.put(String.valueOf(i), 0L);
                }
                for (CuestionarioRespuestaDetalle r : respuestas) {
                    if (r.getValorNumerico() != null) {
                        String key = r.getValorNumerico().stripTrailingZeros().toPlainString();
                        conteos.merge(key, 1L, Long::sum);
                    }
                }
                yield toDistribucionList(conteos, total);
            }
            case SI_NO -> {
                long si = respuestas.stream().filter(r -> Boolean.TRUE.equals(r.getValorBooleano())).count();
                long no = respuestas.stream().filter(r -> Boolean.FALSE.equals(r.getValorBooleano())).count();
                Map<String, Long> conteos = new LinkedHashMap<>();
                conteos.put("Sí", si);
                conteos.put("No", no);
                yield toDistribucionList(conteos, total);
            }
            case OPCION_UNICA -> {
                Map<UUID, Long> porId = respuestas.stream()
                        .map(CuestionarioRespuestaDetalle::getOpcionId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.groupingBy(id -> id, Collectors.counting()));
                Map<String, Long> conteos = new LinkedHashMap<>();
                for (CuestionarioPreguntaOpcion op : pregunta.getOpciones()) {
                    conteos.put(op.getEtiqueta(), porId.getOrDefault(op.getId(), 0L));
                }
                yield toDistribucionList(conteos, total);
            }
            case OPCION_MULTIPLE -> {
                Map<UUID, Long> porId = new LinkedHashMap<>();
                for (CuestionarioRespuestaDetalle r : respuestas) {
                    if (r.getOpcionesIds() != null) {
                        for (UUID opId : r.getOpcionesIds()) {
                            porId.merge(opId, 1L, Long::sum);
                        }
                    }
                }
                Map<String, Long> conteos = new LinkedHashMap<>();
                for (CuestionarioPreguntaOpcion op : pregunta.getOpciones()) {
                    conteos.put(op.getEtiqueta(), porId.getOrDefault(op.getId(), 0L));
                }
                yield toDistribucionList(conteos, total);
            }
            case TEXTO_CORTO, TEXTO_LARGO, NUMERICO -> List.of();
        };
    }

    private List<DistribucionOpcionResponse> toDistribucionList(Map<String, Long> conteos, long total) {
        List<DistribucionOpcionResponse> list = new ArrayList<>();
        for (Map.Entry<String, Long> entry : conteos.entrySet()) {
            long cantidad = entry.getValue();
            BigDecimal pct = total > 0
                    ? BigDecimal.valueOf(cantidad).multiply(CIEN).divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
            list.add(new DistribucionOpcionResponse(entry.getKey(), cantidad, pct));
        }
        return list;
    }

    private List<ReportePorEvaluadoResponse> construirReportePorEvaluado(List<CuestionarioAsignacion> respondidas) {
        Map<UUID, List<CuestionarioAsignacion>> porEvaluado = respondidas.stream()
                .filter(a -> a.getEvaluadoId() != null)
                .collect(Collectors.groupingBy(CuestionarioAsignacion::getEvaluadoId));

        return porEvaluado.entrySet().stream()
                .map(entry -> {
                    UUID evalId = entry.getKey();
                    List<CuestionarioAsignacion> lista = entry.getValue();
                    CuestionarioAsignacion primero = lista.get(0);
                    String nombre = lista.stream()
                            .map(CuestionarioAsignacion::getEvaluadoNombreSnapshot)
                            .filter(n -> n != null && !n.isBlank())
                            .findFirst()
                            .orElse(null);
                    BigDecimal promPuntaje = promedio(lista.stream()
                            .map(CuestionarioAsignacion::getPuntajeTotal)
                            .filter(Objects::nonNull)
                            .toList());
                    BigDecimal promPorcentaje = promedio(lista.stream()
                            .map(CuestionarioAsignacion::getPorcentaje)
                            .filter(Objects::nonNull)
                            .toList());
                    return new ReportePorEvaluadoResponse(
                            primero.getEvaluadoTipo(),
                            evalId,
                            nombre,
                            lista.size(),
                            promPuntaje,
                            promPorcentaje
                    );
                })
                .sorted(Comparator
                        .comparing(ReportePorEvaluadoResponse::promedioPorcentaje, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(ReportePorEvaluadoResponse::evaluadoNombre, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    private BigDecimal promedio(List<BigDecimal> valores) {
        if (valores == null || valores.isEmpty()) {
            return null;
        }
        BigDecimal suma = valores.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return suma.divide(BigDecimal.valueOf(valores.size()), 2, RoundingMode.HALF_UP);
    }
}
