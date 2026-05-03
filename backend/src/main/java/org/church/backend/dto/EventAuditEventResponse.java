package org.church.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record EventAuditEventResponse(
        Long id,
        String name,
        LocalDate startDate,
        LocalDate endDate,
        String status,
        boolean live,
        String description,
        LocalDateTime createdAt,
        int recordCount) {
}
