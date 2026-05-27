package com.autocontrol.controller;

import com.autocontrol.dto.driver.DriverRequest;
import com.autocontrol.dto.driver.DriverResponse;
import com.autocontrol.service.DriverService;
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
@RequestMapping("/api/drivers")
public class DriverController {
    private final DriverService driverService;

    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    @GetMapping
    public List<DriverResponse> getAll() {
        return driverService.getAllDrivers();
    }

    @GetMapping("/{id}")
    public DriverResponse getById(@PathVariable Long id) {
        return driverService.getDriver(id);
    }

    @PostMapping
    public DriverResponse create(@Valid @RequestBody DriverRequest request) {
        return driverService.createDriver(request);
    }

    @PutMapping("/{id}")
    public DriverResponse update(@PathVariable Long id, @Valid @RequestBody DriverRequest request) {
        return driverService.updateDriver(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        driverService.deleteDriver(id);
        return ResponseEntity.noContent().build();
    }
}
