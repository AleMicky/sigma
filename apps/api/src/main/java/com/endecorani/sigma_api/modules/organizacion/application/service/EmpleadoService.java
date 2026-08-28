package com.endecorani.sigma_api.modules.organizacion.application.service;

import com.endecorani.sigma_api.modules.organizacion.application.dto.EmpleadoSearchCriteria;
import com.endecorani.sigma_api.modules.organizacion.application.dto.request.EmpleadoRequest;
import com.endecorani.sigma_api.modules.organizacion.application.dto.response.EmpleadoResponse;
import com.endecorani.sigma_api.modules.organizacion.application.dto.response.PersonaResumenResponse;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Persona;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.AreaRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.CargoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.PersonaRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.shared.application.crud.CrudService;
import com.endecorani.sigma_api.shared.application.dto.response.CatalogoResumenResponse;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaMapper;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class EmpleadoService implements CrudService<EmpleadoRequest, EmpleadoResponse, UUID> {

    private static final int CODIGO_MIN_LENGTH = 2;
    private static final int CODIGO_MAX_LENGTH = 50;

    private static final String ROL_ADMIN = "ADMIN";

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
    private final UsuarioRepository usuarioRepository;

    // =========================================================================
    // COMANDOS / MUTACIONES
    // =========================================================================

    @Override
    @Transactional
    public EmpleadoResponse create(EmpleadoRequest request) {
        Empleado domain = toDomain(request);
        Empleado saved = empleadoRepository.save(domain);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public EmpleadoResponse update(UUID id, EmpleadoRequest request) {
        Empleado domain = findDomainById(id);
        updateDomain(domain, request);
        Empleado updated = empleadoRepository.save(domain);
        return toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        findDomainById(id);
        empleadoRepository.deleteById(id);
    }

    // =========================================================================
    // CONSULTAS / QUERIES
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public EmpleadoResponse findById(UUID id) {
        return toResponse(findDomainById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EmpleadoResponse> findAll(PageRequestDto pageRequest) {
        return PageResponse.from(
                empleadoRepository.findAll(pageRequest.toPageable(allowedSortFields())),
                this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<EmpleadoResponse> find(
            UUID personaId,
            UUID areaId,
            UUID cargoId,
            String query,
            PageRequestDto pageRequest
    ) {
        return PageResponse.from(
                empleadoRepository.findAll(
                        new EmpleadoSearchCriteria(
                                personaId,
                                areaId,
                                cargoId,
                                StringUtils.normalize(query)
                        ),
                        pageRequest.toPageable(allowedSortFields())
                ),
                this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<EmpleadoResponse> findMisEmpleados(
            PageRequestDto pageRequest,
            Authentication authentication
    ) {
        if (esAdmin(authentication)) {
            return findAll(pageRequest);
        }

        UUID personaId = personaIdDeSesion(authentication);

        if (personaId == null) {
            return PageResponse.from(Page.<Empleado>empty(), this::toResponse);
        }

        return PageResponse.from(
                empleadoRepository.findAll(
                        new EmpleadoSearchCriteria(personaId, null, null, null),
                        pageRequest.toPageable(allowedSortFields())
                ),
                this::toResponse
        );
    }

    private UUID personaIdDeSesion(Authentication authentication) {
        if (authentication == null) {
            return null;
        }

        String principalName = authentication.getName();
        if (principalName == null || principalName.isBlank()) {
            return null;
        }

        Optional<Usuario> usuario = usuarioRepository.findByKeycloakUserId(principalName);
        if (usuario.isEmpty()) {
            usuario = usuarioRepository.findByUsernameIgnoreCase(principalName);
        }

        return usuario.map(Usuario::getPersonaId).orElse(null);
    }

    private boolean esAdmin(Authentication authentication) {
        if (authentication == null) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority -> authority.equalsIgnoreCase(ROL_ADMIN)
                        || authority.equalsIgnoreCase("ROLE_" + ROL_ADMIN));
    }

    // =========================================================================
    // MAPEOS Y CONVERSIONES DTO / DOMINIO
    // =========================================================================

    private Empleado toDomain(EmpleadoRequest request) {
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

    private void updateDomain(Empleado domain, EmpleadoRequest request) {
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

    private EmpleadoResponse toResponse(Empleado domain) {
        return new EmpleadoResponse(
                domain.getId(),
                buildPersonaInfo(domain.getPersonaId()),
                buildAreaInfo(domain.getAreaId()),
                buildCargoInfo(domain.getCargoId()),
                domain.getCodigo(),
                domain.getFechaInicio(),
                domain.getFechaFin(),
                AuditoriaMapper.from(domain)
        );
    }

    private PersonaResumenResponse buildPersonaInfo(UUID personaId) {
        if (personaId == null) {
            return null;
        }

        return personaRepository.findById(personaId)
                .map(persona -> new PersonaResumenResponse(
                        persona.getId(),
                        buildNombreCompleto(persona),
                        persona.getTipoDocumento(),
                        persona.getNumeroDocumento()
                ))
                .orElse(null);
    }

    private CatalogoResumenResponse buildAreaInfo(UUID areaId) {
        if (areaId == null) {
            return null;
        }

        return areaRepository.findById(areaId)
                .map(area -> new CatalogoResumenResponse(area.getId(), area.getCodigo(), area.getNombre()))
                .orElse(null);
    }

    private CatalogoResumenResponse buildCargoInfo(UUID cargoId) {
        if (cargoId == null) {
            return null;
        }

        return cargoRepository.findById(cargoId)
                .map(cargo -> new CatalogoResumenResponse(cargo.getId(), cargo.getCodigo(), cargo.getNombre()))
                .orElse(null);
    }

    private String buildNombreCompleto(Persona persona) {
        return Stream.of(
                        persona.getNombres(),
                        persona.getPrimerApellido(),
                        persona.getSegundoApellido()
                )
                .filter(value -> value != null && !value.isBlank())
                .map(String::trim)
                .collect(Collectors.joining(" "));
    }

    // =========================================================================
    // VALIDACIONES Y REGLAS DE NEGOCIO
    // =========================================================================

    private Empleado findDomainById(UUID id) {
        return empleadoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empleado", id));
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
                    "Ya existe un empleado con el código '%s'".formatted(codigo)
            );
        }
    }

    private void validateUniqueCodigoForUpdate(String codigo, UUID currentId) {
        if (empleadoRepository.existsByCodigoIgnoreCaseAndIdNot(codigo, currentId)) {
            throw new ConflictException(
                    "EMPLEADO_ALREADY_EXISTS",
                    "Ya existe otro empleado con el código '%s'".formatted(codigo)
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

    private Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }
}