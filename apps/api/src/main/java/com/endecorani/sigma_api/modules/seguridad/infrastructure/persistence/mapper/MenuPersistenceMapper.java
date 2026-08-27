package com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.seguridad.domain.model.Menu;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.MenuEntity;
import org.springframework.stereotype.Component;

@Component
public class MenuPersistenceMapper {

    public MenuEntity toEntity(Menu menu) {
        if (menu == null) {
            return null;
        }

        MenuEntity entity = new MenuEntity();
        entity.setId(menu.getId());
        entity.setCodigo(menu.getCodigo());
        entity.setNombre(menu.getNombre());
        entity.setIcono(menu.getIcono());
        entity.setRuta(menu.getRuta());
        entity.setOrden(menu.getOrden());
        entity.setActivo(menu.isActivo());

        if (menu.getMenuPadreId() != null) {
            MenuEntity menuPadre = new MenuEntity();
            menuPadre.setId(menu.getMenuPadreId());
            entity.setMenuPadre(menuPadre);
        }
        return entity;
    }

    public Menu toDomain(MenuEntity entity) {
        if (entity == null) {
            return null;
        }

        return Menu.builder()
                .id(entity.getId())
                .menuPadreId(
                        entity.getMenuPadre() != null
                                ? entity.getMenuPadre().getId()
                                : null
                )
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .icono(entity.getIcono())
                .ruta(entity.getRuta())
                .orden(entity.getOrden())
                .activo(entity.isActivo())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
