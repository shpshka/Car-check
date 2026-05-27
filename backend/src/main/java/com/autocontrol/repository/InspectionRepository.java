package com.autocontrol.repository;

import com.autocontrol.entity.Inspection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InspectionRepository extends JpaRepository<Inspection, Long> {
    List<Inspection> findByTransport_IdOrderByInspectionDateDescCreatedAtDesc(Long transportId);
    Optional<Inspection> findFirstByTransport_IdOrderByInspectionDateDescCreatedAtDesc(Long transportId);
    List<Inspection> findAllByOrderByInspectionDateDescCreatedAtDesc();
}
