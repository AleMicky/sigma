package com.endecorani.sigma_api.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/**
 * Carga un archivo {@code .env} del monorepo en system properties
 * cuando la variable aún no está definida en el entorno del proceso.
 * Spring Boot no lee {@code .env} por defecto (IDE / {@code ./mvnw}).
 */
public final class DotEnvLoader {

    private DotEnvLoader() {
    }

    public static void load() {
        Path envFile = resolveEnvFile();
        if (envFile == null) {
            return;
        }

        try {
            List<String> lines = Files.readAllLines(envFile);
            for (String rawLine : lines) {
                applyLine(rawLine);
            }
        } catch (IOException ignored) {
            // Sin .env usable: se usan defaults de application.yaml / entorno real.
        }
    }

    private static Path resolveEnvFile() {
        Path cwd = Path.of("").toAbsolutePath().normalize();
        Path[] candidates = {
                cwd.resolve(".env"),
                cwd.resolve("../.env").normalize(),
                cwd.resolve("../../.env").normalize(),
                cwd.resolve("../../../.env").normalize()
        };

        for (Path candidate : candidates) {
            if (Files.isRegularFile(candidate)) {
                return candidate;
            }
        }
        return null;
    }

    private static void applyLine(String rawLine) {
        String line = rawLine.trim();
        if (line.isEmpty() || line.startsWith("#")) {
            return;
        }
        if (line.startsWith("export ")) {
            line = line.substring("export ".length()).trim();
        }

        int separator = line.indexOf('=');
        if (separator <= 0) {
            return;
        }

        String key = line.substring(0, separator).trim();
        String value = stripQuotes(line.substring(separator + 1).trim());

        if (key.isEmpty()) {
            return;
        }
        if (System.getenv(key) != null) {
            return;
        }
        if (System.getProperty(key) != null) {
            return;
        }

        System.setProperty(key, value);
    }

    private static String stripQuotes(String value) {
        if (value.length() >= 2) {
            char first = value.charAt(0);
            char last = value.charAt(value.length() - 1);
            if ((first == '"' && last == '"') || (first == '\'' && last == '\'')) {
                return value.substring(1, value.length() - 1);
            }
        }
        return value;
    }
}
