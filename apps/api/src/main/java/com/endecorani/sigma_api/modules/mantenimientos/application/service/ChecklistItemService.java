package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.request.ChecklistItemRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.request.ChecklistItemUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.response.ChecklistItemResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ActividadMantenimientoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ChecklistItem;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ActividadMantenimientoAplicacionRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ChecklistItemRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
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
public class ChecklistItemService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "nombre",
            "orden",
            "obligatorio",
            "createdAt",
            "updatedAt"
    );

    private final ChecklistItemRepository repository;
    private final ActividadMantenimientoAplicacionRepository aplicacionRepository;
    private final ActividadMantenimientoMapper mapper;

    @Transactional
    public ChecklistItemResponse create(ChecklistItemRequest dto) {
        if (dto.actividadMantenimientoAplicacionId() != null && !aplicacionRepository.findById(dto.actividadMantenimientoAplicacionId()).isPresent()) {
            throw new ResourceNotFoundException("Aplicación de actividad de mantenimiento", dto.actividadMantenimientoAplicacionId());
        }

        ChecklistItem domain = mapper.toChecklistItemDomain(dto);
        return mapper.toChecklistItemResponse(repository.save(domain));
    }

    @Transactional
    public ChecklistItemResponse update(UUID id, ChecklistItemUpdate dto) {
        ChecklistItem domain = obtenerPorId(id);

        if (dto.actividadMantenimientoAplicacionId() != null && !aplicacionRepository.findById(dto.actividadMantenimientoAplicacionId()).isPresent()) {
            throw new ResourceNotFoundException("Aplicación de actividad de mantenimiento", dto.actividadMantenimientoAplicacionId());
        }

        mapper.updateChecklistItemDomain(dto, domain);

        if (dto.actividadMantenimientoAplicacionId() != null) {
            domain.setActividadMantenimientoAplicacionId(dto.actividadMantenimientoAplicacionId());
        }

        return mapper.toChecklistItemResponse(repository.save(domain));
    }

    @Transactional
    public ChecklistItemResponse update(UUID id, ChecklistItemRequest dto) {
        ChecklistItem domain = obtenerPorId(id);

        if (dto.actividadMantenimientoAplicacionId() != null && !aplicacionRepository.findById(dto.actividadMantenimientoAplicacionId()).isPresent()) {
            throw new ResourceNotFoundException("Aplicación de actividad de mantenimiento", dto.actividadMantenimientoAplicacionId());
        }

        mapper.updateChecklistItemFromRequest(dto, domain);

        if (dto.actividadMantenimientoAplicacionId() != null) {
            domain.setActividadMantenimientoAplicacionId(dto.actividadMantenimientoAplicacionId());
        }

        return mapper.toChecklistItemResponse(repository.save(domain));
    }

    @Transactional(readOnly = true)
    public ChecklistItemResponse findById(UUID id) {
        ChecklistItem domain = obtenerPorId(id);
        return mapper.toChecklistItemResponse(domain);
    }

    @Transactional(readOnly = true)
    public PageResponse<ChecklistItemResponse> findByActividadMantenimientoAplicacionId(
            UUID aplicacionId,
            PageRequestDto pageRequest
    ) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<ChecklistItem> resultado = repository.findByActividadMantenimientoAplicacionId(aplicacionId, pageable);
        return PageResponse.from(resultado, mapper::toChecklistItemResponse);
    }

    @Transactional(readOnly = true)
    public List<ChecklistItemResponse> findByActividadMantenimientoAplicacionId(UUID aplicacionId) {
        return repository.findByActividadMantenimientoAplicacionId(aplicacionId).stream()
                .map(mapper::toChecklistItemResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<ChecklistItemResponse> findAll(PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<ChecklistItem> resultado = repository.findAll(pageable);
        return PageResponse.from(resultado, mapper::toChecklistItemResponse);
    }

    @Transactional
    public void delete(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private ChecklistItem obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ítem de checklist", id));
    }
}
