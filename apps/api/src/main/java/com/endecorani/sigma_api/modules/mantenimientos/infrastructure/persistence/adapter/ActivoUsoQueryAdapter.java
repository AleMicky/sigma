package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoValorEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.mantenimientos.application.port.out.ActivoUsoQueryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class ActivoUsoQueryAdapter implements ActivoUsoQueryPort {

    private static final Set<String> CODIGOS_KM = Set.of("KILOMETRAJE", "KM", "ODOMETRO");
    private static final Set<String> CODIGOS_HORAS = Set.of("HORAS_USO", "HOROMETRO", "HORAS", "HORAS_TRABAJO");

    private final SpringActivoAtributoValorRepository valorRepository;
    private final SpringActivoAtributoRepository atributoRepository;

    @Override
    @Transactional(readOnly = true)
    public LecturaUso obtenerLecturaUso(UUID activoId) {
        if (activoId == null) {
            return LecturaUso.vacia();
        }
        return obtenerLecturasUsoPorActivos(List.of(activoId))
                .getOrDefault(activoId, LecturaUso.vacia());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<UUID, LecturaUso> obtenerLecturasUsoPorActivos(Collection<UUID> activoIds) {
        if (activoIds == null || activoIds.isEmpty()) {
            return Map.of();
        }

        List<UUID> ids = activoIds.stream().filter(Objects::nonNull).distinct().toList();
        if (ids.isEmpty()) {
            return Map.of();
        }

        List<ActivoAtributoValorEntity> valores = valorRepository.findByActivoIdIn(ids);
        if (valores.isEmpty()) {
            return Map.of();
        }

        Set<UUID> atributoIds = valores.stream()
                .map(ActivoAtributoValorEntity::getActivoAtributoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, String> codigosPorAtributo = atributoIds.isEmpty()
                ? Map.of()
                : atributoRepository.findAllById(atributoIds).stream()
                        .filter(a -> a.getId() != null && a.getCodigo() != null)
                        .collect(Collectors.toMap(
                                ActivoAtributoEntity::getId,
                                a -> a.getCodigo().trim().toUpperCase(Locale.ROOT),
                                (a, b) -> a
                        ));

        Map<UUID, BigDecimal> kmMap = new HashMap<>();
        Map<UUID, BigDecimal> horasMap = new HashMap<>();

        for (ActivoAtributoValorEntity valor : valores) {
            if (valor.getActivoId() == null || valor.getActivoAtributoId() == null
                    || valor.getValor() == null || valor.getValor().isBlank()) {
                continue;
            }
            String codigo = codigosPorAtributo.get(valor.getActivoAtributoId());
            if (codigo == null) {
                continue;
            }
            BigDecimal parsed = parseDecimal(valor.getValor());
            if (parsed == null) {
                continue;
            }
            if (CODIGOS_KM.contains(codigo)) {
                kmMap.putIfAbsent(valor.getActivoId(), parsed);
            } else if (CODIGOS_HORAS.contains(codigo)) {
                horasMap.putIfAbsent(valor.getActivoId(), parsed);
            }
        }

        Map<UUID, LecturaUso> result = new HashMap<>();
        for (UUID id : ids) {
            result.put(id, new LecturaUso(kmMap.get(id), horasMap.get(id)));
        }
        return result;
    }

    private BigDecimal parseDecimal(String raw) {
        try {
            return new BigDecimal(raw.trim());
        } catch (NumberFormatException ex) {
            log.debug("Valor numérico inválido en atributo de uso: {}", raw);
            return null;
        }
    }
}
