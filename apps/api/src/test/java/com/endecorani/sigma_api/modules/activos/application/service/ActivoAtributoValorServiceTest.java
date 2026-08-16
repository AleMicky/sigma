package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.request.ActivoAtributoValorRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoAtributoValorResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAtributo;
import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAtributoValor;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.parametros.domain.model.TipoDato;
import com.endecorani.sigma_api.modules.parametros.domain.repository.TipoDatoRepository;
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
import tools.jackson.databind.json.JsonMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ActivoAtributoValorServiceTest {

    private InMemoryActivoAtributoValorRepository valorRepository;
    private InMemoryActivoRepository activoRepository;
    private InMemoryActivoAtributoRepository atributoRepository;
    private InMemoryTipoDatoRepository tipoDatoRepository;
    private ActivoAtributoValorService service;

    private UUID tipoActivoId;
    private UUID activoId;
    private UUID atributoTextoId;
    private UUID atributoSelectId;
    private UUID atributoRequeridoId;
    private UUID tipoDatoTextoId;
    private UUID tipoDatoSelectId;
    private UUID tipoDatoNumberId;

    @BeforeEach
    void setUp() {
        valorRepository = new InMemoryActivoAtributoValorRepository();
        activoRepository = new InMemoryActivoRepository();
        atributoRepository = new InMemoryActivoAtributoRepository();
        tipoDatoRepository = new InMemoryTipoDatoRepository();
        service = new ActivoAtributoValorService(
                valorRepository,
                activoRepository,
                atributoRepository,
                tipoDatoRepository,
                JsonMapper.builder().build()
        );

        tipoActivoId = UUID.randomUUID();

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
        TipoDato number = TipoDato.builder()
                .id(UUID.randomUUID())
                .codigo("NUMBER")
                .nombre("Número")
                .permiteOpciones(false)
                .build();
        tipoDatoRepository.items.add(texto);
        tipoDatoRepository.items.add(select);
        tipoDatoRepository.items.add(number);
        tipoDatoTextoId = texto.getId();
        tipoDatoSelectId = select.getId();
        tipoDatoNumberId = number.getId();

        Activo activo = Activo.builder()
                .id(UUID.randomUUID())
                .codigo("VEH-001")
                .nombre("Toyota")
                .tipoActivoId(tipoActivoId)
                .build();
        activoRepository.items.add(activo);
        activoId = activo.getId();

        ActivoAtributo atributoTexto = ActivoAtributo.builder()
                .id(UUID.randomUUID())
                .tipoActivoId(tipoActivoId)
                .codigo("PLACA")
                .etiqueta("Placa")
                .tipoDatoId(tipoDatoTextoId)
                .requerido(false)
                .build();
        ActivoAtributo atributoSelect = ActivoAtributo.builder()
                .id(UUID.randomUUID())
                .tipoActivoId(tipoActivoId)
                .codigo("COMBUSTIBLE")
                .etiqueta("Combustible")
                .tipoDatoId(tipoDatoSelectId)
                .requerido(false)
                .opciones("""
                        [{"value":"gasolina","label":"Gasolina"},{"value":"diesel","label":"Diésel"}]
                        """)
                .build();
        ActivoAtributo atributoRequerido = ActivoAtributo.builder()
                .id(UUID.randomUUID())
                .tipoActivoId(tipoActivoId)
                .codigo("SERIE")
                .etiqueta("Serie")
                .tipoDatoId(tipoDatoTextoId)
                .requerido(true)
                .build();
        atributoRepository.items.add(atributoTexto);
        atributoRepository.items.add(atributoSelect);
        atributoRepository.items.add(atributoRequerido);
        atributoTextoId = atributoTexto.getId();
        atributoSelectId = atributoSelect.getId();
        atributoRequeridoId = atributoRequerido.getId();
    }

    @Test
    void createNormalizesTextValue() {
        ActivoAtributoValorResponse response = service.create(
                new ActivoAtributoValorRequest(
                        activoId,
                        atributoTextoId,
                        "  ABC   123 "
                )
        );

        assertEquals(activoId, response.activoId());
        assertEquals(atributoTextoId, response.activoAtributoId());
        assertEquals("ABC 123", response.valor());
    }

    @Test
    void createAcceptsSelectOptionIgnoreCaseMatch() {
        ActivoAtributoValorResponse response = service.create(
                new ActivoAtributoValorRequest(
                        activoId,
                        atributoSelectId,
                        "GASOLINA"
                )
        );

        assertEquals("GASOLINA", response.valor());
    }

    @Test
    void createRejectsUnknownActivo() {
        assertThrows(
                ResourceNotFoundException.class,
                () -> service.create(
                        new ActivoAtributoValorRequest(
                                UUID.randomUUID(),
                                atributoTextoId,
                                "ABC"
                        )
                )
        );
    }

    @Test
    void createRejectsTipoActivoMismatch() {
        ActivoAtributo other = ActivoAtributo.builder()
                .id(UUID.randomUUID())
                .tipoActivoId(UUID.randomUUID())
                .codigo("OTHER")
                .etiqueta("Other")
                .tipoDatoId(tipoDatoTextoId)
                .requerido(false)
                .build();
        atributoRepository.items.add(other);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.create(
                        new ActivoAtributoValorRequest(
                                activoId,
                                other.getId(),
                                "x"
                        )
                )
        );

        assertEquals("ACTIVO_ATRIBUTO_TIPO_MISMATCH", exception.getCode());
    }

    @Test
    void createRejectsDuplicateActivoAtributoPair() {
        valorRepository.items.add(
                ActivoAtributoValor.builder()
                        .id(UUID.randomUUID())
                        .activoId(activoId)
                        .activoAtributoId(atributoTextoId)
                        .valor("OLD")
                        .build()
        );

        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> service.create(
                        new ActivoAtributoValorRequest(
                                activoId,
                                atributoTextoId,
                                "NEW"
                        )
                )
        );

        assertEquals("ACTIVO_ATRIBUTO_VALOR_ALREADY_EXISTS", exception.getCode());
    }

    @Test
    void createRejectsBlankWhenRequerido() {
        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.create(
                        new ActivoAtributoValorRequest(
                                activoId,
                                atributoRequeridoId,
                                "   "
                        )
                )
        );

        assertEquals("ACTIVO_ATRIBUTO_VALOR_REQUIRED", exception.getCode());
    }

    @Test
    void createRejectsInvalidNumber() {
        ActivoAtributo atributoNumber = ActivoAtributo.builder()
                .id(UUID.randomUUID())
                .tipoActivoId(tipoActivoId)
                .codigo("KM")
                .etiqueta("Kilometraje")
                .tipoDatoId(tipoDatoNumberId)
                .requerido(false)
                .build();
        atributoRepository.items.add(atributoNumber);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.create(
                        new ActivoAtributoValorRequest(
                                activoId,
                                atributoNumber.getId(),
                                "12.5"
                        )
                )
        );

        assertEquals("INVALID_ACTIVO_ATRIBUTO_VALOR", exception.getCode());
    }

    @Test
    void createRejectsInvalidSelectOption() {
        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.create(
                        new ActivoAtributoValorRequest(
                                activoId,
                                atributoSelectId,
                                "electrico"
                        )
                )
        );

        assertEquals("INVALID_ACTIVO_ATRIBUTO_VALOR", exception.getCode());
    }

    @Test
    void createAllowsNullWhenNotRequerido() {
        ActivoAtributoValorResponse response = service.create(
                new ActivoAtributoValorRequest(
                        activoId,
                        atributoTextoId,
                        null
                )
        );

        assertNull(response.valor());
    }

    @Test
    void updateChangesValor() {
        ActivoAtributoValor stored = ActivoAtributoValor.builder()
                .id(UUID.randomUUID())
                .activoId(activoId)
                .activoAtributoId(atributoTextoId)
                .valor("OLD")
                .build();
        valorRepository.items.add(stored);

        ActivoAtributoValorResponse response = service.update(
                stored.getId(),
                new ActivoAtributoValorRequest(
                        activoId,
                        atributoTextoId,
                        "  NEW   VALUE "
                )
        );

        assertEquals("NEW VALUE", response.valor());
    }

    @Test
    void findByActivoIdFilters() {
        UUID otherActivoId = UUID.randomUUID();
        activoRepository.items.add(
                Activo.builder()
                        .id(otherActivoId)
                        .codigo("VEH-002")
                        .nombre("Nissan")
                        .tipoActivoId(tipoActivoId)
                        .build()
        );

        valorRepository.items.add(
                ActivoAtributoValor.builder()
                        .id(UUID.randomUUID())
                        .activoId(activoId)
                        .activoAtributoId(atributoTextoId)
                        .valor("A")
                        .build()
        );
        valorRepository.items.add(
                ActivoAtributoValor.builder()
                        .id(UUID.randomUUID())
                        .activoId(otherActivoId)
                        .activoAtributoId(atributoTextoId)
                        .valor("B")
                        .build()
        );

        PageResponse<ActivoAtributoValorResponse> page = service.findByActivoId(
                activoId,
                new PageRequestDto(0, 10, "id", null)
        );

        assertEquals(1, page.content().size());
        assertEquals("A", page.content().getFirst().valor());
    }

    @Test
    void deleteRemovesValor() {
        ActivoAtributoValor stored = ActivoAtributoValor.builder()
                .id(UUID.randomUUID())
                .activoId(activoId)
                .activoAtributoId(atributoTextoId)
                .valor("X")
                .build();
        valorRepository.items.add(stored);

        service.delete(stored.getId());

        assertTrue(valorRepository.items.isEmpty());
    }

    private static final class InMemoryActivoAtributoValorRepository
            implements ActivoAtributoValorRepository {

        private final List<ActivoAtributoValor> items = new ArrayList<>();

        @Override
        public ActivoAtributoValor save(ActivoAtributoValor entity) {
            if (entity.getId() == null) {
                entity.setId(UUID.randomUUID());
            }
            items.removeIf(item -> item.getId().equals(entity.getId()));
            items.add(entity);
            return entity;
        }

        @Override
        public Optional<ActivoAtributoValor> findById(UUID id) {
            return items.stream()
                    .filter(item -> item.getId().equals(id))
                    .findFirst();
        }

        @Override
        public List<ActivoAtributoValor> findAll() {
            return List.copyOf(items);
        }

        @Override
        public Page<ActivoAtributoValor> findAll(Pageable pageable) {
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
        public Page<ActivoAtributoValor> findByActivoId(
                UUID activoId,
                Pageable pageable
        ) {
            List<ActivoAtributoValor> filtered = items.stream()
                    .filter(item -> item.getActivoId().equals(activoId))
                    .toList();
            return new PageImpl<>(filtered, pageable, filtered.size());
        }

        @Override
        public boolean existsByActivoIdAndActivoAtributoId(
                UUID activoId,
                UUID activoAtributoId
        ) {
            return items.stream().anyMatch(item ->
                    item.getActivoId().equals(activoId)
                            && item.getActivoAtributoId().equals(activoAtributoId)
            );
        }

        @Override
        public boolean existsByActivoIdAndActivoAtributoIdAndIdNot(
                UUID activoId,
                UUID activoAtributoId,
                UUID id
        ) {
            return items.stream().anyMatch(item ->
                    !item.getId().equals(id)
                            && item.getActivoId().equals(activoId)
                            && item.getActivoAtributoId().equals(activoAtributoId)
            );
        }
    }

    private static final class InMemoryActivoRepository implements ActivoRepository {

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
            return Page.empty(pageable);
        }

        @Override
        public Page<Activo> searchByTipoActivoId(
                UUID tipoActivoId,
                String query,
                Pageable pageable
        ) {
            return Page.empty(pageable);
        }

        @Override
        public Page<Activo> search(String query, Pageable pageable) {
            return Page.empty(pageable);
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
            return Page.empty(pageable);
        }

        @Override
        public Page<ActivoAtributo> searchByTipoActivoId(
                UUID tipoActivoId,
                String query,
                Pageable pageable
        ) {
            return Page.empty(pageable);
        }

        @Override
        public boolean existsByTipoActivoIdAndCodigoIgnoreCase(
                UUID tipoActivoId,
                String codigo
        ) {
            return false;
        }

        @Override
        public boolean existsByTipoActivoIdAndCodigoIgnoreCaseAndIdNot(
                UUID tipoActivoId,
                String codigo,
                UUID id
        ) {
            return false;
        }

        @Override
        public Integer findMaxOrdenByTipoActivoId(UUID tipoActivoId) {
            return null;
        }

        @Override
        public boolean existsByTipoActivoIdAndOrden(
                UUID tipoActivoId,
                Integer orden
        ) {
            return false;
        }

        @Override
        public boolean existsByTipoActivoIdAndOrdenAndIdNot(
                UUID tipoActivoId,
                Integer orden,
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
            if (entity.getId() == null) {
                entity.setId(UUID.randomUUID());
            }
            items.removeIf(item -> item.getId().equals(entity.getId()));
            items.add(entity);
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
        public boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id) {
            return false;
        }

        @Override
        public Page<TipoDato> search(String query, Pageable pageable) {
            return Page.empty(pageable);
        }
    }
}
