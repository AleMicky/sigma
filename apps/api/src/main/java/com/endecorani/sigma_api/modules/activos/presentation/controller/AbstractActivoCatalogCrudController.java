package com.endecorani.sigma_api.modules.activos.presentation.controller;

import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.presentation.controller.AbstractCrudController;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * Base para los catálogos del módulo de activos (categorías, tipos, estados,
 * componentes, accesorios y atributos).
 *
 * <p>Decisión de autorización (REQ-BIZ-001): el JWT de Keycloak sólo expone
 * roles como authorities ({@code KeycloakJwtAuthenticationConverter}); la tabla
 * {@code seguridad.permisos} describe menús/rutas y no se traduce en
 * {@code GrantedAuthority}. Por eso no se inventan permisos granulares: las
 * mutaciones de catálogo y las eliminaciones exigen el rol {@code ADMIN} ya
 * usado por el módulo de seguridad, y las consultas quedan en
 * {@code isAuthenticated()}.
 *
 * @param <REQUEST>  DTO de solicitud.
 * @param <RESPONSE> DTO de respuesta.
 * @param <ID>       Tipo del identificador.
 */
@PreAuthorize("isAuthenticated()")
public abstract class AbstractActivoCatalogCrudController<REQUEST, RESPONSE, ID>
        extends AbstractCrudController<REQUEST, RESPONSE, ID> {

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    @Operation(summary = "Crear un registro del catálogo (solo ADMIN)")
    public ResponseEntity<ApiResponse<RESPONSE>> create(@Valid @RequestBody REQUEST request) {
        return super.create(request);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un registro del catálogo (solo ADMIN)")
    public ResponseEntity<ApiResponse<RESPONSE>> update(
            @PathVariable ID id,
            @Valid @RequestBody REQUEST request
    ) {
        return super.update(id, request);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un registro del catálogo (solo ADMIN)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable ID id) {
        return super.delete(id);
    }
}
