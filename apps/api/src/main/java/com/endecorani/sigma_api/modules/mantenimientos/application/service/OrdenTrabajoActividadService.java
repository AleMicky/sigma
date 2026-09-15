package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.request.OrdenTrabajoActividadRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.response.OrdenTrabajoActividadResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.OrdenTrabajoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoActividad;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoActividadRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoRepository;
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
public class OrdenTrabajoActividadService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "descripcion",
            "realizado",
            "fechaRealizacion",
            "createdAt",
            "updatedAt"
    );

    private final OrdenTrabajoActividadRepository repository;
    private final OrdenTrabajoRepository ordenTrabajoRepository;
    private final OrdenTrabajoMapper mapper;

    @Transactional
    public OrdenTrabajoActividadResponse create(OrdenTrabajoActividadRequest request) {
        if (request.ordenTrabajoId() != null && !ordenTrabajoRepository.findById(request.ordenTrabajoId()).isPresent()) {
            throw new ResourceNotFoundException("Orden de trabajo", request.ordenTrabajoId());
        }

        OrdenTrabajoActividad domain = mapper.toActividadDomain(request);
        if (domain.getEvidencias() != null) {
            domain.getEvidencias().forEach(evidencia -> {
                if (evidencia.getOrdenTrabajoActividadId() == null) {
                    evidencia.setOrdenTrabajoActividadId(domain.getId());
                }
            });
        }

        return mapper.toActividadResponse(repository.save(domain));
    }

    @Transactional
    public OrdenTrabajoActividadResponse update(UUID id, OrdenTrabajoActividadRequest request) {
        OrdenTrabajoActividad domain = obtenerPorId(id);

        if (request.ordenTrabajoId() != null && !ordenTrabajoRepository.findById(request.ordenTrabajoId()).isPresent()) {
            throw new ResourceNotFoundException("Orden de trabajo", request.ordenTrabajoId());
        }

        mapper.updateActividadFromRequest(request, domain);

        if (request.ordenTrabajoId() != null) {
            domain.setOrdenTrabajoId(request.ordenTrabajoId());
        }

        if (domain.getEvidencias() != null) {
            domain.getEvidencias().forEach(evidencia -> {
                if (evidencia.getOrdenTrabajoActividadId() == null) {
                    evidencia.setOrdenTrabajoActividadId(domain.getId());
                }
            });
        }

        return mapper.toActividadResponse(repository.save(domain));
    }

    @Transactional(readOnly = true)
    public OrdenTrabajoActividadResponse findById(UUID id) {
        OrdenTrabajoActividad domain = obtenerPorId(id);
        return mapper.toActividadResponse(domain);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrdenTrabajoActividadResponse> findByOrdenTrabajoId(UUID ordenTrabajoId, PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<OrdenTrabajoActividad> resultado = repository.findByOrdenTrabajoId(ordenTrabajoId, pageable);
        return PageResponse.from(resultado, mapper::toActividadResponse);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrdenTrabajoActividadResponse> findAll(PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<OrdenTrabajoActividad> resultado = repository.findAll(pageable);
        return PageResponse.from(resultado, mapper::toActividadResponse);
    }

    @Transactional
    public void delete(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private OrdenTrabajoActividad obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Actividad de orden de trabajo", id));
    }
}
