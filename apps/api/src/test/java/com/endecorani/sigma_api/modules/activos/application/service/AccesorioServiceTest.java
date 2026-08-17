package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.request.AccesorioRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.AccesorioResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.Accesorio;
import com.endecorani.sigma_api.modules.activos.domain.model.Categoria;
import com.endecorani.sigma_api.modules.activos.domain.repository.AccesorioRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.CategoriaRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
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

import static org.junit.jupiter.api.Assertions.*;

class AccesorioServiceTest {

    private InMemoryAccesorioRepository accesorioRepository;
    private InMemoryCategoriaRepository categoriaRepository;
    private AccesorioService service;

    private UUID categoriaId;

    @BeforeEach
    void setUp() {
        accesorioRepository = new InMemoryAccesorioRepository();
        categoriaRepository = new InMemoryCategoriaRepository();
        service = new AccesorioService(
                accesorioRepository,
                categoriaRepository
        );

        Categoria categoria = Categoria.builder()
                .id(UUID.randomUUID())
                .codigo("VEHICULOS")
                .nombre("Vehículos")
                .build();
        categoriaRepository.items.add(categoria);
        categoriaId = categoria.getId();
    }

    @Test
    void createNormalizesCodigoNombreAndDescripcion() {
        AccesorioResponse response = service.create(
                new AccesorioRequest(
                        categoriaId,
                        "  gps   rastreador ",
                        "  GPS   Rastreador ",
                        "  Desc  "
                )
        );

        assertEquals("gps rastreador", response.codigo());
        assertEquals("GPS Rastreador", response.nombre());
        assertEquals("Desc", response.descripcion());
        assertNotNull(response.catalogo());
        assertEquals(categoriaId, response.catalogo().id());
        assertEquals("Vehículos", response.catalogo().nombre());
        assertEquals(1, accesorioRepository.items.size());
    }

    @Test
    void createRejectsUnknownCategoria() {
        assertThrows(
                ResourceNotFoundException.class,
                () -> service.create(
                        new AccesorioRequest(
                                UUID.randomUUID(),
                                "GPS",
                                "GPS",
                                null
                        )
                )
        );
        assertTrue(accesorioRepository.items.isEmpty());
    }

    @Test
    void createRejectsDuplicateCodigoForSameCategoria() {
        accesorioRepository.items.add(existing("GPS"));

        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> service.create(
                        new AccesorioRequest(
                                categoriaId,
                                "gps",
                                "GPS Nuevo",
                                null
                        )
                )
        );

        assertEquals("ACCESORIO_ALREADY_EXISTS", exception.getCode());
    }

    @Test
    void updateClearsDescripcionWhenNull() {
        Accesorio stored = existing("GPS");
        stored.setDescripcion("Anterior");
        accesorioRepository.items.add(stored);

        AccesorioResponse response = service.update(
                stored.getId(),
                new AccesorioRequest(
                        categoriaId,
                        "GPS",
                        "GPS Navegador",
                        null
                )
        );

        assertNull(response.descripcion());
        assertEquals("GPS Navegador", response.nombre());
    }

    @Test
    void updateRejectsDuplicateCodigoForSameCategoria() {
        Accesorio first = existing("GPS");
        Accesorio second = existing("RADIO");
        accesorioRepository.items.add(first);
        accesorioRepository.items.add(second);

        assertThrows(
                ConflictException.class,
                () -> service.update(
                        second.getId(),
                        new AccesorioRequest(
                                categoriaId,
                                "gps",
                                "Radio Actualizado",
                                null
                        )
                )
        );
    }

    @Test
    void findByCategoriaIdFiltersAndSearches() {
        accesorioRepository.items.add(existing("GPS", "GPS"));
        accesorioRepository.items.add(existing("RADIO", "Radio Comunicador"));
        accesorioRepository.items.add(
                Accesorio.builder()
                        .id(UUID.randomUUID())
                        .categoriaId(UUID.randomUUID())
                        .codigo("OTRO")
                        .nombre("Otro")
                        .build()
        );

        PageResponse<AccesorioResponse> all = service.findByCategoriaId(
                categoriaId,
                null,
                new PageRequestDto(0, 10, "codigo", null)
        );
        assertEquals(2, all.content().size());

        PageResponse<AccesorioResponse> filtered = service.findByCategoriaId(
                categoriaId,
                "radio",
                new PageRequestDto(0, 10, "nombre", null)
        );
        assertEquals(1, filtered.content().size());
        assertEquals("RADIO", filtered.content().getFirst().codigo());
    }

    private Accesorio existing(String codigo) {
        return existing(codigo, codigo);
    }

    private Accesorio existing(String codigo, String nombre) {
        return Accesorio.builder()
                .id(UUID.randomUUID())
                .categoriaId(categoriaId)
                .codigo(codigo)
                .nombre(nombre)
                .build();
    }

    private static final class InMemoryAccesorioRepository
            implements AccesorioRepository {

        private final List<Accesorio> items = new ArrayList<>();

        @Override
        public Accesorio save(Accesorio entity) {
            if (entity.getId() == null) {
                entity.setId(UUID.randomUUID());
            }
            items.removeIf(item -> item.getId().equals(entity.getId()));
            items.add(entity);
            return entity;
        }

        @Override
        public Optional<Accesorio> findById(UUID id) {
            return items.stream()
                    .filter(item -> item.getId().equals(id))
                    .findFirst();
        }

        @Override
        public List<Accesorio> findAll() {
            return List.copyOf(items);
        }

        @Override
        public Page<Accesorio> findAll(Pageable pageable) {
            return new PageImpl<>(List.copyOf(items), pageable, items.size());
        }

        @Override
        public Page<Accesorio> findByCategoriaId(
                UUID categoriaId,
                Pageable pageable
        ) {
            List<Accesorio> filtered = items.stream()
                    .filter(item -> item.getCategoriaId().equals(categoriaId))
                    .toList();
            return new PageImpl<>(filtered, pageable, filtered.size());
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
        public Page<Accesorio> search(
                String query,
                Pageable pageable
        ) {
            String q = query.toLowerCase();
            List<Accesorio> filtered = items.stream()
                    .filter(item ->
                            item.getCodigo().toLowerCase().contains(q)
                                    || item.getNombre().toLowerCase().contains(q)
                    )
                    .toList();
            return new PageImpl<>(filtered, pageable, filtered.size());
        }

        @Override
        public Page<Accesorio> searchByCategoriaId(
                UUID categoriaId,
                String query,
                Pageable pageable
        ) {
            String q = query.toLowerCase();
            List<Accesorio> filtered = items.stream()
                    .filter(item -> item.getCategoriaId().equals(categoriaId))
                    .filter(item ->
                            item.getCodigo().toLowerCase().contains(q)
                                    || item.getNombre().toLowerCase().contains(q)
                    )
                    .toList();
            return new PageImpl<>(filtered, pageable, filtered.size());
        }

        @Override
        public boolean existsByCategoriaIdAndCodigoIgnoreCase(
                UUID categoriaId,
                String codigo
        ) {
            return items.stream().anyMatch(item ->
                    item.getCategoriaId().equals(categoriaId)
                            && item.getCodigo().equalsIgnoreCase(codigo)
            );
        }

        @Override
        public boolean existsByCategoriaIdAndCodigoIgnoreCaseAndIdNot(
                UUID categoriaId,
                String codigo,
                UUID id
        ) {
            return items.stream().anyMatch(item ->
                    !item.getId().equals(id)
                            && item.getCategoriaId().equals(categoriaId)
                            && item.getCodigo().equalsIgnoreCase(codigo)
            );
        }
    }

    private static final class InMemoryCategoriaRepository
            implements CategoriaRepository {

        private final List<Categoria> items = new ArrayList<>();

        @Override
        public Categoria save(Categoria entity) {
            if (entity.getId() == null) {
                entity.setId(UUID.randomUUID());
            }
            items.removeIf(item -> item.getId().equals(entity.getId()));
            items.add(entity);
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
        public Page<Categoria> search(String query, Pageable pageable) {
            String q = query.toLowerCase();
            List<Categoria> filtered = items.stream()
                    .filter(item ->
                            item.getCodigo().toLowerCase().contains(q)
                                    || item.getNombre().toLowerCase().contains(q)
                    )
                    .toList();
            return new PageImpl<>(filtered, pageable, filtered.size());
        }

        @Override
        public Integer findMaxOrden() {
            return items.stream()
                    .map(Categoria::getOrden)
                    .max(Integer::compareTo)
                    .orElse(0);
        }
    }
}
