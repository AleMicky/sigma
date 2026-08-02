package com.endecorani.sigma_api.modules.parametros.application.service;

import com.endecorani.sigma_api.modules.parametros.application.dto.GestionRequest;
import com.endecorani.sigma_api.modules.parametros.application.dto.GestionResponse;
import com.endecorani.sigma_api.modules.parametros.domain.model.Gestion;
import com.endecorani.sigma_api.modules.parametros.domain.model.Periodo;
import com.endecorani.sigma_api.modules.parametros.domain.repository.GestionRepository;
import com.endecorani.sigma_api.modules.parametros.domain.repository.PeriodoRepository;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GestionServiceTest {

    private InMemoryGestionRepository gestionRepository;
    private InMemoryPeriodoRepository periodoRepository;
    private GestionService service;

    @BeforeEach
    void setUp() {
        gestionRepository = new InMemoryGestionRepository();
        periodoRepository = new InMemoryPeriodoRepository();
        service = new GestionService(gestionRepository, periodoRepository);
    }

    @Test
    void createPersistsGestionAndGeneratesTwelvePeriodos() {
        GestionResponse response = service.create(
                new GestionRequest(
                        2026,
                        LocalDate.of(2026, 1, 1),
                        LocalDate.of(2026, 12, 31)
                )
        );

        assertEquals(2026, response.gestion());
        assertEquals(1, gestionRepository.items.size());
        assertEquals(12, periodoRepository.items.size());

        List<Periodo> periodos = periodoRepository.items.stream()
                .sorted(Comparator.comparing(Periodo::getPeriodo))
                .toList();

        assertEquals(1, periodos.getFirst().getPeriodo());
        assertEquals("Enero", periodos.getFirst().getLiteral());
        assertEquals(LocalDate.of(2026, 1, 1), periodos.getFirst().getFechaInicio());
        assertEquals(LocalDate.of(2026, 1, 31), periodos.getFirst().getFechaFin());

        assertEquals(12, periodos.get(11).getPeriodo());
        assertEquals("Diciembre", periodos.get(11).getLiteral());
        assertEquals(LocalDate.of(2026, 12, 1), periodos.get(11).getFechaInicio());
        assertEquals(LocalDate.of(2026, 12, 31), periodos.get(11).getFechaFin());

        assertTrue(
                periodos.stream().allMatch(periodo ->
                        periodo.getGestionId().equals(response.id())
                )
        );
    }

    @Test
    void createRejectsDuplicateGestion() {
        gestionRepository.items.add(existing(2026));

        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> service.create(
                        new GestionRequest(
                                2026,
                                LocalDate.of(2026, 1, 1),
                                LocalDate.of(2026, 12, 31)
                        )
                )
        );

        assertEquals("GESTION_ALREADY_EXISTS", exception.getCode());
        assertTrue(periodoRepository.items.isEmpty());
    }

    @Test
    void createRejectsInvalidDateRange() {
        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.create(
                        new GestionRequest(
                                2026,
                                LocalDate.of(2026, 12, 31),
                                LocalDate.of(2026, 1, 1)
                        )
                )
        );

        assertEquals("INVALID_GESTION_FECHAS", exception.getCode());
        assertTrue(gestionRepository.items.isEmpty());
        assertTrue(periodoRepository.items.isEmpty());
    }

    @Test
    void updateAllowsSameGestionOnSameRecord() {
        Gestion stored = existing(2026);
        gestionRepository.items.add(stored);

        GestionResponse response = service.update(
                stored.getId(),
                new GestionRequest(
                        2026,
                        LocalDate.of(2026, 1, 1),
                        LocalDate.of(2026, 12, 30)
                )
        );

        assertEquals(2026, response.gestion());
        assertEquals(LocalDate.of(2026, 12, 30), response.fechaFin());
    }

    private static Gestion existing(Integer gestion) {
        return Gestion.builder()
                .id(UUID.randomUUID())
                .gestion(gestion)
                .fechaInicio(LocalDate.of(gestion, 1, 1))
                .fechaFin(LocalDate.of(gestion, 12, 31))
                .build();
    }

    private static final class InMemoryGestionRepository
            implements GestionRepository {

        private final List<Gestion> items = new ArrayList<>();

        @Override
        public Gestion save(Gestion entity) {
            if (entity.getId() == null) {
                entity.setId(UUID.randomUUID());
            }
            items.removeIf(item -> item.getId().equals(entity.getId()));
            items.add(entity);
            return entity;
        }

        @Override
        public Optional<Gestion> findById(UUID id) {
            return items.stream()
                    .filter(item -> item.getId().equals(id))
                    .findFirst();
        }

        @Override
        public List<Gestion> findAll() {
            return List.copyOf(items);
        }

        @Override
        public Page<Gestion> findAll(Pageable pageable) {
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
        public boolean existsByGestion(Integer gestion) {
            return items.stream().anyMatch(item ->
                    item.getGestion().equals(gestion)
            );
        }

        @Override
        public boolean existsByGestionAndIdNot(
                Integer gestion,
                UUID id
        ) {
            return items.stream().anyMatch(item ->
                    !item.getId().equals(id)
                            && item.getGestion().equals(gestion)
            );
        }

        @Override
        public Page<Gestion> findByGestion(
                Integer gestion,
                Pageable pageable
        ) {
            List<Gestion> filtered = items.stream()
                    .filter(item -> item.getGestion().equals(gestion))
                    .toList();
            return new PageImpl<>(filtered, pageable, filtered.size());
        }
    }

    private static final class InMemoryPeriodoRepository
            implements PeriodoRepository {

        private final List<Periodo> items = new ArrayList<>();

        @Override
        public Periodo save(Periodo entity) {
            if (entity.getId() == null) {
                entity.setId(UUID.randomUUID());
            }
            items.removeIf(item -> item.getId().equals(entity.getId()));
            items.add(entity);
            return entity;
        }

        @Override
        public List<Periodo> saveAll(List<Periodo> periodos) {
            return periodos.stream().map(this::save).toList();
        }

        @Override
        public Optional<Periodo> findById(UUID id) {
            return items.stream()
                    .filter(item -> item.getId().equals(id))
                    .findFirst();
        }

        @Override
        public List<Periodo> findAll() {
            return List.copyOf(items);
        }

        @Override
        public Page<Periodo> findAll(Pageable pageable) {
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
        public Page<Periodo> findByGestionId(
                UUID gestionId,
                Pageable pageable
        ) {
            List<Periodo> filtered = items.stream()
                    .filter(item -> item.getGestionId().equals(gestionId))
                    .toList();
            return new PageImpl<>(filtered, pageable, filtered.size());
        }

        @Override
        public List<Periodo> findAllByGestionId(UUID gestionId) {
            return items.stream()
                    .filter(item -> item.getGestionId().equals(gestionId))
                    .sorted(Comparator.comparing(Periodo::getPeriodo))
                    .toList();
        }
    }
}
