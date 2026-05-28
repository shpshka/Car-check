package com.autocontrol.service;

import com.autocontrol.dto.problem.ProblemRequest;
import com.autocontrol.dto.problem.ProblemResponse;
import com.autocontrol.entity.Problem;
import com.autocontrol.entity.Transport;
import com.autocontrol.enums.ProblemStatus;
import com.autocontrol.repository.ProblemRepository;
import com.autocontrol.repository.TransportRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ProblemService {
    private final ProblemRepository problemRepository;
    private final TransportRepository transportRepository;

    public ProblemService(ProblemRepository problemRepository, TransportRepository transportRepository) {
        this.problemRepository = problemRepository;
        this.transportRepository = transportRepository;
    }

    @Transactional
    public ProblemResponse createProblem(ProblemRequest request) {
        Transport transport = transportRepository.findById(request.transportId()).orElseThrow(() -> new IllegalArgumentException("Transport not found"));
        Problem problem = new Problem();
        problem.setTransport(transport);
        problem.setTitle(request.title().trim());
        problem.setDescription(request.description() == null || request.description().isBlank() ? request.title().trim() : request.description());
        problem.setStatus(request.status() == null ? ProblemStatus.OPEN : request.status());
        return toResponse(problemRepository.saveAndFlush(problem));
    }

    @Transactional
    public List<ProblemResponse> getActiveProblems() {
        return problemRepository.findByStatusNot(ProblemStatus.RESOLVED).stream().map(this::toResponse).toList();
    }

    @Transactional
    public List<ProblemResponse> getProblemsByTransport(Long transportId) {
        return problemRepository.findByTransport_IdOrderByCreatedAtDesc(transportId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public ProblemResponse resolveProblem(Long id) {
        Problem problem = problemRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Problem not found"));
        problem.setStatus(ProblemStatus.RESOLVED);
        problem.setResolvedAt(LocalDateTime.now());
        return toResponse(problemRepository.saveAndFlush(problem));
    }

    public ProblemResponse toResponse(Problem problem) {
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
