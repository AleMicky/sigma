package com.endecorani.sigma_api.modules.parametros.application.service;

import com.endecorani.sigma_api.modules.parametros.application.dto.request.CatalogoItemRequest;
import com.endecorani.sigma_api.modules.parametros.application.dto.response.CatalogoItemResponse;
import com.endecorani.sigma_api.modules.parametros.domain.model.Catalogo;
import com.endecorani.sigma_api.modules.parametros.domain.model.CatalogoItem;
import com.endecorani.sigma_api.modules.parametros.domain.repository.CatalogoItemRepository;
import com.endecorani.sigma_api.modules.parametros.domain.repository.CatalogoRepository;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CatalogoItemServiceTest {

    private InMemoryCatalogoRepository catalogoRepository;
    private InMemoryCatalogoItemRepository itemRepository;
    private CatalogoItemService service;

    private UUID catalogoId;

    @BeforeEach
    void setUp() {
        catalogoRepository = new InMemoryCatalogoRepository();
        itemRepository = new InMemoryCatalogoItemRepository(catalogoRepository);
        service = new CatalogoItemService(itemRepository, catalogoRepository);

        Catalogo catalogo = Catalogo.builder()
                .id(UUID.randomUUID())
                .codigo("TIPO_DOC")
                .nombre("Tipo de documento")
                .build();
        catalogoRepository.items.add(catalogo);
        catalogoId = catalogo.getId();
    }

    @Test
    void createNormalizesFieldsAndAutoIncrementsOrden() {
        CatalogoItemResponse first = service.create(
                new CatalogoItemRequest(
                        catalogoId,
                        "  Cédula   de identidad ",
                        "  ci  ",
                        null
                )
        );
        CatalogoItemResponse second = service.create(
                new CatalogoItemRequest(
                        catalogoId,
                        "Pasaporte",
                        "PAS",
                        null
                )
        );

        assertEquals(catalogoId, first.catalogoId());
        assertEquals("Cédula de identidad", first.nombre());
        assertEquals("ci", first.valor());
        assertEquals(0, first.orden());
        assertEquals(1, second.orden());
        assertEquals(2, itemRepository.items.size());
    }

    @Test
    void createRejectsDuplicateOrdenInSameCatalogo() {
        itemRepository.items.add(existing(catalogoId, "CI", "Cédula", 1));

        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> service.create(
                        new CatalogoItemRequest(
                                catalogoId,
                                "Pasaporte",
                                "PAS",
                                1
                        )
                )
        );

        assertEquals("CATALOGO_ITEM_ORDEN_ALREADY_EXISTS", exception.getCode());
    }

    @Test
    void createRejectsMissingCatalogo() {
        assertThrows(
                ResourceNotFoundException.class,
                () -> service.create(
                        new CatalogoItemRequest(
                                UUID.randomUUID(),
                                "Nombre",
                                "VAL",
                                1
                        )
                )
        );
        assertTrue(itemRepository.items.isEmpty());
    }

    @Test
    void createRejectsDuplicateValorInSameCatalogo() {
        itemRepository.items.add(existing(catalogoId, "CI", "Cédula", 0));

        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> service.create(
                        new CatalogoItemRequest(
                                catalogoId,
                                "Otra cédula",
                                "ci",
                                2
                        )
                )
        );

        assertEquals("CATALOGO_ITEM_ALREADY_EXISTS", exception.getCode());
    }

    @Test
    void findByCatalogoIdReturnsOnlyMatchingItems() {
        UUID otherCatalogoId = UUID.randomUUID();
        catalogoRepository.items.add(
                Catalogo.builder()
                        .id(otherCatalogoId)
                        .codigo("OTRO")
                        .nombre("Otro")
                        .build()
        );

        itemRepository.items.add(existing(catalogoId, "CI", "Cédula", 0));
        itemRepository.items.add(existing(catalogoId, "PAS", "Pasaporte", 1));
        itemRepository.items.add(existing(otherCatalogoId, "X", "Otro", 0));

        PageResponse<CatalogoItemResponse> page = service.findByCatalogoId(
                catalogoId,
                new PageRequestDto(0, 10, "orden", null)
        );

        assertEquals(2, page.content().size());
        assertTrue(page.content().stream()
                .allMatch(item -> item.catalogoId().equals(catalogoId)));
    }

    @Test
    void findByCatalogoIdRejectsMissingCatalogo() {
        assertThrows(
                ResourceNotFoundException.class,
                () -> service.findByCatalogoId(
                        UUID.randomUUID(),
                        new PageRequestDto(0, 10, "orden", null)
                )
        );
    }

    @Test
    void updateAllowsSameValorOnSameRecord() {
        CatalogoItem stored = existing(catalogoId, "CI", "Cédula", 0);
        itemRepository.items.add(stored);

        CatalogoItemResponse response = service.update(
                stored.getId(),
                new CatalogoItemRequest(
                        catalogoId,
                        "Cédula actualizada",
                        "CI",
                        5
                )
        );

        assertEquals("Cédula actualizada", response.nombre());
        assertEquals("CI", response.valor());
        assertEquals(5, response.orden());
    }

    private static CatalogoItem existing(
            UUID catalogoId,
            String valor,
            String nombre,
            int orden
    ) {
        return CatalogoItem.builder()
                .id(UUID.randomUUID())
                .catalogoId(catalogoId)
                .valor(valor)
                .nombre(nombre)
                .orden(orden)
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

        @Override
        public Page<Catalogo> search(String query, Pageable pageable) {
            String normalized = query.toLowerCase();
            List<Catalogo> filtered = items.stream()
                    .filter(item ->
                            item.getCodigo().toLowerCase().contains(normalized)
                                    || item.getNombre().toLowerCase().contains(normalized)
                    )
                    .toList();
            return new PageImpl<>(filtered, pageable, filtered.size());
        }
    }

    private static final class InMemoryCatalogoItemRepository
            implements CatalogoItemRepository {

        private final InMemoryCatalogoRepository catalogoRepository;
        private final List<CatalogoItem> items = new ArrayList<>();

        InMemoryCatalogoItemRepository(
                InMemoryCatalogoRepository catalogoRepository
        ) {
            this.catalogoRepository = catalogoRepository;
        }

        @Override
        public CatalogoItem save(CatalogoItem entity) {
            if (entity.getId() == null) {
                entity.setId(UUID.randomUUID());
            }
            items.removeIf(item -> item.getId().equals(entity.getId()));
            items.add(entity);
            return entity;
        }

        @Override
        public Optional<CatalogoItem> findById(UUID id) {
            return items.stream()
                    .filter(item -> item.getId().equals(id))
                    .findFirst();
        }

        @Override
        public Page<CatalogoItem> findAll(Pageable pageable) {
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
        public Page<CatalogoItem> findByCatalogoId(
                UUID catalogoId,
                Pageable pageable
        ) {
            List<CatalogoItem> filtered = items.stream()
                    .filter(item -> item.getCatalogoId().equals(catalogoId))
                    .toList();
            return new PageImpl<>(filtered, pageable, filtered.size());
        }

        @Override
        public Page<CatalogoItem> searchByCatalogoId(
                UUID catalogoId,
                String query,
                Pageable pageable
        ) {
            String normalized = query.toLowerCase();
            List<CatalogoItem> filtered = items.stream()
                    .filter(item -> item.getCatalogoId().equals(catalogoId))
                    .filter(item ->
                            item.getNombre().toLowerCase().contains(normalized)
                                    || item.getValor().toLowerCase().contains(normalized)
                    )
                    .toList();
            return new PageImpl<>(filtered, pageable, filtered.size());
        }

        @Override
        public boolean existsByCatalogoIdAndValorIgnoreCase(
                UUID catalogoId,
                String valor
        ) {
            return items.stream().anyMatch(item ->
                    item.getCatalogoId().equals(catalogoId)
                            && item.getValor().equalsIgnoreCase(valor)
            );
        }

        @Override
        public boolean existsByCatalogoIdAndValorIgnoreCaseAndIdNot(
                UUID catalogoId,
                String valor,
                UUID id
        ) {
            return items.stream().anyMatch(item ->
                    !item.getId().equals(id)
                            && item.getCatalogoId().equals(catalogoId)
                            && item.getValor().equalsIgnoreCase(valor)
            );
        }

        @Override
        public Integer findMaxOrdenByCatalogoId(UUID catalogoId) {
            return items.stream()
                    .filter(item -> item.getCatalogoId().equals(catalogoId))
                    .map(CatalogoItem::getOrden)
                    .max(Integer::compareTo)
                    .orElse(null);
        }

        @Override
        public boolean existsByCatalogoIdAndOrden(
                UUID catalogoId,
                Integer orden
        ) {
            return items.stream().anyMatch(item ->
                    item.getCatalogoId().equals(catalogoId)
                            && item.getOrden().equals(orden)
            );
        }

        @Override
        public boolean existsByCatalogoIdAndOrdenAndIdNot(
                UUID catalogoId,
                Integer orden,
                UUID id
        ) {
            return items.stream().anyMatch(item ->
                    !item.getId().equals(id)
                            && item.getCatalogoId().equals(catalogoId)
                            && item.getOrden().equals(orden)
            );
        }

        @Override
        public Page<CatalogoItem> findByCodigo(
                String codigo,
                Pageable pageable
        ) {
            UUID resolvedId = catalogoIdByCodigo(codigo);
            if (resolvedId == null) {
                return new PageImpl<>(List.of(), pageable, 0);
            }
            List<CatalogoItem> filtered = items.stream()
                    .filter(item -> item.getCatalogoId().equals(resolvedId))
                    .toList();
            return new PageImpl<>(filtered, pageable, filtered.size());
        }

        @Override
        public Page<CatalogoItem> searchByCodigo(
                String codigo,
                String query,
                Pageable pageable
        ) {
            UUID resolvedId = catalogoIdByCodigo(codigo);
            if (resolvedId == null) {
                return new PageImpl<>(List.of(), pageable, 0);
            }
            String normalized = query.toLowerCase();
            List<CatalogoItem> filtered = items.stream()
                    .filter(item -> item.getCatalogoId().equals(resolvedId))
                    .filter(item ->
                            item.getNombre().toLowerCase().contains(normalized)
                                    || item.getValor().toLowerCase().contains(normalized)
                    )
                    .toList();
            return new PageImpl<>(filtered, pageable, filtered.size());
        }

        private UUID catalogoIdByCodigo(String codigo) {
            return catalogoRepository.items.stream()
                    .filter(c -> c.getCodigo().equalsIgnoreCase(codigo))
                    .map(Catalogo::getId)
                    .findFirst()
                    .orElse(null);
        }
    }
}
