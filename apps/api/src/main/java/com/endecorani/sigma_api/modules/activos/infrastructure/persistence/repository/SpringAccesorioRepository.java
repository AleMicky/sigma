package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.AccesorioEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringAccesorioRepository
        extends JpaRepository<AccesorioEntity, UUID> {

    Page<AccesorioEntity> findByCategoriaId(
            UUID categoriaId,
            Pageable pageable
    );

    @Query("""
            select accesorio
            from AccesorioEntity accesorio
            where accesorio.categoriaId = :categoriaId
              and (
                   lower(accesorio.codigo) like lower(concat('%', :query, '%'))
                   or lower(accesorio.nombre) like lower(concat('%', :query, '%'))
              )
            """)
    Page<AccesorioEntity> searchByCategoriaId(
            @Param("categoriaId") UUID categoriaId,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            select accesorio
            from AccesorioEntity accesorio
            where lower(accesorio.codigo) like lower(concat('%', :query, '%'))
               or lower(accesorio.nombre) like lower(concat('%', :query, '%'))
            """)
    Page<AccesorioEntity> search(
            @Param("query") String query,
            Pageable pageable
    );

    boolean existsByCategoriaIdAndCodigoIgnoreCase(
            UUID categoriaId,
            String codigo
    );

    boolean existsByCategoriaIdAndCodigoIgnoreCaseAndIdNot(
            UUID categoriaId,
            String codigo,
            UUID id
    );
}
