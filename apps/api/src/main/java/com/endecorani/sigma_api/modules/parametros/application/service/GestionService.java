package com.endecorani.sigma_api.modules.parametros.application.service;

import com.endecorani.sigma_api.modules.parametros.application.dto.GestionRequest;
import com.endecorani.sigma_api.modules.parametros.application.dto.GestionResponse;
import com.endecorani.sigma_api.modules.parametros.domain.model.Gestion;
import com.endecorani.sigma_api.modules.parametros.domain.model.Periodo;
import com.endecorani.sigma_api.modules.parametros.domain.repository.GestionRepository;
import com.endecorani.sigma_api.modules.parametros.domain.repository.PeriodoRepository;
import com.endecorani.sigma_api.shared.application.crud.AbstractCrudService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GestionService extends AbstractCrudService<
        Gestion,
        GestionRequest,
        GestionResponse,
        UUID
        > {

    private static final int GESTION_MIN = 2000;
    private static final int GESTION_MAX = 2100;
    private static final int PERIODOS_POR_GESTION = 12;

    private static final String[] LITERALES_PERIODO = {
            "Enero",
            "Febrero",
            "Marzo",
            "Abril",
            "Mayo",
            "Junio",
            "Julio",
            "Agosto",
            "Septiembre",
            "Octubre",
            "Noviembre",
            "Diciembre"
    };

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "gestion",
            "fechaInicio",
            "fechaFin",
            "createdAt",
            "updatedAt"
    );

    private final GestionRepository gestionRepository;
    private final PeriodoRepository periodoRepository;

    @Override
    protected CrudRepository<Gestion, UUID> repository() {
        return gestionRepository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Override
    @Transactional
    public GestionResponse create(GestionRequest request) {
        Gestion saved = gestionRepository.save(toDomain(request));
        periodoRepository.saveAll(buildPeriodos(saved));
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<GestionResponse> search(
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(query);

        if (normalized == null) {
            return findAll(pageRequest);
        }

        Integer gestion;
        try {
            gestion = Integer.valueOf(normalized);
        } catch (NumberFormatException exception) {
            return PageResponse.from(
                    new PageImpl<>(List.of(), pageRequest.toPageable(allowedSortFields()), 0),
                    this::toResponse
            );
        }

        return PageResponse.from(
                gestionRepository.findByGestion(
                        gestion,
                        pageRequest.toPageable(allowedSortFields())
                ),
                this::toResponse
        );
    }

    @Override
    protected Gestion toDomain(GestionRequest request) {
        Integer gestion = requireGestion(request.gestion());
        validateUniqueGestionForCreate(gestion);
        validateRangoFechas(request.fechaInicio(), request.fechaFin());

        return Gestion.builder()
                .gestion(gestion)
                .fechaInicio(request.fechaInicio())
                .fechaFin(request.fechaFin())
                .build();
    }

    @Override
    protected void updateDomain(
            Gestion domain,
            GestionRequest request
    ) {
        Integer gestion = requireGestion(request.gestion());
        validateUniqueGestionForUpdate(gestion, domain.getId());
        validateRangoFechas(request.fechaInicio(), request.fechaFin());

        domain.setGestion(gestion);
        domain.setFechaInicio(request.fechaInicio());
        domain.setFechaFin(request.fechaFin());
    }

    @Override
    protected GestionResponse toResponse(Gestion domain) {
        return new GestionResponse(
                domain.getId(),
                domain.getGestion(),
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
        return "Gestión";
    }

    private List<Periodo> buildPeriodos(Gestion gestion) {
        List<Periodo> periodos = new ArrayList<>(PERIODOS_POR_GESTION);

        for (int mes = 1; mes <= PERIODOS_POR_GESTION; mes++) {
            YearMonth yearMonth = YearMonth.of(gestion.getGestion(), mes);
            LocalDate fechaInicio = yearMonth.atDay(1);
            LocalDate fechaFin = yearMonth.atEndOfMonth();

            periodos.add(
                    Periodo.builder()
                            .gestionId(gestion.getId())
                            .periodo(mes)
                            .literal(LITERALES_PERIODO[mes - 1])
                            .fechaInicio(fechaInicio)
                            .fechaFin(fechaFin)
                            .build()
            );
        }

        return periodos;
    }

    private Integer requireGestion(Integer gestion) {
        if (gestion == null
                || gestion < GESTION_MIN
                || gestion > GESTION_MAX) {
            throw new BusinessException(
                    "INVALID_GESTION",
                    "La gestión debe estar entre %d y %d"
                            .formatted(GESTION_MIN, GESTION_MAX)
            );
        }

        return gestion;
    }

    private void validateRangoFechas(
            LocalDate fechaInicio,
            LocalDate fechaFin
    ) {
        if (fechaInicio == null || fechaFin == null) {
            throw new BusinessException(
                    "INVALID_GESTION_FECHAS",
                    "Las fechas de inicio y fin son obligatorias"
            );
        }

        if (fechaInicio.isAfter(fechaFin)) {
            throw new BusinessException(
                    "INVALID_GESTION_FECHAS",
                    "La fecha de inicio no puede ser posterior a la fecha de fin"
            );
        }
    }

    private void validateUniqueGestionForCreate(Integer gestion) {
        if (gestionRepository.existsByGestion(gestion)) {
            throw new ConflictException(
                    "GESTION_ALREADY_EXISTS",
                    "Ya existe una gestión para el año '%d'"
                            .formatted(gestion)
            );
        }
    }

    private void validateUniqueGestionForUpdate(
            Integer gestion,
            UUID currentId
    ) {
        if (gestionRepository.existsByGestionAndIdNot(gestion, currentId)) {
            throw new ConflictException(
                    "GESTION_ALREADY_EXISTS",
                    "Ya existe otra gestión para el año '%d'"
                            .formatted(gestion)
            );
        }
    }
}
