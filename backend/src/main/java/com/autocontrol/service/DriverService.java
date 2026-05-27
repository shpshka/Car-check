package com.autocontrol.service;

import com.autocontrol.dto.driver.DriverRequest;
import com.autocontrol.dto.driver.DriverResponse;
import com.autocontrol.entity.Driver;
import com.autocontrol.repository.DriverRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class DriverService {
    private final DriverRepository driverRepository;

    public DriverService(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    public List<DriverResponse> getAllDrivers() {
        return driverRepository.findAll().stream().map(this::toResponse).toList();
    }

    public DriverResponse getDriver(Long id) {
        return toResponse(findDriver(id));
    }

    public DriverResponse createDriver(DriverRequest request) {
        Driver driver = new Driver();
        applyRequest(driver, request);
        return toResponse(driverRepository.save(driver));
    }

    public DriverResponse updateDriver(Long id, DriverRequest request) {
        Driver driver = findDriver(id);
        applyRequest(driver, request);
        return toResponse(driverRepository.save(driver));
    }

    public void deleteDriver(Long id) {
        if (!driverRepository.existsById(id)) {
            throw new IllegalArgumentException("Driver not found");
        }
        driverRepository.deleteById(id);
    }

    private Driver findDriver(Long id) {
        return driverRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Driver not found"));
    }

    private void applyRequest(Driver driver, DriverRequest request) {
        driver.setFullName(request.fullName().trim());
        driver.setPhone(request.phone());
        driver.setComment(request.comment());
    }

    private DriverResponse toResponse(Driver driver) {
        return new DriverResponse(driver.getId(), driver.getFullName(), driver.getPhone(), driver.getComment());
    }
}
