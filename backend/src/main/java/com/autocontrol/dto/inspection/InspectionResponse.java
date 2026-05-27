package com.autocontrol.dto.inspection;

import com.autocontrol.enums.InspectionResult;
import java.time.LocalDate;

public record InspectionResponse(
        Long id,
        Long transportId,
        String transportPlateNumber,
        Long driverId,
        String driverName,
        LocalDate inspectionDate,
        InspectionResult result,
        String comment,
        LocalDate nextInspectionDate
) {
}
