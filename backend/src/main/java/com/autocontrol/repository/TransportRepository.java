package com.autocontrol.repository;

import com.autocontrol.entity.Transport;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransportRepository extends JpaRepository<Transport, Long> {
    boolean existsByPlateNumberIgnoreCase(String plateNumber);
    Optional<Transport> findByPlateNumberIgnoreCase(String plateNumber);
}
