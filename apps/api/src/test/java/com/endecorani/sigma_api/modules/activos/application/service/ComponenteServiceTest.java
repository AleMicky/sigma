package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.ComponenteRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.ComponenteResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.Componente;
import com.endecorani.sigma_api.modules.activos.domain.model.TipoActivo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ComponenteRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
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

class ComponenteServiceTest {

    private InMemoryComponenteRepository componenteRepository;
    private InMemoryTipoActivoRepository tipoActivoRepository;
    private ComponenteService service;

    private UUID tipoActivoId;

    @BeforeEach
    void setUp() {
        componenteRepository = new InMemoryComponenteRepository();
        tipoActivoRepository = new InMemoryTipoActivoRepository();
        service = new ComponenteService(
                componenteRepository,
                tipoActivoRepository
        );

        TipoActivo tipoActivo = TipoActivo.builder()
                .id(UUID.randomUUID())
                .nombre("Vehículo")
                .build();
        tipoActivoRepository.items.add(tipoActivo);
        tipoActivoId = tipoActivo.getId();
    }

    @Test
    void createNormalizesCodigoNombreAndDescripcion() {
        ComponenteResponse response = service.create(
                new ComponenteRequest(
                        tipoActivoId,
                        "  motor   principal ",
                        "  Motor   principal ",
                        "  Desc  ",
                        true
                )
        );

        assertEquals("motor principal", response.codigo());
        assertEquals("Motor principal", response.nombre());
        assertEquals("Desc", response.descripcion());
        assertEquals(tipoActivoId, response.tipoActivoId());
        assertTrue(response.activo());
        assertEquals(1, componenteRepository.items.size());
    }

    @Test
    void createRejectsUnknownTipoActivo() {
        assertThrows(
                ResourceNotFoundException.class,
                () -> service.create(
                        new ComponenteRequest(
                                UUID.randomUUID(),
                                "MOTOR",
                                "Motor",
                                null,
                                true
                        )
                )
        );
        assertTrue(componenteRepository.items.isEmpty());
    }

    @Test
    void createRejectsCodigoTooShortAfterNormalize() {
        assertThrows(
                BusinessException.class,
                () -> service.create(
                        new ComponenteRequest(
                                tipoActivoId,
                                " a ",
                                "Motor",
                                null,
                                true
                        )
                )
        );
        assertTrue(componenteRepository.items.isEmpty());
    }

    @Test
    void createRejectsDuplicateCodigoIgnoreCase() {
        componenteRepository.items.add(existing("MOTOR"));

        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> service.create(
                        new ComponenteRequest(
                                tipoActivoId,
                                "motor",
                                "Motor",
                                null,
                                true
                        )
                )
        );

        assertEquals("COMPONENTE_ALREADY_EXISTS", exception.getCode());
    }

    @Test
    void updateClearsDescripcionWhenNull() {
        Componente stored = existing("MOTOR");
        stored.setDescripcion("Anterior");
        componenteRepository.items.add(stored);

        ComponenteResponse response = service.update(
                stored.getId(),
                new ComponenteRequest(
                        tipoActivoId,
                        "MOTOR",
                        "Motor",
                        null,
                        true
                )
        );

        assertNull(response.descripcion());
    }

    @Test
    void updateRejectsDuplicateCodigoIgnoreCase() {
        Componente first = existing("MOTOR");
        Componente second = existing("TRANSMISION");
        componenteRepository.items.add(first);
        componenteRepository.items.add(second);

        assertThrows(
                ConflictException.class,
                () -> service.update(
                        second.getId(),
                        new ComponenteRequest(
                                tipoActivoId,
                                "motor",
                                "Transmisión",
                                null,
                                true
                        )
                )
        );
    }

    @Test
    void updateAllowsSameCodigoOnSameRecord() {
        Componente stored = existing("MOTOR");
        componenteRepository.items.add(stored);

        ComponenteResponse response = service.update(
                stored.getId(),
                new ComponenteRequest(
                        tipoActivoId,
                        "MOTOR",
                        "Motor actualizado",
                        "Nueva desc",
                        true
                )
        );

        assertEquals("MOTOR", response.codigo());
        assertEquals("Motor actualizado", response.nombre());
        assertEquals("Nueva desc", response.descripcion());
    }

    @Test
    void findByTipoActivoIdFiltersAndSearches() {
        componenteRepository.items.add(existing("MOTOR", "Motor"));
        componenteRepository.items.add(existing("FRENO", "Freno delantero"));
        componenteRepository.items.add(
                Componente.builder()
                        .id(UUID.randomUUID())
                        .tipoActivoId(UUID.randomUUID())
                        .codigo("OTRO")
                        .nombre("Otro")
                        .build()
        );

        PageResponse<ComponenteResponse> all = service.findByTipoActivoId(
                tipoActivoId,
                null,
                new PageRequestDto(0, 10, "codigo", null)
        );
        assertEquals(2, all.content().size());

        PageResponse<ComponenteResponse> filtered = service.findByTipoActivoId(
                tipoActivoId,
                "freno",
                new PageRequestDto(0, 10, "nombre", null)
        );
        assertEquals(1, filtered.content().size());
        assertEquals("FRENO", filtered.content().getFirst().codigo());
    }

    private Componente existing(String codigo) {
        return existing(codigo, codigo);
    }

    private Componente existing(String codigo, String nombre) {
        return Componente.builder()
                .id(UUID.randomUUID())
                .tipoActivoId(tipoActivoId)
                .codigo(codigo)
                .nombre(nombre)
                .build();
    }

    private static final class InMemoryComponenteRepository
            implements ComponenteRepository {

        private final List<Componente> items = new ArrayList<>();

        @Override
        public Componente save(Componente entity) {
            if (entity.getId() == null) {
                entity.setId(UUID.randomUUID());
            }
            items.removeIf(item -> item.getId().equals(entity.getId()));
            items.add(entity);
            return entity;
        }

        @Override
        public Optional<Componente> findById(UUID id) {
            return items.stream()
                    .filter(item -> item.getId().equals(id))
                    .findFirst();
        }

        @Override
        public List<Componente> findAll() {
            return List.copyOf(items);
        }

        @Override
        public Page<Componente> findAll(Pageable pageable) {
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
        public Page<Componente> findByTipoActivoId(
                UUID tipoActivoId,
                Pageable pageable
        ) {
            List<Componente> filtered = items.stream()
                    .filter(item -> item.getTipoActivoId().equals(tipoActivoId))
                    .toList();
            return new PageImpl<>(filtered, pageable, filtered.size());
        }

        @Override
        public Page<Componente> searchByTipoActivoId(
                UUID tipoActivoId,
                String query,
                Pageable pageable
        ) {
            String q = query.toLowerCase();
            List<Componente> filtered = items.stream()
                    .filter(item -> item.getTipoActivoId().equals(tipoActivoId))
                    .filter(item ->
                            item.getCodigo().toLowerCase().contains(q)
                                    || item.getNombre().toLowerCase().contains(q)
                    )
                    .toList();
            return new PageImpl<>(filtered, pageable, filtered.size());
        }

        @Override
        public boolean existsByTipoActivoIdAndCodigoIgnoreCase(
                UUID tipoActivoId,
                String codigo
        ) {
            return items.stream().anyMatch(item ->
                    item.getTipoActivoId().equals(tipoActivoId)
                            && item.getCodigo().equalsIgnoreCase(codigo)
            );
        }

        @Override
        public boolean existsByTipoActivoIdAndCodigoIgnoreCaseAndIdNot(
                UUID tipoActivoId,
                String codigo,
                UUID id
        ) {
            return items.stream().anyMatch(item ->
                    !item.getId().equals(id)
                            && item.getTipoActivoId().equals(tipoActivoId)
                            && item.getCodigo().equalsIgnoreCase(codigo)
            );
        }
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
}
