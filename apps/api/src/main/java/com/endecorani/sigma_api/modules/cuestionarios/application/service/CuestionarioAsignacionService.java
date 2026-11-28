package com.endecorani.sigma_api.modules.cuestionarios.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.request.ResponderCuestionarioRequest;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.AsignacionCuestionarioResponse;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.AsignacionDetalleResponse;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.CuestionarioDetalleResponse;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.RespuestaDetalleResponse;
import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.EstadoAsignacionCuestionario;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.Cuestionario;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioAsignacion;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioPregunta;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioRespuestaDetalle;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioAsignacionRepository;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioRepository;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioRespuestaDetalleRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ForbiddenException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CuestionarioAsignacionService {

    private static final int MAX_LOTE_IDS = 100;

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "estado",
            "fechaHabilitacion",
            "fechaRespuesta",
            "puntajeTotal",
            "porcentaje",
            "createdAt",
            "updatedAt"
    );

    private final CuestionarioRepository cuestionarioRepository;
    private final CuestionarioAsignacionRepository asignacionRepository;
    private final CuestionarioRespuestaDetalleRepository respuestaDetalleRepository;
    private final CuestionarioService cuestionarioService;
    private final CuestionarioPuntajeCalculator puntajeCalculator;
    private final SecurityUtils securityUtils;
    private final UsuarioRepository usuarioRepository;
    private final EmpleadoRepository empleadoRepository;
    private final SpringVEmpleadoRepository springVEmpleadoRepository;

    @Transactional
    public Optional<CuestionarioAsignacion> crearAsignacionSiExistePublicado(
            String moduloOrigen,
            String entidadTipo,
            String eventoDisparador,
            UUID entidadId,
            String entidadCodigoRef,
            String evaluadoTipo,
            UUID evaluadoId,
            String evaluadoNombreSnapshot,
            UUID evaluadorEmpleadoId
    ) {
        if (entidadId == null || evaluadorEmpleadoId == null) {
            return Optional.empty();
        }
        String moduloNorm = normalizarClave(moduloOrigen);
        String entidadTipoNorm = normalizarClave(entidadTipo);
        String eventoNorm = normalizarClave(eventoDisparador);
        if (moduloNorm == null || entidadTipoNorm == null || eventoNorm == null) {
            return Optional.empty();
        }

        Optional<Cuestionario> cuestionarioOpt = cuestionarioRepository
                .findPublishedActiveByDisparador(moduloNorm, entidadTipoNorm, eventoNorm);
        if (cuestionarioOpt.isEmpty()) {
            return Optional.empty();
        }

        Cuestionario cuestionario = cuestionarioOpt.get();
        Optional<CuestionarioAsignacion> existente = asignacionRepository
                .findByCuestionarioIdAndEntidadTipoAndEntidadIdAndEvaluadorEmpleadoId(
                        cuestionario.getId(), entidadTipoNorm, entidadId, evaluadorEmpleadoId
                );
        if (existente.isPresent()) {
            return existente;
        }

        CuestionarioAsignacion nueva = CuestionarioAsignacion.builder()
                .cuestionarioId(cuestionario.getId())
                .cuestionarioVersion(cuestionario.getVersion() != null ? cuestionario.getVersion() : 1)
                .moduloOrigen(moduloNorm)
                .entidadTipo(entidadTipoNorm)
                .entidadId(entidadId)
                .entidadCodigoRef(StringUtils.trimToNull(entidadCodigoRef))
                .evaluadoTipo(normalizarClave(evaluadoTipo))
                .evaluadoId(evaluadoId)
                .evaluadoNombreSnapshot(StringUtils.trimToNull(evaluadoNombreSnapshot))
                .evaluadorEmpleadoId(evaluadorEmpleadoId)
                .obligatorio(Boolean.TRUE.equals(cuestionario.getObligatorio()))
                .anonimoEnReportes(Boolean.TRUE.equals(cuestionario.getAnonimoEnReportes()))
                .estado(EstadoAsignacionCuestionario.PENDIENTE)
                .fechaHabilitacion(Instant.now())
                .build();

        return Optional.of(asignacionRepository.save(nueva));
    }

    @Transactional(readOnly = true)
    public PageResponse<AsignacionCuestionarioResponse> listarMisPendientes(
            PageRequestDto pageRequest,
            String estado,
            String entidadTipo
    ) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        UUID empleadoId = obtenerEmpleadoIdActual();
        if (empleadoId == null) {
            return PageResponse.of(
                    Collections.emptyList(),
                    new PageImpl<>(Collections.emptyList(), pageable, 0)
            );
        }

        EstadoAsignacionCuestionario estadoFiltro = parseEstadoFiltro(estado);
        String entidadTipoNorm = normalizarClave(entidadTipo);

        Page<CuestionarioAsignacion> page = asignacionRepository.findByEvaluadorWithFilters(
                empleadoId, estadoFiltro, entidadTipoNorm, pageable
        );

        if (page.isEmpty()) {
            return PageResponse.of(List.of(), page);
        }

        List<AsignacionCuestionarioResponse> content = mapearAsignaciones(page.getContent(), empleadoId, false);
        return PageResponse.of(content, page);
    }

    @Transactional(readOnly = true)
    public List<AsignacionCuestionarioResponse> listarPorEntidad(String entidadTipo, UUID entidadId) {
        String entidadTipoNorm = normalizarClave(entidadTipo);
        if (entidadTipoNorm == null || entidadId == null) {
            return List.of();
        }

        UUID empleadoId = obtenerEmpleadoIdActual();
        boolean privilegioSupervision = esAdminOSupervisor();

        List<CuestionarioAsignacion> asignaciones;
        if (privilegioSupervision) {
            asignaciones = asignacionRepository.findByEntidadTipoAndEntidadId(entidadTipoNorm, entidadId);
        } else {
            if (empleadoId == null) {
                return List.of();
            }
            asignaciones = asignacionRepository.findByEntidadTipoAndEntidadIdAndEvaluadorEmpleadoId(
                    entidadTipoNorm, entidadId, empleadoId
            );
        }

        return mapearAsignaciones(asignaciones, empleadoId, false);
    }

    @Transactional(readOnly = true)
    public List<AsignacionCuestionarioResponse> listarMisAsignacionesEnLote(String entidadTipo, List<UUID> entidadIds) {
        if (entidadIds == null || entidadIds.isEmpty()) {
            return List.of();
        }
        if (entidadIds.size() > MAX_LOTE_IDS) {
            throw new BusinessException(
                    "VALIDATION_ERROR",
                    "No se pueden consultar más de %d entidades por lote".formatted(MAX_LOTE_IDS)
            );
        }

        String entidadTipoNorm = normalizarClave(entidadTipo);
        if (entidadTipoNorm == null) {
            return List.of();
        }

        UUID empleadoId = obtenerEmpleadoIdActual();
        if (empleadoId == null) {
            return List.of();
        }

        List<CuestionarioAsignacion> asignaciones = asignacionRepository
                .findByEvaluadorEmpleadoIdAndEntidadTipoAndEntidadIdIn(empleadoId, entidadTipoNorm, entidadIds);

        return mapearAsignaciones(asignaciones, empleadoId, false);
    }

    @Transactional(readOnly = true)
    public AsignacionDetalleResponse obtenerDetalle(UUID asignacionId) {
        CuestionarioAsignacion asignacion = obtenerPorId(asignacionId);
        UUID empleadoId = obtenerEmpleadoIdActual();
        boolean esDueno = empleadoId != null && empleadoId.equals(asignacion.getEvaluadorEmpleadoId());

        if (!esDueno && !esAdminOSupervisor()) {
            throw new ForbiddenException("No tiene permisos para acceder a esta evaluación");
        }

        boolean redactarEvaluador = Boolean.TRUE.equals(asignacion.getAnonimoEnReportes()) && !esDueno;
        AsignacionCuestionarioResponse asignacionResp = mapearAsignacionUnica(asignacion, redactarEvaluador);
        CuestionarioDetalleResponse cuestionarioResp = cuestionarioService
                .obtenerDetallePreguntasActivas(asignacion.getCuestionarioId());
        List<RespuestaDetalleResponse> respuestasResp = respuestaDetalleRepository.findByAsignacionId(asignacionId)
                .stream()
                .map(this::toRespuestaDetalleResponse)
                .toList();

        return new AsignacionDetalleResponse(asignacionResp, cuestionarioResp, respuestasResp);
    }

    @Transactional
    public AsignacionDetalleResponse responder(UUID asignacionId, ResponderCuestionarioRequest request) {
        CuestionarioAsignacion asignacion = obtenerPorId(asignacionId);
        UUID empleadoId = obtenerEmpleadoIdActual();

        if (empleadoId == null || !empleadoId.equals(asignacion.getEvaluadorEmpleadoId())) {
            throw new ForbiddenException("Solo el evaluador asignado puede responder este cuestionario");
        }

        if (asignacion.getEstado() == EstadoAsignacionCuestionario.RESPONDIDO) {
            throw new ConflictException(
                    "ASIGNACION_YA_RESPONDIDA",
                    "Esta evaluación ya fue respondida previamente"
            );
        }
        if (asignacion.getEstado() == EstadoAsignacionCuestionario.OMITIDO) {
            throw new ConflictException(
                    "ASIGNACION_OMITIDA",
                    "Esta evaluación fue omitida y no puede ser respondida"
            );
        }

        List<CuestionarioPregunta> preguntasActivas = cuestionarioService
                .cargarPreguntasConOpciones(asignacion.getCuestionarioId(), true);

        CuestionarioPuntajeCalculator.ResultadoEvaluacion resultado = puntajeCalculator.evaluar(
                asignacionId,
                preguntasActivas,
                request.respuestas()
        );

        List<CuestionarioRespuestaDetalle> guardadas = respuestaDetalleRepository.saveAll(resultado.respuestas());

        asignacion.setEstado(EstadoAsignacionCuestionario.RESPONDIDO);
        asignacion.setFechaRespuesta(Instant.now());
        asignacion.setPuntajeTotal(resultado.puntajeTotal());
        asignacion.setPuntajeMaximo(resultado.puntajeMaximo());
        asignacion.setPorcentaje(resultado.porcentaje());
        asignacion.setComentarioGeneral(StringUtils.trimToNull(request.comentarioGeneral()));

        CuestionarioAsignacion asignacionGuardada = asignacionRepository.save(asignacion);

        AsignacionCuestionarioResponse asignacionResp = mapearAsignacionUnica(asignacionGuardada, false);
        CuestionarioDetalleResponse cuestionarioResp = cuestionarioService
                .obtenerDetallePreguntasActivas(asignacionGuardada.getCuestionarioId());
        List<RespuestaDetalleResponse> respuestasResp = guardadas.stream()
                .map(this::toRespuestaDetalleResponse)
                .toList();

        return new AsignacionDetalleResponse(asignacionResp, cuestionarioResp, respuestasResp);
    }

    @Transactional(readOnly = true)
    public boolean tienePendientesObligatorias(UUID empleadoId, String entidadTipo) {
        if (empleadoId == null) {
            return false;
        }
        String entidadTipoNorm = normalizarClave(entidadTipo);
        if (entidadTipoNorm == null) {
            return false;
        }
        return asignacionRepository.existsByEvaluadorEmpleadoIdAndEntidadTipoAndEstadoAndObligatorioTrue(
                empleadoId,
                entidadTipoNorm,
                EstadoAsignacionCuestionario.PENDIENTE
        );
    }

    public List<AsignacionCuestionarioResponse> mapearAsignaciones(
            List<CuestionarioAsignacion> asignaciones,
            UUID empleadoActualId,
            boolean forzarAnonimatoEnReportes
    ) {
        if (asignaciones == null || asignaciones.isEmpty()) {
            return List.of();
        }

        Set<UUID> cuestionarioIds = asignaciones.stream()
                .map(CuestionarioAsignacion::getCuestionarioId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, Cuestionario> cuestionarioMap = cuestionarioRepository.findAllById(cuestionarioIds).stream()
                .collect(Collectors.toMap(Cuestionario::getId, Function.identity(), (a, b) -> a));

        Set<UUID> evaluadorIds = asignaciones.stream()
                .filter(a -> !debeRedactarEvaluador(a, cuestionarioMap.get(a.getCuestionarioId()), empleadoActualId, forzarAnonimatoEnReportes))
                .map(CuestionarioAsignacion::getEvaluadorEmpleadoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, String> nombresEmpleados = evaluadorIds.isEmpty()
                ? Map.of()
                : springVEmpleadoRepository.findAllById(evaluadorIds).stream()
                        .collect(Collectors.toMap(
                                VEmpleadoEntity::getEmpleadoId,
                                VEmpleadoEntity::getNombreCompleto,
                                (a, b) -> a
                        ));

        return asignaciones.stream()
                .map(a -> {
                    Cuestionario c = cuestionarioMap.get(a.getCuestionarioId());
                    boolean redactar = debeRedactarEvaluador(a, c, empleadoActualId, forzarAnonimatoEnReportes);
                    UUID evalId = redactar ? null : a.getEvaluadorEmpleadoId();
                    String evalNombre = redactar ? null : nombresEmpleados.get(a.getEvaluadorEmpleadoId());
                    return toAsignacionResponse(a, c, evalId, evalNombre);
                })
                .toList();
    }

    private AsignacionCuestionarioResponse mapearAsignacionUnica(
            CuestionarioAsignacion asignacion,
            boolean redactarEvaluador
    ) {
        Cuestionario c = cuestionarioRepository.findById(asignacion.getCuestionarioId()).orElse(null);
        UUID evalId = null;
        String evalNombre = null;
        if (!redactarEvaluador && asignacion.getEvaluadorEmpleadoId() != null) {
            evalId = asignacion.getEvaluadorEmpleadoId();
            evalNombre = springVEmpleadoRepository.findById(evalId)
                    .map(VEmpleadoEntity::getNombreCompleto)
                    .orElse(null);
        }
        return toAsignacionResponse(asignacion, c, evalId, evalNombre);
    }

    private boolean debeRedactarEvaluador(
            CuestionarioAsignacion asignacion,
            Cuestionario cuestionario,
            UUID empleadoActualId,
            boolean forzarAnonimatoEnReportes
    ) {
        boolean anonimo = Boolean.TRUE.equals(asignacion.getAnonimoEnReportes())
                || (cuestionario != null && Boolean.TRUE.equals(cuestionario.getAnonimoEnReportes()));
        if (!anonimo) {
            return false;
        }
        if (forzarAnonimatoEnReportes) {
            return true;
        }
        boolean esDueno = empleadoActualId != null && empleadoActualId.equals(asignacion.getEvaluadorEmpleadoId());
        return !esDueno;
    }

    private AsignacionCuestionarioResponse toAsignacionResponse(
            CuestionarioAsignacion a,
            Cuestionario c,
            UUID evaluadorEmpleadoId,
            String evaluadorNombre
    ) {
        return new AsignacionCuestionarioResponse(
                a.getId(),
                a.getCuestionarioId(),
                c != null ? c.getNombre() : null,
                c != null ? c.getCodigo() : null,
                a.getCuestionarioVersion(),
                a.getModuloOrigen(),
                a.getEntidadTipo(),
                a.getEntidadId(),
                a.getEntidadCodigoRef(),
                a.getEvaluadoTipo(),
                a.getEvaluadoId(),
                a.getEvaluadoNombreSnapshot(),
                evaluadorEmpleadoId,
                evaluadorNombre,
                a.getObligatorio(),
                a.getAnonimoEnReportes(),
                a.getEstado(),
                a.getFechaHabilitacion(),
                a.getFechaRespuesta(),
                a.getPuntajeTotal(),
                a.getPuntajeMaximo(),
                a.getPorcentaje(),
                a.getComentarioGeneral()
        );
    }

    private RespuestaDetalleResponse toRespuestaDetalleResponse(CuestionarioRespuestaDetalle r) {
        return new RespuestaDetalleResponse(
                r.getId(),
                r.getPreguntaId(),
                r.getPreguntaEnunciadoSnapshot(),
                r.getTipoPreguntaSnapshot(),
                r.getValorTexto(),
                r.getValorNumerico(),
                r.getValorBooleano(),
                r.getOpcionId(),
                r.getOpcionesIds(),
                r.getPuntajeObtenido()
        );
    }

    private CuestionarioAsignacion obtenerPorId(UUID id) {
        return asignacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asignación de cuestionario", id));
    }

    private UUID obtenerEmpleadoIdActual() {
        return securityUtils.getCurrentUserId()
                .flatMap(usuarioRepository::findById)
                .map(Usuario::getPersonaId)
                .flatMap(empleadoRepository::findFirstByPersonaId)
                .map(Empleado::getId)
                .orElse(null);
    }

    private boolean esAdminOSupervisor() {
        if (securityUtils.isAdmin()) {
            return true;
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return false;
        }
        return auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()) || "ROLE_SUPERVISOR".equals(a.getAuthority()));
    }

    private EstadoAsignacionCuestionario parseEstadoFiltro(String estado) {
        if (estado == null || estado.isBlank()) {
            return EstadoAsignacionCuestionario.PENDIENTE;
        }
        String norm = estado.trim().toUpperCase(Locale.ROOT);
        if ("TODOS".equals(norm)) {
            return null;
        }
        try {
            return EstadoAsignacionCuestionario.valueOf(norm);
        } catch (IllegalArgumentException ex) {
            throw new BusinessException("ESTADO_INVALIDO", "Estado de asignación inválido: '%s'".formatted(estado));
        }
    }

    private String normalizarClave(String value) {
        String norm = StringUtils.normalize(value);
        return norm != null ? norm.toUpperCase(Locale.ROOT) : null;
    }
}
