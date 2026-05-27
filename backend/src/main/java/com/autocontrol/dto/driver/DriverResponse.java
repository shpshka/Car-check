package com.autocontrol.dto.driver;

public record DriverResponse(
        Long id,
        String fullName,
        String phone,
        String comment
) {
}
