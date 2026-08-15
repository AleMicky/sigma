package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.PrioridadRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.PrioridadResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.Prioridad;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PrioridadRepository;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
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
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PrioridadServiceTest {

    private InMemoryPrioridadRepository repository;
    private PrioridadService service;

    @BeforeEach
    void setUp() {
        repository = new InMemoryPrioridadRepository();
        service = new PrioridadService(repository);
    }

    @Test
    void createNormalizesCodigoAndNombre() {
        PrioridadResponse response = service.create(
                new PrioridadRequest(
                        "  alta  ",
                        "  Alta   prioridad ",
                        "  Atención inmediata ",
                        1
                )
        );

        assertEquals("alta", response.codigo());
        assertEquals("Alta prioridad", response.nombre());
        assertEquals("Atención inmediata", response.descripcion());
        assertEquals(1, response.nivel());
        assertEquals(1, repository.items.size());
    }

    @Test
    void createRejectsCodigoTooShortAfterNormalize() {
        assertThrows(
                BusinessException.class,
                () -> service.create(
                        new PrioridadRequest(" a ", "Nombre válido", null, 1)
                )
        );
        assertTrue(repository.items.isEmpty());
    }

    @Test
    void createRejectsDuplicateCodigoIgnoreCase() {
        repository.items.add(existing("ALTA", "Alta", 1));

        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> service.create(
                        new PrioridadRequest("alta", "Otra prioridad", null, 2)
                )
        );

        assertEquals("PRIORIDAD_ALREADY_EXISTS", exception.getCode());
    }

    @Test
    void updateRejectsDuplicateCodigoIgnoreCase() {
        Prioridad first = existing("ALTA", "Alta", 1);
        Prioridad second = existing("MEDIA", "Media", 2);
        repository.items.add(first);
        repository.items.add(second);

        assertThrows(
                ConflictException.class,
                () -> service.update(
                        second.getId(),
                        new PrioridadRequest("alta", "Media", null, 2)
                )
        );
    }

    @Test
    void updateAllowsSameCodigoOnSameRecord() {
        Prioridad stored = existing("ALTA", "Alta", 1);
        repository.items.add(stored);

        PrioridadResponse response = service.update(
                stored.getId(),
                new PrioridadRequest("ALTA", "Alta actualizada", null, 3)
        );

        assertEquals("ALTA", response.codigo());
        assertEquals("Alta actualizada", response.nombre());
        assertEquals(3, response.nivel());
    }

    @Test
    void updateNotFoundThrows() {
        assertThrows(
                ResourceNotFoundException.class,
                () -> service.update(
                        UUID.randomUUID(),
                        new PrioridadRequest("ALTA", "Alta", null, 1)
                )
        );
    }

    private static Prioridad existing(String codigo, String nombre, Integer nivel) {
        return Prioridad.builder()
                .id(UUID.randomUUID())
                .codigo(codigo)
                .nombre(nombre)
                .nivel(nivel)
                .build();
    }

    private static final class InMemoryPrioridadRepository
            implements PrioridadRepository {

        private final List<Prioridad> items = new ArrayList<>();

        @Override
        public Prioridad save(Prioridad entity) {
            if (entity.getId() == null) {
                entity.setId(UUID.randomUUID());
            }
            items.removeIf(item -> item.getId().equals(entity.getId()));
            items.add(entity);
            return entity;
        }

        @Override
        public Optional<Prioridad> findById(UUID id) {
            return items.stream()
                    .filter(item -> item.getId().equals(id))
                    .findFirst();
        }

        @Override
        public List<Prioridad> findAll() {
            return List.copyOf(items);
        }

        @Override
        public Page<Prioridad> findAll(Pageable pageable) {
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
        public Page<Prioridad> search(String query, Pageable pageable) {
            String normalized = query.toLowerCase();
            List<Prioridad> filtered = items.stream()
                    .filter(item ->
                            item.getCodigo().toLowerCase().contains(normalized)
                                    || item.getNombre().toLowerCase().contains(normalized)
                    )
                    .toList();
            return new PageImpl<>(filtered, pageable, filtered.size());
        }
    }
}