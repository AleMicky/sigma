package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.request.ActivoAccesorioRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoAccesorioResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.Accesorio;
import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAccesorio;
import com.endecorani.sigma_api.modules.activos.domain.repository.AccesorioRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoAccesorioRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaMapper;
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
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivoAccesorioService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "activoId",
            "accesorioId",
            "cantidad",
            "numeroSerie",
            "observacion",
            "createdAt",
            "updatedAt"
    );

    private final ActivoAccesorioRepository activoAccesorioRepository;
    private final ActivoRepository activoRepository;
    private final AccesorioRepository accesorioRepository;

    @Transactional
    public ActivoAccesorioResponse create(ActivoAccesorioRequest request) {
        requireActivoExists(request.activoId());
        requireAccesorioExists(request.accesorioId());
        validateUniqueActivoAccesorioForCreate(request.activoId(), request.accesorioId());

        ActivoAccesorio domain = ActivoAccesorio.builder()
                .activoId(request.activoId())
                .accesorioId(request.accesorioId())
                .cantidad(request.cantidad())
                .numeroSerie(StringUtils.normalize(request.numeroSerie()))
                .observacion(StringUtils.normalize(request.observacion()))
                .build();

        return toResponse(activoAccesorioRepository.save(domain));
    }

    @Transactional
    public ActivoAccesorioResponse update(
            UUID id,
            ActivoAccesorioRequest request
    ) {
        requireActivoExists(request.activoId());
        requireAccesorioExists(request.accesorioId());

        ActivoAccesorio domain = findDomainById(id);

        validateUniqueActivoAccesorioForUpdate(
                request.activoId(),
                request.accesorioId(),
                id
        );

        domain.setActivoId(request.activoId());
        domain.setAccesorioId(request.accesorioId());
        domain.setCantidad(request.cantidad());
        domain.setNumeroSerie(StringUtils.normalize(request.numeroSerie()));
        domain.setObservacion(StringUtils.normalize(request.observacion()));

        return toResponse(activoAccesorioRepository.save(domain));
    }

    @Transactional(readOnly = true)
    public ActivoAccesorioResponse findById(UUID id) {
        return toResponse(findDomainById(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<ActivoAccesorioResponse> findAll(
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(query);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        if (normalized == null) {
            Page<ActivoAccesorio> page = activoAccesorioRepository.findAll(pageable);
            return toPageResponse(page);
        }

        Page<ActivoAccesorio> page = activoAccesorioRepository.search(normalized, pageable);
        return toPageResponse(page);
    }

    @Transactional(readOnly = true)
    public PageResponse<ActivoAccesorioResponse> findByActivoId(
            UUID activoId,
            String query,
            PageRequestDto pageRequest
    ) {
        requireActivoExists(activoId);

        String normalized = StringUtils.normalize(query);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        if (normalized == null) {
            Page<ActivoAccesorio> page = activoAccesorioRepository.findByActivoId(
                    activoId,
                    pageable
            );
            return toPageResponse(page);
        }

        Page<ActivoAccesorio> page = activoAccesorioRepository.searchByActivoId(
                activoId,
                normalized,
                pageable
        );
        return toPageResponse(page);
    }

    @Transactional(readOnly = true)
    public PageResponse<ActivoAccesorioResponse> findByAccesorioId(
            UUID accesorioId,
            PageRequestDto pageRequest
    ) {
        requireAccesorioExists(accesorioId);

        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<ActivoAccesorio> page = activoAccesorioRepository.findByAccesorioId(
                accesorioId,
                pageable
        );
        return toPageResponse(page);
    }

    @Transactional
    public void delete(UUID id) {
        findDomainById(id);
        activoAccesorioRepository.deleteById(id);
    }

    private ActivoAccesorio findDomainById(UUID id) {
        return activoAccesorioRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Accesorio de activo", id)
                );
    }

    private void requireActivoExists(UUID activoId) {
        if (!activoRepository.existsById(activoId)) {
            throw new ResourceNotFoundException("Activo", activoId);
        }
    }

    private void requireAccesorioExists(UUID accesorioId) {
        if (!accesorioRepository.existsById(accesorioId)) {
            throw new ResourceNotFoundException("Accesorio", accesorioId);
        }
    }

    private void validateUniqueActivoAccesorioForCreate(
            UUID activoId,
            UUID accesorioId
    ) {
        if (activoAccesorioRepository.existsByActivoIdAndAccesorioId(
                activoId,
                accesorioId
        )) {
            throw new ConflictException(
                    "ACTIVO_ACCESORIO_ALREADY_EXISTS",
                    "Ya existe este accesorio asignado al activo especificado"
            );
        }
    }

    private void validateUniqueActivoAccesorioForUpdate(
            UUID activoId,
            UUID accesorioId,
            UUID currentId
    ) {
        if (activoAccesorioRepository.existsByActivoIdAndAccesorioIdAndIdNot(
                activoId,
                accesorioId,
                currentId
        )) {
            throw new ConflictException(
                    "ACTIVO_ACCESORIO_ALREADY_EXISTS",
                    "Ya existe otro registro con el mismo activo y accesorio"
            );
        }
    }

    private PageResponse<ActivoAccesorioResponse> toPageResponse(Page<ActivoAccesorio> page) {
        if (page.isEmpty()) {
            return PageResponse.of(List.of(), page);
        }

        Set<UUID> activoIds = page.getContent().stream()
                .map(ActivoAccesorio::getActivoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> accesorioIds = page.getContent().stream()
                .map(ActivoAccesorio::getAccesorioId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, Activo> activoMap = activoIds.isEmpty() ? Map.of() :
                activoRepository.findAllById(activoIds).stream()
                        .collect(Collectors.toMap(Activo::getId, Function.identity(), (a, b) -> a));

        Map<UUID, Accesorio> accesorioMap = accesorioIds.isEmpty() ? Map.of() :
                accesorioRepository.findAllById(accesorioIds).stream()
                        .collect(Collectors.toMap(Accesorio::getId, Function.identity(), (a, b) -> a));

        List<ActivoAccesorioResponse> content = page.getContent().stream()
                .map(aa -> toResponse(
                        aa,
                        aa.getActivoId() != null ? activoMap.get(aa.getActivoId()) : null,
                        aa.getAccesorioId() != null ? accesorioMap.get(aa.getAccesorioId()) : null
                ))
                .toList();

        return PageResponse.of(content, page);
    }

    private ActivoAccesorioResponse toResponse(ActivoAccesorio domain) {
        return toResponse(domain, null, null);
    }

    private ActivoAccesorioResponse toResponse(ActivoAccesorio domain, Activo activo, Accesorio accesorio) {
        ActivoAccesorioResponse.ActivoInfo activoInfo = null;
        if (activo != null) {
            activoInfo = new ActivoAccesorioResponse.ActivoInfo(
                    activo.getId(),
                    activo.getCodigo(),
                    activo.getNombre()
            );
        } else if (domain.getActivoId() != null) {
            activoInfo = activoRepository.findById(domain.getActivoId())
                    .map(a -> new ActivoAccesorioResponse.ActivoInfo(
                            a.getId(),
                            a.getCodigo(),
                            a.getNombre()
                    ))
                    .orElse(null);
        }

        ActivoAccesorioResponse.AccesorioInfo accesorioInfo = null;
        if (accesorio != null) {
            accesorioInfo = new ActivoAccesorioResponse.AccesorioInfo(
                    accesorio.getId(),
                    accesorio.getCodigo(),
                    accesorio.getNombre()
            );
        } else if (domain.getAccesorioId() != null) {
            accesorioInfo = accesorioRepository.findById(domain.getAccesorioId())
                    .map(ac -> new ActivoAccesorioResponse.AccesorioInfo(
                            ac.getId(),
                            ac.getCodigo(),
                            ac.getNombre()
                    ))
                    .orElse(null);
        }

        return new ActivoAccesorioResponse(
                domain.getId(),
                activoInfo,
                accesorioInfo,
                domain.getCantidad(),
                domain.getNumeroSerie(),
                domain.getObservacion(),
                AuditoriaMapper.from(domain)
        );
    }
}
