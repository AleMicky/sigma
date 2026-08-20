package com.endecorani.sigma_api.modules.parametros.application.service;

import com.endecorani.sigma_api.modules.parametros.application.dto.request.TipoDatoRequest;
import com.endecorani.sigma_api.modules.parametros.application.dto.response.TipoDatoResponse;
import com.endecorani.sigma_api.modules.parametros.domain.model.TipoDato;
import com.endecorani.sigma_api.modules.parametros.domain.repository.TipoDatoRepository;
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
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TipoDatoServiceTest {

    private InMemoryTipoDatoRepository repository;
    private TipoDatoService service;

    @BeforeEach
    void setUp() {
        repository = new InMemoryTipoDatoRepository();
        service = new TipoDatoService(repository);
    }

    @Test
    void createNormalizesFields() {
        TipoDatoResponse response = service.create(
                new TipoDatoRequest(
                        "  select  ",
                        "  Selección   simple ",
                        "  Opción   única ",
                        true
                )
        );

        assertEquals("select", response.codigo());
        assertEquals("Selección simple", response.nombre());
        assertEquals("Opción única", response.descripcion());
        assertTrue(response.permiteOpciones());
        assertEquals(1, repository.items.size());
    }

    @Test
    void createAllowsNullDescripcion() {
        TipoDatoResponse response = service.create(
                new TipoDatoRequest("TEXT", "Texto", null, false)
        );

        assertNull(response.descripcion());
        assertFalse(response.permiteOpciones());
    }

    @Test
    void createRejectsCodigoTooShortAfterNormalize() {
        assertThrows(
                BusinessException.class,
                () -> service.create(
                        new TipoDatoRequest(" a ", "Nombre válido", null, false)
                )
        );
        assertTrue(repository.items.isEmpty());
    }

    @Test
    void createRejectsDuplicateCodigoIgnoreCase() {
        repository.items.add(existing("SELECT", "Selección", true));

        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> service.create(
                        new TipoDatoRequest("select", "Otro nombre", null, true)
                )
        );

        assertEquals("TIPO_DATO_ALREADY_EXISTS", exception.getCode());
    }

    @Test
    void updateRejectsCodigoChange() {
        TipoDato stored = existing("BETA", "Beta", false);
        repository.items.add(stored);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.update(
                        stored.getId(),
                        new TipoDatoRequest("ALPHA", "Beta", null, false)
                )
        );

        assertEquals("TIPO_DATO_CODIGO_IMMUTABLE", exception.getCode());
        assertEquals("BETA", stored.getCodigo());
    }

    @Test
    void updateKeepsCodigoAndUpdatesOtherFields() {
        TipoDato stored = existing("SELECT", "Selección", true);
        repository.items.add(stored);

        TipoDatoResponse response = service.update(
                stored.getId(),
                new TipoDatoRequest(
                        "SELECT",
                        "Selección actualizada",
                        "Descripción",
                        true
                )
        );

        assertEquals("SELECT", response.codigo());
        assertEquals("Selección actualizada", response.nombre());
        assertEquals("Descripción", response.descripcion());
    }

    private static TipoDato existing(
            String codigo,
            String nombre,
            boolean permiteOpciones
    ) {
        return TipoDato.builder()
                .id(UUID.randomUUID())
                .codigo(codigo)
                .nombre(nombre)
                .permiteOpciones(permiteOpciones)
                .build();
    }

    private static final class InMemoryTipoDatoRepository
            implements TipoDatoRepository {

        private final List<TipoDato> items = new ArrayList<>();

        @Override
        public TipoDato save(TipoDato entity) {
            if (entity.getId() == null) {
                entity.setId(UUID.randomUUID());
            }
            items.removeIf(item -> item.getId().equals(entity.getId()));
            items.add(entity);
            return entity;
        }

        @Override
        public Optional<TipoDato> findById(UUID id) {
            return items.stream()
                    .filter(item -> item.getId().equals(id))
                    .findFirst();
        }

        @Override
        public List<TipoDato> findAll() {
            return List.copyOf(items);
        }

        @Override
        public Page<TipoDato> findAll(Pageable pageable) {
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
        public Page<TipoDato> search(String query, Pageable pageable) {
            String normalized = query.toLowerCase();
            List<TipoDato> filtered = items.stream()
                    .filter(item ->
                            item.getCodigo().toLowerCase().contains(normalized)
                                    || item.getNombre().toLowerCase().contains(normalized)
                    )
                    .toList();
            return new PageImpl<>(filtered, pageable, filtered.size());
        }
    }
}
