package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request.SolicitudMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request.SolicitudMantenimientoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response.SolicitudMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.SolicitudMantenimientoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoRepository;
import com.endecorani.sigma_api.modules.parametros.application.service.CorrelativoService;
import com.endecorani.sigma_api.modules.parametros.domain.constant.CorrelativoCodigo;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SolicitudMantenimientoService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "numero",
            "titulo",
            "fechaSolicitud",
            "estado",
            "createdAt",
            "updatedAt"
    );

    private final SolicitudMantenimientoRepository repository;
    private final SolicitudMantenimientoMapper mapper;
    private final CorrelativoService correlativoService;

    @Transactional(readOnly = true)
    public PageResponse<SolicitudMantenimientoResponse> listar(String search, PageRequestDto pageRequest) {
        String normalized = StringUtils.normalize(search);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<SolicitudMantenimiento> resultado;

        if (normalized == null || normalized.isBlank()) {
            resultado = repository.findAll(pageable);
        } else {
            resultado = repository.search(normalized, pageable);
        }

        return PageResponse.from(resultado, mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public SolicitudMantenimientoResponse buscarPorId(UUID id) {
        SolicitudMantenimiento solicitud = obtenerPorId(id);
        return mapper.toResponse(solicitud);
    }

    @Transactional
    public SolicitudMantenimientoResponse crear(SolicitudMantenimientoRequest dto) {

        String numero = correlativoService.generar(CorrelativoCodigo.SOLICITUD_MANTENIMIENTO,
                LocalDateTime.now().getYear());


        SolicitudMantenimiento solicitud = mapper.toDomain(dto);
        
        // Asignación de valores por defecto al crear
        solicitud.setNumero(numero);
        solicitud.setFechaSolicitud(LocalDateTime.now());
        solicitud.setEstado("ESTADO_BORRADOR"); // Estado inicial
        
        SolicitudMantenimiento guardado = repository.save(solicitud);
        return mapper.toResponse(guardado);
    }

    @Transactional
    public SolicitudMantenimientoResponse actualizar(UUID id, SolicitudMantenimientoUpdate dto) {
        SolicitudMantenimiento actual = obtenerPorId(id);
        
        mapper.updateDomain(dto, actual);
        
        // Mantenemos el estado de flowable si cambia
        if(dto.estado() != null && !dto.estado().isBlank()) {
            actual.setEstado(dto.estado());
        }

        SolicitudMantenimiento actualizado = repository.save(actual);
        return mapper.toResponse(actualizado);
    }

    @Transactional
    public void eliminar(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private SolicitudMantenimiento obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud de mantenimiento", id));
    }
}
