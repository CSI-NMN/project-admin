package org.church.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record EventAuditEventDetailResponse(
        Long id,
        String name,
        LocalDate startDate,
        LocalDate endDate,
        String status,
        boolean live,
        String description,
        LocalDateTime createdAt,
        List<EventAuditRecordResponse> records) {
}
