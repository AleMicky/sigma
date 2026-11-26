package com.endecorani.sigma_api.modules.activos.presentation.controller;

import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.presentation.controller.AbstractCrudController;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Base para operaciones diarias sobre activos (asignaciones y valores de
 * atributos). La creación/editación son operaciones operativas que el negocio
 * requiere para cualquier usuario autenticado; la eliminación se reserva a
 * {@code ADMIN}, como el resto de borrados del módulo (REQ-BIZ-001).
 *
 * <p>No existen permisos granulares en el JWT (sólo roles), por lo que no se
 * inventan authorities nuevas.
 *
 * @param <REQUEST>  DTO de solicitud.
 * @param <RESPONSE> DTO de respuesta.
 * @param <ID>       Tipo del identificador.
 */
@PreAuthorize("isAuthenticated()")
public abstract class AbstractActivoOperationalCrudController<REQUEST, RESPONSE, ID>
        extends AbstractCrudController<REQUEST, RESPONSE, ID> {

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un registro (solo ADMIN)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable ID id) {
        return super.delete(id);
    }
}
