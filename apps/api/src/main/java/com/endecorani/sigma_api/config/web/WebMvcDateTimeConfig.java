package com.endecorani.sigma_api.config.web;

import com.endecorani.sigma_api.shared.util.FlexibleLocalDateTimeParser;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.LocalDateTime;

@Configuration
public class WebMvcDateTimeConfig implements WebMvcConfigurer {

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(new StringToFlexibleLocalDateTimeConverter());
    }

    public static class StringToFlexibleLocalDateTimeConverter implements Converter<String, LocalDateTime> {

        @Override
        public LocalDateTime convert(String source) {
            return FlexibleLocalDateTimeParser.parse(source);
        }
    }
}
