package com.autocontrol.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
public class Reminder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private Transport transport;

    @OneToOne(fetch = FetchType.LAZY)
    private Inspection inspection;

    @NotNull
    @Column(nullable = false)
    private LocalDate reminderDate;

    @NotBlank
    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private Boolean sent = false;

    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
        if (sent == null) sent = false;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Transport getTransport() { return transport; }
    public void setTransport(Transport transport) { this.transport = transport; }
    public Inspection getInspection() { return inspection; }
    public void setInspection(Inspection inspection) { this.inspection = inspection; }
    public LocalDate getReminderDate() { return reminderDate; }
    public void setReminderDate(LocalDate reminderDate) { this.reminderDate = reminderDate; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Boolean getSent() { return sent; }
    public void setSent(Boolean sent) { this.sent = sent; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
