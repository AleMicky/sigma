package com.endecorani.sigma_api.modules.parametros.application.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CorrelativoRequest(

        @NotBlank
        @Size(max = 100)
        String codigo,

        @NotNull
        @Min(2000)
        Integer gestion,

        @NotBlank
        @Size(max = 20)
        String prefijo,

        @NotNull
        @Min(1)
        Integer longitud

) {
}