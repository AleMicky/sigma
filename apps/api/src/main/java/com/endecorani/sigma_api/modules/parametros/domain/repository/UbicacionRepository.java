package com.endecorani.sigma_api.modules.parametros.domain.repository;

import com.endecorani.sigma_api.modules.parametros.domain.enums.TipoUbicacion;
import com.endecorani.sigma_api.modules.parametros.domain.model.Ubicacion;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface UbicacionRepository extends CrudRepository<Ubicacion, UUID> {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    );

    Page<Ubicacion> search(
            String query,
            Pageable pageable
    );

    Page<Ubicacion> findByTipo(
            TipoUbicacion tipo,
            Pageable pageable
    );

    List<Ubicacion> findByUbicacionPadreId(UUID ubicacionPadreId);

    List<Ubicacion> findByUbicacionPadreIdIsNull();

    List<Ubicacion> findAll();

    boolean existsByUbicacionPadreId(UUID ubicacionPadreId);
}