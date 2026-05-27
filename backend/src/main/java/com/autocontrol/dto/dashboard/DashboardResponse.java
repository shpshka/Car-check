package com.autocontrol.dto.dashboard;

import com.autocontrol.dto.reminder.ReminderResponse;
import com.autocontrol.dto.transport.TransportResponse;
import java.util.List;

public record DashboardResponse(
        long totalTransports,
        long overdueInspections,
        long activeProblems,
        long upcomingInspections,
        List<ReminderResponse> urgentReminders,
        List<TransportResponse> problemTransports
) {
}
