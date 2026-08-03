package com.endecorani.sigma_api.modules.organizacion.application.service;

import com.endecorani.sigma_api.modules.organizacion.application.dto.PersonaRequest;
import com.endecorani.sigma_api.modules.organizacion.application.dto.PersonaResponse;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Persona;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.PersonaRepository;
import com.endecorani.sigma_api.shared.application.crud.AbstractCrudService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PersonaService extends AbstractCrudService<
        Persona,
        PersonaRequest,
        PersonaResponse,
        UUID
        > {

    private static final int TIPO_DOCUMENTO_MIN_LENGTH = 2;
    private static final int TIPO_DOCUMENTO_MAX_LENGTH = 20;
    private static final int NUMERO_DOCUMENTO_MIN_LENGTH = 2;
    private static final int NUMERO_DOCUMENTO_MAX_LENGTH = 50;
    private static final int COMPLEMENTO_MAX_LENGTH = 10;
    private static final int NOMBRES_MIN_LENGTH = 2;
    private static final int NOMBRES_MAX_LENGTH = 100;
    private static final int PRIMER_APELLIDO_MIN_LENGTH = 2;
    private static final int PRIMER_APELLIDO_MAX_LENGTH = 100;
    private static final int SEGUNDO_APELLIDO_MAX_LENGTH = 100;
    private static final int TELEFONO_MAX_LENGTH = 30;
    private static final int CORREO_MAX_LENGTH = 150;

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "nombres",
            "primerApellido",
            "numeroDocumento",
            "createdAt",
            "updatedAt"
    );

    private final PersonaRepository personaRepository;

    @Override
    protected CrudRepository<Persona, UUID> repository() {
        return personaRepository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Transactional(readOnly = true)
    public PageResponse<PersonaResponse> search(
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(query);

        if (normalized == null) {
            return findAll(pageRequest);
        }

        return PageResponse.from(
                personaRepository.search(
                        normalized,
                        pageRequest.toPageable(allowedSortFields())
                ),
                this::toResponse
        );
    }

    @Override
    protected Persona toDomain(PersonaRequest request) {
        String tipoDocumento = requireTipoDocumento(request.tipoDocumento());
        String numeroDocumento = requireNumeroDocumento(request.numeroDocumento());
        String complemento = normalizeComplemento(request.complemento());
        validateUniqueDocumentoForCreate(tipoDocumento, numeroDocumento, complemento);

        return Persona.builder()
                .tipoDocumento(tipoDocumento)
                .numeroDocumento(numeroDocumento)
                .complemento(complemento)
                .nombres(requireNombres(request.nombres()))
                .primerApellido(requirePrimerApellido(request.primerApellido()))
                .segundoApellido(normalizeSegundoApellido(request.segundoApellido()))
                .fechaNacimiento(request.fechaNacimiento())
                .telefono(normalizeTelefono(request.telefono()))
                .correo(normalizeCorreo(request.correo()))
                .activo(Boolean.TRUE)
                .build();
    }

    @Override
    protected void updateDomain(Persona domain, PersonaRequest request) {
        String tipoDocumento = requireTipoDocumento(request.tipoDocumento());
        String numeroDocumento = requireNumeroDocumento(request.numeroDocumento());
        String complemento = normalizeComplemento(request.complemento());
        validateUniqueDocumentoForUpdate(
                tipoDocumento,
                numeroDocumento,
                complemento,
                domain.getId()
        );

        domain.setTipoDocumento(tipoDocumento);
        domain.setNumeroDocumento(numeroDocumento);
        domain.setComplemento(complemento);
        domain.setNombres(requireNombres(request.nombres()));
        domain.setPrimerApellido(requirePrimerApellido(request.primerApellido()));
        domain.setSegundoApellido(normalizeSegundoApellido(request.segundoApellido()));
        domain.setFechaNacimiento(request.fechaNacimiento());
        domain.setTelefono(normalizeTelefono(request.telefono()));
        domain.setCorreo(normalizeCorreo(request.correo()));
    }

    @Override
    protected PersonaResponse toResponse(Persona domain) {
        return new PersonaResponse(
                domain.getId(),
                domain.getTipoDocumento(),
                domain.getNumeroDocumento(),
                domain.getComplemento(),
                domain.getNombres(),
                domain.getPrimerApellido(),
                domain.getSegundoApellido(),
                domain.getFechaNacimiento(),
                domain.getTelefono(),
                domain.getCorreo(),
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );
    }

    @Override
    protected String resourceName() {
        return "Persona";
    }

    private void validateUniqueDocumentoForCreate(
            String tipoDocumento,
            String numeroDocumento,
            String complemento
    ) {
        if (personaRepository.existsByDocumento(
                tipoDocumento,
                numeroDocumento,
                complemento
        )) {
            throw new ConflictException(
                    "PERSONA_ALREADY_EXISTS",
                    "Ya existe una persona con el documento '%s %s%s'"
                            .formatted(
                                    tipoDocumento,
                                    numeroDocumento,
                                    complemento != null ? " " + complemento : ""
                            )
            );
        }
    }

    private void validateUniqueDocumentoForUpdate(
            String tipoDocumento,
            String numeroDocumento,
            String complemento,
            UUID currentId
    ) {
        if (personaRepository.existsByDocumentoAndIdNot(
                tipoDocumento,
                numeroDocumento,
                complemento,
                currentId
        )) {
            throw new ConflictException(
                    "PERSONA_ALREADY_EXISTS",
                    "Ya existe otra persona con el documento '%s %s%s'"
                            .formatted(
                                    tipoDocumento,
                                    numeroDocumento,
                                    complemento != null ? " " + complemento : ""
                            )
            );
        }
    }

    private String requireTipoDocumento(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < TIPO_DOCUMENTO_MIN_LENGTH
                || normalized.length() > TIPO_DOCUMENTO_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_PERSONA_TIPO_DOCUMENTO",
                    "El tipo de documento debe tener entre %d y %d caracteres"
                            .formatted(TIPO_DOCUMENTO_MIN_LENGTH, TIPO_DOCUMENTO_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String requireNumeroDocumento(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < NUMERO_DOCUMENTO_MIN_LENGTH
                || normalized.length() > NUMERO_DOCUMENTO_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_PERSONA_NUMERO_DOCUMENTO",
                    "El número de documento debe tener entre %d y %d caracteres"
                            .formatted(NUMERO_DOCUMENTO_MIN_LENGTH, NUMERO_DOCUMENTO_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String normalizeComplemento(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized != null
                && normalized.length() > COMPLEMENTO_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_PERSONA_COMPLEMENTO",
                    "El complemento no puede superar los %d caracteres"
                            .formatted(COMPLEMENTO_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String requireNombres(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < NOMBRES_MIN_LENGTH
                || normalized.length() > NOMBRES_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_PERSONA_NOMBRES",
                    "Los nombres deben tener entre %d y %d caracteres"
                            .formatted(NOMBRES_MIN_LENGTH, NOMBRES_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String requirePrimerApellido(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < PRIMER_APELLIDO_MIN_LENGTH
                || normalized.length() > PRIMER_APELLIDO_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_PERSONA_PRIMER_APELLIDO",
                    "El primer apellido debe tener entre %d y %d caracteres"
                            .formatted(PRIMER_APELLIDO_MIN_LENGTH, PRIMER_APELLIDO_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String normalizeSegundoApellido(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized != null
                && normalized.length() > SEGUNDO_APELLIDO_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_PERSONA_SEGUNDO_APELLIDO",
                    "El segundo apellido no puede superar los %d caracteres"
                            .formatted(SEGUNDO_APELLIDO_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String normalizeTelefono(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized != null
                && normalized.length() > TELEFONO_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_PERSONA_TELEFONO",
                    "El teléfono no puede superar los %d caracteres"
                            .formatted(TELEFONO_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String normalizeCorreo(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized != null
                && normalized.length() > CORREO_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_PERSONA_CORREO",
                    "El correo no puede superar los %d caracteres"
                            .formatted(CORREO_MAX_LENGTH)
            );
        }

        return normalized;
    }
}