package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.ChecklistItemRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.ChecklistItemResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ChecklistItem;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ChecklistItemRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ChecklistMantenimientoRepository;
import com.endecorani.sigma_api.modules.parametros.domain.repository.TipoDatoRepository;
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
public class ChecklistItemService {

    private static final int CODIGO_MIN_LENGTH = 1;
    private static final int CODIGO_MAX_LENGTH = 50;
    private static final int NOMBRE_MIN_LENGTH = 1;
    private static final int NOMBRE_MAX_LENGTH = 200;

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "checklistMantenimientoId",
            "codigo",
            "nombre",
            "tipoDatoId",
            "orden",
            "obligatorio",
            "createdAt",
            "updatedAt"
    );

    private final ChecklistItemRepository repository;
    private final ChecklistMantenimientoRepository
            checklistMantenimientoRepository;
    private final TipoDatoRepository tipoDatoRepository;

    @Transactional
    public ChecklistItemResponse create(ChecklistItemRequest request) {
        requireChecklistMantenimientoExists(
                request.checklistMantenimientoId()
        );
        requireTipoDatoExists(request.tipoDatoId());

        String codigo = requireNormalizedCodigo(request.codigo());
        validateUniqueCodigoForCreate(
                request.checklistMantenimientoId(),
                codigo
        );

        ChecklistItem domain = ChecklistItem.builder()
                .checklistMantenimientoId(
                        request.checklistMantenimientoId()
                )
                .codigo(codigo)
                .nombre(requireNormalizedNombre(request.nombre()))
                .descripcion(StringUtils.normalize(
                        request.descripcion()
                ))
                .tipoDatoId(request.tipoDatoId())
                .orden(request.orden())
                .obligatorio(
                        request.obligatorio() != null
                                ? request.obligatorio()
                                : false
                )
                .opciones(request.opciones())
                .build();

        return toResponse(repository.save(domain));
    }

    @Transactional
    public ChecklistItemResponse update(
            UUID id,
            ChecklistItemRequest request
    ) {
        requireChecklistMantenimientoExists(
                request.checklistMantenimientoId()
        );
        requireTipoDatoExists(request.tipoDatoId());

        ChecklistItem domain = findDomainById(id);

        String codigo = requireNormalizedCodigo(request.codigo());
        validateUniqueCodigoForUpdate(
                request.checklistMantenimientoId(),
                codigo,
                id
        );

        domain.setChecklistMantenimientoId(
                request.checklistMantenimientoId()
        );
        domain.setCodigo(codigo);
        domain.setNombre(requireNormalizedNombre(request.nombre()));
        domain.setDescripcion(StringUtils.normalize(
                request.descripcion()
        ));
        domain.setTipoDatoId(request.tipoDatoId());
        domain.setOrden(request.orden());
        domain.setObligatorio(
                request.obligatorio() != null
                        ? request.obligatorio()
                        : false
        );
        domain.setOpciones(request.opciones());

        return toResponse(repository.save(domain));
    }

    @Transactional(readOnly = true)
    public ChecklistItemResponse findById(UUID id) {
        return toResponse(findDomainById(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<ChecklistItemResponse> findAll(
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
    public PageResponse<ChecklistItemResponse>
    findByChecklistMantenimientoId(
            UUID checklistMantenimientoId,
            String query,
            PageRequestDto pageRequest
    ) {
        requireChecklistMantenimientoExists(checklistMantenimientoId);

        String normalized = StringUtils.normalize(query);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        if (normalized == null) {
            return PageResponse.from(
                    repository.findByChecklistMantenimientoId(
                            checklistMantenimientoId,
                            pageable
                    ),
                    this::toResponse
            );
        }

        return PageResponse.from(
                repository.searchByChecklistMantenimientoId(
                        checklistMantenimientoId,
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

    private ChecklistItem findDomainById(UUID id) {
        return repository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Item de checklist", id
                        )
                );
    }

    private void requireChecklistMantenimientoExists(UUID id) {
        if (!checklistMantenimientoRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Checklist de mantenimiento", id
            );
        }
    }

    private void requireTipoDatoExists(UUID id) {
        if (!tipoDatoRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Tipo de dato", id
            );
        }
    }

    private void validateUniqueCodigoForCreate(
            UUID checklistMantenimientoId,
            String codigo
    ) {
        if (repository
                .existsByChecklistMantenimientoIdAndCodigoIgnoreCase(
                        checklistMantenimientoId,
                        codigo
                )) {
            throw new ConflictException(
                    "CHECKLIST_ITEM_ALREADY_EXISTS",
                    "Ya existe un item con el código '%s' en este checklist"
                            .formatted(codigo)
            );
        }
    }

    private void validateUniqueCodigoForUpdate(
            UUID checklistMantenimientoId,
            String codigo,
            UUID currentId
    ) {
        if (repository
                .existsByChecklistMantenimientoIdAndCodigoIgnoreCaseAndIdNot(
                        checklistMantenimientoId,
                        codigo,
                        currentId
                )) {
            throw new ConflictException(
                    "CHECKLIST_ITEM_ALREADY_EXISTS",
                    "Ya existe otro item con el código '%s' en este checklist"
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
                    "INVALID_CHECKLIST_ITEM_CODIGO",
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
                    "INVALID_CHECKLIST_ITEM_NOMBRE",
                    "El nombre debe tener entre %d y %d caracteres"
                            .formatted(NOMBRE_MIN_LENGTH, NOMBRE_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private ChecklistItemResponse toResponse(
            ChecklistItem domain
    ) {
        ChecklistItemResponse
                .ChecklistMantenimientoInfo checklistInfo = null;

        if (domain.getChecklistMantenimientoId() != null) {
            checklistInfo = checklistMantenimientoRepository
                    .findById(domain.getChecklistMantenimientoId())
                    .map(cl ->
                            new ChecklistItemResponse
                                    .ChecklistMantenimientoInfo(
                                    cl.getId(),
                                    cl.getCodigo(),
                                    cl.getNombre()
                            )
                    )
                    .orElse(null);
        }

        ChecklistItemResponse.TipoDatoInfo tipoDatoInfo = null;

        if (domain.getTipoDatoId() != null) {
            tipoDatoInfo = tipoDatoRepository
                    .findById(domain.getTipoDatoId())
                    .map(td ->
                            new ChecklistItemResponse.TipoDatoInfo(
                                    td.getId(),
                                    td.getCodigo(),
                                    td.getNombre()
                            )
                    )
                    .orElse(null);
        }


        return new ChecklistItemResponse(
                domain.getId(),
                checklistInfo,
                domain.getCodigo(),
                domain.getNombre(),
                domain.getDescripcion(),
                tipoDatoInfo,
                domain.getOrden(),
                domain.getObligatorio(),
                domain.getOpciones(),
                AuditoriaMapper.from(domain)
        );
    }
}
