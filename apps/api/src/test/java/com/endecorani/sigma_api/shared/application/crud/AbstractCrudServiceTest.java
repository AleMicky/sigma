package com.endecorani.sigma_api.shared.application.crud;

import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AbstractCrudServiceTest {

    @Test
    void findAllReturnsMappedPage() {
        InMemoryRepository repository = new InMemoryRepository();
        repository.items.add(new Item(1L, "alpha"));
        repository.items.add(new Item(2L, "beta"));

        TestCrudService service = new TestCrudService(repository);
        PageResponse<ItemResponse> response = service.findAll(
                new PageRequestDto(0, 20, "createdAt", null)
        );

        assertEquals(2, response.content().size());
        assertEquals("ALPHA", response.content().get(0).name());
        assertEquals("BETA", response.content().get(1).name());
        assertEquals(0, response.page());
    }

    @Test
    void deleteThrowsWhenResourceDoesNotExist() {
        TestCrudService service = new TestCrudService(new InMemoryRepository());

        assertThrows(
                ResourceNotFoundException.class,
                () -> service.delete(99L)
        );
    }

    @Test
    void updatePersistsMappedDomain() {
        InMemoryRepository repository = new InMemoryRepository();
        repository.items.add(new Item(1L, "old"));

        TestCrudService service = new TestCrudService(repository);
        ItemResponse result = service.update(1L, new ItemRequest("new"));

        assertEquals("NEW", result.name());
        assertEquals("new", repository.items.getFirst().getName());
    }

    private static final class Item {
        private final Long id;
        private String name;

        private Item(Long id, String name) {
            this.id = id;
            this.name = name;
        }

        private Long getId() {
            return id;
        }

        private String getName() {
            return name;
        }

        private void setName(String name) {
            this.name = name;
        }
    }

    private record ItemRequest(String name) {
    }

    private record ItemResponse(String name) {
    }

    private static final class InMemoryRepository
            implements CrudRepository<Item, Long> {

        private final List<Item> items = new ArrayList<>();

        @Override
        public Item save(Item entity) {
            items.removeIf(item -> item.getId().equals(entity.getId()));
            items.add(entity);
            return entity;
        }

        @Override
        public Optional<Item> findById(Long id) {
            return items.stream()
                    .filter(item -> item.getId().equals(id))
                    .findFirst();
        }

        @Override
        public List<Item> findAll() {
            return List.copyOf(items);
        }

        @Override
        public Page<Item> findAll(Pageable pageable) {
            return new PageImpl<>(List.copyOf(items), pageable, items.size());
        }

        @Override
        public boolean existsById(Long id) {
            return items.stream().anyMatch(item -> item.getId().equals(id));
        }

        @Override
        public void deleteById(Long id) {
            items.removeIf(item -> item.getId().equals(id));
        }
    }

    private static final class TestCrudService
            extends AbstractCrudService<Item, ItemRequest, ItemResponse, Long> {

        private final CrudRepository<Item, Long> repository;

        private TestCrudService(CrudRepository<Item, Long> repository) {
            this.repository = repository;
        }

        @Override
        protected CrudRepository<Item, Long> repository() {
            return repository;
        }

        @Override
        protected Item toDomain(ItemRequest request) {
            return new Item(null, request.name());
        }

        @Override
        protected void updateDomain(Item domain, ItemRequest request) {
            domain.setName(request.name());
        }

        @Override
        protected ItemResponse toResponse(Item domain) {
            return new ItemResponse(domain.getName().toUpperCase());
        }

        @Override
        protected String resourceName() {
            return "Item";
        }
    }
}
