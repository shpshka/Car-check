package com.autocontrol.dto.reminder;

import java.time.LocalDate;

public record ReminderResponse(
        Long id,
        Long transportId,
        String transportPlateNumber,
        Long inspectionId,
        LocalDate reminderDate,
        String message,
        Boolean sent
) {
}
