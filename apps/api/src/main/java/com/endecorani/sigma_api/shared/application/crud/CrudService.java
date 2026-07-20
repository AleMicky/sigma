package com.endecorani.sigma_api.shared.application.crud;

import java.util.List;


public interface CrudService <REQ, RES, ID>  {
    RES create(REQ request);
    RES update(ID id, REQ request);
    RES findById(ID id);
    List<RES> findAll();
    void delete(ID id);
}
