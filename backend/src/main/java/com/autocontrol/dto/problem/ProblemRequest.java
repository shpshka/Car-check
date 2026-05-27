package com.autocontrol.dto.problem;

import com.autocontrol.enums.ProblemStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProblemRequest(
        @NotNull Long transportId,
        @NotBlank String title,
        String description,
        ProblemStatus status
) {
}
