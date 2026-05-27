package com.autocontrol.dto.inspection;

import com.autocontrol.enums.InspectionResult;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record InspectionRequest(
        @NotNull Long transportId,
        @NotNull Long driverId,
        @NotNull LocalDate inspectionDate,
        @NotNull InspectionResult result,
        String comment,
        @NotNull Integer nextInspectionPeriodDays
) {
}
