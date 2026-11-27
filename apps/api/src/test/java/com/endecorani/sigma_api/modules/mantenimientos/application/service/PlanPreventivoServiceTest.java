package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.model.TipoActivo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request.PlanPreventivoCompletoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.response.PlanPreventivoCompletoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.PlanMantenimientoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.application.port.out.ActivoUsoQueryPort;
import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.EstadoPlanMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.*;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.*;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlanPreventivoServiceTest {

    @Mock private PlanMantenimientoRepository planRepository;
    @Mock private PlanMantenimientoActividadRepository planActividadRepository;
    @Mock private PlanMantenimientoActivoRepository planActivoRepository;
    @Mock private ProgramacionMantenimientoRepository programacionRepository;
    @Mock private ProgramacionMantenimientoCriterioRepository criterioRepository;
    @Mock private TipoActivoRepository tipoActivoRepository;
    @Mock private ActivoRepository activoRepository;
    @Mock private ActivoUsoQueryPort activoUsoQueryPort;
    @Spy private CriterioCalculoService criterioCalculoService = new CriterioCalculoService();
    @Mock private PlanMantenimientoMapper planMapper;

    @InjectMocks
    private PlanPreventivoService service;

    @Test
    void crearCompleto_debeRechazarCodigoDuplicado() {
        UUID tipoActivoId = UUID.randomUUID();
        when(planRepository.existsByCodigoIgnoreCase("PLAN-PREV-01")).thenReturn(true);

        PlanPreventivoCompletoRequest req = new PlanPreventivoCompletoRequest(
                tipoActivoId, null, "PLAN-PREV-01", "Plan Generadores", null,
                EstadoPlanMantenimiento.ACTIVO, TipoCriterioMantenimiento.HORAS_USO, null, new BigDecimal("250"),
                List.of(), List.of()
        );

        assertThatThrownBy(() -> service.crearCompleto(req))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void crearCompleto_debePersistirPlanActividadesActivosYCriterios() {
        UUID tipoActivoId = UUID.randomUUID();
        UUID planId = UUID.randomUUID();
        UUID appId = UUID.randomUUID();
        UUID activoId = UUID.randomUUID();
        UUID pmaId = UUID.randomUUID();
        UUID progId = UUID.randomUUID();

        when(planRepository.existsByCodigoIgnoreCase("PLAN-GEN-250H")).thenReturn(false);
        when(tipoActivoRepository.existsById(tipoActivoId)).thenReturn(true);
        when(tipoActivoRepository.findById(tipoActivoId)).thenReturn(Optional.of(TipoActivo.builder().id(tipoActivoId).nombre("Generador").build()));
        when(planRepository.save(any())).thenAnswer(inv -> {
            PlanMantenimiento p = inv.getArgument(0);
            p.setId(planId);
            return p;
        });
        when(planActividadRepository.findByPlanMantenimientoId(planId)).thenReturn(List.of());
        when(planActividadRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(activoUsoQueryPort.obtenerLecturasUsoPorActivos(List.of(activoId)))
                .thenReturn(Map.of(activoId, new ActivoUsoQueryPort.LecturaUso(null, new BigDecimal("1000"))));
        when(planActivoRepository.findByPlanMantenimientoId(planId)).thenReturn(List.of());
        when(activoRepository.findById(activoId)).thenReturn(Optional.of(Activo.builder().id(activoId).tipoActivoId(tipoActivoId).codigo("GEN-01").build()));
        when(planActivoRepository.save(any())).thenAnswer(inv -> {
            PlanMantenimientoActivo pma = inv.getArgument(0);
            pma.setId(pmaId);
            return pma;
        });
        when(programacionRepository.findByPlanMantenimientoActivoIdAndActivoTrue(pmaId)).thenReturn(Optional.empty());
        when(programacionRepository.saveAndFlush(any())).thenAnswer(inv -> {
            ProgramacionMantenimiento prog = inv.getArgument(0);
            prog.setId(progId);
            return prog;
        });
        when(criterioRepository.findByProgramacionMantenimientoId(progId)).thenReturn(List.of());
        when(criterioRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PlanPreventivoCompletoRequest req = new PlanPreventivoCompletoRequest(
                tipoActivoId, null, "PLAN-GEN-250H", "Mantenimiento 250h", "Cambio de aceite",
                EstadoPlanMantenimiento.ACTIVO, TipoCriterioMantenimiento.HORAS_USO, null, new BigDecimal("250"),
                List.of(new PlanPreventivoCompletoRequest.ActividadItem(appId, 1, true)),
                List.of(new PlanPreventivoCompletoRequest.ActivoItem(activoId, null, LocalDate.of(2026, 11, 27), null, true, null, null, List.of()))
        );

        PlanPreventivoCompletoResponse response = service.crearCompleto(req);

        assertThat(response).isNotNull();
        verify(criterioRepository).save(argThat(c ->
                c.getTipoCriterio() == TipoCriterioMantenimiento.HORAS_USO
                        && c.getProximoValorUso().compareTo(new BigDecimal("1250")) == 0
        ));
    }
}
