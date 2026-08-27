package com.endecorani.sigma_api.modules.seguridad.application.service;

import com.endecorani.sigma_api.modules.seguridad.application.dto.request.MenuRequest;
import com.endecorani.sigma_api.modules.seguridad.application.dto.response.MenuResponse;
import com.endecorani.sigma_api.modules.seguridad.application.dto.response.MenuTreeNode;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Menu;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.MenuRepository;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaMapper;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MenuService {

    private static final int CODIGO_MIN_LENGTH = 2;
    private static final int CODIGO_MAX_LENGTH = 100;
    private static final int NOMBRE_MIN_LENGTH = 2;
    private static final int NOMBRE_MAX_LENGTH = 150;
    private static final int ICONO_MAX_LENGTH = 100;
    private static final int RUTA_MAX_LENGTH = 300;

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "nombre",
            "orden",
            "activo",
            "createdAt",
            "updatedAt"
    );

    private static final Comparator<Menu> MENU_ORDER_COMPARATOR =
            Comparator.comparingInt(Menu::getOrden)
                    .thenComparing(Menu::getNombre, String.CASE_INSENSITIVE_ORDER);

    private final MenuRepository menuRepository;

    @Transactional
    public MenuResponse create(MenuRequest request) {
        Menu domain = toDomain(request);
        Menu saved = menuRepository.save(domain);
        return toResponse(saved);
    }

    @Transactional
    public MenuResponse update(UUID id, MenuRequest request) {
        Menu domain = findDomainById(id);
        updateDomain(domain, request);
        Menu updated = menuRepository.save(domain);
        return toResponse(updated);
    }

    @Transactional(readOnly = true)
    public MenuResponse findById(UUID id) {
        return toResponse(findDomainById(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<MenuResponse> findAll(PageRequestDto pageRequest) {
        var page = menuRepository.findAll(
                pageRequest.toPageable(SORT_FIELDS)
        );
        return PageResponse.from(page, this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<MenuResponse> findAllList() {
        return menuRepository.findAll()
                .stream()
                .sorted(MENU_ORDER_COMPARATOR)
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<MenuResponse> search(
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(query);

        if (normalized == null) {
            return findAll(pageRequest);
        }

        return PageResponse.from(
                menuRepository.search(
                        normalized,
                        pageRequest.toPageable(SORT_FIELDS)
                ),
                this::toResponse
        );
    }

    @Transactional
    public void delete(UUID id) {
        if (!menuRepository.existsById(id)) {
            throw new ResourceNotFoundException(resourceName(), id);
        }
        if (menuRepository.existsByMenuPadreId(id)) {
            throw new ConflictException(
                    "MENU_HAS_CHILDREN",
                    "No se puede eliminar el menú porque tiene menús hijos asociados"
            );
        }
        menuRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<MenuResponse> findRaices() {
        return menuRepository.findByMenuPadreIdIsNull()
                .stream()
                .sorted(MENU_ORDER_COMPARATOR)
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MenuResponse> findHijos(UUID id) {
        if (!menuRepository.existsById(id)) {
            throw new ResourceNotFoundException(resourceName(), id);
        }
        return menuRepository.findByMenuPadreId(id)
                .stream()
                .sorted(MENU_ORDER_COMPARATOR)
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MenuTreeNode> buildArbol() {
        List<Menu> todos = menuRepository.findAll();
        return construirArbolDesdeRaices(todos);
    }

    @Transactional(readOnly = true)
    public MenuTreeNode buildArbol(UUID id) {
        Menu raiz = findDomainById(id);
        List<Menu> todos = menuRepository.findAll();
        Map<UUID, List<Menu>> porPadre = agruparPorPadre(todos);
        return construirNodo(raiz, porPadre);
    }

    private Menu toDomain(MenuRequest request) {
        String codigo = requireNormalizedCodigo(request.codigo());
        validateUniqueCodigoForCreate(codigo);

        if (request.menuPadreId() != null) {
            validatePadreExists(request.menuPadreId());
        }

        return Menu.builder()
                .codigo(codigo)
                .nombre(requireNormalizedNombre(request.nombre()))
                .icono(normalizeIcono(request.icono()))
                .ruta(normalizeRuta(request.ruta()))
                .menuPadreId(request.menuPadreId())
                .orden(normalizeOrden(request.orden()))
                .activo(request.activo() == null || request.activo())
                .build();
    }

    private void updateDomain(Menu domain, MenuRequest request) {
        rejectCodigoChange(domain.getCodigo(), request.codigo());

        if (request.menuPadreId() != null) {
            validatePadreExists(request.menuPadreId());
            validateNoCircularReference(domain.getId(), request.menuPadreId());
        }

        domain.setNombre(requireNormalizedNombre(request.nombre()));
        domain.setIcono(normalizeIcono(request.icono()));
        domain.setRuta(normalizeRuta(request.ruta()));
        domain.setMenuPadreId(request.menuPadreId());
        domain.setOrden(normalizeOrden(request.orden()));
        domain.setActivo(request.activo() == null || request.activo());
    }

    private MenuResponse toResponse(Menu menu) {
        return new MenuResponse(
                menu.getId(),
                menu.getMenuPadreId(),
                menu.getCodigo(),
                menu.getNombre(),
                menu.getIcono(),
                menu.getRuta(),
                menu.getOrden(),
                menu.isActivo(),
                AuditoriaMapper.from(menu)
        );
    }

    private Menu findDomainById(UUID id) {
        return menuRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(resourceName(), id)
                );
    }

    private String resourceName() {
        return "Menú";
    }

    private void validateUniqueCodigoForCreate(String codigo) {
        if (menuRepository.existsByCodigoIgnoreCase(codigo)) {
            throw new ConflictException(
                    "MENU_ALREADY_EXISTS",
                    "Ya existe un menú con el código '%s'"
                            .formatted(codigo)
            );
        }
    }

    private void rejectCodigoChange(String currentCodigo, String requestedCodigo) {
        String normalized = StringUtils.normalize(requestedCodigo);

        if (normalized == null || !normalized.equalsIgnoreCase(currentCodigo)) {
            throw new BusinessException(
                    "MENU_CODIGO_IMMUTABLE",
                    "El código del menú no se puede modificar"
            );
        }
    }

    private void validatePadreExists(UUID menuPadreId) {
        if (!menuRepository.existsById(menuPadreId)) {
            throw new ResourceNotFoundException(
                    "Menú padre",
                    menuPadreId
            );
        }
    }

    private void validateNoCircularReference(UUID menuId, UUID nuevoPadreId) {
        if (nuevoPadreId == null) {
            return;
        }
        if (menuId.equals(nuevoPadreId)) {
            throw new BusinessException(
                    "MENU_CIRCULAR_REFERENCE",
                    "Un menú no puede ser su propio padre"
            );
        }

        Set<UUID> visitados = new HashSet<>();
        UUID current = nuevoPadreId;

        while (current != null) {
            if (current.equals(menuId)) {
                throw new BusinessException(
                        "MENU_CIRCULAR_REFERENCE",
                        "Se detectó una referencia circular en la jerarquía de menús"
                );
            }
            if (!visitados.add(current)) {
                break;
            }
            Menu padre = menuRepository.findById(current).orElse(null);
            current = padre != null ? padre.getMenuPadreId() : null;
        }
    }

    private String requireNormalizedCodigo(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < CODIGO_MIN_LENGTH
                || normalized.length() > CODIGO_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_MENU_CODIGO",
                    "El código debe tener entre %d y %d caracteres"
                            .formatted(CODIGO_MIN_LENGTH, CODIGO_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String requireNormalizedNombre(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < NOMBRE_MIN_LENGTH
                || normalized.length() > NOMBRE_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_MENU_NOMBRE",
                    "El nombre debe tener entre %d y %d caracteres"
                            .formatted(NOMBRE_MIN_LENGTH, NOMBRE_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String normalizeIcono(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized != null && normalized.length() > ICONO_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_MENU_ICONO",
                    "El icono no puede superar los %d caracteres"
                            .formatted(ICONO_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String normalizeRuta(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized != null && normalized.length() > RUTA_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_MENU_RUTA",
                    "La ruta no puede superar los %d caracteres"
                            .formatted(RUTA_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private int normalizeOrden(Integer orden) {
        return orden == null ? 0 : orden;
    }

    private Map<UUID, List<Menu>> agruparPorPadre(List<Menu> menus) {
        Map<UUID, List<Menu>> porPadre = new HashMap<>();
        for (Menu menu : menus) {
            UUID clave = menu.getMenuPadreId() != null
                    ? menu.getMenuPadreId()
                    : null;
            porPadre.computeIfAbsent(clave, k -> new ArrayList<>()).add(menu);
        }
        return porPadre;
    }

    private List<MenuTreeNode> construirArbolDesdeRaices(List<Menu> todos) {
        Map<UUID, List<Menu>> porPadre = agruparPorPadre(todos);
        List<Menu> raices = porPadre.getOrDefault(null, List.of())
                .stream()
                .sorted(MENU_ORDER_COMPARATOR)
                .toList();
        List<MenuTreeNode> nodos = new ArrayList<>();
        for (Menu raiz : raices) {
            nodos.add(construirNodo(raiz, porPadre));
        }
        return nodos;
    }

    private MenuTreeNode construirNodo(
            Menu menu,
            Map<UUID, List<Menu>> porPadre
    ) {
        List<Menu> hijosEntities = porPadre.getOrDefault(
                menu.getId(),
                List.of()
        ).stream()
                .sorted(MENU_ORDER_COMPARATOR)
                .toList();
        List<MenuTreeNode> hijos = new ArrayList<>();
        for (Menu hijo : hijosEntities) {
            hijos.add(construirNodo(hijo, porPadre));
        }
        return new MenuTreeNode(
                menu.getId(),
                menu.getMenuPadreId(),
                menu.getCodigo(),
                menu.getNombre(),
                menu.getIcono(),
                menu.getRuta(),
                menu.getOrden(),
                menu.isActivo(),
                hijos
        );
    }
}
