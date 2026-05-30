package org.church.backend.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FamilySubscriptionBulkUpdateRequest(
        @NotNull Long familyId,
        @NotNull Long financialYearId,
        @NotBlank String cardPayload,
        @NotNull BigDecimal totalAmount
) {
}
