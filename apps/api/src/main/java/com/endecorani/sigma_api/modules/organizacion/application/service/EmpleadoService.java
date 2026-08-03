package com.endecorani.sigma_api.modules.organizacion.application.service;

import com.endecorani.sigma_api.modules.organizacion.application.dto.EmpleadoRequest;
import com.endecorani.sigma_api.modules.organizacion.application.dto.EmpleadoResponse;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.AreaRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.CargoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.PersonaRepository;
import com.endecorani.sigma_api.shared.application.crud.AbstractCrudService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
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
public class EmpleadoService extends AbstractCrudService<
        Empleado,
        EmpleadoRequest,
        EmpleadoResponse,
        UUID
        > {

    private static final int CODIGO_MIN_LENGTH = 2;
    private static final int CODIGO_MAX_LENGTH = 50;

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "fechaInicio",
            "createdAt",
            "updatedAt"
    );

    private final EmpleadoRepository empleadoRepository;
    private final PersonaRepository personaRepository;
    private final AreaRepository areaRepository;
    private final CargoRepository cargoRepository;

    @Override
    protected CrudRepository<Empleado, UUID> repository() {
        return empleadoRepository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Transactional(readOnly = true)
    public PageResponse<EmpleadoResponse> find(
            UUID personaId,
            UUID areaId,
            UUID cargoId,
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(query);
        Pageable pageable = pageRequest.toPageable(allowedSortFields());

        boolean hasArea = areaId != null;
        boolean hasCargo = cargoId != null;
        boolean hasPersona = personaId != null;

        Page<Empleado> page;
        if (hasArea && hasCargo && hasPersona) {
            page = normalized == null
                    ? empleadoRepository.findByAreaIdAndCargoIdAndPersonaId(areaId, cargoId, personaId, pageable)
                    : empleadoRepository.searchByAreaIdAndCargoIdAndPersonaId(areaId, cargoId, personaId, normalized, pageable);
        } else if (hasArea && hasCargo) {
            page = normalized == null
                    ? empleadoRepository.findByAreaIdAndCargoId(areaId, cargoId, pageable)
                    : empleadoRepository.searchByAreaIdAndCargoId(areaId, cargoId, normalized, pageable);
        } else if (hasArea && hasPersona) {
            page = normalized == null
                    ? empleadoRepository.findByAreaIdAndPersonaId(areaId, personaId, pageable)
                    : empleadoRepository.searchByAreaIdAndPersonaId(areaId, personaId, normalized, pageable);
        } else if (hasCargo && hasPersona) {
            page = normalized == null
                    ? empleadoRepository.findByCargoIdAndPersonaId(cargoId, personaId, pageable)
                    : empleadoRepository.searchByCargoIdAndPersonaId(cargoId, personaId, normalized, pageable);
        } else if (hasArea) {
            page = normalized == null
                    ? empleadoRepository.findByAreaId(areaId, pageable)
                    : empleadoRepository.searchByAreaId(areaId, normalized, pageable);
        } else if (hasCargo) {
            page = normalized == null
                    ? empleadoRepository.findByCargoId(cargoId, pageable)
                    : empleadoRepository.searchByCargoId(cargoId, normalized, pageable);
        } else if (hasPersona) {
            page = normalized == null
                    ? empleadoRepository.findByPersonaId(personaId, pageable)
                    : empleadoRepository.searchByPersonaId(personaId, normalized, pageable);
        } else {
            if (normalized == null) {
                return findAll(pageRequest);
            }
            page = empleadoRepository.search(normalized, pageable);
        }

        return PageResponse.from(page, this::toResponse);
    }

    @Override
    protected Empleado toDomain(EmpleadoRequest request) {
        validateReferencias(request);
        String codigo = requireNormalizedCodigo(request.codigo());
        validateUniqueCodigoForCreate(codigo);

        return Empleado.builder()
                .personaId(request.personaId())
                .areaId(request.areaId())
                .cargoId(request.cargoId())
                .codigo(codigo)
                .fechaInicio(request.fechaInicio())
                .fechaFin(request.fechaFin())
                .activo(Boolean.TRUE)
                .build();
    }

    @Override
    protected void updateDomain(Empleado domain, EmpleadoRequest request) {
        validateReferencias(request);
        String codigo = requireNormalizedCodigo(request.codigo());
        validateUniqueCodigoForUpdate(codigo, domain.getId());

        domain.setPersonaId(request.personaId());
        domain.setAreaId(request.areaId());
        domain.setCargoId(request.cargoId());
        domain.setCodigo(codigo);
        domain.setFechaInicio(request.fechaInicio());
        domain.setFechaFin(request.fechaFin());
    }

    @Override
    protected EmpleadoResponse toResponse(Empleado domain) {
        return new EmpleadoResponse(
                domain.getId(),
                domain.getPersonaId(),
                domain.getAreaId(),
                domain.getCargoId(),
                domain.getCodigo(),
                domain.getFechaInicio(),
                domain.getFechaFin(),
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );
    }

    @Override
    protected String resourceName() {
        return "Empleado";
    }

    private void validateReferencias(EmpleadoRequest request) {
        requirePersonaExists(request.personaId());
        requireAreaExists(request.areaId());
        requireCargoExists(request.cargoId());
    }

    private void requirePersonaExists(UUID personaId) {
        if (!personaRepository.existsById(personaId)) {
            throw new ResourceNotFoundException("Persona", personaId);
        }
    }

    private void requireAreaExists(UUID areaId) {
        if (!areaRepository.existsById(areaId)) {
            throw new ResourceNotFoundException("Area", areaId);
        }
    }

    private void requireCargoExists(UUID cargoId) {
        if (!cargoRepository.existsById(cargoId)) {
            throw new ResourceNotFoundException("Cargo", cargoId);
        }
    }

    private void validateUniqueCodigoForCreate(String codigo) {
        if (empleadoRepository.existsByCodigoIgnoreCase(codigo)) {
            throw new ConflictException(
                    "EMPLEADO_ALREADY_EXISTS",
                    "Ya existe un empleado con el código '%s'"
                            .formatted(codigo)
            );
        }
    }

    private void validateUniqueCodigoForUpdate(
            String codigo,
            UUID currentId
    ) {
        if (empleadoRepository.existsByCodigoIgnoreCaseAndIdNot(
                codigo,
                currentId
        )) {
            throw new ConflictException(
                    "EMPLEADO_ALREADY_EXISTS",
                    "Ya existe otro empleado con el código '%s'"
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
                    "INVALID_EMPLEADO_CODIGO",
                    "El código debe tener entre %d y %d caracteres"
                            .formatted(CODIGO_MIN_LENGTH, CODIGO_MAX_LENGTH)
            );
        }

        return normalized;
    }
}