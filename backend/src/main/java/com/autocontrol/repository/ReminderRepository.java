package com.autocontrol.repository;

import com.autocontrol.entity.Reminder;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByReminderDateLessThanEqualAndSentFalseOrderByReminderDateAsc(LocalDate date);
    List<Reminder> findAllByOrderByReminderDateAsc();
    List<Reminder> findByTransport_IdOrderByReminderDateAsc(Long transportId);
}
