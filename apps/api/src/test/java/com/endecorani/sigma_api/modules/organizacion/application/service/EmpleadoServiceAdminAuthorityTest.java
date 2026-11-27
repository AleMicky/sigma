package com.endecorani.sigma_api.modules.organizacion.application.service;

import com.endecorani.sigma_api.modules.organizacion.domain.repository.AreaRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.CargoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.PersonaRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/** REQ-SEG-114: el alias "ADMIN" no habilita el alcance global de empleados. */
@ExtendWith(MockitoExtension.class)
class EmpleadoServiceAdminAuthorityTest {

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
    private EmpleadoService service;

    @Test
    void authorityAliasAdmin_noDebeVerTodosLosEmpleados() {
        var authentication = new UsernamePasswordAuthenticationToken(
                "admin", "credenciales", List.of(new SimpleGrantedAuthority("ADMIN")));

        assertTrue(service.findMisEmpleados(null, new PageRequestDto(), authentication).content().isEmpty());
        verifyNoInteractions(empleadoRepository);
    }

    @Test
    void authorityCanonicaRoleAdmin_debeVerTodosLosEmpleados() {
        var authentication = new UsernamePasswordAuthenticationToken(
                "admin", "credenciales", List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        when(empleadoRepository.findAll(any(Pageable.class))).thenReturn(Page.empty());

        assertTrue(service.findMisEmpleados(null, new PageRequestDto(), authentication).content().isEmpty());
        verify(empleadoRepository).findAll(any(Pageable.class));
    }
}
