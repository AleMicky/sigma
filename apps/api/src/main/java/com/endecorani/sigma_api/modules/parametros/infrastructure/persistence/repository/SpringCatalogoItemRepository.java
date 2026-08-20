package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.CatalogoItemEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringCatalogoItemRepository
        extends JpaRepository<
        CatalogoItemEntity,
        UUID
        > {

    Page<CatalogoItemEntity> findByCatalogo_Id(
            UUID catalogoId,
            Pageable pageable
    );

    @Query("""
            select item
            from CatalogoItemEntity item
            where item.catalogo.id = :catalogoId
              and (
                   lower(item.nombre) like lower(concat('%', :query, '%'))
                   or lower(item.valor) like lower(concat('%', :query, '%'))
              )
            """)
    Page<CatalogoItemEntity> searchByCatalogoId(
            @Param("catalogoId") UUID catalogoId,
            @Param("query") String query,
            Pageable pageable
    );

    boolean existsByCatalogo_IdAndValorIgnoreCase(
            UUID catalogoId,
            String valor
    );

    boolean existsByCatalogo_IdAndValorIgnoreCaseAndIdNot(
            UUID catalogoId,
            String valor,
            UUID id
    );

    @Query("""
            select max(item.orden)
            from CatalogoItemEntity item
            where item.catalogo.id = :catalogoId
            """)
    Integer findMaxOrdenByCatalogoId(@Param("catalogoId") UUID catalogoId);

    boolean existsByCatalogo_IdAndOrden(
            UUID catalogoId,
            Integer orden
    );

    boolean existsByCatalogo_IdAndOrdenAndIdNot(
            UUID catalogoId,
            Integer orden,
            UUID id
    );

    Page<CatalogoItemEntity> findByCatalogo_Codigo(
            String codigo,
            Pageable pageable
    );

    @Query("""
            select item
            from CatalogoItemEntity item
            where item.catalogo.codigo = :codigo
              and (
                   lower(item.nombre) like lower(concat('%', :query, '%'))
                   or lower(item.valor) like lower(concat('%', :query, '%'))
              )
            """)
    Page<CatalogoItemEntity> searchByCodigo(
            @Param("codigo") String codigo,
            @Param("query") String query,
            Pageable pageable
    );
}
