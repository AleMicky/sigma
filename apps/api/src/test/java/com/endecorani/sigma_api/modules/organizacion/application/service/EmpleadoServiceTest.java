package com.endecorani.sigma_api.modules.organizacion.application.service;

import com.endecorani.sigma_api.modules.organizacion.application.dto.request.EmpleadoRequest;
import com.endecorani.sigma_api.modules.organizacion.application.dto.response.EmpleadoResponse;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Area;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Cargo;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Persona;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.AreaRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.CargoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.PersonaRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmpleadoServiceTest {

    @Mock
    private EmpleadoRepository empleadoRepository;

    @Mock
    private PersonaRepository personaRepository;

    @Mock
    private AreaRepository areaRepository;

    @Mock
    private CargoRepository cargoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private EmpleadoService empleadoService;

    private UUID empleadoId;
    private UUID personaId;
    private UUID areaId;
    private UUID cargoId;
    private Empleado empleado;
    private Persona persona;
    private Area area;
    private Cargo cargo;

    @BeforeEach
    void setUp() {
        empleadoId = UUID.randomUUID();
        personaId = UUID.randomUUID();
        areaId = UUID.randomUUID();
        cargoId = UUID.randomUUID();

        empleado = Empleado.builder()
                .id(empleadoId)
                .personaId(personaId)
                .areaId(areaId)
                .cargoId(cargoId)
                .codigo("EMP-100")
                .fechaInicio(LocalDate.now().minusMonths(6))
                .activo(true)
                .build();

        persona = Persona.builder()
                .id(personaId)
                .nombres("Carlos")
                .primerApellido("Mamani")
                .segundoApellido("Quispe")
                .tipoDocumento("CI")
                .numeroDocumento("7654321")
                .build();

        area = Area.builder()
                .id(areaId)
                .codigo("ADM")
                .nombre("Administración")
                .build();

        cargo = Cargo.builder()
                .id(cargoId)
                .codigo("GER")
                .nombre("Gerente")
                .build();
    }

    @Test
    @DisplayName("Debe listar empleados con batch resolution de Persona, Area y Cargo")
    void debeListarEmpleadosConBatchResolution() {
        PageRequestDto pageRequest = new PageRequestDto();

        when(empleadoRepository.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(empleado)));
        when(personaRepository.findAllById(any())).thenReturn(List.of(persona));
        when(areaRepository.findAllById(any())).thenReturn(List.of(area));
        when(cargoRepository.findAllById(any())).thenReturn(List.of(cargo));

        PageResponse<EmpleadoResponse> response = empleadoService.findAll(pageRequest);

        assertNotNull(response);
        assertEquals(1, response.content().size());
        EmpleadoResponse item = response.content().get(0);
        assertEquals("EMP-100", item.codigo());
        assertNotNull(item.personaInfo());
        assertEquals("Carlos Mamani Quispe", item.personaInfo().nombreCompleto());
        assertNotNull(item.areaInfo());
        assertEquals("Administración", item.areaInfo().nombre());
        assertNotNull(item.cargoInfo());
        assertEquals("Gerente", item.cargoInfo().nombre());
    }

    @Test
    @DisplayName("Debe obtener empleado por ID")
    void debeObtenerEmpleadoPorId() {
        when(empleadoRepository.findById(empleadoId)).thenReturn(Optional.of(empleado));
        when(personaRepository.findById(personaId)).thenReturn(Optional.of(persona));
        when(areaRepository.findById(areaId)).thenReturn(Optional.of(area));
        when(cargoRepository.findById(cargoId)).thenReturn(Optional.of(cargo));

        EmpleadoResponse response = empleadoService.findById(empleadoId);

        assertNotNull(response);
        assertEquals(empleadoId, response.id());
        assertEquals("EMP-100", response.codigo());
    }

    @Test
    @DisplayName("Debe crear empleado exitosamente cuando referencias y código son válidos")
    void debeCrearEmpleadoExitosamente() {
        EmpleadoRequest request = new EmpleadoRequest(
                personaId,
                areaId,
                cargoId,
                "EMP-100",
                LocalDate.now(),
                null
        );

        when(personaRepository.existsById(personaId)).thenReturn(true);
        when(areaRepository.existsById(areaId)).thenReturn(true);
        when(cargoRepository.existsById(cargoId)).thenReturn(true);
        when(empleadoRepository.existsByCodigoIgnoreCase("EMP-100")).thenReturn(false);
        when(empleadoRepository.save(any(Empleado.class))).thenReturn(empleado);
        when(personaRepository.findById(personaId)).thenReturn(Optional.of(persona));
        when(areaRepository.findById(areaId)).thenReturn(Optional.of(area));
        when(cargoRepository.findById(cargoId)).thenReturn(Optional.of(cargo));

        EmpleadoResponse response = empleadoService.create(request);

        assertNotNull(response);
        assertEquals("EMP-100", response.codigo());
        verify(empleadoRepository, times(1)).save(any(Empleado.class));
    }

    @Test
    @DisplayName("Debe fallar al crear empleado si el código ya existe")
    void debeFallarSiCodigoYaExiste() {
        EmpleadoRequest request = new EmpleadoRequest(
                personaId,
                areaId,
                cargoId,
                "EMP-100",
                LocalDate.now(),
                null
        );

        when(personaRepository.existsById(personaId)).thenReturn(true);
        when(areaRepository.existsById(areaId)).thenReturn(true);
        when(cargoRepository.existsById(cargoId)).thenReturn(true);
        when(empleadoRepository.existsByCodigoIgnoreCase("EMP-100")).thenReturn(true);

        assertThrows(ConflictException.class, () -> empleadoService.create(request));
        verify(empleadoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe fallar al crear empleado si la persona no existe")
    void debeFallarSiPersonaNoExiste() {
        EmpleadoRequest request = new EmpleadoRequest(
                personaId,
                areaId,
                cargoId,
                "EMP-100",
                LocalDate.now(),
                null
        );

        when(personaRepository.existsById(personaId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> empleadoService.create(request));
    }
}
