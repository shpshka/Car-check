package com.autocontrol.service;

import com.autocontrol.dto.inspection.InspectionRequest;
import com.autocontrol.dto.inspection.InspectionResponse;
import com.autocontrol.entity.Driver;
import com.autocontrol.entity.Inspection;
import com.autocontrol.entity.Reminder;
import com.autocontrol.entity.Transport;
import com.autocontrol.repository.DriverRepository;
import com.autocontrol.repository.InspectionRepository;
import com.autocontrol.repository.ReminderRepository;
import com.autocontrol.repository.TransportRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class InspectionService {
    private final InspectionRepository inspectionRepository;
    private final TransportRepository transportRepository;
    private final DriverRepository driverRepository;
    private final ReminderRepository reminderRepository;

    public InspectionService(InspectionRepository inspectionRepository, TransportRepository transportRepository, DriverRepository driverRepository, ReminderRepository reminderRepository) {
        this.inspectionRepository = inspectionRepository;
        this.transportRepository = transportRepository;
        this.driverRepository = driverRepository;
        this.reminderRepository = reminderRepository;
    }

    @Transactional
    public InspectionResponse createInspection(InspectionRequest request) {
        Transport transport = transportRepository.findById(request.transportId()).orElseThrow(() -> new IllegalArgumentException("Transport not found"));
        Driver driver = driverRepository.findById(request.driverId()).orElseThrow(() -> new IllegalArgumentException("Driver not found"));
        LocalDate nextInspectionDate = request.inspectionDate().plusDays(request.nextInspectionPeriodDays());

        Inspection inspection = new Inspection();
        inspection.setTransport(transport);
        inspection.setDriver(driver);
        inspection.setInspectionDate(request.inspectionDate());
        inspection.setResult(request.result());
        inspection.setComment(request.comment());
        inspection.setNextInspectionDate(nextInspectionDate);
        Inspection saved = inspectionRepository.save(inspection);

        Reminder reminder = new Reminder();
        reminder.setTransport(transport);
        reminder.setInspection(saved);
        reminder.setReminderDate(nextInspectionDate);
        reminder.setMessage("Vehicle " + transport.getPlateNumber() + " needs technical inspection on " + nextInspectionDate);
        reminder.setSent(false);
        reminderRepository.save(reminder);

        return toResponse(saved);
    }

    @Transactional
    public List<InspectionResponse> getInspectionsByTransport(Long transportId) {
        return inspectionRepository.findByTransport_IdOrderByInspectionDateDescCreatedAtDesc(transportId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<InspectionResponse> getAllInspections() {
        return inspectionRepository.findAllByOrderByInspectionDateDescCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    public InspectionResponse toResponse(Inspection inspection) {
        return new InspectionResponse(
                inspection.getId(),
                inspection.getTransport().getId(),
                inspection.getTransport().getPlateNumber(),
                inspection.getDriver().getId(),
                inspection.getDriver().getFullName(),
                inspection.getInspectionDate(),
                inspection.getResult(),
                inspection.getComment(),
                inspection.getNextInspectionDate()
        );
    }
}
