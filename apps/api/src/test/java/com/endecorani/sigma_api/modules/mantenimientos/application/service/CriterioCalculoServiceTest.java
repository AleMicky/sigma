package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.EstadoAlertaPreventiva;
import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ConfiguracionPreventiva;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimientoCriterio;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CriterioCalculoServiceTest {

    private final CriterioCalculoService service = new CriterioCalculoService();

    private ConfiguracionPreventiva defaultConfig() {
        return ConfiguracionPreventiva.builder()
                .diasAnticipacionAlerta(15)
                .kmAnticipacionAlerta(new BigDecimal("500"))
                .horasAnticipacionAlerta(new BigDecimal("50"))
                .build();
    }

    @Test
    void evaluarCriterioTiempo_debeDistinguirAlDiaProximoYCritico() {
        LocalDate hoy = LocalDate.of(2026, 11, 27);
        ConfiguracionPreventiva cfg = defaultConfig();

        ProgramacionMantenimientoCriterio alDia = ProgramacionMantenimientoCriterio.builder()
                .tipoCriterio(TipoCriterioMantenimiento.TIEMPO)
                .proximaFecha(hoy.plusDays(16))
                .activo(true)
                .build();
        ProgramacionMantenimientoCriterio proximo = ProgramacionMantenimientoCriterio.builder()
                .tipoCriterio(TipoCriterioMantenimiento.TIEMPO)
                .proximaFecha(hoy.plusDays(15))
                .activo(true)
                .build();
        ProgramacionMantenimientoCriterio critico = ProgramacionMantenimientoCriterio.builder()
                .tipoCriterio(TipoCriterioMantenimiento.TIEMPO)
                .proximaFecha(hoy)
                .activo(true)
                .build();

        assertThat(service.evaluarCriterio(alDia, hoy, null, null, cfg)).isEqualTo(EstadoAlertaPreventiva.AL_DIA);
        assertThat(service.evaluarCriterio(proximo, hoy, null, null, cfg)).isEqualTo(EstadoAlertaPreventiva.PROXIMO);
        assertThat(service.evaluarCriterio(critico, hoy, null, null, cfg)).isEqualTo(EstadoAlertaPreventiva.CRITICO);
    }

    @Test
    void evaluarProgramacionCombinada_debeVencerPorElPrimeroQueSeCumpla() {
        LocalDate hoy = LocalDate.of(2026, 11, 27);
        ConfiguracionPreventiva cfg = defaultConfig();

        ProgramacionMantenimientoCriterio porFecha = ProgramacionMantenimientoCriterio.builder()
                .tipoCriterio(TipoCriterioMantenimiento.TIEMPO)
                .proximaFecha(hoy.plusDays(60))
                .activo(true)
                .build();
        ProgramacionMantenimientoCriterio porKm = ProgramacionMantenimientoCriterio.builder()
                .tipoCriterio(TipoCriterioMantenimiento.KILOMETRAJE)
                .intervaloUso(new BigDecimal("5000"))
                .proximoValorUso(new BigDecimal("15000"))
                .activo(true)
                .build();

        EstadoAlertaPreventiva estado = service.evaluarProgramacion(
                true,
                List.of(porFecha, porKm),
                hoy,
                new BigDecimal("15050"),
                null,
                cfg
        );

        assertThat(estado).isEqualTo(EstadoAlertaPreventiva.CRITICO);
    }

    @Test
    void calcularProximoValorUso_debeSumarBaseEIntervalo() {
        BigDecimal proximo = service.calcularProximoValorUso(new BigDecimal("1200"), new BigDecimal("250"));
        assertThat(proximo).isEqualByComparingTo("1450");
    }
}
