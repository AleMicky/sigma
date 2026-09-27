package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehicular.request.FlotaVehicularRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehicular.request.FlotaVehicularUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehicular.response.FlotaVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.mapper.FlotaVehicularMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.FlotaVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.FlotaVehicularRepository;
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

@Service
@RequiredArgsConstructor
public class FlotaVehicularService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "nombre",
            "descripcion",
            "activo",
            "createdAt",
            "updatedAt"
    );

    private final FlotaVehicularRepository repository;
    private final FlotaVehicularMapper mapper;

    @Transactional(readOnly = true)
    public PageResponse<FlotaVehicularResponse> listar(String search, Boolean activo, PageRequestDto pageRequest) {
        String normalizedSearch = StringUtils.normalize(search);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<FlotaVehicular> resultado;

        if ((normalizedSearch == null || normalizedSearch.isBlank()) && activo == null) {
            resultado = repository.findAll(pageable);
        } else {
            resultado = repository.searchWithFilters(normalizedSearch, activo, pageable);
        }

        return PageResponse.from(resultado, mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public List<FlotaVehicularResponse> findAllActivos() {
        return repository.findAllActivos().stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public FlotaVehicularResponse findById(UUID id) {
        FlotaVehicular flota = obtenerPorId(id);
        return mapper.toResponse(flota);
    }

    @Transactional
    public FlotaVehicularResponse create(FlotaVehicularRequest dto) {
        String codigo = StringUtils.normalize(dto.codigo());
        validarCodigoUnicoParaCrear(codigo);

        FlotaVehicular flota = mapper.toDomain(dto);
        flota.setCodigo(codigo);
        flota.setNombre(StringUtils.normalize(dto.nombre()));
        flota.setDescripcion(StringUtils.normalize(dto.descripcion()));
        if (dto.activo() != null) {
            flota.setActivo(dto.activo());
        } else {
            flota.setActivo(true);
        }

        FlotaVehicular guardada = repository.save(flota);
        return mapper.toResponse(guardada);
    }

    @Transactional
    public FlotaVehicularResponse update(UUID id, FlotaVehicularUpdate dto) {
        FlotaVehicular actual = obtenerPorId(id);

        String codigo = StringUtils.normalize(dto.codigo());
        validarCodigoUnicoParaActualizar(codigo, id);

        mapper.updateDomain(dto, actual);
        actual.setCodigo(codigo);
        actual.setNombre(StringUtils.normalize(dto.nombre()));
        actual.setDescripcion(StringUtils.normalize(dto.descripcion()));
        if (dto.activo() != null) {
            actual.setActivo(dto.activo());
        }

        FlotaVehicular actualizada = repository.save(actual);
        return mapper.toResponse(actualizada);
    }

    @Transactional
    public FlotaVehicularResponse update(UUID id, FlotaVehicularRequest dto) {
        FlotaVehicular actual = obtenerPorId(id);

        String codigo = StringUtils.normalize(dto.codigo());
        validarCodigoUnicoParaActualizar(codigo, id);

        mapper.updateDomainFromRequest(dto, actual);
        actual.setCodigo(codigo);
        actual.setNombre(StringUtils.normalize(dto.nombre()));
        actual.setDescripcion(StringUtils.normalize(dto.descripcion()));
        if (dto.activo() != null) {
            actual.setActivo(dto.activo());
        }

        FlotaVehicular actualizada = repository.save(actual);
        return mapper.toResponse(actualizada);
    }

    @Transactional
    public FlotaVehicularResponse toggleActivo(UUID id) {
        FlotaVehicular actual = obtenerPorId(id);
        actual.setActivo(!actual.isActivo());
        FlotaVehicular actualizada = repository.save(actual);
        return mapper.toResponse(actualizada);
    }

    @Transactional
    public void delete(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private FlotaVehicular obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flota vehicular", id));
    }

    private void validarCodigoUnicoParaCrear(String codigo) {
        if (codigo != null && repository.existsByCodigoIgnoreCase(codigo)) {
            throw new ConflictException(
                    "FLOTA_VEHICULAR_ALREADY_EXISTS",
                    "Ya existe una flota vehicular con el código '%s'".formatted(codigo)
            );
        }
    }

    private void validarCodigoUnicoParaActualizar(String codigo, UUID currentId) {
        if (codigo != null && repository.existsByCodigoIgnoreCaseAndIdNot(codigo, currentId)) {
            throw new ConflictException(
                    "FLOTA_VEHICULAR_ALREADY_EXISTS",
                    "Ya existe otra flota vehicular con el código '%s'".formatted(codigo)
            );
        }
    }
}
