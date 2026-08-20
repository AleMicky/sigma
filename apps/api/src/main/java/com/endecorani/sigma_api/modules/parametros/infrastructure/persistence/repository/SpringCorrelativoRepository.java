package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.CorrelativoEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringCorrelativoRepository  extends JpaRepository<CorrelativoEntity, UUID> {
    boolean existsByCodigoIgnoreCaseAndGestion(
            String codigo,
            Integer gestion
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select correlativo
            from CorrelativoEntity correlativo
            where lower(correlativo.codigo) = lower(:codigo)
              and correlativo.gestion = :gestion
            """)
    Optional<CorrelativoEntity> findForUpdate(
            @Param("codigo") String codigo,
            @Param("gestion") Integer gestion
    );
}
