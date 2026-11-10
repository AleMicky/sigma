package com.endecorani.sigma_api.shared.presentation.controller;

import com.endecorani.sigma_api.shared.application.crud.CrudService;

/**
 * Controlador base CRUD estándar para entidades cuyos DTOs de creación y actualización son idénticos.
 * Extiende de {@link AbstractExtendedCrudController} manteniendo total compatibilidad con las implementaciones existentes.
 *
 * @param <REQUEST>  DTO de solicitud (tanto para create como para update).
 * @param <RESPONSE> DTO de respuesta.
 * @param <ID>       Tipo del identificador único de la entidad.
 */
public abstract class AbstractCrudController<
        REQUEST,
        RESPONSE,
        ID
        > extends AbstractExtendedCrudController<REQUEST, REQUEST, RESPONSE, ID> {

    @Override
    protected abstract CrudService<REQUEST, RESPONSE, ID> service();
}
