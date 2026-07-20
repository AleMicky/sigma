package com.endecorani.sigma_api.shared.application.crud;

import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;

public interface CrudService<REQ, RES, ID> {

    RES create(REQ request);

    RES update(ID id, REQ request);

    RES findById(ID id);

    PageResponse<RES> findAll(PageRequestDto pageRequest);

    void delete(ID id);
}
