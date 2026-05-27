package com.autocontrol.dto.transport;

import com.autocontrol.dto.inspection.InspectionResponse;
import com.autocontrol.dto.problem.ProblemResponse;
import com.autocontrol.enums.TransportStatus;
import java.time.LocalDate;
import java.util.List;

public record TransportDetailsResponse(
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
        List<ProblemResponse> activeProblems,
        List<InspectionResponse> inspectionHistory
) {
}
