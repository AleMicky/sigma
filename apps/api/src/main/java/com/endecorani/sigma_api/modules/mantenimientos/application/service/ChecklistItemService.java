package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.request.ChecklistItemRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.request.ChecklistItemUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.response.ChecklistItemResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ChecklistMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ChecklistItem;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ChecklistItemRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ChecklistMantenimientoRepository;
import com.endecorani.sigma_api.modules.parametros.domain.repository.TipoDatoRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
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
            "checklistMantenimientoId",
            "codigo",
            "nombre",
            "orden",
            "obligatorio",
            "createdAt",
            "updatedAt"
    );

    private final ChecklistItemRepository repository;
    private final ChecklistMantenimientoRepository checklistRepository;
    private final TipoDatoRepository tipoDatoRepository;
    private final ChecklistMapper mapper;

    @Transactional(readOnly = true)
    public PageResponse<ChecklistItemResponse> findAll(PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<ChecklistItem> resultado = repository.findAll(pageable);
        return PageResponse.from(resultado, this::toEnrichedResponse);
    }

    @Transactional(readOnly = true)
    public PageResponse<ChecklistItemResponse> findByChecklistMantenimientoId(
            UUID checklistMantenimientoId,
            PageRequestDto pageRequest
    ) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<ChecklistItem> resultado = repository.findByChecklistMantenimientoId(checklistMantenimientoId, pageable);
        return PageResponse.from(resultado, this::toEnrichedResponse);
    }

    @Transactional(readOnly = true)
    public List<ChecklistItemResponse> findByChecklistMantenimientoId(UUID checklistMantenimientoId) {
        return repository.findByChecklistMantenimientoIdOrderByOrdenAsc(checklistMantenimientoId).stream()
                .map(this::toEnrichedResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ChecklistItemResponse findById(UUID id) {
        ChecklistItem item = obtenerPorId(id);
        return toEnrichedResponse(item);
    }

    @Transactional
    public ChecklistItemResponse create(ChecklistItemRequest dto) {
        if (!checklistRepository.existsById(dto.checklistMantenimientoId())) {
            throw new ResourceNotFoundException("Checklist de mantenimiento", dto.checklistMantenimientoId());
        }

        if (!tipoDatoRepository.existsById(dto.tipoDatoId())) {
            throw new ResourceNotFoundException("Tipo de dato", dto.tipoDatoId());
        }

        if (repository.existsByChecklistMantenimientoIdAndCodigoIgnoreCase(dto.checklistMantenimientoId(), dto.codigo())) {
            throw new ConflictException(
                    "CHECKLIST_ITEM_CODIGO_DUPLICADO",
                    "Ya existe un ítem en este checklist con el código " + dto.codigo()
            );
        }

        ChecklistItem domain = mapper.toItemDomain(dto);
        ChecklistItem guardado = repository.save(domain);
        return toEnrichedResponse(guardado);
    }

    @Transactional
    public ChecklistItemResponse update(UUID id, ChecklistItemRequest dto) {
        ChecklistItem actual = obtenerPorId(id);

        UUID checklistId = dto.checklistMantenimientoId() != null ? dto.checklistMantenimientoId() : actual.getChecklistMantenimientoId();

        if (dto.checklistMantenimientoId() != null && !checklistRepository.existsById(dto.checklistMantenimientoId())) {
            throw new ResourceNotFoundException("Checklist de mantenimiento", dto.checklistMantenimientoId());
        }

        if (!tipoDatoRepository.existsById(dto.tipoDatoId())) {
            throw new ResourceNotFoundException("Tipo de dato", dto.tipoDatoId());
        }

        if (repository.existsByChecklistMantenimientoIdAndCodigoIgnoreCaseAndIdNot(checklistId, dto.codigo(), id)) {
            throw new ConflictException(
                    "CHECKLIST_ITEM_CODIGO_DUPLICADO",
                    "Ya existe otro ítem en este checklist con el código " + dto.codigo()
            );
        }

        mapper.updateItemFromRequest(dto, actual);
        if (dto.checklistMantenimientoId() != null) {
            actual.setChecklistMantenimientoId(dto.checklistMantenimientoId());
        }

        ChecklistItem actualizado = repository.save(actual);
        return toEnrichedResponse(actualizado);
    }

    @Transactional
    public ChecklistItemResponse update(UUID id, ChecklistItemUpdate dto) {
        ChecklistItem actual = obtenerPorId(id);

        UUID checklistId = dto.checklistMantenimientoId() != null ? dto.checklistMantenimientoId() : actual.getChecklistMantenimientoId();

        if (dto.checklistMantenimientoId() != null && !checklistRepository.existsById(dto.checklistMantenimientoId())) {
            throw new ResourceNotFoundException("Checklist de mantenimiento", dto.checklistMantenimientoId());
        }

        if (!tipoDatoRepository.existsById(dto.tipoDatoId())) {
            throw new ResourceNotFoundException("Tipo de dato", dto.tipoDatoId());
        }

        if (repository.existsByChecklistMantenimientoIdAndCodigoIgnoreCaseAndIdNot(checklistId, dto.codigo(), id)) {
            throw new ConflictException(
                    "CHECKLIST_ITEM_CODIGO_DUPLICADO",
                    "Ya existe otro ítem en este checklist con el código " + dto.codigo()
            );
        }

        mapper.updateItemDomain(dto, actual);
        if (dto.checklistMantenimientoId() != null) {
            actual.setChecklistMantenimientoId(dto.checklistMantenimientoId());
        }

        ChecklistItem actualizado = repository.save(actual);
        return toEnrichedResponse(actualizado);
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

    private ChecklistItemResponse toEnrichedResponse(ChecklistItem domain) {
        ChecklistItemResponse base = mapper.toItemResponse(domain);

        ChecklistItemResponse.ChecklistInfo checklistInfo = null;
        if (domain.getChecklistMantenimientoId() != null) {
            checklistInfo = checklistRepository.findById(domain.getChecklistMantenimientoId())
                    .map(c -> new ChecklistItemResponse.ChecklistInfo(c.getId(), c.getCodigo(), c.getNombre()))
                    .orElse(null);
        }

        ChecklistItemResponse.TipoDatoInfo tipoDatoInfo = null;
        if (domain.getTipoDatoId() != null) {
            tipoDatoInfo = tipoDatoRepository.findById(domain.getTipoDatoId())
                    .map(t -> new ChecklistItemResponse.TipoDatoInfo(t.getId(), t.getCodigo(), t.getNombre()))
                    .orElse(null);
        }

        return new ChecklistItemResponse(
                base.id(),
                base.checklistMantenimientoId(),
                checklistInfo,
                base.codigo(),
                base.nombre(),
                base.descripcion(),
                base.tipoDatoId(),
                tipoDatoInfo,
                base.orden(),
                base.obligatorio(),
                base.opciones(),
                base.auditoria()
        );
    }
}
