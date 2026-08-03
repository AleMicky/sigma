package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.ActivoAtributoOpcionDto;
import com.endecorani.sigma_api.modules.activos.application.dto.ActivoAtributoRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.ActivoAtributoResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAtributo;
import com.endecorani.sigma_api.modules.activos.domain.model.TipoActivo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.modules.parametros.domain.model.TipoDato;
import com.endecorani.sigma_api.modules.parametros.domain.repository.TipoDatoRepository;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import tools.jackson.databind.json.JsonMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ActivoAtributoServiceTest {

    private InMemoryActivoAtributoRepository atributoRepository;
    private InMemoryTipoActivoRepository tipoActivoRepository;
    private InMemoryTipoDatoRepository tipoDatoRepository;
    private ActivoAtributoService service;

    private UUID tipoActivoId;
    private UUID tipoDatoTextoId;
    private UUID tipoDatoSelectId;

    @BeforeEach
    void setUp() {
        atributoRepository = new InMemoryActivoAtributoRepository();
        tipoActivoRepository = new InMemoryTipoActivoRepository();
        tipoDatoRepository = new InMemoryTipoDatoRepository();
        service = new ActivoAtributoService(
                atributoRepository,
                tipoActivoRepository,
                tipoDatoRepository,
                JsonMapper.builder().build()
        );

        TipoActivo tipoActivo = TipoActivo.builder()
                .id(UUID.randomUUID())
                .nombre("Vehículo")
                .build();
        tipoActivoRepository.items.add(tipoActivo);
        tipoActivoId = tipoActivo.getId();

        TipoDato texto = TipoDato.builder()
                .id(UUID.randomUUID())
                .codigo("TEXT")
                .nombre("Texto")
                .permiteOpciones(false)
                .build();
        TipoDato select = TipoDato.builder()
                .id(UUID.randomUUID())
                .codigo("SELECT")
                .nombre("Selección")
                .permiteOpciones(true)
                .build();
        tipoDatoRepository.items.add(texto);
        tipoDatoRepository.items.add(select);
        tipoDatoTextoId = texto.getId();
        tipoDatoSelectId = select.getId();
    }

    @Test
    void createNormalizesFieldsAndDefaultsAndAutoIncrementsOrden() {
        ActivoAtributoResponse first = service.create(
                new ActivoAtributoRequest(
                        tipoActivoId,
                        "  placa   vehiculo ",
                        "  Número   de placa ",
                        "  Desc  ",
                        tipoDatoTextoId,
                        null,
                        null,
                        null,
                        null,
                        "  ABC-123 ",
                        null
                )
        );
        ActivoAtributoResponse second = service.create(
                new ActivoAtributoRequest(
                        tipoActivoId,
                        "MARCA",
                        "Marca",
                        null,
                        tipoDatoTextoId,
                        null,
                        true,
                        false,
                        false,
                        null,
                        null
                )
        );

        assertEquals("placa vehiculo", first.codigo());
        assertEquals("Número de placa", first.etiqueta());
        assertEquals("Desc", first.descripcion());
        assertEquals("ABC-123", first.valorDefecto());
        assertEquals(0, first.orden());
        assertFalse(first.requerido());
        assertTrue(first.visible());
        assertTrue(first.editable());
        assertNull(first.opciones());

        assertEquals(1, second.orden());
        assertTrue(second.requerido());
        assertFalse(second.visible());
        assertFalse(second.editable());
        assertEquals(2, atributoRepository.items.size());
    }

    @Test
    void createStoresOpcionesAsJsonForSelect() {
        ActivoAtributoResponse response = service.create(
                selectRequest(
                        List.of(
                                new ActivoAtributoOpcionDto("  gasolina ", "  Gasolina "),
                                new ActivoAtributoOpcionDto("DIESEL", "Diésel")
                        )
                )
        );

        assertEquals(2, response.opciones().size());
        assertEquals("gasolina", response.opciones().get(0).value());
        assertEquals("Gasolina", response.opciones().get(0).label());
        assertTrue(
                atributoRepository.items.getFirst().getOpciones().contains("\"value\":\"gasolina\"")
        );
    }

    @Test
    void createRejectsOpcionesWhenTipoDatoDoesNotAllowThem() {
        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.create(
                        new ActivoAtributoRequest(
                                tipoActivoId,
                                "PLACA",
                                "Placa",
                                null,
                                tipoDatoTextoId,
                                null,
                                null,
                                null,
                                null,
                                null,
                                List.of(new ActivoAtributoOpcionDto("A", "A"))
                        )
                )
        );

        assertEquals("ACTIVO_ATRIBUTO_OPCIONES_NOT_ALLOWED", exception.getCode());
    }

    @Test
    void createRequiresOpcionesForSelect() {
        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.create(selectRequest(null))
        );

        assertEquals("ACTIVO_ATRIBUTO_OPCIONES_REQUIRED", exception.getCode());
    }

    @Test
    void createRejectsDuplicateOpcionValueIgnoreCase() {
        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.create(
                        selectRequest(
                                List.of(
                                        new ActivoAtributoOpcionDto("GAS", "Gasolina"),
                                        new ActivoAtributoOpcionDto("gas", "Gas")
                                )
                        )
                )
        );

        assertEquals("ACTIVO_ATRIBUTO_OPCION_DUPLICATED", exception.getCode());
    }

    @Test
    void createRejectsDuplicateCodigoInSameTipoActivo() {
        atributoRepository.items.add(
                existing(tipoActivoId, "PLACA", 0)
        );

        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> service.create(
                        new ActivoAtributoRequest(
                                tipoActivoId,
                                "placa",
                                "Placa",
                                null,
                                tipoDatoTextoId,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null
                        )
                )
        );

        assertEquals("ACTIVO_ATRIBUTO_ALREADY_EXISTS", exception.getCode());
    }

    @Test
    void createRejectsMissingTipoActivo() {
        assertThrows(
                ResourceNotFoundException.class,
                () -> service.create(
                        new ActivoAtributoRequest(
                                UUID.randomUUID(),
                                "PLACA",
                                "Placa",
                                null,
                                tipoDatoTextoId,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null
                        )
                )
        );
    }

    @Test
    void updateClearsOptionalFieldsWhenNull() {
        ActivoAtributo stored = existing(tipoActivoId, "PLACA", 0);
        stored.setDescripcion("Anterior");
        stored.setValorDefecto("XYZ");
        atributoRepository.items.add(stored);

        ActivoAtributoResponse response = service.update(
                stored.getId(),
                new ActivoAtributoRequest(
                        tipoActivoId,
                        "PLACA",
                        "Placa",
                        null,
                        tipoDatoTextoId,
                        0,
                        null,
                        null,
                        null,
                        null,
                        null
                )
        );

        assertNull(response.descripcion());
        assertNull(response.valorDefecto());
        assertNull(response.opciones());
    }

    private ActivoAtributoRequest selectRequest(
            List<ActivoAtributoOpcionDto> opciones
    ) {
        return new ActivoAtributoRequest(
                tipoActivoId,
                "TIPO_COMBUSTIBLE",
                "Tipo de combustible",
                null,
                tipoDatoSelectId,
                null,
                null,
                null,
                null,
                null,
                opciones
        );
    }

    private static ActivoAtributo existing(
            UUID tipoActivoId,
            String codigo,
            int orden
    ) {
        return ActivoAtributo.builder()
                .id(UUID.randomUUID())
                .tipoActivoId(tipoActivoId)
                .codigo(codigo)
                .etiqueta(codigo)
                .orden(orden)
                .requerido(false)
                .visible(true)
                .editable(true)
                .build();
    }

    private static final class InMemoryActivoAtributoRepository
            implements ActivoAtributoRepository {

        private final List<ActivoAtributo> items = new ArrayList<>();

        @Override
        public ActivoAtributo save(ActivoAtributo entity) {
            if (entity.getId() == null) {
                entity.setId(UUID.randomUUID());
            }
            items.removeIf(item -> item.getId().equals(entity.getId()));
            items.add(entity);
            return entity;
        }

        @Override
        public Optional<ActivoAtributo> findById(UUID id) {
            return items.stream()
                    .filter(item -> item.getId().equals(id))
                    .findFirst();
        }

        @Override
        public List<ActivoAtributo> findAll() {
            return List.copyOf(items);
        }

        @Override
        public Page<ActivoAtributo> findAll(Pageable pageable) {
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
        public Page<ActivoAtributo> findByTipoActivoId(
                UUID tipoActivoId,
                Pageable pageable
        ) {
            List<ActivoAtributo> filtered = items.stream()
                    .filter(item -> item.getTipoActivoId().equals(tipoActivoId))
                    .toList();
            return new PageImpl<>(filtered, pageable, filtered.size());
        }

        @Override
        public Page<ActivoAtributo> searchByTipoActivoId(
                UUID tipoActivoId,
                String query,
                Pageable pageable
        ) {
            String lower = query.toLowerCase();
            List<ActivoAtributo> filtered = items.stream()
                    .filter(item -> item.getTipoActivoId().equals(tipoActivoId))
                    .filter(item ->
                            item.getCodigo().toLowerCase().contains(lower)
                                    || item.getEtiqueta().toLowerCase().contains(lower)
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

        @Override
        public Integer findMaxOrdenByTipoActivoId(UUID tipoActivoId) {
            return items.stream()
                    .filter(item -> item.getTipoActivoId().equals(tipoActivoId))
                    .map(ActivoAtributo::getOrden)
                    .max(Integer::compareTo)
                    .orElse(null);
        }

        @Override
        public boolean existsByTipoActivoIdAndOrden(
                UUID tipoActivoId,
                Integer orden
        ) {
            return items.stream().anyMatch(item ->
                    item.getTipoActivoId().equals(tipoActivoId)
                            && orden.equals(item.getOrden())
            );
        }

        @Override
        public boolean existsByTipoActivoIdAndOrdenAndIdNot(
                UUID tipoActivoId,
                Integer orden,
                UUID id
        ) {
            return items.stream().anyMatch(item ->
                    !item.getId().equals(id)
                            && item.getTipoActivoId().equals(tipoActivoId)
                            && orden.equals(item.getOrden())
            );
        }
    }

    private static final class InMemoryTipoActivoRepository
            implements TipoActivoRepository {

        private final List<TipoActivo> items = new ArrayList<>();

        @Override
        public TipoActivo save(TipoActivo entity) {
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
            return false;
        }

        @Override
        public boolean existsByNombreIgnoreCaseAndIdNot(
                String nombre,
                UUID id
        ) {
            return false;
        }
    }

    private static final class InMemoryTipoDatoRepository
            implements TipoDatoRepository {

        private final List<TipoDato> items = new ArrayList<>();

        @Override
        public TipoDato save(TipoDato entity) {
            return entity;
        }

        @Override
        public Optional<TipoDato> findById(UUID id) {
            return items.stream()
                    .filter(item -> item.getId().equals(id))
                    .findFirst();
        }

        @Override
        public List<TipoDato> findAll() {
            return List.copyOf(items);
        }

        @Override
        public Page<TipoDato> findAll(Pageable pageable) {
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
        public Page<TipoDato> search(String query, Pageable pageable) {
            return Page.empty(pageable);
        }
    }
}
