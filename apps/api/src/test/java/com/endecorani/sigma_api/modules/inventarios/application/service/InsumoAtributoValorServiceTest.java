package com.endecorani.sigma_api.modules.inventarios.application.service;

import com.endecorani.sigma_api.modules.inventarios.application.dto.request.InsumoAtributoValorRequest;
import com.endecorani.sigma_api.modules.inventarios.application.dto.response.InsumoAtributoValorResponse;
import com.endecorani.sigma_api.modules.inventarios.domain.model.Insumo;
import com.endecorani.sigma_api.modules.inventarios.domain.model.InsumoAtributoValor;
import com.endecorani.sigma_api.modules.inventarios.domain.model.TipoInsumoAtributo;
import com.endecorani.sigma_api.modules.inventarios.domain.repository.InsumoAtributoValorRepository;
import com.endecorani.sigma_api.modules.inventarios.domain.repository.InsumoRepository;
import com.endecorani.sigma_api.modules.inventarios.domain.repository.TipoInsumoAtributoRepository;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class InsumoAtributoValorServiceTest {

    private InMemoryInsumoAtributoValorRepository valorRepository;
    private InMemoryInsumoRepository insumoRepository;
    private InMemoryTipoInsumoAtributoRepository atributoRepository;
    private InMemoryTipoDatoRepository tipoDatoRepository;
    private InsumoAtributoValorService service;

    private UUID insumoId;
    private UUID atributoTextoId;
    private UUID atributoRequeridoId;
    private UUID atributoNumberId;
    private UUID tipoDatoTextoId;
    private UUID tipoDatoNumberId;

    @BeforeEach
    void setUp() {
        valorRepository = new InMemoryInsumoAtributoValorRepository();
        insumoRepository = new InMemoryInsumoRepository();
        atributoRepository = new InMemoryTipoInsumoAtributoRepository();
        tipoDatoRepository = new InMemoryTipoDatoRepository();
        service = new InsumoAtributoValorService(
                valorRepository,
                insumoRepository,
                atributoRepository,
                tipoDatoRepository
        );

        TipoDato texto = TipoDato.builder()
                .id(UUID.randomUUID())
                .codigo("TEXT")
                .nombre("Texto")
                .permiteOpciones(false)
                .build();
        TipoDato number = TipoDato.builder()
                .id(UUID.randomUUID())
                .codigo("NUMBER")
                .nombre("Número")
                .permiteOpciones(false)
                .build();
        tipoDatoRepository.items.add(texto);
        tipoDatoRepository.items.add(number);
        tipoDatoTextoId = texto.getId();
        tipoDatoNumberId = number.getId();

        Insumo insumo = Insumo.builder()
                .id(UUID.randomUUID())
                .codigo("INS-001")
                .nombre("Tornillo")
                .build();
        insumoRepository.items.add(insumo);
        insumoId = insumo.getId();

        TipoInsumoAtributo atributoTexto = TipoInsumoAtributo.builder()
                .id(UUID.randomUUID())
                .codigo("MARCA")
                .nombre("Marca")
                .tipoDatoId(tipoDatoTextoId)
                .requerido(false)
                .build();
        TipoInsumoAtributo atributoRequerido = TipoInsumoAtributo.builder()
                .id(UUID.randomUUID())
                .codigo("SERIE")
                .nombre("Serie")
                .tipoDatoId(tipoDatoTextoId)
                .requerido(true)
                .build();
        TipoInsumoAtributo atributoNumber = TipoInsumoAtributo.builder()
                .id(UUID.randomUUID())
                .codigo("CANTIDAD")
                .nombre("Cantidad")
                .tipoDatoId(tipoDatoNumberId)
                .requerido(false)
                .build();
        atributoRepository.items.add(atributoTexto);
        atributoRepository.items.add(atributoRequerido);
        atributoRepository.items.add(atributoNumber);
        atributoTextoId = atributoTexto.getId();
        atributoRequeridoId = atributoRequerido.getId();
        atributoNumberId = atributoNumber.getId();
    }

    @Test
    void createNormalizesTextValue() {
        InsumoAtributoValorResponse response = service.create(
                new InsumoAtributoValorRequest(
                        insumoId,
                        atributoTextoId,
                        "  ABC   123 "
                )
        );

        assertEquals(insumoId, response.insumoId());
        assertEquals(atributoTextoId, response.tipoInsumoAtributoId());
        assertEquals("ABC 123", response.valor());
    }

    @Test
    void createRejectsUnknownInsumo() {
        assertThrows(
                ResourceNotFoundException.class,
                () -> service.create(
                        new InsumoAtributoValorRequest(
                                UUID.randomUUID(),
                                atributoTextoId,
                                "ABC"
                        )
                )
        );
    }

    @Test
    void createRejectsUnknownAtributo() {
        assertThrows(
                ResourceNotFoundException.class,
                () -> service.create(
                        new InsumoAtributoValorRequest(
                                insumoId,
                                UUID.randomUUID(),
                                "ABC"
                        )
                )
        );
    }

    @Test
    void createRejectsDuplicatePair() {
        valorRepository.items.add(
                InsumoAtributoValor.builder()
                        .id(UUID.randomUUID())
                        .insumoId(insumoId)
                        .tipoInsumoAtributoId(atributoTextoId)
                        .valor("OLD")
                        .build()
        );

        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> service.create(
                        new InsumoAtributoValorRequest(
                                insumoId,
                                atributoTextoId,
                                "NEW"
                        )
                )
        );

        assertEquals("INSUMO_ATRIBUTO_VALOR_ALREADY_EXISTS", exception.getCode());
    }

    @Test
    void createRejectsBlankWhenRequerido() {
        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.create(
                        new InsumoAtributoValorRequest(
                                insumoId,
                                atributoRequeridoId,
                                "   "
                        )
                )
        );

        assertEquals("INSUMO_ATRIBUTO_VALOR_REQUIRED", exception.getCode());
    }

    @Test
    void createRejectsInvalidNumber() {
        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.create(
                        new InsumoAtributoValorRequest(
                                insumoId,
                                atributoNumberId,
                                "12.5"
                        )
                )
        );

        assertEquals("INVALID_INSUMO_ATRIBUTO_VALOR", exception.getCode());
    }

    @Test
    void createAllowsNullWhenNotRequerido() {
        InsumoAtributoValorResponse response = service.create(
                new InsumoAtributoValorRequest(
                        insumoId,
                        atributoTextoId,
                        null
                )
        );

        assertNull(response.valor());
    }

    @Test
    void updateChangesValor() {
        InsumoAtributoValor stored = InsumoAtributoValor.builder()
                .id(UUID.randomUUID())
                .insumoId(insumoId)
                .tipoInsumoAtributoId(atributoTextoId)
                .valor("OLD")
                .build();
        valorRepository.items.add(stored);

        InsumoAtributoValorResponse response = service.update(
                stored.getId(),
                new InsumoAtributoValorRequest(
                        insumoId,
                        atributoTextoId,
                        "  NEW   VALUE "
                )
        );

        assertEquals("NEW VALUE", response.valor());
    }

    @Test
    void findByInsumoIdFilters() {
        UUID otherInsumoId = UUID.randomUUID();
        insumoRepository.items.add(
                Insumo.builder()
                        .id(otherInsumoId)
                        .codigo("INS-002")
                        .nombre("Clavo")
                        .build()
        );

        valorRepository.items.add(
                InsumoAtributoValor.builder()
                        .id(UUID.randomUUID())
                        .insumoId(insumoId)
                        .tipoInsumoAtributoId(atributoTextoId)
                        .valor("A")
                        .build()
        );
        valorRepository.items.add(
                InsumoAtributoValor.builder()
                        .id(UUID.randomUUID())
                        .insumoId(otherInsumoId)
                        .tipoInsumoAtributoId(atributoTextoId)
                        .valor("B")
                        .build()
        );

        PageResponse<InsumoAtributoValorResponse> page = service.findByInsumoId(
                insumoId,
                new PageRequestDto(0, 10, "id", null)
        );

        assertEquals(1, page.content().size());
        assertEquals("A", page.content().getFirst().valor());
    }

    @Test
    void deleteRemovesValor() {
        InsumoAtributoValor stored = InsumoAtributoValor.builder()
                .id(UUID.randomUUID())
                .insumoId(insumoId)
                .tipoInsumoAtributoId(atributoTextoId)
                .valor("X")
                .build();
        valorRepository.items.add(stored);

        service.delete(stored.getId());

        assertTrue(valorRepository.items.isEmpty());
    }

    private static final class InMemoryInsumoAtributoValorRepository
            implements InsumoAtributoValorRepository {

        private final List<InsumoAtributoValor> items = new ArrayList<>();

        @Override
        public InsumoAtributoValor save(InsumoAtributoValor entity) {
            if (entity.getId() == null) {
                entity.setId(UUID.randomUUID());
            }
            items.removeIf(item -> item.getId().equals(entity.getId()));
            items.add(entity);
            return entity;
        }

        @Override
        public Optional<InsumoAtributoValor> findById(UUID id) {
            return items.stream()
                    .filter(item -> item.getId().equals(id))
                    .findFirst();
        }

        @Override
        public List<InsumoAtributoValor> findAll() {
            return List.copyOf(items);
        }

        @Override
        public Page<InsumoAtributoValor> findAll(Pageable pageable) {
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
        public Page<InsumoAtributoValor> findByInsumoId(
                UUID insumoId,
                Pageable pageable
        ) {
            List<InsumoAtributoValor> filtered = items.stream()
                    .filter(item -> item.getInsumoId().equals(insumoId))
                    .toList();
            return new PageImpl<>(filtered, pageable, filtered.size());
        }

        @Override
        public boolean existsByInsumoIdAndTipoInsumoAtributoId(
                UUID insumoId,
                UUID tipoInsumoAtributoId
        ) {
            return items.stream().anyMatch(item ->
                    item.getInsumoId().equals(insumoId)
                            && item.getTipoInsumoAtributoId()
                            .equals(tipoInsumoAtributoId)
            );
        }

        @Override
        public boolean existsByInsumoIdAndTipoInsumoAtributoIdAndIdNot(
                UUID insumoId,
                UUID tipoInsumoAtributoId,
                UUID id
        ) {
            return items.stream().anyMatch(item ->
                    !item.getId().equals(id)
                            && item.getInsumoId().equals(insumoId)
                            && item.getTipoInsumoAtributoId()
                            .equals(tipoInsumoAtributoId)
            );
        }
    }

    private static final class InMemoryInsumoRepository
            implements InsumoRepository {

        private final List<Insumo> items = new ArrayList<>();

        @Override
        public Insumo save(Insumo entity) {
            if (entity.getId() == null) {
                entity.setId(UUID.randomUUID());
            }
            items.removeIf(item -> item.getId().equals(entity.getId()));
            items.add(entity);
            return entity;
        }

        @Override
        public Optional<Insumo> findById(UUID id) {
            return items.stream()
                    .filter(item -> item.getId().equals(id))
                    .findFirst();
        }

        @Override
        public List<Insumo> findAll() {
            return List.copyOf(items);
        }

        @Override
        public Page<Insumo> findAll(Pageable pageable) {
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
    }

    private static final class InMemoryTipoInsumoAtributoRepository
            implements TipoInsumoAtributoRepository {

        private final List<TipoInsumoAtributo> items = new ArrayList<>();

        @Override
        public TipoInsumoAtributo save(TipoInsumoAtributo entity) {
            if (entity.getId() == null) {
                entity.setId(UUID.randomUUID());
            }
            items.removeIf(item -> item.getId().equals(entity.getId()));
            items.add(entity);
            return entity;
        }

        @Override
        public Optional<TipoInsumoAtributo> findById(UUID id) {
            return items.stream()
                    .filter(item -> item.getId().equals(id))
                    .findFirst();
        }

        @Override
        public List<TipoInsumoAtributo> findAll() {
            return List.copyOf(items);
        }

        @Override
        public Page<TipoInsumoAtributo> findAll(Pageable pageable) {
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
        public Page<TipoInsumoAtributo> findByTipoInsumoId(
                UUID tipoInsumoId,
                Pageable pageable
        ) {
            return Page.empty(pageable);
        }

        @Override
        public Page<TipoInsumoAtributo> searchByTipoInsumoId(
                UUID tipoInsumoId,
                String query,
                Pageable pageable
        ) {
            return Page.empty(pageable);
        }

        @Override
        public boolean existsByTipoInsumoIdAndCodigoIgnoreCase(
                UUID tipoInsumoId,
                String codigo
        ) {
            return false;
        }

        @Override
        public boolean existsByTipoInsumoIdAndCodigoIgnoreCaseAndIdNot(
                UUID tipoInsumoId,
                String codigo,
                UUID id
        ) {
            return false;
        }

        @Override
        public Integer findMaxOrdenByTipoInsumoId(UUID tipoInsumoId) {
            return null;
        }

        @Override
        public boolean existsByTipoInsumoIdAndOrden(
                UUID tipoInsumoId,
                Integer orden
        ) {
            return false;
        }

        @Override
        public boolean existsByTipoInsumoIdAndOrdenAndIdNot(
                UUID tipoInsumoId,
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
