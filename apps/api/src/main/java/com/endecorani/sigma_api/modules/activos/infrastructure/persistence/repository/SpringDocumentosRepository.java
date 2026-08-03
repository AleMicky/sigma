package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.DocumentosEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringDocumentosRepository
        extends BaseJpaRepository<
        DocumentosEntity,
        UUID
        > {

    Page<DocumentosEntity> findByActivoId(UUID activoId, Pageable pageable);

    Page<DocumentosEntity> findByTipoDocumentoId(UUID tipoDocumentoId, Pageable pageable);

    Page<DocumentosEntity> findByActivoIdAndTipoDocumentoId(
            UUID activoId,
            UUID tipoDocumentoId,
            Pageable pageable
    );

    @Query("""
            select documento
            from DocumentosEntity documento
            where lower(documento.nombre) like lower(concat('%', :query, '%'))
               or lower(documento.descripcion) like lower(concat('%', :query, '%'))
            """)
    Page<DocumentosEntity> search(
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            select documento
            from DocumentosEntity documento
            where documento.activoId = :activoId
              and (
                   lower(documento.nombre) like lower(concat('%', :query, '%'))
                or lower(documento.descripcion) like lower(concat('%', :query, '%'))
              )
            """)
    Page<DocumentosEntity> searchByActivoId(
            @Param("activoId") UUID activoId,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            select documento
            from DocumentosEntity documento
            where documento.tipoDocumentoId = :tipoDocumentoId
              and (
                   lower(documento.nombre) like lower(concat('%', :query, '%'))
                or lower(documento.descripcion) like lower(concat('%', :query, '%'))
              )
            """)
    Page<DocumentosEntity> searchByTipoDocumentoId(
            @Param("tipoDocumentoId") UUID tipoDocumentoId,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            select documento
            from DocumentosEntity documento
            where documento.activoId = :activoId
              and documento.tipoDocumentoId = :tipoDocumentoId
              and (
                   lower(documento.nombre) like lower(concat('%', :query, '%'))
                or lower(documento.descripcion) like lower(concat('%', :query, '%'))
              )
            """)
    Page<DocumentosEntity> searchByActivoIdAndTipoDocumentoId(
            @Param("activoId") UUID activoId,
            @Param("tipoDocumentoId") UUID tipoDocumentoId,
            @Param("query") String query,
            Pageable pageable
    );
}