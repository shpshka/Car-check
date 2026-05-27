package com.autocontrol.dto.problem;

import com.autocontrol.enums.ProblemStatus;
import java.time.LocalDateTime;

public record ProblemResponse(
        Long id,
        Long transportId,
        String transportPlateNumber,
        String title,
        String description,
        ProblemStatus status,
        LocalDateTime createdAt,
        LocalDateTime resolvedAt
) {
}
