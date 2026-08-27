package com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.MenuEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MenuJpaRepository
        extends org.springframework.data.jpa.repository.JpaRepository<MenuEntity, UUID> {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id);

    boolean existsByMenuPadreId(UUID menuPadreId);

    List<MenuEntity> findByMenuPadreId(UUID menuPadreId);

    List<MenuEntity> findByMenuPadreIdIsNull();

    @Query("""
            select m
            from MenuEntity m
            where lower(m.codigo) like lower(concat('%', :query, '%'))
               or lower(m.nombre) like lower(concat('%', :query, '%'))
            """)
    Page<MenuEntity> search(@Param("query") String query, Pageable pageable);
}
