package com.autocontrol.dto.driver;

import jakarta.validation.constraints.NotBlank;

public record DriverRequest(
        @NotBlank String fullName,
        String phone,
        String comment
) {
}
