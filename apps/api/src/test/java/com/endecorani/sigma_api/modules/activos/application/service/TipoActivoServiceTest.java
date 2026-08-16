package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.request.TipoActivoRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.TipoActivoResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.Categoria;
import com.endecorani.sigma_api.modules.activos.domain.model.TipoActivo;
import com.endecorani.sigma_api.modules.activos.domain.repository.CategoriaRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
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
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TipoActivoServiceTest {

    private static final UUID CATEGORIA_ID = UUID.fromString(
            "a1b2c3d4-e5f6-4011-8001-000000000001"
    );

    private InMemoryTipoActivoRepository repository;
    private InMemoryCategoriaRepository categoriaRepository;
    private TipoActivoService service;

    @BeforeEach
    void setUp() {
        repository = new InMemoryTipoActivoRepository();
        categoriaRepository = new InMemoryCategoriaRepository();
        categoriaRepository.items.add(
                Categoria.builder()
                        .id(CATEGORIA_ID)
                        .codigo("GENERAL")
                        .nombre("General")
                        .orden(0)
                        .build()
        );
        service = new TipoActivoService(repository, categoriaRepository);
    }

    @Test
    void createNormalizesNombreDescripcionColorAndIcono() {
        TipoActivoResponse response = service.create(
                new TipoActivoRequest(
                        CATEGORIA_ID,
                        "  Vehículo   liviano ",
                        "  Desc  ",
                        " #2563eb ",
                        " Car "
                )
        );

        assertEquals(CATEGORIA_ID, response.categoriaId());
        assertEquals("Vehículo liviano", response.nombre());
        assertEquals("Desc", response.descripcion());
        assertEquals("#2563EB", response.color());
        assertEquals("Car", response.icono());
        assertEquals(1, repository.items.size());
    }

    @Test
    void createRejectsMissingCategoria() {
        assertThrows(
                ResourceNotFoundException.class,
                () -> service.create(
                        new TipoActivoRequest(
                                UUID.randomUUID(),
                                "Equipo",
                                null,
                                null,
                                null
                        )
                )
        );
        assertTrue(repository.items.isEmpty());
    }

    @Test
    void createRejectsNombreTooShortAfterNormalize() {
        assertThrows(
                BusinessException.class,
                () -> service.create(
                        new TipoActivoRequest(CATEGORIA_ID, " a ", null, null, null)
                )
        );
        assertTrue(repository.items.isEmpty());
    }

    @Test
    void createRejectsInvalidColor() {
        assertThrows(
                BusinessException.class,
                () -> service.create(
                        new TipoActivoRequest(
                                CATEGORIA_ID,
                                "Equipo",
                                null,
                                "blue",
                                null
                        )
                )
        );
    }

    @Test
    void createRejectsDuplicateNombreIgnoreCase() {
        repository.items.add(existing("Vehículo"));

        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> service.create(
                        new TipoActivoRequest(
                                CATEGORIA_ID,
                                "vehículo",
                                null,
                                null,
                                null
                        )
                )
        );

        assertEquals("TIPO_ACTIVO_ALREADY_EXISTS", exception.getCode());
    }

    @Test
    void updateClearsOptionalFieldsWhenNull() {
        TipoActivo stored = existing("Equipo");
        stored.setDescripcion("Anterior");
        stored.setColor("#2563EB");
        stored.setIcono("Laptop");
        repository.items.add(stored);

        TipoActivoResponse response = service.update(
                stored.getId(),
                new TipoActivoRequest(CATEGORIA_ID, "Equipo", null, null, null)
        );

        assertNull(response.descripcion());
        assertNull(response.color());
        assertNull(response.icono());
    }

    @Test
    void updateRejectsDuplicateNombreIgnoreCase() {
        TipoActivo first = existing("Alpha");
        TipoActivo second = existing("Beta");
        repository.items.add(first);
        repository.items.add(second);

        assertThrows(
                ConflictException.class,
                () -> service.update(
                        second.getId(),
                        new TipoActivoRequest(
                                CATEGORIA_ID,
                                "alpha",
                                null,
                                null,
                                null
                        )
                )
        );
    }

    @Test
    void updateAllowsSameNombreOnSameRecord() {
        TipoActivo stored = existing("Equipo");
        repository.items.add(stored);

        TipoActivoResponse response = service.update(
                stored.getId(),
                new TipoActivoRequest(
                        CATEGORIA_ID,
                        "Equipo",
                        "Nueva desc",
                        "#0D9488",
                        "Laptop"
                )
        );

        assertEquals(CATEGORIA_ID, response.categoriaId());
        assertEquals("Equipo", response.nombre());
        assertEquals("Nueva desc", response.descripcion());
        assertEquals("#0D9488", response.color());
        assertEquals("Laptop", response.icono());
    }

    private static TipoActivo existing(String nombre) {
        return TipoActivo.builder()
                .id(UUID.randomUUID())
                .categoriaId(CATEGORIA_ID)
                .nombre(nombre)
                .build();
    }

    private static final class InMemoryTipoActivoRepository
            implements TipoActivoRepository {

        private final List<TipoActivo> items = new ArrayList<>();

        @Override
        public TipoActivo save(TipoActivo entity) {
            if (entity.getId() == null) {
                entity.setId(UUID.randomUUID());
            }
            items.removeIf(item -> item.getId().equals(entity.getId()));
            items.add(entity);
            return entity;
        }

        @Override
        public Optional<TipoActivo> findById(UUID id) {
            return items.stream()
                    .filter(item -> item.getId().equals(id))
                    .findFirst();
        }

        @Override
        public List<TipoActivo> findAll() {
            return List.copyOf(items);
        }

        @Override
        public Page<TipoActivo> findAll(Pageable pageable) {
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
        public boolean existsByNombreIgnoreCase(String nombre) {
            return items.stream().anyMatch(item ->
                    item.getNombre().equalsIgnoreCase(nombre)
            );
        }

        @Override
        public boolean existsByNombreIgnoreCaseAndIdNot(
                String nombre,
                UUID id
        ) {
            return items.stream().anyMatch(item ->
                    !item.getId().equals(id)
                            && item.getNombre().equalsIgnoreCase(nombre)
            );
        }
    }

    private static final class InMemoryCategoriaRepository
            implements CategoriaRepository {

        private final List<Categoria> items = new ArrayList<>();

        @Override
        public Categoria save(Categoria entity) {
            return entity;
        }

        @Override
        public Optional<Categoria> findById(UUID id) {
            return items.stream()
                    .filter(item -> item.getId().equals(id))
                    .findFirst();
        }

        @Override
        public List<Categoria> findAll() {
            return List.copyOf(items);
        }

        @Override
        public Page<Categoria> findAll(Pageable pageable) {
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
            return false;
        }

        @Override
        public boolean existsByCodigoIgnoreCaseAndIdNot(
                String codigo,
                UUID id
        ) {
            return false;
        }

        @Override
        public Page<Categoria> search(String query, Pageable pageable) {
            return Page.empty(pageable);
        }

        @Override
        public Integer findMaxOrden() {
            return null;
        }
    }
}
