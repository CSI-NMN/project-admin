package org.church.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SubscriptionCardResponse(
        Long id,
        Long personId,
        Long familyId,
        String personName,
        String familyName,
        String memberNo,
        Long financialYearId,
        String financialYearLabel,
        String status,
        Boolean isLocked,
        BigDecimal totalAmount,
        LocalDateTime lastSavedAt,
        String cardPayload
) {
}
