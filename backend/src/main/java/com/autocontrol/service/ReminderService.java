package com.autocontrol.service;

import com.autocontrol.dto.reminder.ReminderResponse;
import com.autocontrol.dto.reminder.ReminderRequest;
import com.autocontrol.entity.Inspection;
import com.autocontrol.entity.Reminder;
import com.autocontrol.entity.Transport;
import com.autocontrol.repository.InspectionRepository;
import com.autocontrol.repository.ReminderRepository;
import com.autocontrol.repository.TransportRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ReminderService {
    private final ReminderRepository reminderRepository;
    private final TransportRepository transportRepository;
    private final InspectionRepository inspectionRepository;

    public ReminderService(ReminderRepository reminderRepository, TransportRepository transportRepository, InspectionRepository inspectionRepository) {
        this.reminderRepository = reminderRepository;
        this.transportRepository = transportRepository;
        this.inspectionRepository = inspectionRepository;
    }

    @Transactional
    public List<ReminderResponse> getAllReminders() {
        return reminderRepository.findAllByOrderByReminderDateAsc().stream().map(this::toResponse).toList();
    }

    @Transactional
    public List<ReminderResponse> getDueReminders() {
        return reminderRepository.findByReminderDateLessThanEqualAndSentFalseOrderByReminderDateAsc(LocalDate.now()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<ReminderResponse> getRemindersByTransport(Long transportId) {
        return reminderRepository.findByTransport_IdOrderByReminderDateAsc(transportId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public ReminderResponse createReminder(ReminderRequest request) {
        Transport transport = transportRepository.findById(request.transportId()).orElseThrow(() -> new IllegalArgumentException("Transport not found"));
        Inspection inspection = request.inspectionId() == null ? null : inspectionRepository.findById(request.inspectionId()).orElseThrow(() -> new IllegalArgumentException("Inspection not found"));

        Reminder reminder = new Reminder();
        reminder.setTransport(transport);
        reminder.setInspection(inspection);
        reminder.setReminderDate(request.reminderDate());
        reminder.setMessage(request.message().trim());
        reminder.setSent(request.sent() != null && request.sent());
        return toResponse(reminderRepository.saveAndFlush(reminder));
    }

    @Transactional
    public ReminderResponse markAsSent(Long id) {
        Reminder reminder = reminderRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Reminder not found"));
        reminder.setSent(true);
        return toResponse(reminderRepository.saveAndFlush(reminder));
    }

    public ReminderResponse toResponse(Reminder reminder) {
        return new ReminderResponse(
                reminder.getId(),
                reminder.getTransport().getId(),
                reminder.getTransport().getPlateNumber(),
                reminder.getInspection() == null ? null : reminder.getInspection().getId(),
                reminder.getReminderDate(),
                reminder.getMessage(),
                reminder.getSent()
        );
    }
}
