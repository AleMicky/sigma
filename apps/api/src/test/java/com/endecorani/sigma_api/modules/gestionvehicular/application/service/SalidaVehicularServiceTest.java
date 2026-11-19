package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.response.SalidaVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SalidaVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.BitacoraVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularEventoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.modules.parametros.application.service.CorrelativoService;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowApplicationService;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowEntitySupport;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

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
    private WorkflowEntitySupport workflowEntitySupport;
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
    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private SalidaVehicularService service;

    @Test
    void listar_cuandoEsAdmin_debeVerTodoSinForzarCreatedById() {
        when(securityUtils.isAdmin()).thenReturn(true);
        Page<SalidaVehicular> emptyPage = new PageImpl<>(Collections.emptyList());
        when(salidaRepository.searchWithFilters(
                isNull(), isNull(), isNull(), isNull(), isNull(), eq(false), isNull(), isNull(), isNull(), any(Pageable.class)
        )).thenReturn(emptyPage);

        PageResponse<SalidaVehicularResponse> response = service.listar(
                null, null, null, null, null, null, null, null, new PageRequestDto()
        );

        assertNotNull(response);
        verify(salidaRepository).searchWithFilters(
                isNull(), isNull(), isNull(), isNull(), isNull(), eq(false), isNull(), isNull(), isNull(), any(Pageable.class)
        );
    }

    @Test
    void listar_cuandoNoEsAdmin_debeFiltrarEstrictamentePorCreatedByIdDelUsuarioActual() {
        UUID currentUserId = UUID.randomUUID();
        UUID otroUserId = UUID.randomUUID();
        when(securityUtils.isAdmin()).thenReturn(false);
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.of(currentUserId));

        Page<SalidaVehicular> emptyPage = new PageImpl<>(Collections.emptyList());
        when(salidaRepository.searchWithFilters(
                isNull(), isNull(), isNull(), isNull(), eq(currentUserId), eq(false), isNull(), isNull(), isNull(), any(Pageable.class)
        )).thenReturn(emptyPage);

        PageResponse<SalidaVehicularResponse> response = service.listar(
                null, null, null, null, otroUserId, null, null, null, new PageRequestDto()
        );

        assertNotNull(response);
        verify(salidaRepository).searchWithFilters(
                isNull(), isNull(), isNull(), isNull(), eq(currentUserId), eq(false), isNull(), isNull(), isNull(), any(Pageable.class)
        );
    }

    @Test
    void listar_cuandoNoEsAdminYSinUsuarioActual_debeRetornarVacioSinConsultarRepositorio() {
        when(securityUtils.isAdmin()).thenReturn(false);
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.empty());

        PageResponse<SalidaVehicularResponse> response = service.listar(
                null, null, null, null, null, null, null, null, new PageRequestDto()
        );

        assertNotNull(response);
        assertTrue(response.content().isEmpty());
        verifyNoInteractions(salidaRepository);
    }

    @Test
    void listarActivas_cuandoNoEsAdmin_debeFiltrarPorCreatedByIdSinArea() {
        UUID currentUserId = UUID.randomUUID();
        when(securityUtils.isAdmin()).thenReturn(false);
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.of(currentUserId));
        when(salidaRepository.findActivas(isNull(), eq(currentUserId))).thenReturn(List.of());

        List<SalidaVehicularResponse> response = service.listarActivas();

        assertTrue(response.isEmpty());
        verify(salidaRepository).findActivas(isNull(), eq(currentUserId));
    }
}
