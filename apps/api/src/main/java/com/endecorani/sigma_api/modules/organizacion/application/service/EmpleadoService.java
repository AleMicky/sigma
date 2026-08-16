package com.endecorani.sigma_api.modules.organizacion.application.service;

import com.endecorani.sigma_api.modules.organizacion.application.dto.EmpleadoRequest;
import com.endecorani.sigma_api.modules.organizacion.application.dto.EmpleadoResponse;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.AreaRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.CargoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoSearchCriteria;
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
        EmpleadoSearchCriteria criteria = new EmpleadoSearchCriteria(
                personaId,
                areaId,
                cargoId,
                StringUtils.normalize(query)
        );

        return PageResponse.from(
                empleadoRepository.findAll(
                        criteria,
                        pageRequest.toPageable(allowedSortFields())
                ),
                this::toResponse
        );
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
        String personaNombre = null;
        String personaDoc = null;
        if (domain.getPersonaId() != null) {
            var personaOpt = personaRepository.findById(domain.getPersonaId());
            if (personaOpt.isPresent()) {
                var p = personaOpt.get();
                personaDoc = p.getNumeroDocumento();
                StringBuilder sb = new StringBuilder();
                if (p.getNombres() != null && !p.getNombres().isBlank()) {
                    sb.append(p.getNombres().trim());
                }
                if (p.getPrimerApellido() != null && !p.getPrimerApellido().isBlank()) {
                    if (!sb.isEmpty()) sb.append(" ");
                    sb.append(p.getPrimerApellido().trim());
                }
                if (p.getSegundoApellido() != null && !p.getSegundoApellido().isBlank()) {
                    if (!sb.isEmpty()) sb.append(" ");
                    sb.append(p.getSegundoApellido().trim());
                }
                personaNombre = sb.toString();
            }
        }

        String areaNombre = null;
        if (domain.getAreaId() != null) {
            areaNombre = areaRepository.findById(domain.getAreaId())
                    .map(com.endecorani.sigma_api.modules.organizacion.domain.model.Area::getNombre)
                    .orElse(null);
        }

        String cargoNombre = null;
        if (domain.getCargoId() != null) {
            cargoNombre = cargoRepository.findById(domain.getCargoId())
                    .map(com.endecorani.sigma_api.modules.organizacion.domain.model.Cargo::getNombre)
                    .orElse(null);
        }

        return new EmpleadoResponse(
                domain.getId(),
                domain.getPersonaId(),
                personaNombre,
                personaDoc,
                domain.getAreaId(),
                areaNombre,
                domain.getCargoId(),
                cargoNombre,
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