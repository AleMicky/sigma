package com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.RolMenuEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RolMenuJpaRepository extends JpaRepository<RolMenuEntity, UUID> {

    List<RolMenuEntity> findByRolId(UUID rolId);

    List<RolMenuEntity> findByRolIdIn(List<UUID> rolIds);

    List<RolMenuEntity> findByMenuId(UUID menuId);

    Optional<RolMenuEntity> findByRolIdAndMenuId(UUID rolId, UUID menuId);

    void deleteByRolId(UUID rolId);

    void deleteByMenuId(UUID menuId);
}
