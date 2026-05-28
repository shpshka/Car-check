package com.autocontrol.service;

import com.autocontrol.dto.inspection.InspectionResponse;
import com.autocontrol.dto.problem.ProblemResponse;
import com.autocontrol.dto.transport.TransportDetailsResponse;
import com.autocontrol.dto.transport.TransportRequest;
import com.autocontrol.dto.transport.TransportResponse;
import com.autocontrol.entity.Inspection;
import com.autocontrol.entity.Problem;
import com.autocontrol.entity.Transport;
import com.autocontrol.enums.ProblemStatus;
import com.autocontrol.enums.TransportStatus;
import com.autocontrol.repository.InspectionRepository;
import com.autocontrol.repository.ProblemRepository;
import com.autocontrol.repository.TransportRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class TransportService {
    private final TransportRepository transportRepository;
    private final InspectionRepository inspectionRepository;
    private final ProblemRepository problemRepository;

    public TransportService(TransportRepository transportRepository, InspectionRepository inspectionRepository, ProblemRepository problemRepository) {
        this.transportRepository = transportRepository;
        this.inspectionRepository = inspectionRepository;
        this.problemRepository = problemRepository;
    }

    @Transactional
    public List<TransportResponse> getAllTransports() {
        return transportRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public TransportDetailsResponse getTransportDetails(Long id) {
        Transport transport = getTransport(id);
        List<ProblemResponse> activeProblems = problemRepository.findByTransport_IdOrderByCreatedAtDesc(id).stream()
                .filter(problem -> problem.getStatus() != ProblemStatus.RESOLVED)
                .map(this::toProblemResponse)
                .toList();
        List<InspectionResponse> history = inspectionRepository.findByTransport_IdOrderByInspectionDateDescCreatedAtDesc(id).stream()
                .map(this::toInspectionResponse)
                .toList();
        Inspection latest = latestInspection(id);
        return new TransportDetailsResponse(
                transport.getId(),
                transport.getPlateNumber(),
                transport.getBrand(),
                transport.getModel(),
                transport.getYear(),
                transport.getComment(),
                latest == null ? null : latest.getDriver().getFullName(),
                latest == null ? null : latest.getInspectionDate(),
                latest == null ? null : latest.getNextInspectionDate(),
                calculateStatus(transport),
                activeProblems,
                history
        );
    }

    @Transactional
    public TransportResponse createTransport(TransportRequest request) {
        String plateNumber = normalizePlateNumber(request.plateNumber());
        if (transportRepository.existsByPlateNumberIgnoreCase(plateNumber)) {
            throw new IllegalArgumentException("Transport with this plate number already exists");
        }
        Transport transport = new Transport();
        applyRequest(transport, request, plateNumber);
        return toResponse(transportRepository.saveAndFlush(transport));
    }

    @Transactional
    public TransportResponse updateTransport(Long id, TransportRequest request) {
        Transport transport = getTransport(id);
        String plateNumber = normalizePlateNumber(request.plateNumber());
        transportRepository.findByPlateNumberIgnoreCase(plateNumber).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new IllegalArgumentException("Transport with this plate number already exists");
            }
        });
        applyRequest(transport, request, plateNumber);
        return toResponse(transportRepository.saveAndFlush(transport));
    }

    @Transactional
    public void deleteTransport(Long id) {
        if (!transportRepository.existsById(id)) {
            throw new IllegalArgumentException("Transport not found");
        }
        Transport transport = getTransport(id);
        transportRepository.delete(transport);
        transportRepository.flush();
    }

    @Transactional
    public TransportResponse toResponse(Transport transport) {
        Inspection latest = latestInspection(transport.getId());
        return new TransportResponse(
                transport.getId(),
                transport.getPlateNumber(),
                transport.getBrand(),
                transport.getModel(),
                transport.getYear(),
                transport.getComment(),
                latest == null ? null : latest.getDriver().getFullName(),
                latest == null ? null : latest.getInspectionDate(),
                latest == null ? null : latest.getNextInspectionDate(),
                calculateStatus(transport),
                problemRepository.countByTransport_IdAndStatusNot(transport.getId(), ProblemStatus.RESOLVED)
        );
    }

    @Transactional
    public TransportStatus calculateStatus(Transport transport) {
        if (problemRepository.countByTransport_IdAndStatusNot(transport.getId(), ProblemStatus.RESOLVED) > 0) {
            return TransportStatus.HAS_PROBLEMS;
        }
        Inspection latest = latestInspection(transport.getId());
        if (latest == null) {
            return TransportStatus.OK;
        }
        LocalDate nextDate = latest.getNextInspectionDate();
        LocalDate today = LocalDate.now();
        if (nextDate.isBefore(today)) {
            return TransportStatus.OVERDUE;
        }
        if (!nextDate.isAfter(today.plusDays(7))) {
            return TransportStatus.INSPECTION_SOON;
        }
        return TransportStatus.OK;
    }

    private Transport getTransport(Long id) {
        return transportRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Transport not found"));
    }

    private Inspection latestInspection(Long transportId) {
        return inspectionRepository.findFirstByTransport_IdOrderByInspectionDateDescCreatedAtDesc(transportId).orElse(null);
    }

    private void applyRequest(Transport transport, TransportRequest request, String plateNumber) {
        transport.setPlateNumber(plateNumber);
        transport.setBrand(request.brand().trim());
        transport.setModel(request.model().trim());
        transport.setYear(request.year());
        transport.setComment(request.comment());
    }

    private String normalizePlateNumber(String plateNumber) {
        return plateNumber == null ? "" : plateNumber.trim().toUpperCase().replaceAll("\\s+", "");
    }

    private InspectionResponse toInspectionResponse(Inspection inspection) {
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

    private ProblemResponse toProblemResponse(Problem problem) {
        return new ProblemResponse(
                problem.getId(),
                problem.getTransport().getId(),
                problem.getTransport().getPlateNumber(),
                problem.getTitle(),
                problem.getDescription(),
                problem.getStatus(),
                problem.getCreatedAt(),
                problem.getResolvedAt()
        );
    }
}
