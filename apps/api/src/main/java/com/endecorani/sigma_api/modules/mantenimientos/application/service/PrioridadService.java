package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.PrioridadRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.PrioridadResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.Prioridad;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PrioridadRepository;
import com.endecorani.sigma_api.shared.application.crud.AbstractCrudService;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaMapper;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PrioridadService extends AbstractCrudService<
        Prioridad,
        PrioridadRequest,
        PrioridadResponse,
        UUID
        > {

    private static final int CODIGO_MIN_LENGTH = 2;
    private static final int CODIGO_MAX_LENGTH = 30;
    private static final int NOMBRE_MIN_LENGTH = 2;
    private static final int NOMBRE_MAX_LENGTH = 100;
    private static final int NIVEL_MIN = 1;
    private static final int NIVEL_MAX = 5;

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "nombre",
            "descripcion",
            "nivel",
            "porDefecto",
            "createdAt",
            "updatedAt"
    );

    private final PrioridadRepository prioridadRepository;

    @Override
    protected CrudRepository<Prioridad, UUID> repository() {
        return prioridadRepository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Transactional(readOnly = true)
    public PageResponse<PrioridadResponse> search(
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(query);

        if (normalized == null) {
            return findAll(pageRequest);
        }

        return PageResponse.from(
                prioridadRepository.search(
                        normalized,
                        pageRequest.toPageable(allowedSortFields())
                ),
                this::toResponse
        );
    }

    @Override
    protected Prioridad toDomain(PrioridadRequest request) {
        String codigo = requireNormalizedCodigo(request.codigo());
        validateUniqueCodigoForCreate(codigo);
        Integer nivel = requireValidNivel(request.nivel());
        boolean porDefecto = Boolean.TRUE.equals(request.porDefecto());

        if (porDefecto) {
            prioridadRepository.clearPorDefecto(null);
        }

        return Prioridad.builder()
                .codigo(codigo)
                .nombre(requireNormalizedNombre(request.nombre()))
                .descripcion(StringUtils.normalize(request.descripcion()))
                .nivel(nivel)
                .porDefecto(porDefecto)
                .build();
    }

    @Override
    protected void updateDomain(
            Prioridad domain,
            PrioridadRequest request
    ) {
        String codigo = requireNormalizedCodigo(request.codigo());
        validateUniqueCodigoForUpdate(codigo, domain.getId());
        boolean porDefecto = Boolean.TRUE.equals(request.porDefecto());

        if (porDefecto) {
            prioridadRepository.clearPorDefecto(domain.getId());
        }

        domain.setCodigo(codigo);
        domain.setNombre(requireNormalizedNombre(request.nombre()));
        domain.setDescripcion(StringUtils.normalize(request.descripcion()));
        domain.setNivel(requireValidNivel(request.nivel()));
        domain.setPorDefecto(porDefecto);
    }

    @Override
    protected PrioridadResponse toResponse(Prioridad domain) {

        return new PrioridadResponse(
                domain.getId(),
                domain.getCodigo(),
                domain.getNombre(),
                domain.getDescripcion(),
                domain.getNivel(),
                Boolean.TRUE.equals(domain.getPorDefecto()),
                AuditoriaMapper.from(domain)
        );
    }

    @Override
    protected String resourceName() {
        return "Prioridad";
    }

    private void validateUniqueCodigoForCreate(String codigo) {
        if (prioridadRepository.existsByCodigoIgnoreCase(codigo)) {
            throw new ConflictException(
                    "PRIORIDAD_ALREADY_EXISTS",
                    "Ya existe una prioridad con el código '%s'"
                            .formatted(codigo)
            );
        }
    }

    private void validateUniqueCodigoForUpdate(
            String codigo,
            UUID currentId
    ) {
        if (prioridadRepository.existsByCodigoIgnoreCaseAndIdNot(
                codigo,
                currentId
        )) {
            throw new ConflictException(
                    "PRIORIDAD_ALREADY_EXISTS",
                    "Ya existe otra prioridad con el código '%s'"
                            .formatted(codigo)
            );
        }
    }

    private String requireNormalizedCodigo(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < CODIGO_MIN_LENGTH
                || normalized.length() > CODIGO_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_PRIORIDAD_CODIGO",
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
                    "INVALID_PRIORIDAD_NOMBRE",
                    "El nombre debe tener entre %d y %d caracteres"
                            .formatted(NOMBRE_MIN_LENGTH, NOMBRE_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private Integer requireValidNivel(Integer nivel) {
        if (nivel == null
                || nivel < NIVEL_MIN
                || nivel > NIVEL_MAX) {
            throw new BusinessException(
                    "INVALID_PRIORIDAD_NIVEL",
                    "El nivel de prioridad debe estar entre %d y %d"
                            .formatted(NIVEL_MIN, NIVEL_MAX)
            );
        }

        return nivel;
    }
}