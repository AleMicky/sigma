package com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.seguridad.domain.model.Permiso;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.MenuEntity;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.PermisoEntity;
import org.springframework.stereotype.Component;

@Component
public class PermisoPersistenceMapper {

    public PermisoEntity toEntity(Permiso permiso) {
        if (permiso == null) {
            return null;
        }

        PermisoEntity entity = new PermisoEntity();
        entity.setId(permiso.getId());
        entity.setCodigo(permiso.getCodigo());
        entity.setNombre(permiso.getNombre());
        entity.setDescripcion(permiso.getDescripcion());
        entity.setMetodoHttp(permiso.getMetodoHttp());
        entity.setRuta(permiso.getRuta());
        entity.setActivo(permiso.isActivo());

        if (permiso.getMenuId() != null) {
            MenuEntity menu = new MenuEntity();
            menu.setId(permiso.getMenuId());
            entity.setMenu(menu);
        } else {
            entity.setMenu(null);
        }

        return entity;
    }

    public Permiso toDomain(PermisoEntity entity) {
        if (entity == null) {
            return null;
        }

        return Permiso.builder()
                .id(entity.getId())
                .menuId(entity.getMenu() != null ? entity.getMenu().getId() : null)
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .metodoHttp(entity.getMetodoHttp())
                .ruta(entity.getRuta())
                .activo(entity.isActivo())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
