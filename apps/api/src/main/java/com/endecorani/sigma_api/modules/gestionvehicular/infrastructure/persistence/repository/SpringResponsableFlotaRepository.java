package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ResponsableFlotaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringResponsableFlotaRepository extends JpaRepository<ResponsableFlotaEntity, UUID> {

    List<ResponsableFlotaEntity> findByFlotaVehicularId(UUID flotaVehicularId);

    List<ResponsableFlotaEntity> findByEmpleadoId(UUID empleadoId);

    Optional<ResponsableFlotaEntity> findByFlotaVehicularIdAndEmpleadoId(UUID flotaVehicularId, UUID empleadoId);

    boolean existsByFlotaVehicularIdAndEmpleadoId(UUID flotaVehicularId, UUID empleadoId);

    boolean existsByFlotaVehicularIdAndEmpleadoIdAndIdNot(UUID flotaVehicularId, UUID empleadoId, UUID id);

    @Modifying
    @Query("""
        UPDATE ResponsableFlotaEntity r
        SET r.principal = false
        WHERE r.flotaVehicularId = :flotaVehicularId AND r.id <> :excludeId
    """)
    void clearOtherPrincipals(@Param("flotaVehicularId") UUID flotaVehicularId, @Param("excludeId") UUID excludeId);

    @Query("""
        SELECT r FROM ResponsableFlotaEntity r
        WHERE (:flotaVehicularId IS NULL OR r.flotaVehicularId = :flotaVehicularId)
          AND (:empleadoId IS NULL OR r.empleadoId = :empleadoId)
          AND (:principal IS NULL OR r.principal = :principal)
          AND (:activo IS NULL OR r.activo = :activo)
    """)
    Page<ResponsableFlotaEntity> searchWithFilters(
            @Param("flotaVehicularId") UUID flotaVehicularId,
            @Param("empleadoId") UUID empleadoId,
            @Param("principal") Boolean principal,
            @Param("activo") Boolean activo,
            Pageable pageable
    );
}
