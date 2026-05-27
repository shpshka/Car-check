package com.autocontrol.entity;

import com.autocontrol.enums.InspectionResult;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
public class Inspection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private Transport transport;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private Driver driver;

    @NotNull
    @Column(nullable = false)
    private LocalDate inspectionDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InspectionResult result;

    private String comment;

    @NotNull
    @Column(nullable = false)
    private LocalDate nextInspectionDate;

    private LocalDateTime createdAt;

    @OneToOne(mappedBy = "inspection")
    private Reminder reminder;

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Transport getTransport() { return transport; }
    public void setTransport(Transport transport) { this.transport = transport; }
    public Driver getDriver() { return driver; }
    public void setDriver(Driver driver) { this.driver = driver; }
    public LocalDate getInspectionDate() { return inspectionDate; }
    public void setInspectionDate(LocalDate inspectionDate) { this.inspectionDate = inspectionDate; }
    public InspectionResult getResult() { return result; }
    public void setResult(InspectionResult result) { this.result = result; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public LocalDate getNextInspectionDate() { return nextInspectionDate; }
    public void setNextInspectionDate(LocalDate nextInspectionDate) { this.nextInspectionDate = nextInspectionDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Reminder getReminder() { return reminder; }
    public void setReminder(Reminder reminder) { this.reminder = reminder; }
}
