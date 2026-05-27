package com.autocontrol.controller;

import com.autocontrol.dto.reminder.ReminderRequest;
import com.autocontrol.dto.reminder.ReminderResponse;
import jakarta.validation.Valid;
import com.autocontrol.service.ReminderService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ReminderController {
    private final ReminderService reminderService;

    public ReminderController(ReminderService reminderService) {
        this.reminderService = reminderService;
    }

    @GetMapping("/reminders")
    public List<ReminderResponse> getAll() {
        return reminderService.getAllReminders();
    }

    @PostMapping("/reminders")
    public ReminderResponse create(@Valid @RequestBody ReminderRequest request) {
        return reminderService.createReminder(request);
    }

    @GetMapping("/reminders/due")
    public List<ReminderResponse> getDue() {
        return reminderService.getDueReminders();
    }

    @GetMapping("/transports/{transportId}/reminders")
    public List<ReminderResponse> getByTransport(@PathVariable Long transportId) {
        return reminderService.getRemindersByTransport(transportId);
    }

    @PutMapping("/reminders/{id}/sent")
    public ReminderResponse markAsSent(@PathVariable Long id) {
        return reminderService.markAsSent(id);
    }
}
