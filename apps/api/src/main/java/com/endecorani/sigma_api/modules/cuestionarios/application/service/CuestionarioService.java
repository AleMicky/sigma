package com.endecorani.sigma_api.modules.cuestionarios.application.service;

import com.endecorani.sigma_api.modules.cuestionarios.application.dto.request.CuestionarioRequest;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.request.PreguntaItemRequest;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.request.PreguntaOpcionItemRequest;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.request.ReemplazarPreguntasRequest;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.CuestionarioDetalleResponse;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.CuestionarioResponse;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.DisparadorCatalogoResponse;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.PreguntaOpcionResponse;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.PreguntaResponse;
import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.EstadoAsignacionCuestionario;
import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.EstadoCuestionario;
import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.EventoDisparadorCuestionario;
import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.ModuloOrigenCuestionario;
import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.TipoPregunta;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.Cuestionario;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioPregunta;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioPreguntaOpcion;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioAsignacionRepository;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioPreguntaOpcionRepository;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioPreguntaRepository;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioRepository;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioRespuestaDetalleRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CuestionarioService {

    private static final int MAX_CODIGO_LENGTH = 50;
    private static final Pattern VERSION_SUFFIX_PATTERN = Pattern.compile("_V\\d+$");

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "nombre",
            "moduloOrigen",
            "entidadTipo",
            "eventoDisparador",
            "version",
            "estado",
            "obligatorio",
            "anonimoEnReportes",
            "activo",
            "createdAt",
            "updatedAt"
    );

    private static final List<DisparadorCatalogoResponse> CATALOGO_DISPARADORES = List.of(
            new DisparadorCatalogoResponse(
                    ModuloOrigenCuestionario.GESTION_VEHICULAR.name(),
                    "Gestión Vehicular",
                    "SOLICITUD_VEHICULAR",
                    "Solicitud de Vehículo",
                    EventoDisparadorCuestionario.AL_FINALIZAR.name(),
                    "Al finalizar viaje",
                    "Habilita la evaluación al solicitante cuando una solicitud vehicular finaliza su flujo.",
                    "CONDUCTOR"
            ),
            new DisparadorCatalogoResponse(
                    ModuloOrigenCuestionario.MANTENIMIENTOS.name(),
                    "Mantenimientos",
                    "SOLICITUD_MANTENIMIENTO",
                    "Solicitud de Mantenimiento",
                    EventoDisparadorCuestionario.AL_CERRAR.name(),
                    "Al cerrar solicitud",
                    "Habilita la evaluación cuando una solicitud de mantenimiento es cerrada.",
                    "TECNICO"
            ),
            new DisparadorCatalogoResponse(
                    ModuloOrigenCuestionario.ACTIVOS.name(),
                    "Activos",
                    "ACTIVO",
                    "Activo",
                    EventoDisparadorCuestionario.MANUAL.name(),
                    "Disparo manual",
                    "Evaluación habilitada manualmente sobre un activo institucional.",
                    "ACTIVO"
            ),
            new DisparadorCatalogoResponse(
                    ModuloOrigenCuestionario.GENERAL.name(),
                    "General",
                    "GENERAL",
                    "General",
                    EventoDisparadorCuestionario.MANUAL.name(),
                    "Disparo manual",
                    "Cuestionario general de aplicación manual.",
                    "GENERAL"
            )
    );

    private final CuestionarioRepository cuestionarioRepository;
    private final CuestionarioPreguntaRepository preguntaRepository;
    private final CuestionarioPreguntaOpcionRepository opcionRepository;
    private final CuestionarioAsignacionRepository asignacionRepository;
    private final CuestionarioRespuestaDetalleRepository respuestaDetalleRepository;

    @Transactional(readOnly = true)
    public PageResponse<CuestionarioResponse> listar(
            String q,
            String moduloOrigen,
            String estado,
            Boolean activo,
            PageRequestDto pageRequest
    ) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        EstadoCuestionario estadoEnum = parseEstadoCuestionario(estado);
        String moduloNorm = normalizarClaveOpcional(moduloOrigen);

        Page<Cuestionario> page = cuestionarioRepository.search(
                StringUtils.normalize(q),
                moduloNorm,
                estadoEnum,
                activo,
                pageable
        );

        if (page.isEmpty()) {
            return PageResponse.of(List.of(), page);
        }

        List<UUID> ids = page.getContent().stream().map(Cuestionario::getId).toList();
        Map<UUID, Long> preguntasCount = preguntaRepository.countActiveByCuestionarioIds(ids);
        Map<UUID, Long> respuestasCount = asignacionRepository.countByCuestionarioIdsAndEstado(
                ids, EstadoAsignacionCuestionario.RESPONDIDO
        );

        List<CuestionarioResponse> content = page.getContent().stream()
                .map(c -> toSummaryResponse(
                        c,
                        preguntasCount.getOrDefault(c.getId(), 0L),
                        respuestasCount.getOrDefault(c.getId(), 0L)
                ))
                .toList();

        return PageResponse.of(content, page);
    }

    public List<DisparadorCatalogoResponse> disparadores() {
        return CATALOGO_DISPARADORES;
    }

    @Transactional(readOnly = true)
    public CuestionarioDetalleResponse obtenerDetalle(UUID id) {
        Cuestionario cuestionario = obtenerPorId(id);
        return construirDetalle(cuestionario, false);
    }

    @Transactional(readOnly = true)
    public CuestionarioDetalleResponse obtenerDetallePreguntasActivas(UUID id) {
        Cuestionario cuestionario = obtenerPorId(id);
        return construirDetalle(cuestionario, true);
    }

    @Transactional
    public CuestionarioDetalleResponse crear(CuestionarioRequest request) {
        String codigo = normalizarCodigo(request.codigo());
        if (cuestionarioRepository.existsByCodigoIgnoreCase(codigo)) {
            throw new ConflictException(
                    "CUESTIONARIO_CODIGO_DUPLICADO",
                    "Ya existe un cuestionario con el código '%s'".formatted(codigo)
            );
        }

        String moduloOrigen = validarYNormalizarModulo(request.moduloOrigen());
        String entidadTipo = normalizarClaveObligatoria(request.entidadTipo(), "entidadTipo");
        String eventoDisparador = validarYNormalizarEvento(request.eventoDisparador());

        Cuestionario cuestionario = Cuestionario.builder()
                .codigo(codigo)
                .nombre(StringUtils.normalize(request.nombre()))
                .descripcion(StringUtils.trimToNull(request.descripcion()))
                .moduloOrigen(moduloOrigen)
                .entidadTipo(entidadTipo)
                .eventoDisparador(eventoDisparador)
                .version(1)
                .estado(EstadoCuestionario.BORRADOR)
                .obligatorio(Boolean.TRUE.equals(request.obligatorio()))
                .anonimoEnReportes(Boolean.TRUE.equals(request.anonimoEnReportes()))
                .activo(request.activo() == null || Boolean.TRUE.equals(request.activo()))
                .build();

        Cuestionario guardado = cuestionarioRepository.save(cuestionario);
        return construirDetalle(guardado, false);
    }

    @Transactional
    public CuestionarioDetalleResponse actualizar(UUID id, CuestionarioRequest request) {
        Cuestionario actual = obtenerPorId(id);

        String codigo = normalizarCodigo(request.codigo());
        if (cuestionarioRepository.existsByCodigoIgnoreCaseAndIdNot(codigo, id)) {
            throw new ConflictException(
                    "CUESTIONARIO_CODIGO_DUPLICADO",
                    "Ya existe otro cuestionario con el código '%s'".formatted(codigo)
            );
        }

        String moduloOrigen = validarYNormalizarModulo(request.moduloOrigen());
        String entidadTipo = normalizarClaveObligatoria(request.entidadTipo(), "entidadTipo");
        String eventoDisparador = validarYNormalizarEvento(request.eventoDisparador());
        boolean nuevoActivo = request.activo() != null ? request.activo() : Boolean.TRUE.equals(actual.getActivo());

        if (actual.getEstado() == EstadoCuestionario.PUBLICADO && nuevoActivo) {
            List<Cuestionario> conflictos = cuestionarioRepository.findPublishedActiveByDisparadorExcludingId(
                    moduloOrigen, entidadTipo, eventoDisparador, id
            );
            if (!conflictos.isEmpty()) {
                throw new ConflictException(
                        "CUESTIONARIO_DISPARADOR_OCUPADO",
                        "Ya existe otro cuestionario publicado activo para el disparador %s / %s / %s"
                                .formatted(moduloOrigen, entidadTipo, eventoDisparador)
                );
            }
        }

        actual.setCodigo(codigo);
        actual.setNombre(StringUtils.normalize(request.nombre()));
        actual.setDescripcion(StringUtils.trimToNull(request.descripcion()));
        actual.setModuloOrigen(moduloOrigen);
        actual.setEntidadTipo(entidadTipo);
        actual.setEventoDisparador(eventoDisparador);
        if (request.obligatorio() != null) {
            actual.setObligatorio(request.obligatorio());
        }
        if (request.anonimoEnReportes() != null) {
            actual.setAnonimoEnReportes(request.anonimoEnReportes());
        }
        actual.setActivo(nuevoActivo);

        Cuestionario guardado = cuestionarioRepository.save(actual);
        return construirDetalle(guardado, false);
    }

    @Transactional
    public CuestionarioDetalleResponse reemplazarPreguntas(UUID id, ReemplazarPreguntasRequest request) {
        Cuestionario cuestionario = obtenerPorId(id);

        if (tieneRespuestas(id)) {
            throw new ConflictException(
                    "CUESTIONARIO_CON_RESPUESTAS",
                    "No se pueden modificar las preguntas de un cuestionario que ya cuenta con respuestas registradas. Cree una nueva versión."
            );
        }

        List<PreguntaItemRequest> items = request.preguntas() != null ? request.preguntas() : List.of();
        validarPreguntas(items);

        List<CuestionarioPregunta> existentes = preguntaRepository.findByCuestionarioIdOrderByOrdenAsc(id);
        if (!existentes.isEmpty()) {
            List<UUID> existentesIds = existentes.stream().map(CuestionarioPregunta::getId).toList();
            opcionRepository.deleteByPreguntaIdIn(existentesIds);
            opcionRepository.flush();
            preguntaRepository.deleteByCuestionarioId(id);
            preguntaRepository.flush();
        }

        int ordenFallback = 1;
        for (PreguntaItemRequest item : items) {
            int orden = item.orden() != null ? item.orden() : ordenFallback;
            ordenFallback++;

            CuestionarioPregunta pregunta = CuestionarioPregunta.builder()
                    .cuestionarioId(id)
                    .seccion(StringUtils.trimToNull(item.seccion()))
                    .orden(orden)
                    .enunciado(StringUtils.normalize(item.enunciado()))
                    .descripcionAyuda(StringUtils.trimToNull(item.descripcionAyuda()))
                    .tipoPregunta(item.tipoPregunta())
                    .obligatoria(item.obligatoria() == null || Boolean.TRUE.equals(item.obligatoria()))
                    .peso(item.peso() != null ? item.peso() : BigDecimal.ONE)
                    .configJson(item.configJson() != null ? new LinkedHashMap<>(item.configJson()) : null)
                    .activo(item.activo() == null || Boolean.TRUE.equals(item.activo()))
                    .build();

            CuestionarioPregunta preguntaGuardada = preguntaRepository.save(pregunta);

            if (esTipoConOpciones(item.tipoPregunta()) && item.opciones() != null && !item.opciones().isEmpty()) {
                List<CuestionarioPreguntaOpcion> opciones = new ArrayList<>();
                int opcionOrdenFallback = 1;
                for (PreguntaOpcionItemRequest opItem : item.opciones()) {
                    int opOrden = opItem.orden() != null ? opItem.orden() : opcionOrdenFallback;
                    opcionOrdenFallback++;
                    String etiqueta = StringUtils.normalize(opItem.etiqueta());
                    String valor = StringUtils.trimToNull(opItem.valor());
                    if (valor == null) {
                        valor = generarValorOpcion(etiqueta, opOrden);
                    }
                    opciones.add(CuestionarioPreguntaOpcion.builder()
                            .preguntaId(preguntaGuardada.getId())
                            .orden(opOrden)
                            .etiqueta(etiqueta)
                            .valor(valor)
                            .puntaje(opItem.puntaje() != null ? opItem.puntaje() : BigDecimal.ZERO)
                            .activo(opItem.activo() == null || Boolean.TRUE.equals(opItem.activo()))
                            .build());
                }
                opcionRepository.saveAll(opciones);
            }
        }

        return construirDetalle(cuestionario, false);
    }

    @Transactional
    public CuestionarioDetalleResponse publicar(UUID id, boolean reemplazarActivo) {
        Cuestionario cuestionario = obtenerPorId(id);

        List<CuestionarioPregunta> preguntasActivas = cargarPreguntasConOpciones(id, true);
        if (preguntasActivas.isEmpty()) {
            throw new BusinessException(
                    "CUESTIONARIO_SIN_PREGUNTAS",
                    "No se puede publicar el cuestionario porque debe tener al menos una pregunta activa"
            );
        }

        for (CuestionarioPregunta pregunta : preguntasActivas) {
            if (esTipoConOpciones(pregunta.getTipoPregunta())) {
                long opcionesActivas = pregunta.getOpciones().stream()
                        .filter(o -> Boolean.TRUE.equals(o.getActivo()))
                        .count();
                if (opcionesActivas < 2) {
                    throw new BusinessException(
                            "PREGUNTA_OPCIONES_INSUFICIENTES",
                            "La pregunta '%s' de tipo %s requiere al menos 2 opciones activas"
                                    .formatted(pregunta.getEnunciado(), pregunta.getTipoPregunta())
                    );
                }
            }
        }

        List<Cuestionario> publicadosMismoDisparador = cuestionarioRepository
                .findPublishedActiveByDisparadorExcludingId(
                        cuestionario.getModuloOrigen(),
                        cuestionario.getEntidadTipo(),
                        cuestionario.getEventoDisparador(),
                        id
                );

        if (!publicadosMismoDisparador.isEmpty()) {
            if (!reemplazarActivo) {
                throw new ConflictException(
                        "CUESTIONARIO_DISPARADOR_OCUPADO",
                        "Ya existe un cuestionario publicado activo para %s / %s / %s"
                                .formatted(
                                        cuestionario.getModuloOrigen(),
                                        cuestionario.getEntidadTipo(),
                                        cuestionario.getEventoDisparador()
                                )
                );
            }
            for (Cuestionario anterior : publicadosMismoDisparador) {
                anterior.setEstado(EstadoCuestionario.INACTIVO);
                anterior.setActivo(false);
                cuestionarioRepository.saveAndFlush(anterior);
            }
        }

        cuestionario.setEstado(EstadoCuestionario.PUBLICADO);
        cuestionario.setActivo(true);
        Cuestionario guardado = cuestionarioRepository.save(cuestionario);
        return construirDetalle(guardado, false);
    }

    @Transactional
    public CuestionarioDetalleResponse inactivar(UUID id) {
        Cuestionario cuestionario = obtenerPorId(id);
        cuestionario.setEstado(EstadoCuestionario.INACTIVO);
        cuestionario.setActivo(false);
        Cuestionario guardado = cuestionarioRepository.save(cuestionario);
        return construirDetalle(guardado, false);
    }

    @Transactional
    public CuestionarioDetalleResponse crearNuevaVersion(UUID id) {
        Cuestionario origen = obtenerPorId(id);
        List<CuestionarioPregunta> preguntasOrigen = cargarPreguntasConOpciones(id, false);

        int nuevaVersion = (origen.getVersion() != null ? origen.getVersion() : 1) + 1;
        String nuevoCodigo = generarCodigoNuevaVersion(origen.getCodigo(), nuevaVersion);

        Cuestionario clon = Cuestionario.builder()
                .codigo(nuevoCodigo)
                .nombre(origen.getNombre())
                .descripcion(origen.getDescripcion())
                .moduloOrigen(origen.getModuloOrigen())
                .entidadTipo(origen.getEntidadTipo())
                .eventoDisparador(origen.getEventoDisparador())
                .version(nuevaVersion)
                .estado(EstadoCuestionario.BORRADOR)
                .obligatorio(origen.getObligatorio())
                .anonimoEnReportes(origen.getAnonimoEnReportes())
                .activo(true)
                .build();

        Cuestionario clonGuardado = cuestionarioRepository.save(clon);

        for (CuestionarioPregunta pOrigen : preguntasOrigen) {
            CuestionarioPregunta pClon = CuestionarioPregunta.builder()
                    .cuestionarioId(clonGuardado.getId())
                    .seccion(pOrigen.getSeccion())
                    .orden(pOrigen.getOrden())
                    .enunciado(pOrigen.getEnunciado())
                    .descripcionAyuda(pOrigen.getDescripcionAyuda())
                    .tipoPregunta(pOrigen.getTipoPregunta())
                    .obligatoria(pOrigen.getObligatoria())
                    .peso(pOrigen.getPeso())
                    .configJson(pOrigen.getConfigJson() != null ? new LinkedHashMap<>(pOrigen.getConfigJson()) : null)
                    .activo(pOrigen.getActivo())
                    .build();
            CuestionarioPregunta pGuardada = preguntaRepository.save(pClon);

            if (pOrigen.getOpciones() != null && !pOrigen.getOpciones().isEmpty()) {
                List<CuestionarioPreguntaOpcion> opcionesClon = new ArrayList<>();
                for (CuestionarioPreguntaOpcion op : pOrigen.getOpciones()) {
                    opcionesClon.add(CuestionarioPreguntaOpcion.builder()
                            .preguntaId(pGuardada.getId())
                            .orden(op.getOrden())
                            .etiqueta(op.getEtiqueta())
                            .valor(op.getValor())
                            .puntaje(op.getPuntaje())
                            .activo(op.getActivo())
                            .build());
                }
                opcionRepository.saveAll(opcionesClon);
            }
        }

        return construirDetalle(clonGuardado, false);
    }

    @Transactional
    public void delete(UUID id) {
        obtenerPorId(id);
        if (asignacionRepository.existsByCuestionarioId(id)) {
            throw new ConflictException(
                    "CUESTIONARIO_CON_ASIGNACIONES",
                    "No se puede eliminar el cuestionario porque tiene asignaciones registradas"
            );
        }

        List<CuestionarioPregunta> preguntas = preguntaRepository.findByCuestionarioIdOrderByOrdenAsc(id);
        if (!preguntas.isEmpty()) {
            opcionRepository.deleteByPreguntaIdIn(preguntas.stream().map(CuestionarioPregunta::getId).toList());
            preguntaRepository.deleteByCuestionarioId(id);
        }
        cuestionarioRepository.deleteById(id);
    }

    public List<CuestionarioPregunta> cargarPreguntasConOpciones(UUID cuestionarioId, boolean soloActivas) {
        List<CuestionarioPregunta> preguntas = soloActivas
                ? preguntaRepository.findByCuestionarioIdAndActivoTrueOrderByOrdenAsc(cuestionarioId)
                : preguntaRepository.findByCuestionarioIdOrderByOrdenAsc(cuestionarioId);

        if (preguntas.isEmpty()) {
            return List.of();
        }

        List<UUID> preguntaIds = preguntas.stream().map(CuestionarioPregunta::getId).toList();
        Map<UUID, List<CuestionarioPreguntaOpcion>> opcionesPorPregunta = opcionRepository
                .findByPreguntaIdInOrderByOrdenAsc(preguntaIds)
                .stream()
                .collect(Collectors.groupingBy(CuestionarioPreguntaOpcion::getPreguntaId));

        for (CuestionarioPregunta pregunta : preguntas) {
            List<CuestionarioPreguntaOpcion> ops = opcionesPorPregunta.getOrDefault(pregunta.getId(), List.of());
            if (soloActivas) {
                ops = ops.stream().filter(o -> Boolean.TRUE.equals(o.getActivo())).toList();
            }
            pregunta.setOpciones(new ArrayList<>(ops));
        }

        return preguntas;
    }

    private Cuestionario obtenerPorId(UUID id) {
        return cuestionarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cuestionario", id));
    }

    private boolean tieneRespuestas(UUID cuestionarioId) {
        return asignacionRepository.existsByCuestionarioIdAndEstado(cuestionarioId, EstadoAsignacionCuestionario.RESPONDIDO)
                || respuestaDetalleRepository.existsByCuestionarioId(cuestionarioId);
    }

    private void validarPreguntas(List<PreguntaItemRequest> items) {
        for (PreguntaItemRequest item : items) {
            if (item.peso() != null && item.peso().compareTo(BigDecimal.ZERO) < 0) {
                throw new BusinessException("PREGUNTA_PESO_INVALIDO", "El peso de la pregunta no puede ser negativo");
            }
            if (esTipoConOpciones(item.tipoPregunta())) {
                long activas = item.opciones() == null ? 0 : item.opciones().stream()
                        .filter(o -> o.activo() == null || Boolean.TRUE.equals(o.activo()))
                        .count();
                if (activas < 2) {
                    throw new BusinessException(
                            "PREGUNTA_OPCIONES_INSUFICIENTES",
                            "La pregunta '%s' de tipo %s debe tener al menos 2 opciones activas"
                                    .formatted(item.enunciado(), item.tipoPregunta())
                    );
                }
            }
        }
    }

    private boolean esTipoConOpciones(TipoPregunta tipo) {
        return tipo == TipoPregunta.OPCION_UNICA || tipo == TipoPregunta.OPCION_MULTIPLE;
    }

    private String generarCodigoNuevaVersion(String codigoActual, int versionInicial) {
        String base = VERSION_SUFFIX_PATTERN.matcher(codigoActual.toUpperCase(Locale.ROOT)).replaceFirst("");
        int intento = versionInicial;
        while (true) {
            String sufijo = "_V" + intento;
            int maxBaseLen = Math.max(1, MAX_CODIGO_LENGTH - sufijo.length());
            String baseTruncada = base.length() > maxBaseLen ? base.substring(0, maxBaseLen) : base;
            String candidato = baseTruncada + sufijo;
            if (!cuestionarioRepository.existsByCodigoIgnoreCase(candidato)) {
                return candidato;
            }
            intento++;
        }
    }

    private String normalizarCodigo(String codigo) {
        String norm = StringUtils.normalize(codigo);
        if (norm == null) {
            throw new BusinessException("VALIDATION_ERROR", "El código del cuestionario es obligatorio");
        }
        return norm.replace(' ', '_').toUpperCase(Locale.ROOT);
    }

    private String normalizarClaveObligatoria(String value, String campo) {
        String norm = normalizarClaveOpcional(value);
        if (norm == null) {
            throw new BusinessException("VALIDATION_ERROR", "El campo '%s' es obligatorio".formatted(campo));
        }
        return norm;
    }

    private String normalizarClaveOpcional(String value) {
        String norm = StringUtils.normalize(value);
        return norm != null ? norm.toUpperCase(Locale.ROOT) : null;
    }

    private String validarYNormalizarModulo(String moduloOrigen) {
        String norm = normalizarClaveObligatoria(moduloOrigen, "moduloOrigen");
        try {
            return ModuloOrigenCuestionario.valueOf(norm).name();
        } catch (IllegalArgumentException ex) {
            throw new BusinessException(
                    "MODULO_ORIGEN_INVALIDO",
                    "Módulo de origen inválido: '%s'".formatted(moduloOrigen)
            );
        }
    }

    private String validarYNormalizarEvento(String eventoDisparador) {
        String norm = normalizarClaveObligatoria(eventoDisparador, "eventoDisparador");
        try {
            return EventoDisparadorCuestionario.valueOf(norm).name();
        } catch (IllegalArgumentException ex) {
            throw new BusinessException(
                    "EVENTO_DISPARADOR_INVALIDO",
                    "Evento disparador inválido: '%s'".formatted(eventoDisparador)
            );
        }
    }

    private EstadoCuestionario parseEstadoCuestionario(String estado) {
        if (estado == null || estado.isBlank()) {
            return null;
        }
        try {
            return EstadoCuestionario.valueOf(estado.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BusinessException("ESTADO_INVALIDO", "Estado de cuestionario inválido: '%s'".formatted(estado));
        }
    }

    private String generarValorOpcion(String etiqueta, int orden) {
        if (etiqueta == null || etiqueta.isBlank()) {
            return "OPCION_" + orden;
        }
        String clean = etiqueta.toUpperCase(Locale.ROOT)
                .replaceAll("[^A-Z0-9]+", "_")
                .replaceAll("^_+|_+$", "");
        if (clean.isBlank()) {
            return "OPCION_" + orden;
        }
        return clean.length() > 100 ? clean.substring(0, 100) : clean;
    }

    private CuestionarioResponse toSummaryResponse(Cuestionario c, long totalPreguntas, long totalRespuestas) {
        return new CuestionarioResponse(
                c.getId(),
                c.getCodigo(),
                c.getNombre(),
                c.getDescripcion(),
                c.getModuloOrigen(),
                c.getEntidadTipo(),
                c.getEventoDisparador(),
                c.getVersion(),
                c.getEstado(),
                c.getObligatorio(),
                c.getAnonimoEnReportes(),
                c.getActivo(),
                totalPreguntas,
                totalRespuestas,
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }

    private CuestionarioDetalleResponse construirDetalle(Cuestionario c, boolean soloActivas) {
        List<CuestionarioPregunta> preguntas = cargarPreguntasConOpciones(c.getId(), soloActivas);
        long totalRespuestas = asignacionRepository.countByCuestionarioIdAndEstado(
                c.getId(), EstadoAsignacionCuestionario.RESPONDIDO
        );

        List<PreguntaResponse> preguntaResponses = preguntas.stream()
                .map(p -> new PreguntaResponse(
                        p.getId(),
                        p.getSeccion(),
                        p.getOrden(),
                        p.getEnunciado(),
                        p.getDescripcionAyuda(),
                        p.getTipoPregunta(),
                        p.getObligatoria(),
                        p.getPeso(),
                        p.getConfigJson(),
                        p.getActivo(),
                        p.getOpciones().stream()
                                .map(o -> new PreguntaOpcionResponse(
                                        o.getId(),
                                        o.getOrden(),
                                        o.getEtiqueta(),
                                        o.getValor(),
                                        o.getPuntaje(),
                                        o.getActivo()
                                ))
                                .toList()
                ))
                .toList();

        return new CuestionarioDetalleResponse(
                c.getId(),
                c.getCodigo(),
                c.getNombre(),
                c.getDescripcion(),
                c.getModuloOrigen(),
                c.getEntidadTipo(),
                c.getEventoDisparador(),
                c.getVersion(),
                c.getEstado(),
                c.getObligatorio(),
                c.getAnonimoEnReportes(),
                c.getActivo(),
                totalRespuestas,
                preguntaResponses,
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}
