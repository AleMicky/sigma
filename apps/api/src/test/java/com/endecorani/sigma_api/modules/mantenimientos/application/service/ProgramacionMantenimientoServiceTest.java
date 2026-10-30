package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.EvaluarProgramacionRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response.EvaluacionProgramacionResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ProgramacionMantenimientoCriterioMapper;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ProgramacionMantenimientoHistorialMapper;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ProgramacionMantenimientoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimientoActivo;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimientoCriterio;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.*;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.TipoMantenimientoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringPrioridadRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringTipoMantenimientoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProgramacionMantenimientoServiceTest {

    @Mock
    private ProgramacionMantenimientoRepository repository;
    @Mock
    private ProgramacionMantenimientoCriterioRepository criterioRepository;
    @Mock
    private ProgramacionMantenimientoHistorialRepository historialRepository;
    @Mock
    private PlanMantenimientoActivoRepository planMantenimientoActivoRepository;
    @Mock
    private PlanMantenimientoRepository planMantenimientoRepository;
    @Mock
    private ActivoRepository activoRepository;
    @Mock
    private TipoActivoRepository tipoActivoRepository;
    @Mock
    private ProgramacionMantenimientoCriterioService criterioService;
    @Mock
    private SolicitudMantenimientoService solicitudMantenimientoService;
    @Mock
    private SolicitudMantenimientoRepository solicitudRepository;
    @Mock
    private SpringTipoMantenimientoRepository springTipoMantenimientoRepository;
    @Mock
    private SpringPrioridadRepository springPrioridadRepository;
    @Mock
    private SpringActivoAtributoRepository springActivoAtributoRepository;
    @Mock
    private SpringActivoAtributoValorRepository springActivoAtributoValorRepository;
    @Mock
    private EmpleadoRepository empleadoRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private SecurityUtils securityUtils;
    @Mock
    private ProgramacionMantenimientoMapper mapper;
    @Mock
    private ProgramacionMantenimientoCriterioMapper criterioMapper;
    @Mock
    private ProgramacionMantenimientoHistorialMapper historialMapper;
    @Mock
    private ProgramacionSeguimientoExcelService excelService;

    @InjectMocks
    private ProgramacionMantenimientoService service;

    @Test
    @DisplayName("evaluarPorActivo debe retornar vacío si activoId es null o no tiene planes")
    void evaluarPorActivoNull() {
        List<EvaluacionProgramacionResponse> res = service.evaluarPorActivo(null);
        assertThat(res).isEmpty();

        UUID randomId = UUID.randomUUID();
        when(planMantenimientoActivoRepository.findByActivoId(randomId)).thenReturn(Collections.emptyList());
        List<EvaluacionProgramacionResponse> res2 = service.evaluarPorActivo(randomId);
        assertThat(res2).isEmpty();
    }

    @Test
    @DisplayName("findByActivoId debe buscar las asignaciones y mapear programaciones")
    void findByActivoId() {
        UUID activoId = UUID.randomUUID();
        UUID pmaId = UUID.randomUUID();

        PlanMantenimientoActivo pma = new PlanMantenimientoActivo();
        pma.setId(pmaId);
        pma.setActivoId(activoId);
        pma.setActivo(true);

        when(planMantenimientoActivoRepository.findByActivoId(activoId)).thenReturn(List.of(pma));
        when(repository.findByPlanMantenimientoActivoId(pmaId)).thenReturn(Collections.emptyList());

        var res = service.findByActivoId(activoId);
        assertThat(res).isEmpty();
        verify(repository, times(1)).findByPlanMantenimientoActivoId(pmaId);
    }

    @Test
    @DisplayName("evaluarProgramacion no debe disparar si odómetro no ha llegado al umbral")
    void evaluarProgramacionNoDisparaSiNoLlegaAlUmbral() {
        UUID progId = UUID.randomUUID();
        UUID pmaId = UUID.randomUUID();
        UUID activoId = UUID.randomUUID();
        UUID planId = UUID.randomUUID();

        ProgramacionMantenimiento prog = new ProgramacionMantenimiento();
        prog.setId(progId);
        prog.setPlanMantenimientoActivoId(pmaId);
        prog.setActivo(true);

        PlanMantenimientoActivo pma = new PlanMantenimientoActivo();
        pma.setId(pmaId);
        pma.setActivoId(activoId);
        pma.setPlanMantenimientoId(planId);
        pma.setActivo(true);

        Activo activo = new Activo();
        activo.setId(activoId);

        PlanMantenimiento plan = new PlanMantenimiento();
        plan.setId(planId);

        ProgramacionMantenimientoCriterio criterio = new ProgramacionMantenimientoCriterio();
        criterio.setTipoCriterio(TipoCriterioMantenimiento.KILOMETRAJE);
        criterio.setProximoValorUso(new BigDecimal("50000"));
        criterio.setActivo(true);

        when(repository.findByIdWithLock(progId)).thenReturn(Optional.of(prog));
        when(planMantenimientoActivoRepository.findById(pmaId)).thenReturn(Optional.of(pma));
        when(activoRepository.findById(activoId)).thenReturn(Optional.of(activo));
        when(planMantenimientoRepository.findById(planId)).thenReturn(Optional.of(plan));
        when(criterioRepository.findByProgramacionMantenimientoIdAndActivoTrue(progId)).thenReturn(List.of(criterio));

        EvaluarProgramacionRequest request = new EvaluarProgramacionRequest(
                LocalDate.now(),
                new BigDecimal("45000"), // 45,000 km < 50,000 km
                null,
                false
        );

        EvaluacionProgramacionResponse resp = service.evaluarProgramacion(progId, request);
        assertThat(resp.cumpleCriterio()).isFalse();
        assertThat(resp.solicitudGenerada()).isFalse();
    }

    @Test
    @DisplayName("evaluarProgramacion debe disparar solicitud, usar fallback de solicitante y auto-enviar a SOLICITADO")
    void evaluarProgramacionDisparaSolicitudYAutoEnvia() {
        UUID progId = UUID.randomUUID();
        UUID pmaId = UUID.randomUUID();
        UUID activoId = UUID.randomUUID();
        UUID planId = UUID.randomUUID();
        UUID solicitanteFallbackId = UUID.randomUUID();
        UUID tipoMantId = UUID.randomUUID();
        UUID prioridadId = UUID.randomUUID();
        UUID solicitudId = UUID.randomUUID();

        ProgramacionMantenimiento prog = new ProgramacionMantenimiento();
        prog.setId(progId);
        prog.setPlanMantenimientoActivoId(pmaId);
        prog.setActivo(true);

        PlanMantenimientoActivo pma = new PlanMantenimientoActivo();
        pma.setId(pmaId);
        pma.setActivoId(activoId);
        pma.setPlanMantenimientoId(planId);
        pma.setActivo(true);
        pma.setResponsableId(null); // Sin responsable para probar fallback

        Activo activo = new Activo();
        activo.setId(activoId);
        activo.setCodigo("ACT-01");
        activo.setNombre("Camioneta Hilux");

        PlanMantenimiento plan = new PlanMantenimiento();
        plan.setId(planId);
        plan.setCodigo("PLAN-01");
        plan.setNombre("Plan 50k");

        ProgramacionMantenimientoCriterio criterio = new ProgramacionMantenimientoCriterio();
        criterio.setTipoCriterio(TipoCriterioMantenimiento.KILOMETRAJE);
        criterio.setProximoValorUso(new BigDecimal("50000"));
        criterio.setIntervaloUso(new BigDecimal("5000"));
        criterio.setActivo(true);

        when(repository.findByIdWithLock(progId)).thenReturn(Optional.of(prog));
        when(planMantenimientoActivoRepository.findById(pmaId)).thenReturn(Optional.of(pma));
        when(activoRepository.findById(activoId)).thenReturn(Optional.of(activo));
        when(planMantenimientoRepository.findById(planId)).thenReturn(Optional.of(plan));
        when(criterioRepository.findByProgramacionMantenimientoIdAndActivoTrue(progId)).thenReturn(List.of(criterio));
        when(historialRepository.findFirstPendingByProgramacionMantenimientoId(progId)).thenReturn(Optional.empty());

        TipoMantenimientoEntity tipoMant = new TipoMantenimientoEntity();
        tipoMant.setId(tipoMantId);
        when(springTipoMantenimientoRepository.findByCodigoIgnoreCase("PREVENTIVO")).thenReturn(Optional.of(tipoMant));

        var prioridadEntity = new com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.PrioridadEntity();
        prioridadEntity.setId(prioridadId);
        when(springPrioridadRepository.findFirstByPorDefectoTrue()).thenReturn(Optional.of(prioridadEntity));

        // Fallback de empleado
        com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado emp =
                new com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado();
        emp.setId(solicitanteFallbackId);
        when(empleadoRepository.findAll(org.springframework.data.domain.Pageable.ofSize(1)))
                .thenReturn(new org.springframework.data.domain.PageImpl<>(List.of(emp)));

        SolicitudMantenimientoResponse solResp = new SolicitudMantenimientoResponse(
                solicitudId,
                "SOL-2026-001",
                null, null, List.of(), null, null, "Titulo", "Desc",
                null, null, null, null, null, null, null, null, "BORRADOR", List.of(), null
        );
        when(solicitudMantenimientoService.create(any())).thenReturn(solResp);

        EvaluarProgramacionRequest request = new EvaluarProgramacionRequest(
                LocalDate.now(),
                new BigDecimal("50000"), // Cumple límite
                null,
                false
        );

        EvaluacionProgramacionResponse resp = service.evaluarProgramacion(progId, request);
        assertThat(resp.cumpleCriterio()).isTrue();
        assertThat(resp.solicitudGenerada()).isTrue();
        assertThat(resp.solicitudId()).isEqualTo(solicitudId);
        assertThat(resp.solicitudNumero()).isEqualTo("SOL-2026-001");

        // Verifica que se haya guardado en el historial y enviado para aprobación
        verify(historialRepository, times(1)).save(any());
        verify(solicitudMantenimientoService, times(1)).enviar(eq(solicitudId), any());
    }
}
