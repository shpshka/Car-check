package com.autocontrol.repository;

import com.autocontrol.entity.Problem;
import com.autocontrol.enums.ProblemStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProblemRepository extends JpaRepository<Problem, Long> {
    List<Problem> findByStatusNot(ProblemStatus status);
    List<Problem> findByTransport_IdOrderByCreatedAtDesc(Long transportId);
    long countByTransport_IdAndStatusNot(Long transportId, ProblemStatus status);
    long countByStatusNot(ProblemStatus status);
}
