package com.autocontrol.controller;

import com.autocontrol.dto.inspection.InspectionRequest;
import com.autocontrol.dto.inspection.InspectionResponse;
import com.autocontrol.service.InspectionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class InspectionController {
    private final InspectionService inspectionService;

    public InspectionController(InspectionService inspectionService) {
        this.inspectionService = inspectionService;
    }

    @PostMapping("/inspections")
    public InspectionResponse create(@Valid @RequestBody InspectionRequest request) {
        return inspectionService.createInspection(request);
    }

    @GetMapping("/inspections")
    public List<InspectionResponse> getAll() {
        return inspectionService.getAllInspections();
    }

    @GetMapping("/transports/{transportId}/inspections")
    public List<InspectionResponse> getByTransport(@PathVariable Long transportId) {
        return inspectionService.getInspectionsByTransport(transportId);
    }
}
