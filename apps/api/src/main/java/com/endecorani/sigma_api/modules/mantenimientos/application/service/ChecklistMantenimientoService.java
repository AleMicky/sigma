package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.request.ChecklistMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.request.ChecklistMantenimientoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.response.ChecklistMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ChecklistMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ChecklistMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ActividadMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ChecklistMantenimientoRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChecklistMantenimientoService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "nombre",
            "actividadMantenimientoId",
            "createdAt",
            "updatedAt"
    );

    private final ChecklistMantenimientoRepository repository;
    private final ActividadMantenimientoRepository actividadRepository;
    private final ChecklistMapper mapper;

    @Transactional(readOnly = true)
    public PageResponse<ChecklistMantenimientoResponse> findAll(PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<ChecklistMantenimiento> resultado = repository.findAll(pageable);
        return PageResponse.from(resultado, this::toEnrichedResponse);
    }

    @Transactional(readOnly = true)
    public PageResponse<ChecklistMantenimientoResponse> listar(String search, PageRequestDto pageRequest) {
        String normalized = StringUtils.normalize(search);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<ChecklistMantenimiento> resultado;

        if (normalized == null || normalized.isBlank()) {
            resultado = repository.findAll(pageable);
        } else {
            resultado = repository.search(normalized, pageable);
        }

        return PageResponse.from(resultado, this::toEnrichedResponse);
    }

    @Transactional(readOnly = true)
    public ChecklistMantenimientoResponse findById(UUID id) {
        ChecklistMantenimiento checklist = obtenerPorId(id);
        return toEnrichedResponse(checklist);
    }

    @Transactional(readOnly = true)
    public ChecklistMantenimientoResponse findByCodigo(String codigo) {
        ChecklistMantenimiento checklist = repository.findByCodigo(codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist de mantenimiento no encontrado con código: " + codigo));
        return toEnrichedResponse(checklist);
    }

    @Transactional(readOnly = true)
    public List<ChecklistMantenimientoResponse> findByActividadMantenimientoId(UUID actividadMantenimientoId) {
        return repository.findByActividadMantenimientoId(actividadMantenimientoId).stream()
                .map(this::toEnrichedResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<ChecklistMantenimientoResponse> findByActividadMantenimientoId(
            UUID actividadMantenimientoId,
            PageRequestDto pageRequest
    ) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<ChecklistMantenimiento> resultado = repository.findByActividadMantenimientoId(actividadMantenimientoId, pageable);
        return PageResponse.from(resultado, this::toEnrichedResponse);
    }

    @Transactional
    public ChecklistMantenimientoResponse create(ChecklistMantenimientoRequest dto) {
        if (!actividadRepository.findById(dto.actividadMantenimientoId()).isPresent()) {
            throw new ResourceNotFoundException("Actividad de mantenimiento", dto.actividadMantenimientoId());
        }

        if (repository.existsByCodigoIgnoreCase(dto.codigo())) {
            throw new ConflictException(
                    "CHECKLIST_CODIGO_DUPLICADO",
                    "Ya existe un checklist de mantenimiento con el código " + dto.codigo()
            );
        }

        ChecklistMantenimiento domain = mapper.toDomain(dto);
        if (domain.getItems() != null) {
            domain.getItems().forEach(item -> {
                if (item.getChecklistMantenimientoId() == null) {
                    item.setChecklistMantenimientoId(domain.getId());
                }
            });
        }

        ChecklistMantenimiento guardado = repository.save(domain);
        return toEnrichedResponse(guardado);
    }

    @Transactional
    public ChecklistMantenimientoResponse update(UUID id, ChecklistMantenimientoRequest dto) {
        ChecklistMantenimiento actual = obtenerPorId(id);

        if (!actividadRepository.findById(dto.actividadMantenimientoId()).isPresent()) {
            throw new ResourceNotFoundException("Actividad de mantenimiento", dto.actividadMantenimientoId());
        }

        if (repository.existsByCodigoIgnoreCaseAndIdNot(dto.codigo(), id)) {
            throw new ConflictException(
                    "CHECKLIST_CODIGO_DUPLICADO",
                    "Ya existe otro checklist de mantenimiento con el código " + dto.codigo()
            );
        }

        mapper.updateDomainFromRequest(dto, actual);

        if (actual.getItems() != null) {
            actual.getItems().forEach(item -> {
                if (item.getChecklistMantenimientoId() == null) {
                    item.setChecklistMantenimientoId(actual.getId());
                }
            });
        }

        ChecklistMantenimiento actualizado = repository.save(actual);
        return toEnrichedResponse(actualizado);
    }

    @Transactional
    public ChecklistMantenimientoResponse update(UUID id, ChecklistMantenimientoUpdate dto) {
        ChecklistMantenimiento actual = obtenerPorId(id);

        if (!actividadRepository.findById(dto.actividadMantenimientoId()).isPresent()) {
            throw new ResourceNotFoundException("Actividad de mantenimiento", dto.actividadMantenimientoId());
        }

        if (repository.existsByCodigoIgnoreCaseAndIdNot(dto.codigo(), id)) {
            throw new ConflictException(
                    "CHECKLIST_CODIGO_DUPLICADO",
                    "Ya existe otro checklist de mantenimiento con el código " + dto.codigo()
            );
        }

        mapper.updateDomain(dto, actual);

        if (actual.getItems() != null) {
            actual.getItems().forEach(item -> {
                if (item.getChecklistMantenimientoId() == null) {
                    item.setChecklistMantenimientoId(actual.getId());
                }
            });
        }

        ChecklistMantenimiento actualizado = repository.save(actual);
        return toEnrichedResponse(actualizado);
    }

    @Transactional
    public void delete(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private ChecklistMantenimiento obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist de mantenimiento", id));
    }

    private ChecklistMantenimientoResponse toEnrichedResponse(ChecklistMantenimiento domain) {
        ChecklistMantenimientoResponse base = mapper.toResponse(domain);
        if (domain.getActividadMantenimientoId() != null) {
            ChecklistMantenimientoResponse.ActividadInfo info = actividadRepository.findById(domain.getActividadMantenimientoId())
                    .map(a -> new ChecklistMantenimientoResponse.ActividadInfo(a.getId(), a.getCodigo(), a.getNombre()))
                    .orElse(null);
            return new ChecklistMantenimientoResponse(
                    base.id(),
                    base.actividadMantenimientoId(),
                    info,
                    base.codigo(),
                    base.nombre(),
                    base.descripcion(),
                    base.items(),
                    base.auditoria()
            );
        }
        return base;
    }
}
