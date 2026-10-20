package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ProgramacionMantenimientoCriterioRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ProgramacionMantenimientoCriterioUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ProgramacionMantenimientoCriterioMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimientoActivo;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimientoCriterio;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PlanMantenimientoActivoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ProgramacionMantenimientoCriterioRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ProgramacionMantenimientoRepository;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProgramacionMantenimientoCriterioServiceTest {

    @Mock
    private ProgramacionMantenimientoCriterioRepository repository;

    @Mock
    private ProgramacionMantenimientoRepository programacionRepository;

    @Mock
    private PlanMantenimientoActivoRepository planMantenimientoActivoRepository;

    @Mock
    private ActivoRepository activoRepository;

    @Mock
    private SpringActivoAtributoRepository springActivoAtributoRepository;

    @Mock
    private ProgramacionMantenimientoCriterioMapper mapper;

    @InjectMocks
    private ProgramacionMantenimientoCriterioService service;

    private UUID programacionId;
    private UUID criterionId;
    private UUID planMantenimientoActivoId;
    private UUID activoId;
    private UUID tipoActivoId;
    private ProgramacionMantenimiento programacion;
    private PlanMantenimientoActivo planActivo;
    private Activo activo;
    private ProgramacionMantenimientoCriterio criterion;

    @BeforeEach
    void setUp() {
        programacionId = UUID.randomUUID();
        criterionId = UUID.randomUUID();
        planMantenimientoActivoId = UUID.randomUUID();
        activoId = UUID.randomUUID();
        tipoActivoId = UUID.randomUUID();

        programacion = ProgramacionMantenimiento.builder()
                .id(programacionId)
                .planMantenimientoActivoId(planMantenimientoActivoId)
                .activo(true)
                .build();

        planActivo = PlanMantenimientoActivo.builder()
                .id(planMantenimientoActivoId)
                .activoId(activoId)
                .build();

        activo = Activo.builder()
                .id(activoId)
                .codigo("ACT-VEH-01")
                .nombre("Camioneta Ranger")
                .tipoActivoId(tipoActivoId)
                .build();

        criterion = ProgramacionMantenimientoCriterio.builder()
                .id(criterionId)
                .programacionMantenimientoId(programacionId)
                .tipoCriterio(TipoCriterioMantenimiento.TIEMPO)
                .intervaloDias(30)
                .activo(true)
                .build();
    }

    @Test
    @DisplayName("Regla 1: No permitir desactivar el único criterio activo de la programación")
    void testRegla1_FallaDesactivarUltimoCriterioActivo() {
        when(repository.findById(criterionId)).thenReturn(Optional.of(criterion));
        when(repository.countByProgramacionMantenimientoIdAndActivoTrue(programacionId)).thenReturn(1L);

        BusinessException ex = assertThrows(BusinessException.class, () -> service.desactivar(criterionId));
        assertTrue(ex.getMessage().contains("al menos un criterio activo"));
    }

    @Test
    @DisplayName("Regla 1: No permitir eliminar el único criterio activo de la programación")
    void testRegla1_FallaEliminarUltimoCriterioActivo() {
        when(repository.findById(criterionId)).thenReturn(Optional.of(criterion));
        when(repository.countByProgramacionMantenimientoIdAndActivoTrue(programacionId)).thenReturn(1L);

        BusinessException ex = assertThrows(BusinessException.class, () -> service.delete(criterionId));
        assertTrue(ex.getMessage().contains("al menos un criterio activo"));
    }

    @Test
    @DisplayName("Regla 2: No permitir agregar criterio de tipo duplicado a la misma programación")
    void testRegla2_FallaSiYaExisteCriterioMismoTipo() {
        ProgramacionMantenimientoCriterioRequest request = new ProgramacionMantenimientoCriterioRequest(
                null, TipoCriterioMantenimiento.TIEMPO, 45, null, LocalDate.now().plusDays(45), null, true
        );

        when(programacionRepository.findById(programacionId)).thenReturn(Optional.of(programacion));
        when(planMantenimientoActivoRepository.findById(planMantenimientoActivoId)).thenReturn(Optional.of(planActivo));
        when(activoRepository.findById(activoId)).thenReturn(Optional.of(activo));
        when(repository.existsByProgramacionMantenimientoIdAndTipoCriterio(programacionId, TipoCriterioMantenimiento.TIEMPO))
                .thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () -> service.create(programacionId, request));
        assertTrue(ex.getMessage().contains("Ya existe un criterio del tipo TIEMPO"));
    }

    @Test
    @DisplayName("Regla 3: Validar que activo soporte kilometraje antes de guardar")
    void testRegla3_FallaSiActivoNoPoseeAtributoOdometro() {
        ProgramacionMantenimientoCriterioRequest request = new ProgramacionMantenimientoCriterioRequest(
                null, TipoCriterioMantenimiento.KILOMETRAJE, null, new BigDecimal("5000"), null, new BigDecimal("10000"), true
        );

        when(programacionRepository.findById(programacionId)).thenReturn(Optional.of(programacion));
        when(planMantenimientoActivoRepository.findById(planMantenimientoActivoId)).thenReturn(Optional.of(planActivo));
        when(activoRepository.findById(activoId)).thenReturn(Optional.of(activo));
        when(repository.existsByProgramacionMantenimientoIdAndTipoCriterio(programacionId, TipoCriterioMantenimiento.KILOMETRAJE))
                .thenReturn(false);

        // Simulamos que el tipo de activo no tiene atributo kilometraje
        when(springActivoAtributoRepository.existsByTipoActivoIdAndCodigoIgnoreCase(tipoActivoId, "KILOMETRAJE")).thenReturn(false);
        when(springActivoAtributoRepository.existsByTipoActivoIdAndCodigoIgnoreCase(tipoActivoId, "KM")).thenReturn(false);
        when(springActivoAtributoRepository.existsByTipoActivoIdAndCodigoIgnoreCase(tipoActivoId, "ODOMETRO")).thenReturn(false);

        BusinessException ex = assertThrows(BusinessException.class, () -> service.create(programacionId, request));
        assertTrue(ex.getMessage().contains("no puede proporcionar kilometraje"));
    }
}
