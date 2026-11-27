package com.endecorani.sigma_api.modules.seguridad.application.service;

import com.endecorani.sigma_api.modules.seguridad.application.dto.request.AsignarMenusRolRequest;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Rol;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.MenuRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.RolMenuRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.RolRepository;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository.RolJpaRepository;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository.RolMenuJpaRepository;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository.UsuarioJpaRepository;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository.UsuarioRolJpaRepository;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/** REQ-SEG-007: menuIds nulo no muta; [] es una limpieza explícita. */
@ExtendWith(MockitoExtension.class)
class RolMenuServiceAsignacionTest {

    @Mock
    private RolRepository rolRepository;
    @Mock
    private RolJpaRepository rolJpaRepository;
    @Mock
    private RolMenuRepository rolMenuRepository;
    @Mock
    private RolMenuJpaRepository rolMenuJpaRepository;
    @Mock
    private UsuarioJpaRepository usuarioJpaRepository;
    @Mock
    private UsuarioRolJpaRepository usuarioRolJpaRepository;
    @Mock
    private MenuRepository menuRepository;
    @Mock
    private MenuService menuService;

    private RolMenuService service;

    @BeforeEach
    void setUp() {
        service = new RolMenuService(
                rolRepository,
                rolJpaRepository,
                rolMenuRepository,
                rolMenuJpaRepository,
                usuarioJpaRepository,
                usuarioRolJpaRepository,
                menuRepository,
                menuService
        );
    }

    @Test
    void menuIdsNulo_debeFallar400SinMutarAsignaciones() {
        UUID rolId = UUID.randomUUID();

        BusinessException exception = assertThrows(BusinessException.class,
                () -> service.asignarMenus(rolId, new AsignarMenusRolRequest(null)));

        assertEquals("VALIDATION_ERROR", exception.getCode());
        verifyNoInteractions(rolMenuRepository);
    }

    @Test
    void requestNulo_debeFallar400SinMutarAsignaciones() {
        BusinessException exception = assertThrows(BusinessException.class,
                () -> service.asignarMenus(UUID.randomUUID(), null));

        assertEquals("VALIDATION_ERROR", exception.getCode());
        verifyNoInteractions(rolMenuRepository);
    }

    @Test
    void menuIdsVacio_debeLimpiarAsignacionesYRetornarListaVacia() {
        UUID rolId = UUID.randomUUID();
        when(rolRepository.findById(rolId)).thenReturn(Optional.of(mock(Rol.class)));

        List<UUID> resultado = service.asignarMenus(rolId, new AsignarMenusRolRequest(List.of()));

        assertEquals(List.of(), resultado);
        verify(rolMenuRepository).asignarMenusARol(rolId, List.of());
    }

    @Test
    void menuIdsConUUIDs_debeAsignarListaResultante() {
        UUID rolId = UUID.randomUUID();
        UUID menuId = UUID.randomUUID();
        when(rolRepository.findById(rolId)).thenReturn(Optional.of(mock(Rol.class)));
        when(menuRepository.existsById(menuId)).thenReturn(true);

        List<UUID> resultado = service.asignarMenus(rolId, new AsignarMenusRolRequest(List.of(menuId)));

        assertEquals(List.of(menuId), resultado);
        verify(rolMenuRepository).asignarMenusARol(rolId, List.of(menuId));
    }
}
