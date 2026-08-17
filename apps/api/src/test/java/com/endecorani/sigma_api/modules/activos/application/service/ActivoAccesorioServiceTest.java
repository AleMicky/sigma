package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.request.ActivoAccesorioRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoAccesorioResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.Accesorio;
import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAccesorio;
import com.endecorani.sigma_api.modules.activos.domain.repository.AccesorioRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoAccesorioRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
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

class ActivoAccesorioServiceTest {

    private InMemoryActivoAccesorioRepository activoAccesorioRepository;
    private InMemoryActivoRepository activoRepository;
    private InMemoryAccesorioRepository accesorioRepository;
    private ActivoAccesorioService service;

    private UUID activoId;
    private UUID accesorioId;

    @BeforeEach
    void setUp() {
        activoAccesorioRepository = new InMemoryActivoAccesorioRepository();
        activoRepository = new InMemoryActivoRepository();
        accesorioRepository = new InMemoryAccesorioRepository();
        service = new ActivoAccesorioService(
                activoAccesorioRepository,
                activoRepository,
                accesorioRepository
        );

        Activo activo = Activo.builder()
                .id(UUID.randomUUID())
                .codigo("ACT-001")
                .nombre("Camioneta Hilux")
                .build();
        activoRepository.items.add(activo);
        activoId = activo.getId();

        Accesorio accesorio = Accesorio.builder()
                .id(UUID.randomUUID())
                .codigo("GPS")
                .nombre("GPS Navegador")
                .build();
        accesorioRepository.items.add(accesorio);
        accesorioId = accesorio.getId();
    }

    @Test
    void createNormalizesNumeroSerieAndObservacion() {
        ActivoAccesorioResponse response = service.create(
                new ActivoAccesorioRequest(
                        activoId,
                        accesorioId,
                        2,
                        "  SN-12345 ",
                        "  Instalado  en  cabina  "
                )
        );

        assertEquals("SN-12345", response.numeroSerie());
        assertEquals("Instalado en cabina", response.observacion());
        assertEquals(2, response.cantidad());
        assertNotNull(response.activo());
        assertEquals(activoId, response.activo().id());
        assertEquals("Camioneta Hilux", response.activo().nombre());
        assertNotNull(response.accesorio());
        assertEquals(accesorioId, response.accesorio().id());
        assertEquals("GPS Navegador", response.accesorio().nombre());
        assertEquals(1, activoAccesorioRepository.items.size());
    }

    @Test
    void createRejectsUnknownActivo() {
        assertThrows(
                ResourceNotFoundException.class,
                () -> service.create(
                        new ActivoAccesorioRequest(
                                UUID.randomUUID(),
                                accesorioId,
                                1,
                                null,
                                null
                        )
                )
        );
        assertTrue(activoAccesorioRepository.items.isEmpty());
    }

    @Test
    void createRejectsUnknownAccesorio() {
        assertThrows(
                ResourceNotFoundException.class,
                () -> service.create(
                        new ActivoAccesorioRequest(
                                activoId,
                                UUID.randomUUID(),
                                1,
                                null,
                                null
                        )
                )
        );
        assertTrue(activoAccesorioRepository.items.isEmpty());
    }

    @Test
    void createRejectsDuplicateActivoAccesorio() {
        activoAccesorioRepository.items.add(existing(activoId, accesorioId));

        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> service.create(
                        new ActivoAccesorioRequest(
                                activoId,
                                accesorioId,
                                1,
                                null,
                                null
                        )
                )
        );

        assertEquals("ACTIVO_ACCESORIO_ALREADY_EXISTS", exception.getCode());
    }

    @Test
    void updateClearsNumeroSerieAndObservacionWhenNull() {
        ActivoAccesorio stored = existing(activoId, accesorioId);
        stored.setNumeroSerie("SN-OLD");
        stored.setObservacion("Old observation");
        activoAccesorioRepository.items.add(stored);

        ActivoAccesorioResponse response = service.update(
                stored.getId(),
                new ActivoAccesorioRequest(
                        activoId,
                        accesorioId,
                        3,
                        null,
                        null
                )
        );

        assertNull(response.numeroSerie());
        assertNull(response.observacion());
        assertEquals(3, response.cantidad());
    }

    @Test
    void updateRejectsDuplicateActivoAccesorio() {
        UUID otroAccesorioId = UUID.randomUUID();
        Accesorio otro = Accesorio.builder()
                .id(otroAccesorioId)
                .codigo("RADIO")
                .nombre("Radio")
                .build();
        accesorioRepository.items.add(otro);

        ActivoAccesorio first = existing(activoId, accesorioId);
        ActivoAccesorio second = existing(activoId, otroAccesorioId);
        activoAccesorioRepository.items.add(first);
        activoAccesorioRepository.items.add(second);

        assertThrows(
                ConflictException.class,
                () -> service.update(
                        second.getId(),
                        new ActivoAccesorioRequest(
                                activoId,
                                accesorioId,
                                1,
                                null,
                                null
                        )
                )
        );
    }

    @Test
    void findByActivoIdFiltersAndSearches() {
        UUID otroAccesorioId = UUID.randomUUID();
        Accesorio otro = Accesorio.builder()
                .id(otroAccesorioId)
                .codigo("RADIO")
                .nombre("Radio Comunicador")
                .build();
        accesorioRepository.items.add(otro);

        ActivoAccesorio first = existing(activoId, accesorioId);
        first.setNumeroSerie("SN-111");
        ActivoAccesorio second = existing(activoId, otroAccesorioId);
        second.setNumeroSerie("SN-222");
        activoAccesorioRepository.items.add(first);
        activoAccesorioRepository.items.add(second);

        UUID otroActivoId = UUID.randomUUID();
        Activo otroActivo = Activo.builder()
                .id(otroActivoId)
                .codigo("ACT-002")
                .nombre("Otro activo")
                .build();
        activoRepository.items.add(otroActivo);
        activoAccesorioRepository.items.add(existing(otroActivoId, accesorioId));

        PageResponse<ActivoAccesorioResponse> all = service.findByActivoId(
                activoId,
                null,
                new PageRequestDto(0, 10, "cantidad", null)
        );
        assertEquals(2, all.content().size());

        PageResponse<ActivoAccesorioResponse> filtered = service.findByActivoId(
                activoId,
                "SN-111",
                new PageRequestDto(0, 10, "cantidad", null)
        );
        assertEquals(1, filtered.content().size());
    }

    @Test
    void deleteRemovesExistingRecord() {
        ActivoAccesorio stored = existing(activoId, accesorioId);
        activoAccesorioRepository.items.add(stored);

        service.delete(stored.getId());

        assertTrue(activoAccesorioRepository.items.isEmpty());
    }

    @Test
    void deleteThrowsForNonExistentId() {
        assertThrows(
                ResourceNotFoundException.class,
                () -> service.delete(UUID.randomUUID())
        );
    }

    private ActivoAccesorio existing(UUID activoId, UUID accesorioId) {
        return ActivoAccesorio.builder()
                .id(UUID.randomUUID())
                .activoId(activoId)
                .accesorioId(accesorioId)
                .cantidad(1)
                .build();
    }

    private static final class InMemoryActivoAccesorioRepository
            implements ActivoAccesorioRepository {

        private final List<ActivoAccesorio> items = new ArrayList<>();

        @Override
        public ActivoAccesorio save(ActivoAccesorio entity) {
            if (entity.getId() == null) {
                entity.setId(UUID.randomUUID());
            }
            items.removeIf(item -> item.getId().equals(entity.getId()));
            items.add(entity);
            return entity;
        }

        @Override
        public Optional<ActivoAccesorio> findById(UUID id) {
            return items.stream()
                    .filter(item -> item.getId().equals(id))
                    .findFirst();
        }

        @Override
        public List<ActivoAccesorio> findAll() {
            return List.copyOf(items);
        }

        @Override
        public Page<ActivoAccesorio> findAll(Pageable pageable) {
            return new PageImpl<>(List.copyOf(items), pageable, items.size());
        }

        @Override
        public Page<ActivoAccesorio> findByActivoId(
                UUID activoId,
                Pageable pageable
        ) {
            List<ActivoAccesorio> filtered = items.stream()
                    .filter(item -> item.getActivoId().equals(activoId))
                    .toList();
            return new PageImpl<>(filtered, pageable, filtered.size());
        }

        @Override
        public Page<ActivoAccesorio> findByAccesorioId(
                UUID accesorioId,
                Pageable pageable
        ) {
            List<ActivoAccesorio> filtered = items.stream()
                    .filter(item -> item.getAccesorioId().equals(accesorioId))
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
        public Page<ActivoAccesorio> search(
                String query,
                Pageable pageable
        ) {
            String q = query.toLowerCase();
            List<ActivoAccesorio> filtered = items.stream()
                    .filter(item ->
                            (item.getNumeroSerie() != null
                                    && item.getNumeroSerie().toLowerCase().contains(q))
                                    || (item.getObservacion() != null
                                    && item.getObservacion().toLowerCase().contains(q))
                    )
                    .toList();
            return new PageImpl<>(filtered, pageable, filtered.size());
        }

        @Override
        public Page<ActivoAccesorio> searchByActivoId(
                UUID activoId,
                String query,
                Pageable pageable
        ) {
            String q = query.toLowerCase();
            List<ActivoAccesorio> filtered = items.stream()
                    .filter(item -> item.getActivoId().equals(activoId))
                    .filter(item ->
                            (item.getNumeroSerie() != null
                                    && item.getNumeroSerie().toLowerCase().contains(q))
                                    || (item.getObservacion() != null
                                    && item.getObservacion().toLowerCase().contains(q))
                    )
                    .toList();
            return new PageImpl<>(filtered, pageable, filtered.size());
        }

        @Override
        public boolean existsByActivoIdAndAccesorioId(
                UUID activoId,
                UUID accesorioId
        ) {
            return items.stream().anyMatch(item ->
                    item.getActivoId().equals(activoId)
                            && item.getAccesorioId().equals(accesorioId)
            );
        }

        @Override
        public boolean existsByActivoIdAndAccesorioIdAndIdNot(
                UUID activoId,
                UUID accesorioId,
                UUID id
        ) {
            return items.stream().anyMatch(item ->
                    !item.getId().equals(id)
                            && item.getActivoId().equals(activoId)
                            && item.getAccesorioId().equals(accesorioId)
            );
        }
    }

    private static final class InMemoryActivoRepository
            implements ActivoRepository {

        private final List<Activo> items = new ArrayList<>();

        @Override
        public Activo save(Activo entity) {
            if (entity.getId() == null) {
                entity.setId(UUID.randomUUID());
            }
            items.removeIf(item -> item.getId().equals(entity.getId()));
            items.add(entity);
            return entity;
        }

        @Override
        public Optional<Activo> findById(UUID id) {
            return items.stream()
                    .filter(item -> item.getId().equals(id))
                    .findFirst();
        }

        @Override
        public List<Activo> findAll() {
            return List.copyOf(items);
        }

        @Override
        public Page<Activo> findAll(Pageable pageable) {
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
        public Page<Activo> findByTipoActivoId(UUID tipoActivoId, Pageable pageable) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        @Override
        public Page<Activo> searchByTipoActivoId(UUID tipoActivoId, String query, Pageable pageable) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        @Override
        public Page<Activo> search(String query, Pageable pageable) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        @Override
        public boolean existsByCodigoIgnoreCase(String codigo) {
            return false;
        }

        @Override
        public boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id) {
            return false;
        }
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
        public Page<Accesorio> findByCategoriaId(UUID categoriaId, Pageable pageable) {
            return new PageImpl<>(List.of(), pageable, 0);
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
        public Page<Accesorio> search(String query, Pageable pageable) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        @Override
        public Page<Accesorio> searchByCategoriaId(UUID categoriaId, String query, Pageable pageable) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        @Override
        public boolean existsByCategoriaIdAndCodigoIgnoreCase(UUID categoriaId, String codigo) {
            return false;
        }

        @Override
        public boolean existsByCategoriaIdAndCodigoIgnoreCaseAndIdNot(UUID categoriaId, String codigo, UUID id) {
            return false;
        }
    }
}
