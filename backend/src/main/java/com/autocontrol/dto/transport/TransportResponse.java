package com.autocontrol.dto.transport;

import com.autocontrol.enums.TransportStatus;
import java.time.LocalDate;

public record TransportResponse(
        Long id,
        String plateNumber,
        String brand,
        String model,
        Integer year,
        String comment,
        String lastDriverName,
        LocalDate lastInspectionDate,
        LocalDate nextInspectionDate,
        TransportStatus status,
        long activeProblemsCount
) {
}
