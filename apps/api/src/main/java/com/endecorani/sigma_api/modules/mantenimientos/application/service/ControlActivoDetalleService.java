package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.request.ControlActivoDetalleRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.response.ControlActivoDetalleResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ControlActivoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ControlActivoDetalle;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ControlActivoDetalleRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ControlActivoRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ControlActivoDetalleService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "cantidadEsperada",
            "cantidadEncontrada",
            "conforme",
            "createdAt",
            "updatedAt"
    );

    private final ControlActivoDetalleRepository repository;
    private final ControlActivoRepository controlActivoRepository;
    private final ControlActivoMapper mapper;

    @Transactional
    public ControlActivoDetalleResponse create(ControlActivoDetalleRequest request) {
        if (request.controlActivoId() != null && !controlActivoRepository.findById(request.controlActivoId()).isPresent()) {
            throw new ResourceNotFoundException("Control de activo", request.controlActivoId());
        }

        ControlActivoDetalle domain = mapper.toDetalleDomain(request);
        return mapper.toDetalleResponse(repository.save(domain));
    }

    @Transactional
    public ControlActivoDetalleResponse update(UUID id, ControlActivoDetalleRequest request) {
        ControlActivoDetalle domain = obtenerPorId(id);

        if (request.controlActivoId() != null && !controlActivoRepository.findById(request.controlActivoId()).isPresent()) {
            throw new ResourceNotFoundException("Control de activo", request.controlActivoId());
        }

        mapper.updateDetalleFromRequest(request, domain);

        if (request.controlActivoId() != null) {
            domain.setControlActivoId(request.controlActivoId());
        }

        return mapper.toDetalleResponse(repository.save(domain));
    }

    @Transactional(readOnly = true)
    public ControlActivoDetalleResponse findById(UUID id) {
        ControlActivoDetalle domain = obtenerPorId(id);
        return mapper.toDetalleResponse(domain);
    }

    @Transactional(readOnly = true)
    public PageResponse<ControlActivoDetalleResponse> findAll(PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<ControlActivoDetalle> resultado = repository.findAll(pageable);
        return PageResponse.from(resultado, mapper::toDetalleResponse);
    }

    @Transactional(readOnly = true)
    public PageResponse<ControlActivoDetalleResponse> findAll(UUID controlActivoId, PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<ControlActivoDetalle> resultado = repository.findByControlActivoId(controlActivoId, pageable);
        return PageResponse.from(resultado, mapper::toDetalleResponse);
    }

    @Transactional
    public void delete(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private ControlActivoDetalle obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Detalle de control de activo", id));
    }
}
