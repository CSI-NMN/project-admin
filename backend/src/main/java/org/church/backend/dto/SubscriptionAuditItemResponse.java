package org.church.backend.dto;

import java.time.LocalDateTime;

public record SubscriptionAuditItemResponse(
        Long id,
        LocalDateTime createdAt,
        String type,
        String month,
        String fieldName,
        String oldValue,
        String newValue) {
}
