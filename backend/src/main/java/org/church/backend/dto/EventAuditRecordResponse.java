package org.church.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EventAuditRecordResponse(
        Long id,
        String type,
        String description,
        BigDecimal amount,
        String itemName,
        BigDecimal quantity,
        String unit,
        LocalDateTime createdAt) {
}
