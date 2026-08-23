package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.ChecklistMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.ChecklistMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ChecklistMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ActividadMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ChecklistMantenimientoRepository;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaMapper;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChecklistMantenimientoService {

    private static final int CODIGO_MIN_LENGTH = 2;
    private static final int CODIGO_MAX_LENGTH = 50;
    private static final int NOMBRE_MIN_LENGTH = 2;
    private static final int NOMBRE_MAX_LENGTH = 150;

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "actividadMantenimientoId",
            "codigo",
            "nombre",
            "descripcion",
            "createdAt",
            "updatedAt"
    );

    private final ChecklistMantenimientoRepository repository;
    private final ActividadMantenimientoRepository
            actividadMantenimientoRepository;

    @Transactional
    public ChecklistMantenimientoResponse create(
            ChecklistMantenimientoRequest request
    ) {
        requireActividadMantenimientoExists(
                request.actividadMantenimientoId()
        );

        String codigo = requireNormalizedCodigo(request.codigo());
        validateUniqueCodigoForCreate(
                request.actividadMantenimientoId(),
                codigo
        );

        ChecklistMantenimiento domain =
                ChecklistMantenimiento.builder()
                        .actividadMantenimientoId(
                                request.actividadMantenimientoId()
                        )
                        .codigo(codigo)
                        .nombre(requireNormalizedNombre(
                                request.nombre()
                        ))
                        .descripcion(StringUtils.normalize(
                                request.descripcion()
                        ))
                        .build();

        return toResponse(repository.save(domain));
    }

    @Transactional
    public ChecklistMantenimientoResponse update(
            UUID id,
            ChecklistMantenimientoRequest request
    ) {
        requireActividadMantenimientoExists(
                request.actividadMantenimientoId()
        );

        ChecklistMantenimiento domain = findDomainById(id);

        String codigo = requireNormalizedCodigo(request.codigo());
        validateUniqueCodigoForUpdate(
                request.actividadMantenimientoId(),
                codigo,
                id
        );

        domain.setActividadMantenimientoId(
                request.actividadMantenimientoId()
        );
        domain.setCodigo(codigo);
        domain.setNombre(requireNormalizedNombre(request.nombre()));
        domain.setDescripcion(StringUtils.normalize(
                request.descripcion()
        ));

        return toResponse(repository.save(domain));
    }

    @Transactional(readOnly = true)
    public ChecklistMantenimientoResponse findById(UUID id) {
        return toResponse(findDomainById(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<ChecklistMantenimientoResponse> findAll(
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(query);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        if (normalized == null) {
            return PageResponse.from(
                    repository.findAll(pageable),
                    this::toResponse
            );
        }

        return PageResponse.from(
                repository.search(normalized, pageable),
                this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<ChecklistMantenimientoResponse>
    findByActividadMantenimientoId(
            UUID actividadMantenimientoId,
            String query,
            PageRequestDto pageRequest
    ) {
        requireActividadMantenimientoExists(actividadMantenimientoId);

        String normalized = StringUtils.normalize(query);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        if (normalized == null) {
            return PageResponse.from(
                    repository.findByActividadMantenimientoId(
                            actividadMantenimientoId,
                            pageable
                    ),
                    this::toResponse
            );
        }

        return PageResponse.from(
                repository.searchByActividadMantenimientoId(
                        actividadMantenimientoId,
                        normalized,
                        pageable
                ),
                this::toResponse
        );
    }

    @Transactional
    public void delete(UUID id) {
        findDomainById(id);
        repository.deleteById(id);
    }

    private ChecklistMantenimiento findDomainById(UUID id) {
        return repository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Checklist de mantenimiento",
                                id
                        )
                );
    }

    private void requireActividadMantenimientoExists(UUID id) {
        if (!actividadMantenimientoRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Actividad de mantenimiento", id
            );
        }
    }

    private void validateUniqueCodigoForCreate(
            UUID actividadMantenimientoId,
            String codigo
    ) {
        if (repository
                .existsByActividadMantenimientoIdAndCodigoIgnoreCase(
                        actividadMantenimientoId,
                        codigo
                )) {
            throw new ConflictException(
                    "CHECKLIST_MANTENIMIENTO_ALREADY_EXISTS",
                    "Ya existe un checklist con el código '%s' para esta actividad"
                            .formatted(codigo)
            );
        }
    }

    private void validateUniqueCodigoForUpdate(
            UUID actividadMantenimientoId,
            String codigo,
            UUID currentId
    ) {
        if (repository
                .existsByActividadMantenimientoIdAndCodigoIgnoreCaseAndIdNot(
                        actividadMantenimientoId,
                        codigo,
                        currentId
                )) {
            throw new ConflictException(
                    "CHECKLIST_MANTENIMIENTO_ALREADY_EXISTS",
                    "Ya existe otro checklist con el código '%s' para esta actividad"
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
                    "INVALID_CHECKLIST_CODIGO",
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
                    "INVALID_CHECKLIST_NOMBRE",
                    "El nombre debe tener entre %d y %d caracteres"
                            .formatted(NOMBRE_MIN_LENGTH, NOMBRE_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private ChecklistMantenimientoResponse toResponse(
            ChecklistMantenimiento domain
    ) {
        ChecklistMantenimientoResponse
                .ActividadMantenimientoInfo actividadInfo = null;

        if (domain.getActividadMantenimientoId() != null) {
            actividadInfo = actividadMantenimientoRepository
                    .findById(domain.getActividadMantenimientoId())
                    .map(a ->
                            new ChecklistMantenimientoResponse
                                    .ActividadMantenimientoInfo(
                                    a.getId(),
                                    a.getCodigo(),
                                    a.getNombre()
                            )
                    )
                    .orElse(null);
        }


        return new ChecklistMantenimientoResponse(
                domain.getId(),
                actividadInfo,
                domain.getCodigo(),
                domain.getNombre(),
                domain.getDescripcion(),
                AuditoriaMapper.from(domain)
        );
    }
}
