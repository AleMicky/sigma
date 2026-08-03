package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.ActivoRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.ActivoResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.model.TipoActivo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.storage.ImageStorageService;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ActivoServiceTest {

    private InMemoryActivoRepository activoRepository;
    private InMemoryTipoActivoRepository tipoActivoRepository;
    private FakeImageStorageService imageStorageService;
    private ActivoService service;

    private UUID tipoActivoId;

    @BeforeEach
    void setUp() {
        activoRepository = new InMemoryActivoRepository();
        tipoActivoRepository = new InMemoryTipoActivoRepository();
        imageStorageService = new FakeImageStorageService();
        service = new ActivoService(
                activoRepository,
                tipoActivoRepository,
                imageStorageService
        );

        TipoActivo tipoActivo = TipoActivo.builder()
                .id(UUID.randomUUID())
                .nombre("Vehículo")
                .build();
        tipoActivoRepository.items.add(tipoActivo);
        tipoActivoId = tipoActivo.getId();
    }

    @Test
    void createNormalizesFields() {
        ActivoResponse response = service.create(
                new ActivoRequest(
                        "  veh-001  ",
                        "  Toyota   Hilux ",
                        "  Camioneta  ",
                        tipoActivoId,
                        "  Sede   central ",
                        LocalDate.of(2024, 1, 15)
                )
        );

        assertEquals("veh-001", response.codigo());
        assertEquals("Toyota Hilux", response.nombre());
        assertEquals("Camioneta", response.descripcion());
        assertEquals("Sede central", response.ubicacion());
        assertEquals(LocalDate.of(2024, 1, 15), response.fechaAdquisicion());
        assertNull(response.urlImagen());
    }

    @Test
    void createRejectsUnknownTipoActivo() {
        assertThrows(
                ResourceNotFoundException.class,
                () -> service.create(
                        new ActivoRequest(
                                "VEH-001",
                                "Toyota",
                                null,
                                UUID.randomUUID(),
                                null,
                                null
                        )
                )
        );
    }

    @Test
    void createRejectsDuplicateCodigoIgnoreCase() {
        activoRepository.items.add(existing("VEH-001"));

        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> service.create(
                        new ActivoRequest(
                                "veh-001",
                                "Otro",
                                null,
                                tipoActivoId,
                                null,
                                null
                        )
                )
        );

        assertEquals("ACTIVO_ALREADY_EXISTS", exception.getCode());
    }

    @Test
    void createRejectsCodigoTooShort() {
        assertThrows(
                BusinessException.class,
                () -> service.create(
                        new ActivoRequest(
                                " a ",
                                "Toyota",
                                null,
                                tipoActivoId,
                                null,
                                null
                        )
                )
        );
    }

    @Test
    void findByTipoActivoIdFiltersAndSearches() {
        activoRepository.items.add(existing("VEH-001", "Toyota"));
        activoRepository.items.add(existing("VEH-002", "Nissan"));
        activoRepository.items.add(
                Activo.builder()
                        .id(UUID.randomUUID())
                        .codigo("PC-001")
                        .nombre("Laptop")
                        .tipoActivoId(UUID.randomUUID())
                        .build()
        );

        PageResponse<ActivoResponse> all = service.findByTipoActivoId(
                tipoActivoId,
                null,
                new PageRequestDto(0, 10, "codigo", null)
        );
        assertEquals(2, all.content().size());

        PageResponse<ActivoResponse> filtered = service.findByTipoActivoId(
                tipoActivoId,
                "nissan",
                new PageRequestDto(0, 10, "nombre", null)
        );
        assertEquals(1, filtered.content().size());
        assertEquals("VEH-002", filtered.content().getFirst().codigo());
    }

    @Test
    void uploadAndDeleteImagen() {
        Activo stored = existing("VEH-001");
        activoRepository.items.add(stored);

        ActivoResponse uploaded = service.uploadImagen(
                stored.getId(),
                new MockMultipartFile(
                        "file",
                        "foto.jpg",
                        "image/jpeg",
                        new byte[] {1, 2, 3}
                )
        );

        assertEquals(
                "/api/v1/files/activos/" + stored.getId() + ".jpg",
                uploaded.urlImagen()
        );

        ActivoResponse cleared = service.deleteImagen(stored.getId());
        assertNull(cleared.urlImagen());
    }

    @Test
    void deleteRemovesImageFile() {
        Activo stored = existing("VEH-001");
        String url = "/api/v1/files/activos/" + stored.getId() + ".jpg";
        stored.setUrlImagen(url);
        activoRepository.items.add(stored);
        imageStorageService.storedUrls.add(url);

        service.delete(stored.getId());

        assertTrue(activoRepository.items.isEmpty());
        assertFalse(imageStorageService.storedUrls.contains(url));
    }

    private Activo existing(String codigo) {
        return existing(codigo, codigo);
    }

    private Activo existing(String codigo, String nombre) {
        return Activo.builder()
                .id(UUID.randomUUID())
                .codigo(codigo)
                .nombre(nombre)
                .tipoActivoId(tipoActivoId)
                .build();
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
        public Page<Activo> findByTipoActivoId(
                UUID tipoActivoId,
                Pageable pageable
        ) {
            List<Activo> filtered = items.stream()
                    .filter(item -> item.getTipoActivoId().equals(tipoActivoId))
                    .toList();
            return new PageImpl<>(filtered, pageable, filtered.size());
        }

        @Override
        public Page<Activo> searchByTipoActivoId(
                UUID tipoActivoId,
                String query,
                Pageable pageable
        ) {
            String q = query.toLowerCase();
            List<Activo> filtered = items.stream()
                    .filter(item -> item.getTipoActivoId().equals(tipoActivoId))
                    .filter(item ->
                            item.getCodigo().toLowerCase().contains(q)
                                    || item.getNombre().toLowerCase().contains(q)
                    )
                    .toList();
            return new PageImpl<>(filtered, pageable, filtered.size());
        }

        @Override
        public Page<Activo> search(String query, Pageable pageable) {
            String q = query.toLowerCase();
            List<Activo> filtered = items.stream()
                    .filter(item ->
                            item.getCodigo().toLowerCase().contains(q)
                                    || item.getNombre().toLowerCase().contains(q)
                    )
                    .toList();
            return new PageImpl<>(filtered, pageable, filtered.size());
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

    private static final class FakeImageStorageService
            implements ImageStorageService {

        private final Set<String> storedUrls = new HashSet<>();

        @Override
        public String store(String folder, UUID entityId, MultipartFile file) {
            String extension = "image/png".equals(file.getContentType())
                    ? "png"
                    : "jpg";
            String url = "/api/v1/files/" + folder + "/" + entityId + "." + extension;
            storedUrls.add(url);
            return url;
        }

        @Override
        public void delete(String publicUrl) {
            storedUrls.remove(publicUrl);
        }
    }
}
