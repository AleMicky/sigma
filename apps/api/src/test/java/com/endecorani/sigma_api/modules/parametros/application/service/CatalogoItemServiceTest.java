package com.endecorani.sigma_api.modules.parametros.application.service;

import com.endecorani.sigma_api.modules.parametros.application.dto.CatalogoItemRequest;
import com.endecorani.sigma_api.modules.parametros.application.dto.CatalogoItemResponse;
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
        itemRepository = new InMemoryCatalogoItemRepository();
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
    void createNormalizesFieldsAndDefaultsOrden() {
        CatalogoItemResponse response = service.create(
                new CatalogoItemRequest(
                        catalogoId,
                        "  Cédula   de identidad ",
                        "  ci  ",
                        null
                )
        );

        assertEquals(catalogoId, response.catalogoId());
        assertEquals("Cédula de identidad", response.nombre());
        assertEquals("ci", response.valor());
        assertEquals(0, response.orden());
        assertEquals(1, itemRepository.items.size());
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
        itemRepository.items.add(existing(catalogoId, "CI", "Cédula"));

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

        itemRepository.items.add(existing(catalogoId, "CI", "Cédula"));
        itemRepository.items.add(existing(catalogoId, "PAS", "Pasaporte"));
        itemRepository.items.add(existing(otherCatalogoId, "X", "Otro"));

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
        CatalogoItem stored = existing(catalogoId, "CI", "Cédula");
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
            String nombre
    ) {
        return CatalogoItem.builder()
                .id(UUID.randomUUID())
                .catalogoId(catalogoId)
                .valor(valor)
                .nombre(nombre)
                .orden(0)
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

    private static final class InMemoryCatalogoItemRepository
            implements CatalogoItemRepository {

        private final List<CatalogoItem> items = new ArrayList<>();

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
        public List<CatalogoItem> findAll() {
            return List.copyOf(items);
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
    }
}
