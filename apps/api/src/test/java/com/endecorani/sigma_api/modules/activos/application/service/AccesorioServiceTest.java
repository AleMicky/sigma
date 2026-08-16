package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.request.AccesorioRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.AccesorioResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.Accesorio;
import com.endecorani.sigma_api.modules.activos.domain.model.TipoActivo;
import com.endecorani.sigma_api.modules.activos.domain.repository.AccesorioRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
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
    private InMemoryTipoActivoRepository tipoActivoRepository;
    private AccesorioService service;

    private UUID tipoActivoId;

    @BeforeEach
    void setUp() {
        accesorioRepository = new InMemoryAccesorioRepository();
        tipoActivoRepository = new InMemoryTipoActivoRepository();
        service = new AccesorioService(
                accesorioRepository,
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
        AccesorioResponse response = service.create(
                new AccesorioRequest(
                        tipoActivoId,
                        "  gps   rastreador ",
                        "  GPS   Rastreador ",
                        "  Desc  "
                )
        );

        assertEquals("gps rastreador", response.codigo());
        assertEquals("GPS Rastreador", response.nombre());
        assertEquals("Desc", response.descripcion());
        assertNotNull(response.catalogo());
        assertEquals(tipoActivoId, response.catalogo().id());
        assertEquals("Vehículo", response.catalogo().nombre());
        assertEquals(1, accesorioRepository.items.size());
    }

    @Test
    void createRejectsUnknownTipoActivo() {
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
    void createRejectsDuplicateCodigoForSameTipoActivo() {
        accesorioRepository.items.add(existing("GPS"));

        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> service.create(
                        new AccesorioRequest(
                                tipoActivoId,
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
                        tipoActivoId,
                        "GPS",
                        "GPS Navegador",
                        null
                )
        );

        assertNull(response.descripcion());
        assertEquals("GPS Navegador", response.nombre());
    }

    @Test
    void updateRejectsDuplicateCodigoForSameTipoActivo() {
        Accesorio first = existing("GPS");
        Accesorio second = existing("RADIO");
        accesorioRepository.items.add(first);
        accesorioRepository.items.add(second);

        assertThrows(
                ConflictException.class,
                () -> service.update(
                        second.getId(),
                        new AccesorioRequest(
                                tipoActivoId,
                                "gps",
                                "Radio Actualizado",
                                null
                        )
                )
        );
    }

    @Test
    void findByTipoActivoIdFiltersAndSearches() {
        accesorioRepository.items.add(existing("GPS", "GPS"));
        accesorioRepository.items.add(existing("RADIO", "Radio Comunicador"));
        accesorioRepository.items.add(
                Accesorio.builder()
                        .id(UUID.randomUUID())
                        .tipoActivoId(UUID.randomUUID())
                        .codigo("OTRO")
                        .nombre("Otro")
                        .build()
        );

        PageResponse<AccesorioResponse> all = service.findByTipoActivoId(
                tipoActivoId,
                null,
                new PageRequestDto(0, 10, "codigo", null)
        );
        assertEquals(2, all.content().size());

        PageResponse<AccesorioResponse> filtered = service.findByTipoActivoId(
                tipoActivoId,
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
                .tipoActivoId(tipoActivoId)
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
        public Page<Accesorio> findByTipoActivoId(
                UUID tipoActivoId,
                Pageable pageable
        ) {
            List<Accesorio> filtered = items.stream()
                    .filter(item -> item.getTipoActivoId().equals(tipoActivoId))
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
        public Page<Accesorio> searchByTipoActivoId(
                UUID tipoActivoId,
                String query,
                Pageable pageable
        ) {
            String q = query.toLowerCase();
            List<Accesorio> filtered = items.stream()
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
