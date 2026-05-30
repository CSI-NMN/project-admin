package org.church.backend.dto;

import java.time.LocalDate;

public record SubscriptionFinancialYearResponse(
        Long id,
        String yearLabel,
        LocalDate startDate,
        LocalDate endDate,
        Boolean active
) {
}
