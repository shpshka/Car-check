package com.autocontrol.controller;

import com.autocontrol.dto.problem.ProblemRequest;
import com.autocontrol.dto.problem.ProblemResponse;
import com.autocontrol.service.ProblemService;
import jakarta.validation.Valid;
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
public class ProblemController {
    private final ProblemService problemService;

    public ProblemController(ProblemService problemService) {
        this.problemService = problemService;
    }

    @PostMapping("/problems")
    public ProblemResponse create(@Valid @RequestBody ProblemRequest request) {
        return problemService.createProblem(request);
    }

    @GetMapping("/problems/active")
    public List<ProblemResponse> getActive() {
        return problemService.getActiveProblems();
    }

    @GetMapping("/transports/{transportId}/problems")
    public List<ProblemResponse> getByTransport(@PathVariable Long transportId) {
        return problemService.getProblemsByTransport(transportId);
    }

    @PutMapping("/problems/{id}/resolve")
    public ProblemResponse resolve(@PathVariable Long id) {
        return problemService.resolveProblem(id);
    }
}
