package com.autocontrol.service;

import com.autocontrol.dto.dashboard.DashboardResponse;
import com.autocontrol.dto.transport.TransportResponse;
import com.autocontrol.enums.ProblemStatus;
import com.autocontrol.enums.TransportStatus;
import com.autocontrol.repository.ProblemRepository;
import com.autocontrol.repository.TransportRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {
    private final TransportRepository transportRepository;
    private final ProblemRepository problemRepository;
    private final TransportService transportService;
    private final ReminderService reminderService;

    public DashboardService(TransportRepository transportRepository, ProblemRepository problemRepository, TransportService transportService, ReminderService reminderService) {
        this.transportRepository = transportRepository;
        this.problemRepository = problemRepository;
        this.transportService = transportService;
        this.reminderService = reminderService;
    }

    public DashboardResponse getDashboard() {
        List<TransportResponse> transports = transportRepository.findAll().stream().map(transportService::toResponse).toList();
        long overdue = transports.stream().filter(transport -> transport.status() == TransportStatus.OVERDUE).count();
        long upcoming = transports.stream().filter(transport -> transport.status() == TransportStatus.INSPECTION_SOON).count();
        List<TransportResponse> problemTransports = transports.stream()
                .filter(transport -> transport.status() == TransportStatus.HAS_PROBLEMS)
                .toList();

        return new DashboardResponse(
                transports.size(),
                overdue,
                problemRepository.countByStatusNot(ProblemStatus.RESOLVED),
                upcoming,
                reminderService.getDueReminders(),
                problemTransports
        );
    }
}
