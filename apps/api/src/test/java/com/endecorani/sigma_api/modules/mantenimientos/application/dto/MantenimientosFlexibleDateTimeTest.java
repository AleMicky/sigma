package com.endecorani.sigma_api.modules.mantenimientos.application.dto;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.request.OrdenTrabajoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request.PlanMantenimientoActivoRequest;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** REQ-MANT-007: ISO local, Z y offset se normalizan a America/La_Paz en todos los DTOs. */
class MantenimientosFlexibleDateTimeTest {

    private final JsonMapper mapper = JsonMapper.builder().build();

    @Test
    void ordenTrabajo_aceptaFechaLocalNaive() throws Exception {
        OrdenTrabajoRequest request = mapper.readValue("""
                {
                  "solicitudMantenimientoId": "11111111-1111-4111-8111-111111111111",
                  "activoId": "22222222-2222-4222-8222-222222222222",
                  "responsableId": "33333333-3333-4333-8333-333333333333",
                  "fechaInicio": "2026-11-26T10:00:00"
                }
                """, OrdenTrabajoRequest.class);

        assertEquals(LocalDateTime.of(2026, 11, 26, 10, 0), request.fechaInicio());
    }

    @Test
    void ordenTrabajo_aceptaFechaConZulu() throws Exception {
        OrdenTrabajoRequest request = mapper.readValue("""
                {
                  "solicitudMantenimientoId": "11111111-1111-4111-8111-111111111111",
                  "activoId": "22222222-2222-4222-8222-222222222222",
                  "responsableId": "33333333-3333-4333-8333-333333333333",
                  "fechaInicio": "2026-11-26T14:00:00Z"
                }
                """, OrdenTrabajoRequest.class);

        assertEquals(LocalDateTime.of(2026, 11, 26, 10, 0), request.fechaInicio());
    }

    @Test
    void ordenTrabajo_aceptaFechaConOffset() throws Exception {
        OrdenTrabajoRequest request = mapper.readValue("""
                {
                  "solicitudMantenimientoId": "11111111-1111-4111-8111-111111111111",
                  "activoId": "22222222-2222-4222-8222-222222222222",
                  "responsableId": "33333333-3333-4333-8333-333333333333",
                  "fechaInicio": "2026-11-26T10:00:00-04:00"
                }
                """, OrdenTrabajoRequest.class);

        assertEquals(LocalDateTime.of(2026, 11, 26, 10, 0), request.fechaInicio());
    }

    @Test
    void planActivo_aceptaFechaLocalNaive() throws Exception {
        PlanMantenimientoActivoRequest request = mapper.readValue("""
                {"planMantenimientoId": "11111111-1111-4111-8111-111111111111",
                 "activoId": "22222222-2222-4222-8222-222222222222",
                 "fechaInicio": "2026-11-26"}
                """, PlanMantenimientoActivoRequest.class);

        assertEquals(LocalDate.of(2026, 11, 26), request.fechaInicio());
    }

    @Test
    void planActivo_aceptaFechaConZulu() throws Exception {
        PlanMantenimientoActivoRequest request = mapper.readValue("""
                {"planMantenimientoId": "11111111-1111-4111-8111-111111111111",
                 "activoId": "22222222-2222-4222-8222-222222222222",
                 "fechaInicio": "2026-11-26T04:00:00Z"}
                """, PlanMantenimientoActivoRequest.class);

        assertEquals(LocalDate.of(2026, 11, 26), request.fechaInicio());
    }

    @Test
    void planActivo_aceptaFechaConOffset() throws Exception {
        PlanMantenimientoActivoRequest request = mapper.readValue("""
                {"planMantenimientoId": "11111111-1111-4111-8111-111111111111",
                 "activoId": "22222222-2222-4222-8222-222222222222",
                 "fechaInicio": "2026-11-26T10:00:00-04:00"}
                """, PlanMantenimientoActivoRequest.class);

        assertEquals(LocalDate.of(2026, 11, 26), request.fechaInicio());
    }
}
