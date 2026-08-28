package com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.PermisoEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PermisoJpaRepository extends JpaRepository<PermisoEntity, UUID> {

    List<PermisoEntity> findByMenuId(UUID menuId);

    Page<PermisoEntity> findByMenuId(UUID menuId, Pageable pageable);

    boolean existsByMenuId(UUID menuId);

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id);

    @Query("""
            select p
            from PermisoEntity p
            where lower(p.codigo) like lower(concat('%', :query, '%'))
               or lower(p.nombre) like lower(concat('%', :query, '%'))
               or lower(p.ruta) like lower(concat('%', :query, '%'))
            """)
    Page<PermisoEntity> search(@Param("query") String query, Pageable pageable);

    @Query("""
            select p
            from PermisoEntity p
            where p.menu.id = :menuId
              and (lower(p.codigo) like lower(concat('%', :query, '%'))
                or lower(p.nombre) like lower(concat('%', :query, '%'))
                or lower(p.ruta) like lower(concat('%', :query, '%')))
            """)
    Page<PermisoEntity> searchByMenuId(@Param("menuId") UUID menuId, @Param("query") String query, Pageable pageable);
}
