package com.autocontrol.dto.reminder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record ReminderRequest(
        @NotNull Long transportId,
        Long inspectionId,
        @NotNull LocalDate reminderDate,
        @NotBlank String message,
        Boolean sent
) {
}
