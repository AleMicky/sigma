package com.endecorani.sigma_api.modules.seguridad.presentation.controller;

import com.endecorani.sigma_api.modules.seguridad.application.dto.request.AsignarMenusRolRequest;
import com.endecorani.sigma_api.modules.seguridad.application.dto.request.AsignarPersonaUsuarioRequest;
import com.endecorani.sigma_api.modules.seguridad.application.dto.request.MenuRequest;
import com.endecorani.sigma_api.modules.seguridad.application.dto.request.PermisoRequest;
import com.endecorani.sigma_api.modules.seguridad.application.service.MenuService;
import com.endecorani.sigma_api.modules.seguridad.application.service.PermisoService;
import com.endecorani.sigma_api.modules.seguridad.application.service.RolMenuService;
import com.endecorani.sigma_api.modules.seguridad.application.service.RolService;
import com.endecorani.sigma_api.modules.seguridad.application.service.RolSyncService;
import com.endecorani.sigma_api.modules.seguridad.application.service.UsuarioService;
import com.endecorani.sigma_api.modules.seguridad.application.service.UsuarioSyncService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@SpringJUnitConfig(classes = SeguridadControllersSecurityTest.TestConfig.class)
class SeguridadControllersSecurityTest {

    @Configuration
    @EnableMethodSecurity
    static class TestConfig {

        @Bean
        UsuarioService usuarioService() {
            return mock(UsuarioService.class);
        }

        @Bean
        UsuarioSyncService usuarioSyncService() {
            return mock(UsuarioSyncService.class);
        }

        @Bean
        RolService rolService() {
            return mock(RolService.class);
        }

        @Bean
        RolSyncService rolSyncService() {
            return mock(RolSyncService.class);
        }

        @Bean
        RolMenuService rolMenuService() {
            return mock(RolMenuService.class);
        }

        @Bean
        MenuService menuService() {
            return mock(MenuService.class);
        }

        @Bean
        PermisoService permisoService() {
            return mock(PermisoService.class);
        }

        @Bean
        UsuarioController usuarioController(UsuarioService usuarioService, UsuarioSyncService usuarioSyncService) {
            return new UsuarioController(usuarioService, usuarioSyncService);
        }

        @Bean
        RolController rolController(RolService rolService, RolSyncService rolSyncService) {
            return new RolController(rolService, rolSyncService);
        }

        @Bean
        RolMenuController rolMenuController(RolMenuService rolMenuService) {
            return new RolMenuController(rolMenuService);
        }

        @Bean
        MenuController menuController(MenuService menuService, RolMenuService rolMenuService) {
            return new MenuController(menuService, rolMenuService);
        }

        @Bean
        PermisoController permisoController(PermisoService permisoService) {
            return new PermisoController(permisoService);
        }
    }

    @Autowired
    private UsuarioController usuarioController;
    @Autowired
    private RolController rolController;
    @Autowired
    private RolMenuController rolMenuController;
    @Autowired
    private MenuController menuController;
    @Autowired
    private PermisoController permisoController;
    @Autowired
    private UsuarioSyncService usuarioSyncService;
    @Autowired
    private RolSyncService rolSyncService;
    @Autowired
    private RolMenuService rolMenuService;

    @Test
    @WithMockUser(username = "operador", roles = "OPERADOR")
    void usuarioNonAdmin_debeRecibirAccessDeniedEnEndpointsAdministrativosDeSeguridad() {
        UUID id = UUID.randomUUID();
        PageRequestDto page = new PageRequestDto();
        MenuRequest menuRequest = new MenuRequest("TEST", "Test", null, null, null, "/test", null, null, true, null, 1, true);
        PermisoRequest permisoRequest = new PermisoRequest(id, "TEST_PERM", "Test", null, "GET", "/api/v1/test", true);

        assertThrows(AccessDeniedException.class, () -> usuarioController.findAll(page));
        assertThrows(AccessDeniedException.class, () -> usuarioController.sincronizar());
        assertThrows(AccessDeniedException.class, () -> usuarioController.actualizarPersona(id, new AsignarPersonaUsuarioRequest(UUID.randomUUID())));

        assertThrows(AccessDeniedException.class, () -> rolController.findAll(page));
        assertThrows(AccessDeniedException.class, () -> rolController.sincronizar());
        assertThrows(AccessDeniedException.class, () -> rolController.findUsuariosByRol(id));

        assertThrows(AccessDeniedException.class, () -> rolMenuController.findMenusByRol(id));
        assertThrows(AccessDeniedException.class, () -> rolMenuController.asignarMenus(id, new AsignarMenusRolRequest(List.of())));

        assertThrows(AccessDeniedException.class, () -> menuController.findAll(page));
        assertThrows(AccessDeniedException.class, () -> menuController.create(menuRequest));
        assertThrows(AccessDeniedException.class, () -> menuController.update(id, menuRequest));
        assertThrows(AccessDeniedException.class, () -> menuController.delete(id));

        assertThrows(AccessDeniedException.class, () -> permisoController.findAll(null, null, page));
        assertThrows(AccessDeniedException.class, () -> permisoController.create(permisoRequest));
        assertThrows(AccessDeniedException.class, () -> permisoController.update(id, permisoRequest));
        assertThrows(AccessDeniedException.class, () -> permisoController.delete(id));
    }

    @Test
    @WithMockUser(username = "operador", roles = "OPERADOR")
    void usuarioNonAdmin_debePoderConsultarSusPropiosMenus() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        when(rolMenuService.obtenerMisMenus(any())).thenReturn(List.of());

        var response = menuController.obtenerMisMenus(auth);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void usuarioAdmin_debePoderEjecutarOperacionesAdministrativasDeSeguridad() {
        UUID rolId = UUID.randomUUID();
        MenuRequest menuRequest = new MenuRequest("TEST", "Test", null, null, null, "/test", null, null, true, null, 1, true);
        PermisoRequest permisoRequest = new PermisoRequest(rolId, "TEST_PERM", "Test", null, "GET", "/api/v1/test", true);

        when(usuarioSyncService.sincronizarTodos()).thenReturn(3);
        when(rolSyncService.sincronizarTodos()).thenReturn(2);
        when(rolMenuService.asignarMenus(any(), any())).thenReturn(List.of());

        assertEquals(HttpStatus.OK, usuarioController.sincronizar().getStatusCode());
        assertEquals(HttpStatus.OK, rolController.sincronizar().getStatusCode());
        assertEquals(HttpStatus.OK, rolMenuController.asignarMenus(rolId, new AsignarMenusRolRequest(List.of())).getStatusCode());
        assertEquals(HttpStatus.CREATED, menuController.create(menuRequest).getStatusCode());
        assertEquals(HttpStatus.CREATED, permisoController.create(permisoRequest).getStatusCode());
    }
}
