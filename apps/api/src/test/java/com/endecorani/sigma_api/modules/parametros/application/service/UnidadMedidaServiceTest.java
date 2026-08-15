package com.endecorani.sigma_api.modules.parametros.application.service;

import com.endecorani.sigma_api.modules.parametros.application.dto.UnidadMedidaRequest;
import com.endecorani.sigma_api.modules.parametros.application.dto.UnidadMedidaResponse;
import com.endecorani.sigma_api.modules.parametros.domain.model.UnidadMedida;
import com.endecorani.sigma_api.modules.parametros.domain.repository.UnidadMedidaRepository;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class UnidadMedidaServiceTest {

    private InMemoryUnidadMedidaRepository repository;
    private UnidadMedidaService service;

    @BeforeEach
    void setUp() {
        repository = new InMemoryUnidadMedidaRepository();
        service = new UnidadMedidaService(repository);
    }

    @Test
    void createNormalizesFields() {
        UnidadMedidaResponse response = service.create(
                new UnidadMedidaRequest(
                        "  kg  ",
                        "  Kilogramo   simple ",
                        "  kg ",
                        true
                )
        );

        assertEquals("kg", response.codigo());
        assertEquals("Kilogramo simple", response.nombre());
        assertEquals("kg", response.simbolo());
        assertTrue(response.permiteDecimal());
        assertEquals(1, repository.items.size());
    }

    @Test
    void createAllowsFalsePermiteDecimal() {
        UnidadMedidaResponse response = service.create(
                new UnidadMedidaRequest("UND", "Unidad", "u", false)
        );

        assertFalse(response.permiteDecimal());
    }

    @Test
    void createRejectsCodigoTooShortAfterNormalize() {
        assertThrows(
                BusinessException.class,
                () -> service.create(
                        new UnidadMedidaRequest(" a ", "Nombre válido", "a", false)
                )
        );
        assertTrue(repository.items.isEmpty());
    }

    @Test
    void createRejectsBlankSimbolo() {
        assertThrows(
                BusinessException.class,
                () -> service.create(
                        new UnidadMedidaRequest("UND", "Unidad", "   ", false)
                )
        );
        assertTrue(repository.items.isEmpty());
    }

    @Test
    void createRejectsNullPermiteDecimal() {
        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.create(
                        new UnidadMedidaRequest("UND", "Unidad", "u", null)
                )
        );

        assertEquals(
                "INVALID_UNIDAD_MEDIDA_PERMITE_DECIMAL",
                exception.getCode()
        );
    }

    @Test
    void createRejectsDuplicateCodigoIgnoreCase() {
        repository.items.add(existing("KG", "Kilogramo", "kg", true));

        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> service.create(
                        new UnidadMedidaRequest("kg", "Otro nombre", "kg", true)
                )
        );

        assertEquals("UNIDAD_MEDIDA_ALREADY_EXISTS", exception.getCode());
    }

    @Test
    void updateRejectsCodigoChange() {
        UnidadMedida stored = existing("BETA", "Beta", "b", false);
        repository.items.add(stored);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.update(
                        stored.getId(),
                        new UnidadMedidaRequest("ALPHA", "Beta", "b", false)
                )
        );

        assertEquals("UNIDAD_MEDIDA_CODIGO_IMMUTABLE", exception.getCode());
        assertEquals("BETA", stored.getCodigo());
    }

    @Test
    void updateKeepsCodigoAndUpdatesOtherFields() {
        UnidadMedida stored = existing("KG", "Kilogramo", "kg", true);
        repository.items.add(stored);

        UnidadMedidaResponse response = service.update(
                stored.getId(),
                new UnidadMedidaRequest("KG", "Kilogramo actualizado", "k", false)
        );

        assertEquals("KG", response.codigo());
        assertEquals("Kilogramo actualizado", response.nombre());
        assertEquals("k", response.simbolo());
        assertFalse(response.permiteDecimal());
    }

    private static UnidadMedida existing(
            String codigo,
            String nombre,
            String simbolo,
            boolean permiteDecimal
    ) {
        return UnidadMedida.builder()
                .id(UUID.randomUUID())
                .codigo(codigo)
                .nombre(nombre)
                .simbolo(simbolo)
                .permiteDecimal(permiteDecimal)
                .build();
    }

    private static final class InMemoryUnidadMedidaRepository
            implements UnidadMedidaRepository {

        private final List<UnidadMedida> items = new ArrayList<>();

        @Override
        public UnidadMedida save(UnidadMedida entity) {
            if (entity.getId() == null) {
                entity.setId(UUID.randomUUID());
            }
            items.removeIf(item -> item.getId().equals(entity.getId()));
            items.add(entity);
            return entity;
        }

        @Override
        public Optional<UnidadMedida> findById(UUID id) {
            return items.stream()
                    .filter(item -> item.getId().equals(id))
                    .findFirst();
        }

        @Override
        public List<UnidadMedida> findAll() {
            return List.copyOf(items);
        }

        @Override
        public Page<UnidadMedida> findAll(Pageable pageable) {
            return new PageImpl<>(List.copyOf(items), pageable, items.size());
        }

        @Override
        public boolean existsById(UUID id) {
            return items.stream().anyMatch(item -> item.getId().equals(id));
        }

        @Override
        public void deleteById(UUID id) {
            items.removeIf(item -> item.getId().equals(id));
        }

        @Override
        public boolean existsByCodigoIgnoreCase(String codigo) {
            return items.stream().anyMatch(item ->
                    item.getCodigo().equalsIgnoreCase(codigo)
            );
        }

        @Override
        public boolean existsByCodigoIgnoreCaseAndIdNot(
                String codigo,
                UUID id
        ) {
            return items.stream().anyMatch(item ->
                    !item.getId().equals(id)
                            && item.getCodigo().equalsIgnoreCase(codigo)
            );
        }

        @Override
        public Page<UnidadMedida> search(String query, Pageable pageable) {
            String normalized = query.toLowerCase();
            List<UnidadMedida> filtered = items.stream()
                    .filter(item ->
                            item.getCodigo().toLowerCase().contains(normalized)
                                    || item.getNombre().toLowerCase().contains(normalized)
                                    || item.getSimbolo().toLowerCase().contains(normalized)
                    )
                    .toList();
            return new PageImpl<>(filtered, pageable, filtered.size());
        }
    }
}
