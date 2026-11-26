package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.request.SolicitudVehicularAdjuntoRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response.SolicitudVehicularAdjuntoResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.mapper.SolicitudVehicularAdjuntoMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SolicitudVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SolicitudVehicularAdjunto;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ConductorRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SolicitudVehicularAdjuntoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SolicitudVehicularRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.storage.DocumentStorageService;
import com.endecorani.sigma_api.shared.domain.exception.ForbiddenException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** REQ-VEH-003: alcance de los adjuntos de solicitudes vehiculares. */
@ExtendWith(MockitoExtension.class)
class SolicitudVehicularAdjuntoServiceAlcanceTest {

    @Mock private SolicitudVehicularAdjuntoRepository repository;
    @Mock private SolicitudVehicularRepository solicitudVehicularRepository;
    @Mock private SolicitudVehicularAdjuntoMapper mapper;
    @Mock private DocumentStorageService documentStorageService;
    @Mock private SecurityUtils securityUtils;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private EmpleadoRepository empleadoRepository;
    @Mock private ConductorRepository conductorRepository;

    @InjectMocks
    private SolicitudVehicularAdjuntoService service;

    private final UUID solicitudId = UUID.randomUUID();
    private final UUID adjuntoId = UUID.randomUUID();

    @Test
    void findById_adjuntoDeOtraSolicitud_debeLanzarForbidden() {
        configurarUsuarioActual();
        when(repository.findById(adjuntoId)).thenReturn(Optional.of(adjuntoAjeno()));
        when(solicitudVehicularRepository.findById(solicitudId)).thenReturn(Optional.of(solicitudAjena()));

        assertThrows(ForbiddenException.class, () -> service.findById(adjuntoId));
    }

    @Test
    void findBySolicitudVehicularId_solicitudAjena_debeLanzarForbidden() {
        configurarUsuarioActual();
        when(solicitudVehicularRepository.findById(solicitudId)).thenReturn(Optional.of(solicitudAjena()));

        assertThrows(ForbiddenException.class,
                () -> service.findBySolicitudVehicularId(solicitudId, new PageRequestDto()));
    }

    @Test
    void createWithFile_solicitudAjena_noDebeAlmacenarArchivo() {
        configurarUsuarioActual();
        when(solicitudVehicularRepository.findById(solicitudId)).thenReturn(Optional.of(solicitudAjena()));

        assertThrows(ForbiddenException.class, () -> service.createWithFile(
                solicitudId,
                new SolicitudVehicularAdjuntoRequest("descripcion"),
                new MockMultipartFile("file", "a.pdf", "application/pdf", new byte[]{1})));

        verify(documentStorageService, never()).store(any(), any(), any());
    }

    @Test
    void replaceFile_solicitudAjena_noDebeSobrescribirArchivo() {
        configurarUsuarioActual();
        when(repository.findById(adjuntoId)).thenReturn(Optional.of(adjuntoAjeno()));
        when(solicitudVehicularRepository.findById(solicitudId)).thenReturn(Optional.of(solicitudAjena()));

        assertThrows(ForbiddenException.class, () -> service.replaceFile(adjuntoId,
                new MockMultipartFile("file", "a.pdf", "application/pdf", new byte[]{1})));

        verify(documentStorageService, never()).store(any(), any(), any());
    }

    @Test
    void delete_solicitudAjena_noDebeEliminarArchivoNiRegistro() {
        configurarUsuarioActual();
        when(repository.findById(adjuntoId)).thenReturn(Optional.of(adjuntoAjeno()));
        when(solicitudVehicularRepository.findById(solicitudId)).thenReturn(Optional.of(solicitudAjena()));

        assertThrows(ForbiddenException.class, () -> service.delete(adjuntoId));

        verify(documentStorageService, never()).delete(any());
        verify(repository, never()).deleteById(any());
    }

    @Test
    void findById_solicitudInexistente_debeLanzar404() {
        when(repository.findById(adjuntoId)).thenReturn(Optional.of(adjuntoAjeno()));
        when(solicitudVehicularRepository.findById(solicitudId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.findById(adjuntoId));
    }

    private void configurarUsuarioActual() {
        UUID userId = UUID.randomUUID();
        UUID personaId = UUID.randomUUID();
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.of(userId));
        when(usuarioRepository.findById(userId))
                .thenReturn(Optional.of(Usuario.builder().id(userId).personaId(personaId).build()));
        when(empleadoRepository.findFirstByPersonaId(personaId))
                .thenReturn(Optional.of(Empleado.builder().id(UUID.randomUUID()).build()));
        when(conductorRepository.findByEmpleadoId(any())).thenReturn(Optional.empty());
    }

    private SolicitudVehicularAdjunto adjuntoAjeno() {
        return SolicitudVehicularAdjunto.builder()
                .id(adjuntoId)
                .solicitudVehicularId(solicitudId)
                .url("/api/v1/files/adjunto.pdf")
                .build();
    }

    private SolicitudVehicular solicitudAjena() {
        return SolicitudVehicular.builder()
                .id(solicitudId)
                .createdById(UUID.randomUUID())
                .solicitanteId(UUID.randomUUID())
                .build();
    }
}
