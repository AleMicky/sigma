package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.request.ConductorRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.request.ConductorUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.response.ConductorEmpleadoInfo;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.response.ConductorResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.mapper.ConductorMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.Conductor;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ConductorRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConductorServiceTest {

    @Mock
    private ConductorRepository repository;

    @Mock
    private EmpleadoRepository empleadoRepository;

    @Mock
    private com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository springVEmpleadoRepository;

    @Mock
    private ConductorMapper mapper;

    @InjectMocks
    private ConductorService service;

    private UUID conductorId;
    private UUID empleadoId;
    private Conductor conductorDomain;
    private Empleado empleadoDomain;
    private com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity vEmpleadoEntity;
    private ConductorResponse conductorResponse;
    private ConductorEmpleadoInfo empleadoInfo;

    @BeforeEach
    void setUp() {
        conductorId = UUID.randomUUID();
        empleadoId = UUID.randomUUID();

        conductorDomain = Conductor.builder()
                .id(conductorId)
                .empleadoId(empleadoId)
                .numeroLicencia("12345678-LP")
                .categoriaLicencia("C")
                .fechaVencimiento(LocalDate.now().plusYears(2))
                .activo(true)
                .build();

        empleadoDomain = Empleado.builder()
                .id(empleadoId)
                .codigo("EMP-001")
                .nombreCompleto("Juan Perez")
                .cargo("Chofer")
                .area("Transportes")
                .build();

        vEmpleadoEntity = new com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity();
        vEmpleadoEntity.setEmpleadoId(empleadoId);
        vEmpleadoEntity.setCodigo("EMP-001");
        vEmpleadoEntity.setNombreCompleto("Juan Perez");
        vEmpleadoEntity.setCargo("Chofer");
        vEmpleadoEntity.setArea("Transportes");

        empleadoInfo = new ConductorEmpleadoInfo(
                empleadoId,
                "EMP-001",
                "Juan Perez",
                "Chofer",
                "Transportes"
        );

        conductorResponse = new ConductorResponse(
                conductorId,
                empleadoId,
                empleadoInfo,
                "12345678-LP",
                "C",
                LocalDate.now().plusYears(2),
                true,
                null
        );
    }

    @Test
    @DisplayName("Debe listar conductores con paginación y resolver info de empleados")
    void debeListarConductoresConPaginacion() {
        PageRequestDto pageRequest = new PageRequestDto();
        when(repository.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(conductorDomain)));
        when(springVEmpleadoRepository.findAllById(any())).thenReturn(List.of(vEmpleadoEntity));
        when(mapper.toResponse(eq(conductorDomain), any(ConductorEmpleadoInfo.class))).thenReturn(conductorResponse);

        PageResponse<ConductorResponse> response = service.findAll(pageRequest);

        assertNotNull(response);
        assertEquals(1, response.content().size());
        assertEquals("12345678-LP", response.content().get(0).numeroLicencia());
        assertEquals("Juan Perez", response.content().get(0).empleado().nombreCompleto());
    }

    @Test
    @DisplayName("Debe obtener un conductor por ID correctamente")
    void debeObtenerConductorPorId() {
        when(repository.findById(conductorId)).thenReturn(Optional.of(conductorDomain));
        when(springVEmpleadoRepository.findById(empleadoId)).thenReturn(Optional.of(vEmpleadoEntity));
        when(mapper.toResponse(eq(conductorDomain), any(ConductorEmpleadoInfo.class))).thenReturn(conductorResponse);

        ConductorResponse result = service.findById(conductorId);

        assertNotNull(result);
        assertEquals(conductorId, result.id());
        assertEquals("12345678-LP", result.numeroLicencia());
    }

    @Test
    @DisplayName("Debe lanzar excepción si el conductor no existe al buscar por ID")
    void debeLanzarExcepcionSiConductorNoExiste() {
        when(repository.findById(conductorId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.findById(conductorId));
    }

    @Test
    @DisplayName("Debe crear un conductor exitosamente")
    void debeCrearConductorExitosamente() {
        ConductorRequest request = new ConductorRequest(
                empleadoId,
                "12345678-LP",
                "C",
                LocalDate.now().plusYears(2),
                true
        );

        when(empleadoRepository.findById(empleadoId)).thenReturn(Optional.of(empleadoDomain));
        when(repository.existsByEmpleadoId(empleadoId)).thenReturn(false);
        when(repository.existsByNumeroLicenciaIgnoreCase("12345678-LP")).thenReturn(false);
        when(mapper.toDomain(request)).thenReturn(conductorDomain);
        when(repository.save(any(Conductor.class))).thenReturn(conductorDomain);
        when(springVEmpleadoRepository.findById(empleadoId)).thenReturn(Optional.of(vEmpleadoEntity));
        when(mapper.toResponse(eq(conductorDomain), any(ConductorEmpleadoInfo.class))).thenReturn(conductorResponse);

        ConductorResponse created = service.create(request);

        assertNotNull(created);
        assertEquals("12345678-LP", created.numeroLicencia());
        verify(repository, times(1)).save(any(Conductor.class));
    }

    @Test
    @DisplayName("Debe rechazar la creación si el empleado ya tiene conductor asignado")
    void debeFallarSiEmpleadoYaTieneConductor() {
        ConductorRequest request = new ConductorRequest(
                empleadoId,
                "12345678-LP",
                "C",
                LocalDate.now().plusYears(2),
                true
        );

        when(empleadoRepository.findById(empleadoId)).thenReturn(Optional.of(empleadoDomain));
        when(repository.existsByEmpleadoId(empleadoId)).thenReturn(true);

        assertThrows(ConflictException.class, () -> service.create(request));
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("Debe eliminar un conductor existente")
    void debeEliminarConductor() {
        when(repository.findById(conductorId)).thenReturn(Optional.of(conductorDomain));
        doNothing().when(repository).deleteById(conductorId);

        assertDoesNotThrow(() -> service.delete(conductorId));
        verify(repository, times(1)).deleteById(conductorId);
    }
}
