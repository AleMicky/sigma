package com.endecorani.sigma_api.modules.gestionvehicular.domain.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.ResponsableFlota;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ResponsableFlotaRepository {

    Page<ResponsableFlota> findAll(Pageable pageable);

    Page<ResponsableFlota> searchWithFilters(UUID flotaVehicularId, UUID empleadoId, Boolean principal, Boolean activo, Pageable pageable);

    List<ResponsableFlota> findByFlotaVehicularId(UUID flotaVehicularId);

    List<ResponsableFlota> findByEmpleadoId(UUID empleadoId);

    Optional<ResponsableFlota> findById(UUID id);

    Optional<ResponsableFlota> findByFlotaVehicularIdAndEmpleadoId(UUID flotaVehicularId, UUID empleadoId);

    ResponsableFlota save(ResponsableFlota responsableFlota);

    void deleteById(UUID id);

    boolean existsById(UUID id);

    boolean existsByFlotaVehicularIdAndEmpleadoId(UUID flotaVehicularId, UUID empleadoId);

    boolean existsByFlotaVehicularIdAndEmpleadoIdAndIdNot(UUID flotaVehicularId, UUID empleadoId, UUID id);
}
