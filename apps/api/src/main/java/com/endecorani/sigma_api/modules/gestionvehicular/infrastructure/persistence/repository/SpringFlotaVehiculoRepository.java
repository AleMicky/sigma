package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.FlotaVehiculoEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringFlotaVehiculoRepository extends JpaRepository<FlotaVehiculoEntity, UUID> {

    List<FlotaVehiculoEntity> findByFlotaVehicularId(UUID flotaVehicularId);

    List<FlotaVehiculoEntity> findByFlotaVehicularIdAndActivoIdIn(UUID flotaVehicularId, Collection<UUID> activoIds);

    void deleteByFlotaVehicularId(UUID flotaVehicularId);

    Optional<FlotaVehiculoEntity> findByFlotaVehicularIdAndActivoId(UUID flotaVehicularId, UUID activoId);

    boolean existsByFlotaVehicularIdAndActivoId(UUID flotaVehicularId, UUID activoId);

    boolean existsByFlotaVehicularIdAndActivoIdAndIdNot(UUID flotaVehicularId, UUID activoId, UUID id);

    @Query("""
        SELECT fv FROM FlotaVehiculoEntity fv
        WHERE (:flotaVehicularId IS NULL OR fv.flotaVehicularId = :flotaVehicularId)
          AND (:activoId IS NULL OR fv.activoId = :activoId)
          AND (:activo IS NULL OR fv.activo = :activo)
    """)
    Page<FlotaVehiculoEntity> searchWithFilters(
            @Param("flotaVehicularId") UUID flotaVehicularId,
            @Param("activoId") UUID activoId,
            @Param("activo") Boolean activo,
            Pageable pageable
    );

    @Query("""
        SELECT DISTINCT fv FROM FlotaVehiculoEntity fv
        INNER JOIN ResponsableFlotaEntity rf ON rf.flotaVehicularId = fv.flotaVehicularId
        WHERE rf.empleadoId = :empleadoId
          AND (:activo IS NULL OR (fv.activo = :activo AND rf.activo = :activo))
        ORDER BY fv.createdAt ASC
    """)
    List<FlotaVehiculoEntity> findByResponsableEmpleadoId(
            @Param("empleadoId") UUID empleadoId,
            @Param("activo") Boolean activo
    );
}
