package com.endecorani.sigma_api.modules.gestionvehicular.domain.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.FlotaVehiculo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FlotaVehiculoRepository {

    Page<FlotaVehiculo> findAll(Pageable pageable);

    Page<FlotaVehiculo> searchWithFilters(UUID flotaVehicularId, UUID activoId, Boolean activo, Pageable pageable);

    List<FlotaVehiculo> findByFlotaVehicularId(UUID flotaVehicularId);

    List<FlotaVehiculo> findByFlotaVehicularIdAndActivoIdIn(UUID flotaVehicularId, Collection<UUID> activoIds);

    List<FlotaVehiculo> findByResponsableEmpleadoId(UUID empleadoId, Boolean activo);

    Optional<FlotaVehiculo> findById(UUID id);

    Optional<FlotaVehiculo> findByFlotaVehicularIdAndActivoId(UUID flotaVehicularId, UUID activoId);

    FlotaVehiculo save(FlotaVehiculo flotaVehiculo);

    List<FlotaVehiculo> saveAll(List<FlotaVehiculo> flotaVehiculos);

    void deleteById(UUID id);

    void deleteAll(List<FlotaVehiculo> flotaVehiculos);

    void deleteByFlotaVehicularId(UUID flotaVehicularId);

    boolean existsById(UUID id);

    boolean existsByFlotaVehicularIdAndActivoId(UUID flotaVehicularId, UUID activoId);

    boolean existsByFlotaVehicularIdAndActivoIdAndIdNot(UUID flotaVehicularId, UUID activoId, UUID id);
}
