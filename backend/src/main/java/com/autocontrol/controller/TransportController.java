package com.autocontrol.controller;

import com.autocontrol.dto.transport.TransportDetailsResponse;
import com.autocontrol.dto.transport.TransportRequest;
import com.autocontrol.dto.transport.TransportResponse;
import com.autocontrol.service.TransportService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transports")
public class TransportController {
    private final TransportService transportService;

    public TransportController(TransportService transportService) {
        this.transportService = transportService;
    }

    @GetMapping
    public List<TransportResponse> getAll() {
        return transportService.getAllTransports();
    }

    @GetMapping("/{id}")
    public TransportDetailsResponse getById(@PathVariable Long id) {
        return transportService.getTransportDetails(id);
    }

    @PostMapping
    public TransportResponse create(@Valid @RequestBody TransportRequest request) {
        return transportService.createTransport(request);
    }

    @PutMapping("/{id}")
    public TransportResponse update(@PathVariable Long id, @Valid @RequestBody TransportRequest request) {
        return transportService.updateTransport(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        transportService.deleteTransport(id);
        return ResponseEntity.noContent().build();
    }
}
