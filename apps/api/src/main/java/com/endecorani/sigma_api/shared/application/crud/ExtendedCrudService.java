package com.endecorani.sigma_api.shared.application.crud;

import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;

/**
 * Interfaz genérica ampliada para servicios CRUD que admiten tipos distintos para
 * la creación y la actualización de entidades (DDD / CQRS-friendly).
 *
 * @param <CREATE_REQ> DTO de solicitud de creación.
 * @param <UPDATE_REQ> DTO de solicitud de actualización.
 * @param <RES>        DTO de respuesta.
 * @param <ID>         Tipo del identificador único de la entidad.
 */
public interface ExtendedCrudService<CREATE_REQ, UPDATE_REQ, RES, ID> {

    RES create(CREATE_REQ request);

    RES update(ID id, UPDATE_REQ request);

    RES findById(ID id);

    PageResponse<RES> findAll(PageRequestDto pageRequest);

    void delete(ID id);
}

