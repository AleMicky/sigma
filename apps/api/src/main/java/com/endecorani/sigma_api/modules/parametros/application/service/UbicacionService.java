package com.endecorani.sigma_api.modules.parametros.application.service;

import com.endecorani.sigma_api.modules.parametros.application.dto.request.UbicacionRequest;
import com.endecorani.sigma_api.modules.parametros.application.dto.response.UbicacionResponse;
import com.endecorani.sigma_api.modules.parametros.application.dto.response.UbicacionTreeNode;
import com.endecorani.sigma_api.modules.parametros.domain.enums.TipoUbicacion;
import com.endecorani.sigma_api.modules.parametros.domain.model.Ubicacion;
import com.endecorani.sigma_api.modules.parametros.domain.repository.UbicacionRepository;
import com.endecorani.sigma_api.shared.application.crud.AbstractCrudService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UbicacionService extends AbstractCrudService<
        Ubicacion,
        UbicacionRequest,
        UbicacionResponse,
        UUID
        > {

    private static final int CODIGO_MIN_LENGTH = 2;
    private static final int CODIGO_MAX_LENGTH = 30;
    private static final int NOMBRE_MIN_LENGTH = 2;
    private static final int NOMBRE_MAX_LENGTH = 150;
    private static final int DESCRIPCION_MAX_LENGTH = 250;
    private static final int DIRECCION_MAX_LENGTH = 250;

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "nombre",
            "tipo",
            "createdAt",
            "updatedAt"
    );

    private final UbicacionRepository ubicacionRepository;

    @Override
    protected CrudRepository<Ubicacion, UUID> repository() {
        return ubicacionRepository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (!ubicacionRepository.existsById(id)) {
            throw new ResourceNotFoundException(resourceName(), id);
        }
        if (ubicacionRepository.existsByUbicacionPadreId(id)) {
            throw new ConflictException(
                    "UBICACION_HAS_CHILDREN",
                    "No se puede eliminar la ubicación porque tiene ubicaciones hijas asociadas"
            );
        }
        ubicacionRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public PageResponse<UbicacionResponse> search(
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(query);

        if (normalized == null) {
            return findAll(pageRequest);
        }

        return PageResponse.from(
                ubicacionRepository.search(
                        normalized,
                        pageRequest.toPageable(allowedSortFields())
                ),
                this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<UbicacionResponse> findByTipo(
            TipoUbicacion tipo,
            PageRequestDto pageRequest
    ) {
        return PageResponse.from(
                ubicacionRepository.findByTipo(
                        tipo,
                        pageRequest.toPageable(allowedSortFields())
                ),
                this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public List<UbicacionResponse> findHijos(UUID id) {
        if (!ubicacionRepository.existsById(id)) {
            throw new ResourceNotFoundException(resourceName(), id);
        }
        return ubicacionRepository.findByUbicacionPadreId(id)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UbicacionResponse> findRaices() {
        return ubicacionRepository.findByUbicacionPadreIdIsNull()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UbicacionTreeNode> buildArbol() {
        List<Ubicacion> todas = ubicacionRepository.findAll();
        return construirArbolDesdeRaices(todas);
    }

    @Transactional(readOnly = true)
    public UbicacionTreeNode buildArbol(UUID id) {
        Ubicacion raiz = findDomainById(id);
        List<Ubicacion> todas = ubicacionRepository.findAll();
        Map<UUID, List<Ubicacion>> porPadre = agruparPorPadre(todas);
        return construirNodo(raiz, porPadre);
    }

    @Override
    protected Ubicacion toDomain(UbicacionRequest request) {
        String codigo = requireNormalizedCodigo(request.codigo());
        validateUniqueCodigoForCreate(codigo);

        if (request.ubicacionPadreId() != null) {
            validatePadreExists(request.ubicacionPadreId());
        }

        return Ubicacion.builder()
                .codigo(codigo)
                .nombre(requireNormalizedNombre(request.nombre()))
                .descripcion(normalizeDescripcion(request.descripcion()))
                .tipo(request.tipo())
                .ubicacionPadreId(request.ubicacionPadreId())
                .direccion(normalizeDireccion(request.direccion()))
                .latitud(request.latitud())
                .longitud(request.longitud())
                .build();
    }

    @Override
    protected void updateDomain(
            Ubicacion domain,
            UbicacionRequest request
    ) {
        rejectCodigoChange(domain.getCodigo(), request.codigo());

        if (request.ubicacionPadreId() != null) {
            validatePadreExists(request.ubicacionPadreId());
            validateNoCircularReference(domain.getId(), request.ubicacionPadreId());
        }

        domain.setNombre(requireNormalizedNombre(request.nombre()));
        domain.setDescripcion(normalizeDescripcion(request.descripcion()));
        domain.setTipo(request.tipo());
        domain.setUbicacionPadreId(request.ubicacionPadreId());
        domain.setDireccion(normalizeDireccion(request.direccion()));
        domain.setLatitud(request.latitud());
        domain.setLongitud(request.longitud());
    }

    @Override
    protected UbicacionResponse toResponse(Ubicacion domain) {
        return new UbicacionResponse(
                domain.getId(),
                domain.getCodigo(),
                domain.getNombre(),
                domain.getDescripcion(),
                domain.getTipo(),
                domain.getUbicacionPadreId(),
                domain.getDireccion(),
                domain.getLatitud(),
                domain.getLongitud(),
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );
    }

    @Override
    protected String resourceName() {
        return "Ubicación";
    }

    private void validateUniqueCodigoForCreate(String codigo) {
        if (ubicacionRepository.existsByCodigoIgnoreCase(codigo)) {
            throw new ConflictException(
                    "UBICACION_ALREADY_EXISTS",
                    "Ya existe una ubicación con el código '%s'"
                            .formatted(codigo)
            );
        }
    }

    private void rejectCodigoChange(String currentCodigo, String requestedCodigo) {
        String normalized = StringUtils.normalize(requestedCodigo);

        if (normalized == null || !normalized.equalsIgnoreCase(currentCodigo)) {
            throw new BusinessException(
                    "UBICACION_CODIGO_IMMUTABLE",
                    "El código de la ubicación no se puede modificar"
            );
        }
    }

    private void validatePadreExists(UUID ubicacionPadreId) {
        if (!ubicacionRepository.existsById(ubicacionPadreId)) {
            throw new ResourceNotFoundException(
                    "Ubicación padre",
                    ubicacionPadreId
            );
        }
    }

    private void validateNoCircularReference(
            UUID ubicacionId,
            UUID nuevoPadreId
    ) {
        if (nuevoPadreId == null) {
            return;
        }
        if (ubicacionId.equals(nuevoPadreId)) {
            throw new BusinessException(
                    "UBICACION_CIRCULAR_REFERENCE",
                    "Una ubicación no puede ser su propio padre"
            );
        }

        Set<UUID> visitados = new HashSet<>();
        UUID current = nuevoPadreId;

        while (current != null) {
            if (current.equals(ubicacionId)) {
                throw new BusinessException(
                        "UBICACION_CIRCULAR_REFERENCE",
                        "Se detectó una referencia circular en la jerarquía de ubicaciones"
                );
            }
            if (!visitados.add(current)) {
                break;
            }
            Ubicacion padre = ubicacionRepository.findById(current).orElse(null);
            current = padre != null ? padre.getUbicacionPadreId() : null;
        }
    }

    private String requireNormalizedCodigo(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < CODIGO_MIN_LENGTH
                || normalized.length() > CODIGO_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_UBICACION_CODIGO",
                    "El código debe tener entre %d y %d caracteres"
                            .formatted(CODIGO_MIN_LENGTH, CODIGO_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String requireNormalizedNombre(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < NOMBRE_MIN_LENGTH
                || normalized.length() > NOMBRE_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_UBICACION_NOMBRE",
                    "El nombre debe tener entre %d y %d caracteres"
                            .formatted(NOMBRE_MIN_LENGTH, NOMBRE_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String normalizeDescripcion(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized != null && normalized.length() > DESCRIPCION_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_UBICACION_DESCRIPCION",
                    "La descripción no puede superar los %d caracteres"
                            .formatted(DESCRIPCION_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String normalizeDireccion(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized != null && normalized.length() > DIRECCION_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_UBICACION_DIRECCION",
                    "La dirección no puede superar los %d caracteres"
                            .formatted(DIRECCION_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private Map<UUID, List<Ubicacion>> agruparPorPadre(List<Ubicacion> ubicaciones) {
        Map<UUID, List<Ubicacion>> porPadre = new HashMap<>();
        for (Ubicacion ub : ubicaciones) {
            UUID clave = ub.getUbicacionPadreId() != null
                    ? ub.getUbicacionPadreId()
                    : null;
            porPadre.computeIfAbsent(clave, k -> new ArrayList<>()).add(ub);
        }
        return porPadre;
    }

    private List<UbicacionTreeNode> construirArbolDesdeRaices(List<Ubicacion> todas) {
        Map<UUID, List<Ubicacion>> porPadre = agruparPorPadre(todas);
        List<Ubicacion> raices = porPadre.getOrDefault(null, List.of());
        List<UbicacionTreeNode> nodos = new ArrayList<>();
        for (Ubicacion raiz : raices) {
            nodos.add(construirNodo(raiz, porPadre));
        }
        return nodos;
    }

    private UbicacionTreeNode construirNodo(
            Ubicacion ubicacion,
            Map<UUID, List<Ubicacion>> porPadre
    ) {
        List<Ubicacion> hijosEntities = porPadre.getOrDefault(
                ubicacion.getId(),
                List.of()
        );
        List<UbicacionTreeNode> hijos = new ArrayList<>();
        for (Ubicacion hijo : hijosEntities) {
            hijos.add(construirNodo(hijo, porPadre));
        }
        return new UbicacionTreeNode(
                ubicacion.getId(),
                ubicacion.getCodigo(),
                ubicacion.getNombre(),
                ubicacion.getTipo(),
                ubicacion.getUbicacionPadreId(),
                hijos
        );
    }
}