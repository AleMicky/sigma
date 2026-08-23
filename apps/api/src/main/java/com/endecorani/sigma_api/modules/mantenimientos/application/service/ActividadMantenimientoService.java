package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.ActividadMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.ActividadMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ActividadMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ActividadMantenimientoRepository;
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
public class ActividadMantenimientoService extends AbstractCrudService<
        ActividadMantenimiento,
        ActividadMantenimientoRequest,
        ActividadMantenimientoResponse,
        UUID
        > {

    private static final int CODIGO_MIN_LENGTH = 2;
    private static final int CODIGO_MAX_LENGTH = 50;
    private static final int NOMBRE_MIN_LENGTH = 2;
    private static final int NOMBRE_MAX_LENGTH = 150;

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "nombre",
            "descripcion",
            "aplicaTodosTiposActivo",
            "requiereChecklist",
            "createdAt",
            "updatedAt"
    );

    private final ActividadMantenimientoRepository actividadMantenimientoRepository;

    @Override
    protected CrudRepository<ActividadMantenimiento, UUID> repository() {
        return actividadMantenimientoRepository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Transactional(readOnly = true)
    public PageResponse<ActividadMantenimientoResponse> search(
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(query);

        if (normalized == null) {
            return findAll(pageRequest);
        }

        return PageResponse.from(
                actividadMantenimientoRepository.search(
                        normalized,
                        pageRequest.toPageable(allowedSortFields())
                ),
                this::toResponse
        );
    }

    @Override
    protected ActividadMantenimiento toDomain(ActividadMantenimientoRequest request) {
        String codigo = requireNormalizedCodigo(request.codigo());
        validateUniqueCodigoForCreate(codigo);

        return ActividadMantenimiento.builder()
                .codigo(codigo)
                .nombre(requireNormalizedNombre(request.nombre()))
                .descripcion(StringUtils.normalize(request.descripcion()))
                .aplicaTodosTiposActivo(
                        request.aplicaTodosTiposActivo() != null
                                ? request.aplicaTodosTiposActivo()
                                : false
                )
                .requiereChecklist(
                        request.requiereChecklist() != null
                                ? request.requiereChecklist()
                                : false
                )
                .build();
    }

    @Override
    protected void updateDomain(
            ActividadMantenimiento domain,
            ActividadMantenimientoRequest request
    ) {
        String codigo = requireNormalizedCodigo(request.codigo());
        validateUniqueCodigoForUpdate(codigo, domain.getId());

        domain.setCodigo(codigo);
        domain.setNombre(requireNormalizedNombre(request.nombre()));
        domain.setDescripcion(StringUtils.normalize(request.descripcion()));
        domain.setAplicaTodosTiposActivo(
                request.aplicaTodosTiposActivo() != null
                        ? request.aplicaTodosTiposActivo()
                        : false
        );
        domain.setRequiereChecklist(
                request.requiereChecklist() != null
                        ? request.requiereChecklist()
                        : false
        );
    }

    @Override
    protected ActividadMantenimientoResponse toResponse(ActividadMantenimiento domain) {

        return new ActividadMantenimientoResponse(
                domain.getId(),
                domain.getCodigo(),
                domain.getNombre(),
                domain.getDescripcion(),
                domain.getAplicaTodosTiposActivo(),
                domain.getRequiereChecklist(),
                AuditoriaMapper.from(domain)
        );
    }

    @Override
    protected String resourceName() {
        return "ActividadMantenimiento";
    }

    private void validateUniqueCodigoForCreate(String codigo) {
        if (actividadMantenimientoRepository.existsByCodigoIgnoreCase(codigo)) {
            throw new ConflictException(
                    "ACTIVIDAD_MANTENIMIENTO_ALREADY_EXISTS",
                    "Ya existe una actividad de mantenimiento con el código '%s'"
                            .formatted(codigo)
            );
        }
    }

    private void validateUniqueCodigoForUpdate(
            String codigo,
            UUID currentId
    ) {
        if (actividadMantenimientoRepository.existsByCodigoIgnoreCaseAndIdNot(
                codigo,
                currentId
        )) {
            throw new ConflictException(
                    "ACTIVIDAD_MANTENIMIENTO_ALREADY_EXISTS",
                    "Ya existe otra actividad de mantenimiento con el código '%s'"
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
                    "INVALID_ACTIVIDAD_MANTENIMIENTO_CODIGO",
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
                    "INVALID_ACTIVIDAD_MANTENIMIENTO_NOMBRE",
                    "El nombre debe tener entre %d y %d caracteres"
                            .formatted(NOMBRE_MIN_LENGTH, NOMBRE_MAX_LENGTH)
            );
        }

        return normalized;
    }
}
