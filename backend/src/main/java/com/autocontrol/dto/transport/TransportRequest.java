package com.autocontrol.dto.transport;

import jakarta.validation.constraints.NotBlank;

public record TransportRequest(
        @NotBlank String plateNumber,
        @NotBlank String brand,
        @NotBlank String model,
        Integer year,
        String comment
) {
}
