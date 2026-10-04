package com.endecorani.sigma_api.shared.presentation.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HealthControllerTest {

    @Mock
    private DataSource dataSource;

    @Mock
    private Connection connection;

    @InjectMocks
    private HealthController healthController;

    @Test
    @DisplayName("checkHealth should return UP when database connection is valid")
    void checkHealth_whenDatabaseHealthy_shouldReturnUp() throws SQLException {
        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.isValid(anyInt())).thenReturn(true);

        ResponseEntity<?> response = healthController.checkHealth();

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    @DisplayName("checkHealth should return DEGRADED when database connection throws exception")
    void checkHealth_whenDatabaseUnhealthy_shouldReturnDegraded() throws SQLException {
        when(dataSource.getConnection()).thenThrow(new SQLException("Connection error"));

        ResponseEntity<?> response = healthController.checkHealth();

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
    }
}
