package com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.seguridad.domain.model.RolMenu;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.MenuEntity;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.RolEntity;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.RolMenuEntity;
import org.springframework.stereotype.Component;

@Component
public class RolMenuPersistenceMapper {

    public RolMenuEntity toEntity(RolMenu domain) {
        if (domain == null) {
            return null;
        }

        RolEntity rolEntity = null;
        if (domain.getRolId() != null) {
            rolEntity = new RolEntity();
            rolEntity.setId(domain.getRolId());
        }

        MenuEntity menuEntity = null;
        if (domain.getMenuId() != null) {
            menuEntity = new MenuEntity();
            menuEntity.setId(domain.getMenuId());
        }

        RolMenuEntity entity = new RolMenuEntity();
        entity.setId(domain.getId());
        entity.setRol(rolEntity);
        entity.setMenu(menuEntity);
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setUpdatedAt(domain.getUpdatedAt());
        entity.setCreatedBy(domain.getCreatedBy());
        entity.setUpdatedBy(domain.getUpdatedBy());

        return entity;
    }

    public RolMenu toDomain(RolMenuEntity entity) {
        if (entity == null) {
            return null;
        }

        return RolMenu.builder()
                .id(entity.getId())
                .rolId(entity.getRol() != null ? entity.getRol().getId() : null)
                .menuId(entity.getMenu() != null ? entity.getMenu().getId() : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
