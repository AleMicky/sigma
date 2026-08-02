package com.endecorani.sigma_api.modules.parametros.application.service;

import com.endecorani.sigma_api.modules.parametros.application.dto.CatalogoRequest;
import com.endecorani.sigma_api.modules.parametros.application.dto.CatalogoResponse;
import com.endecorani.sigma_api.modules.parametros.domain.model.Catalogo;
import com.endecorani.sigma_api.modules.parametros.domain.repository.CatalogoRepository;
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
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CatalogoServiceTest {

    private InMemoryCatalogoRepository repository;
    private CatalogoService service;

    @BeforeEach
    void setUp() {
        repository = new InMemoryCatalogoRepository();
        service = new CatalogoService(repository);
    }

    @Test
    void createNormalizesCodigoAndNombre() {
        CatalogoResponse response = service.create(
                new CatalogoRequest("  estado_civil  ", "  Estado   civil ")
        );

        assertEquals("estado_civil", response.codigo());
        assertEquals("Estado civil", response.nombre());
        assertEquals(1, repository.items.size());
    }

    @Test
    void createRejectsCodigoTooShortAfterNormalize() {
        assertThrows(
                BusinessException.class,
                () -> service.create(new CatalogoRequest(" a ", "Nombre válido"))
        );
        assertTrue(repository.items.isEmpty());
    }

    @Test
    void createRejectsDuplicateCodigoIgnoreCase() {
        repository.items.add(existing("ESTADO_CIVIL", "Estado civil"));

        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> service.create(
                        new CatalogoRequest("estado_civil", "Otro nombre")
                )
        );

        assertEquals("CATALOGO_ALREADY_EXISTS", exception.getCode());
    }

    @Test
    void updateRejectsDuplicateCodigoIgnoreCase() {
        Catalogo first = existing("ALPHA", "Alpha");
        Catalogo second = existing("BETA", "Beta");
        repository.items.add(first);
        repository.items.add(second);

        assertThrows(
                ConflictException.class,
                () -> service.update(
                        second.getId(),
                        new CatalogoRequest("alpha", "Beta")
                )
        );
    }

    @Test
    void updateAllowsSameCodigoOnSameRecord() {
        Catalogo stored = existing("ESTADO_CIVIL", "Estado civil");
        repository.items.add(stored);

        CatalogoResponse response = service.update(
                stored.getId(),
                new CatalogoRequest("ESTADO_CIVIL", "Estado civil actualizado")
        );

        assertEquals("ESTADO_CIVIL", response.codigo());
        assertEquals("Estado civil actualizado", response.nombre());
    }

    private static Catalogo existing(String codigo, String nombre) {
        return Catalogo.builder()
                .id(UUID.randomUUID())
                .codigo(codigo)
                .nombre(nombre)
                .build();
    }

    private static final class InMemoryCatalogoRepository
            implements CatalogoRepository {

        private final List<Catalogo> items = new ArrayList<>();

        @Override
        public Catalogo save(Catalogo entity) {
            if (entity.getId() == null) {
                entity.setId(UUID.randomUUID());
            }
            items.removeIf(item -> item.getId().equals(entity.getId()));
            items.add(entity);
            return entity;
        }

        @Override
        public Optional<Catalogo> findById(UUID id) {
            return items.stream()
                    .filter(item -> item.getId().equals(id))
                    .findFirst();
        }

        @Override
        public List<Catalogo> findAll() {
            return List.copyOf(items);
        }

        @Override
        public Page<Catalogo> findAll(Pageable pageable) {
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
    }
}
