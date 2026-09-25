package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.request.ConductorRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.request.ConductorUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.response.ConductorResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.mapper.ConductorMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.Conductor;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ConductorRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
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

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConductorService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "empleadoId",
            "numeroLicencia",
            "categoriaLicencia",
            "fechaVencimiento",
            "activo",
            "createdAt",
            "updatedAt"
    );

    private final ConductorRepository repository;
    private final EmpleadoRepository empleadoRepository;
    private final ConductorMapper mapper;

    @Transactional(readOnly = true)
    public PageResponse<ConductorResponse> findAll(PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<Conductor> resultado = repository.findAll(pageable);
        return PageResponse.from(resultado, mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public PageResponse<ConductorResponse> listar(String search, PageRequestDto pageRequest) {
        String normalized = StringUtils.normalize(search);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<Conductor> resultado;

        if (normalized == null || normalized.isBlank()) {
            resultado = repository.findAll(pageable);
        } else {
            resultado = repository.search(normalized, pageable);
        }

        return PageResponse.from(resultado, mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ConductorResponse findById(UUID id) {
        Conductor conductor = obtenerPorId(id);
        return mapper.toResponse(conductor);
    }

    @Transactional
    public ConductorResponse create(ConductorRequest dto) {
        UUID empleadoId = dto.empleadoId();
        validarEmpleadoExistente(empleadoId);

        String numeroLicencia = StringUtils.normalize(dto.numeroLicencia());
        validarUnicosParaCrear(empleadoId, numeroLicencia);

        Conductor domain = mapper.toDomain(dto);
        domain.setNumeroLicencia(numeroLicencia);
        domain.setCategoriaLicencia(StringUtils.normalize(dto.categoriaLicencia()));
        if (dto.activo() == null) {
            domain.setActivo(true);
        }

        Conductor guardado = repository.save(domain);
        return mapper.toResponse(guardado);
    }

    @Transactional
    public ConductorResponse update(UUID id, ConductorRequest dto) {
        Conductor actual = obtenerPorId(id);

        UUID empleadoId = dto.empleadoId();
        validarEmpleadoExistente(empleadoId);

        String numeroLicencia = StringUtils.normalize(dto.numeroLicencia());
        validarUnicosParaActualizar(empleadoId, numeroLicencia, id);

        mapper.updateDomainFromRequest(dto, actual);
        actual.setNumeroLicencia(numeroLicencia);
        actual.setCategoriaLicencia(StringUtils.normalize(dto.categoriaLicencia()));
        if (dto.activo() != null) {
            actual.setActivo(dto.activo());
        }

        Conductor actualizado = repository.save(actual);
        return mapper.toResponse(actualizado);
    }

    @Transactional
    public ConductorResponse update(UUID id, ConductorUpdate dto) {
        Conductor actual = obtenerPorId(id);

        UUID empleadoId = dto.empleadoId();
        validarEmpleadoExistente(empleadoId);

        String numeroLicencia = StringUtils.normalize(dto.numeroLicencia());
        validarUnicosParaActualizar(empleadoId, numeroLicencia, id);

        mapper.updateDomain(dto, actual);
        actual.setNumeroLicencia(numeroLicencia);
        actual.setCategoriaLicencia(StringUtils.normalize(dto.categoriaLicencia()));
        if (dto.activo() != null) {
            actual.setActivo(dto.activo());
        }

        Conductor actualizado = repository.save(actual);
        return mapper.toResponse(actualizado);
    }

    @Transactional
    public void delete(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private Conductor obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conductor", id));
    }

    private void validarEmpleadoExistente(UUID empleadoId) {
        if (!empleadoRepository.existsById(empleadoId)) {
            throw new ResourceNotFoundException("Empleado", empleadoId);
        }
    }

    private void validarUnicosParaCrear(UUID empleadoId, String numeroLicencia) {
        if (repository.existsByEmpleadoId(empleadoId)) {
            throw new ConflictException(
                    "CONDUCTOR_EMPLEADO_ALREADY_EXISTS",
                    "Ya existe un conductor asociado al empleado '%s'".formatted(empleadoId)
            );
        }

        if (repository.existsByNumeroLicenciaIgnoreCase(numeroLicencia)) {
            throw new ConflictException(
                    "CONDUCTOR_NUMERO_LICENCIA_ALREADY_EXISTS",
                    "Ya existe un conductor con el número de licencia '%s'".formatted(numeroLicencia)
            );
        }
    }

    private void validarUnicosParaActualizar(UUID empleadoId, String numeroLicencia, UUID currentId) {
        if (repository.existsByEmpleadoIdAndIdNot(empleadoId, currentId)) {
            throw new ConflictException(
                    "CONDUCTOR_EMPLEADO_ALREADY_EXISTS",
                    "Ya existe otro conductor asociado al empleado '%s'".formatted(empleadoId)
            );
        }

        if (repository.existsByNumeroLicenciaIgnoreCaseAndIdNot(numeroLicencia, currentId)) {
            throw new ConflictException(
                    "CONDUCTOR_NUMERO_LICENCIA_ALREADY_EXISTS",
                    "Ya existe otro conductor con el número de licencia '%s'".formatted(numeroLicencia)
            );
        }
    }
}
