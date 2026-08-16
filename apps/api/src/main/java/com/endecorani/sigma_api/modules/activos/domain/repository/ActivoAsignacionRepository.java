package com.endecorani.sigma_api.modules.activos.domain.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAsignacion;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ActivoAsignacionRepository extends CrudRepository<ActivoAsignacion, UUID> {

    Page<ActivoAsignacion> findAll(ActivoAsignacionSearchCriteria criteria, Pageable pageable);

}
