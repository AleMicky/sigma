package com.endecorani.sigma_api.modules.parametros.application.service;

import com.endecorani.sigma_api.modules.parametros.application.dto.request.PeriodoRequest;
import com.endecorani.sigma_api.modules.parametros.application.dto.response.PeriodoResponse;
import com.endecorani.sigma_api.modules.parametros.domain.model.Periodo;
import com.endecorani.sigma_api.modules.parametros.domain.repository.GestionRepository;
import com.endecorani.sigma_api.modules.parametros.domain.repository.PeriodoRepository;
import com.endecorani.sigma_api.shared.application.crud.AbstractCrudService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PeriodoService extends AbstractCrudService<
        Periodo,
        PeriodoRequest,
        PeriodoResponse,
        UUID
        > {

    private static final int LITERAL_MIN_LENGTH = 2;
    private static final int LITERAL_MAX_LENGTH = 50;

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "periodo",
            "literal",
            "fechaInicio",
            "fechaFin",
            "createdAt",
            "updatedAt"
    );

    private final PeriodoRepository periodoRepository;
    private final GestionRepository gestionRepository;

    @Override
    protected CrudRepository<Periodo, UUID> repository() {
        return periodoRepository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Override
    @Transactional
    public PeriodoResponse create(PeriodoRequest request) {
        throw new BusinessException(
                "PERIODO_CREATE_NOT_ALLOWED",
                "Los períodos se crean automáticamente al registrar una gestión"
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<PeriodoResponse> findByGestionId(
            UUID gestionId,
            PageRequestDto pageRequest
    ) {
        requireGestionExists(gestionId);

        return PageResponse.from(
                periodoRepository.findByGestionId(
                        gestionId,
                        pageRequest.toPageable(allowedSortFields())
                ),
                this::toResponse
        );
    }

    @Override
    protected Periodo toDomain(PeriodoRequest request) {
        throw new BusinessException(
                "PERIODO_CREATE_NOT_ALLOWED",
                "Los períodos se crean automáticamente al registrar una gestión"
        );
    }

    @Override
    protected void updateDomain(
            Periodo domain,
            PeriodoRequest request
    ) {
        requireGestionExists(request.gestionId());

        if (!domain.getGestionId().equals(request.gestionId())) {
            throw new BusinessException(
                    "INVALID_PERIODO_GESTION",
                    "No se puede cambiar la gestión de un período"
            );
        }

        if (!domain.getPeriodo().equals(request.periodo())) {
            throw new BusinessException(
                    "INVALID_PERIODO_NUMERO",
                    "No se puede cambiar el número de un período"
            );
        }

        validateRangoFechas(request.fechaInicio(), request.fechaFin());

        domain.setLiteral(requireNormalizedLiteral(request.literal()));
        domain.setFechaInicio(request.fechaInicio());
        domain.setFechaFin(request.fechaFin());
    }

    @Override
    protected PeriodoResponse toResponse(Periodo domain) {
        return new PeriodoResponse(
                domain.getId(),
                domain.getGestionId(),
                domain.getPeriodo(),
                domain.getLiteral(),
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
        return "Período";
    }

    private void requireGestionExists(UUID gestionId) {
        if (!gestionRepository.existsById(gestionId)) {
            throw new ResourceNotFoundException("Gestión", gestionId);
        }
    }

    private String requireNormalizedLiteral(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < LITERAL_MIN_LENGTH
                || normalized.length() > LITERAL_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_PERIODO_LITERAL",
                    "El literal debe tener entre %d y %d caracteres"
                            .formatted(LITERAL_MIN_LENGTH, LITERAL_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private void validateRangoFechas(
            LocalDate fechaInicio,
            LocalDate fechaFin
    ) {
        if (fechaInicio == null || fechaFin == null) {
            throw new BusinessException(
                    "INVALID_PERIODO_FECHAS",
                    "Las fechas de inicio y fin son obligatorias"
            );
        }

        if (fechaInicio.isAfter(fechaFin)) {
            throw new BusinessException(
                    "INVALID_PERIODO_FECHAS",
                    "La fecha de inicio no puede ser posterior a la fecha de fin"
            );
        }
    }
}
