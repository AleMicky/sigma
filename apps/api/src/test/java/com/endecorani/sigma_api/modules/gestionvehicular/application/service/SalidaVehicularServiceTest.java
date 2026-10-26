package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.request.*;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.response.BitacoraVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.response.SalidaVehicularEventoResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.response.SalidaVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.BitacoraVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SalidaVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SalidaVehicularEvento;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.BitacoraVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularEventoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.modules.parametros.application.service.CorrelativoService;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.modules.workflow.application.dto.request.CompleteWorkflowTaskRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowActionResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskActionsResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskResponse;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowApplicationService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SalidaVehicularServiceTest {

    @Mock
    private SalidaVehicularRepository salidaRepository;

    @Mock
    private SalidaVehicularEventoRepository eventoRepository;

    @Mock
    private BitacoraVehicularRepository bitacoraRepository;

    @Mock
    private WorkflowApplicationService workflowApplicationService;

    @Mock
    private CorrelativoService correlativoService;

    @Mock
    private SpringActivoRepository activoRepository;

    @Mock
    private SpringActivoAtributoRepository activoAtributoRepository;

    @Mock
    private SpringActivoAtributoValorRepository activoAtributoValorRepository;

    @Mock
    private SpringVEmpleadoRepository vempleadoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private EmpleadoRepository empleadoRepository;

    @Mock
    private SecurityUtils securityUtils;

    @InjectMocks
    private SalidaVehicularService service;

    private UUID activoId;
    private UUID empleadoId;
    private UUID salidaId;
    private SalidaVehicular salida;

    @BeforeEach
    void setUp() {
        activoId = UUID.randomUUID();
        empleadoId = UUID.randomUUID();
        salidaId = UUID.randomUUID();

        salida = SalidaVehicular.builder()
                .id(salidaId)
                .numero("SAL-2026-0001")
                .activoId(activoId)
                .empleadoId(empleadoId)
                .motivo("Inspección de planta")
                .origen("Oficina Central")
                .destino("Planta Hidroeléctrica Corani")
                .estado("REGISTRADA")
                .processInstanceId("proc-123")
                .createdAt(Instant.now())
                .build();
    }

    @Test
    @DisplayName("Debe registrar una nueva salida e iniciar el proceso Flowable")
    void registrar_debeIniciarFlowableYCrearSalida() {
        RegistrarSalidaVehicularRequest request = new RegistrarSalidaVehicularRequest(
                activoId,
                empleadoId,
                "Inspección de obras",
                "Cochabamba",
                "Corani"
        );

        when(activoRepository.existsById(activoId)).thenReturn(true);
        when(correlativoService.generar(anyString(), anyInt())).thenReturn("SAL-2026-0001");
        when(workflowApplicationService.iniciar(eq("SALIDA_VEHICULAR"), anyString(), anyMap())).thenReturn("proc-123");
        when(workflowApplicationService.obtenerTareaActual("proc-123")).thenReturn(
                new WorkflowTaskResponse("task-1", "REGISTRADA - Iniciar Salida", "iniciarSalida", null, "proc-123", "def-1")
        );
        when(salidaRepository.save(any(SalidaVehicular.class))).thenAnswer(invocation -> invocation.getArgument(0));
        ActivoEntity activo = new ActivoEntity();
        activo.setId(activoId);
        activo.setCodigo("VEH-01");
        activo.setDescripcion("Camioneta Toyota");
        when(activoRepository.findById(activoId)).thenReturn(Optional.of(activo));

        SalidaVehicularResponse response = service.registrar(request);

        assertNotNull(response);
        assertEquals("SAL-2026-0001", response.numero());
        assertEquals("REGISTRADA", response.estado());
        assertEquals("proc-123", response.processInstanceId());
        verify(workflowApplicationService).iniciar(eq("SALIDA_VEHICULAR"), anyString(), anyMap());
    }

    @Test
    @DisplayName("Debe listar salidas con filtros y paginación")
    void listar_debeRetornarPaginaDeSalidas() {
        PageRequestDto pageRequest = new PageRequestDto();
        when(salidaRepository.searchWithFilters(any(), any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(salida)));

        PageResponse<SalidaVehicularResponse> response = service.listar(
                "Corani", activoId, null, null, null, null, pageRequest
        );

        assertNotNull(response);
        assertEquals(1, response.totalElements());
        assertEquals("SAL-2026-0001", response.content().getFirst().numero());
    }

    @Test
    @DisplayName("Debe ejecutar una acción Flowable y registrar automáticamente un evento vehicular")
    void ejecutarAccion_debeCompletarTareaYRegistrarEvento() {
        WorkflowActionResponse accion = new WorkflowActionResponse("Iniciar Salida", "action", "INICIAR_SALIDA");
        WorkflowTaskActionsResponse tareaActual = new WorkflowTaskActionsResponse(
                "task-1", "REGISTRADA - Iniciar Salida", "iniciarSalida", "proc-123", "REGISTRADA", List.of(), List.of(accion)
        );
        WorkflowTaskActionsResponse tareaSiguiente = new WorkflowTaskActionsResponse(
                "task-2", "EN_CURSO - Registrar Llegada", "registrarLlegada", "proc-123", "EN_CURSO", List.of(), List.of()
        );

        when(salidaRepository.findById(salidaId)).thenReturn(Optional.of(salida));
        when(workflowApplicationService.obtenerAccionesDisponibles("proc-123")).thenReturn(tareaActual);
        when(workflowApplicationService.completarTarea(eq("proc-123"), any(CompleteWorkflowTaskRequest.class)))
                .thenReturn(tareaSiguiente);
        when(salidaRepository.save(any(SalidaVehicular.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EjecutarAccionSalidaRequest request = new EjecutarAccionSalidaRequest(
                new BigDecimal("12500.50"),
                new BigDecimal("-17.3895"),
                new BigDecimal("-66.1568"),
                "Salida autorizada a tiempo",
                Map.of()
        );

        SalidaVehicularResponse response = service.ejecutarAccion(salidaId, "INICIAR_SALIDA", request);

        assertNotNull(response);
        assertEquals("EN_CURSO", response.estado());
        verify(eventoRepository).save(argThat(ev ->
                ev.getSalidaVehicularId().equals(salidaId)
                        && ev.getTipoEvento().equals("Iniciar Salida")
                        && ev.getKilometraje().compareTo(new BigDecimal("12500.50")) == 0
        ));
    }

    @Test
    @DisplayName("Debe cancelar una salida vehicular activa mediante Flowable")
    void cancelar_debeCancelarEnFlowableYActualizarEstado() {
        when(salidaRepository.findById(salidaId)).thenReturn(Optional.of(salida));
        when(salidaRepository.save(any(SalidaVehicular.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CancelarSalidaVehicularRequest request = new CancelarSalidaVehicularRequest("Viaje cancelado por clima adverso");
        SalidaVehicularResponse response = service.cancelar(salidaId, request);

        assertNotNull(response);
        assertEquals("CANCELADA", response.estado());
        verify(workflowApplicationService).cancelarProceso(eq("proc-123"), anyString());
        verify(eventoRepository).save(argThat(ev -> ev.getTipoEvento().equals("CANCELACION")));
    }

    @Test
    @DisplayName("Debe registrar y listar bitácoras para una salida")
    void bitacoras_debeRegistrarYListarCorrectamente() {
        when(salidaRepository.findById(salidaId)).thenReturn(Optional.of(salida));
        when(salidaRepository.existsById(salidaId)).thenReturn(true);

        BitacoraVehicular bitacora = BitacoraVehicular.builder()
                .id(UUID.randomUUID())
                .salidaVehicularId(salidaId)
                .empleadoId(empleadoId)
                .tipo("INCIDENTE")
                .descripcion("Pinchazo de llanta delantera derecha")
                .fechaHora(Instant.now())
                .build();

        when(bitacoraRepository.save(any(BitacoraVehicular.class))).thenReturn(bitacora);
        when(bitacoraRepository.findBySalidaVehicularId(salidaId)).thenReturn(List.of(bitacora));

        RegistrarBitacoraRequest request = new RegistrarBitacoraRequest(
                "INCIDENTE", "Pinchazo de llanta delantera derecha", Instant.now(), null, null
        );

        BitacoraVehicularResponse bitacoraResponse = service.registrarBitacora(salidaId, request);
        assertNotNull(bitacoraResponse);
        assertEquals("INCIDENTE", bitacoraResponse.tipo());

        List<BitacoraVehicularResponse> list = service.listarBitacoras(salidaId);
        assertNotNull(list);
        assertEquals(1, list.size());
    }

    @Test
    @DisplayName("Debe listar eventos vehiculares de una salida")
    void listarEventos_debeRetornarEventosRegistrados() {
        when(salidaRepository.existsById(salidaId)).thenReturn(true);
        SalidaVehicularEvento ev1 = SalidaVehicularEvento.builder()
                .id(UUID.randomUUID())
                .salidaVehicularId(salidaId)
                .empleadoId(empleadoId)
                .tipoEvento("Iniciar Salida")
                .fechaHora(Instant.now())
                .kilometraje(new BigDecimal("1000"))
                .build();

        when(eventoRepository.findBySalidaVehicularId(salidaId)).thenReturn(List.of(ev1));

        List<SalidaVehicularEventoResponse> eventos = service.listarEventos(salidaId);
        assertNotNull(eventos);
        assertEquals(1, eventos.size());
        assertEquals("Iniciar Salida", eventos.getFirst().tipoEvento());
    }
}
