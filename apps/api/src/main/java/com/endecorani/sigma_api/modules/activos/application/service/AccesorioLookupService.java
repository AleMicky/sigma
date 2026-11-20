package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.AccesorioEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringAccesorioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccesorioLookupService {

    public record AccesorioResumen(UUID id, String codigo, String nombre) {
    }

    private final SpringAccesorioRepository springAccesorioRepository;

    @Transactional(readOnly = true)
    public Map<UUID, AccesorioResumen> findMapByIds(Collection<UUID> ids) {
        if (ids == null || ids.isEmpty()) {
            return Collections.emptyMap();
        }

        Set<UUID> validIds = ids.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (validIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return springAccesorioRepository.findAllById(validIds).stream()
                .collect(Collectors.toMap(
                        AccesorioEntity::getId,
                        acc -> new AccesorioResumen(acc.getId(), acc.getCodigo(), acc.getNombre()),
                        (a, b) -> a
                ));
    }
}
