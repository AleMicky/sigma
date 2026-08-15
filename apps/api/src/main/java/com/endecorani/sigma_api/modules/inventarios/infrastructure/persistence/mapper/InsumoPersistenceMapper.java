package com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.inventarios.domain.model.Insumo;
import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity.CategoriaInsumoEntity;
import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity.InsumoEntity;
import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity.TipoInsumoEntity;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.UnidadMedidaEntity;
import org.springframework.stereotype.Component;

@Component
public class InsumoPersistenceMapper {

    public InsumoEntity toEntity(Insumo domain) {
        if (domain == null) {
            return null;
        }

        InsumoEntity entity = new InsumoEntity();
        entity.setId(domain.getId());
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());
        entity.setMarca(domain.getMarca());

        if (domain.getTipoInsumoId() != null) {
            TipoInsumoEntity tipoInsumo = new TipoInsumoEntity();
            tipoInsumo.setId(domain.getTipoInsumoId());
            entity.setTipoInsumo(tipoInsumo);
        }

        if (domain.getCategoriaInsumoId() != null) {
            CategoriaInsumoEntity categoriaInsumo = new CategoriaInsumoEntity();
            categoriaInsumo.setId(domain.getCategoriaInsumoId());
            entity.setCategoriaInsumo(categoriaInsumo);
        }

        if (domain.getUnidadMedidaId() != null) {
            UnidadMedidaEntity unidadMedida = new UnidadMedidaEntity();
            unidadMedida.setId(domain.getUnidadMedidaId());
            entity.setUnidadMedida(unidadMedida);
        }

        return entity;
    }

    public Insumo toDomain(InsumoEntity entity) {
        if (entity == null) {
            return null;
        }

        return Insumo.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .tipoInsumoId(
                        entity.getTipoInsumo() != null
                                ? entity.getTipoInsumo().getId()
                                : null
                )
                .categoriaInsumoId(
                        entity.getCategoriaInsumo() != null
                                ? entity.getCategoriaInsumo().getId()
                                : null
                )
                .unidadMedidaId(
                        entity.getUnidadMedida() != null
                                ? entity.getUnidadMedida().getId()
                                : null
                )
                .marca(entity.getMarca())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
