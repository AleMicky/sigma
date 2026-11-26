package com.endecorani.sigma_api.modules.gestionvehicular.application.dto;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.cargacombustible.request.CargaCombustibleRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.viajevehicular.request.RegistrarRetornoViajeRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.viajevehicular.request.RegistrarSalidaViajeRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.CargaCombustibleService;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.ViajeVehicularService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.test.util.ReflectionTestUtils;
import tools.jackson.databind.json.JsonMapper;

import java.time.LocalDateTime;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * REQ-VEH-006 / REQ-VEH-008: fechas ISO-8601 con Z, offset o formato local se convierten
 * a la misma hora de {@code America/La_Paz}, y los campos de ordenación anunciados
 * ({@code createdAt}, {@code fechaCarga}) son aceptados por la paginación.
 */
class FechasVehicularesDeserializationTest {

    private static final JsonMapper MAPPER = JsonMapper.builder().build();
    private static final LocalDateTime ESPERADO = LocalDateTime.of(2026, 11, 26, 10, 0);

    @ParameterizedTest
    @CsvSource({
            "2026-11-26T10:00:00",
            "2026-11-26T14:00:00Z",
            "2026-11-26T10:00:00-04:00"
    })
    void cargaCombustible_fechaCarga_aceptaIsoLocalZOffset(String texto) {
        CargaCombustibleRequest request = MAPPER.readValue(
                "{\"fechaCarga\":\"" + texto + "\"}", CargaCombustibleRequest.class);
        assertEquals(ESPERADO, request.fechaCarga());
    }

    @ParameterizedTest
    @CsvSource({
            "2026-11-26T10:00:00",
            "2026-11-26T14:00:00Z",
            "2026-11-26T10:00:00-04:00"
    })
    void registrarSalidaViaje_fechaSalidaReal_aceptaIsoLocalZOffset(String texto) {
        RegistrarSalidaViajeRequest request = MAPPER.readValue(
                "{\"fechaSalidaReal\":\"" + texto + "\"}", RegistrarSalidaViajeRequest.class);
        assertEquals(ESPERADO, request.fechaSalidaReal());
    }

    @ParameterizedTest
    @CsvSource({
            "2026-11-26T10:00:00",
            "2026-11-26T14:00:00Z",
            "2026-11-26T10:00:00-04:00"
    })
    void registrarRetornoViaje_fechaRetornoReal_aceptaIsoLocalZOffset(String texto) {
        RegistrarRetornoViajeRequest request = MAPPER.readValue(
                "{\"fechaRetornoReal\":\"" + texto + "\"}", RegistrarRetornoViajeRequest.class);
        assertEquals(ESPERADO, request.fechaRetornoReal());
    }

    @Test
    void sortByYDirection_sonValidadosContraCamposPermitidos() {
        @SuppressWarnings("unchecked")
        Set<String> viajeCampos = (Set<String>) ReflectionTestUtils.getField(ViajeVehicularService.class, "SORT_FIELDS");
        @SuppressWarnings("unchecked")
        Set<String> cargaCampos = (Set<String>) ReflectionTestUtils.getField(CargaCombustibleService.class, "SORT_FIELDS");

        assertTrue(viajeCampos.contains("createdAt"));
        assertTrue(cargaCampos.contains("createdAt"));
        assertTrue(cargaCampos.contains("fechaCarga"));

        Pageable pagina = new PageRequestDto(0, 20, "createdAt", Sort.Direction.ASC).toPageable(viajeCampos);
        assertEquals("createdAt", pagina.getSort().getOrderFor("createdAt").getProperty());
        assertEquals(Sort.Direction.ASC, pagina.getSort().getOrderFor("createdAt").getDirection());

        Pageable carga = new PageRequestDto(0, 20, "fechaCarga", Sort.Direction.DESC).toPageable(cargaCampos);
        assertEquals(Sort.Direction.DESC, carga.getSort().getOrderFor("fechaCarga").getDirection());

        BusinessException ex = assertThrows(BusinessException.class,
                () -> new PageRequestDto(0, 20, "campoInexistente; DROP", Sort.Direction.ASC)
                        .toPageable(viajeCampos));
        assertEquals("INVALID_SORT_FIELD", ex.getCode());
    }
}
