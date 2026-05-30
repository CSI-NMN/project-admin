package org.church.backend.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SubscriptionUpsertRequest(
        @NotNull Long personId,
        @NotNull Long financialYearId,
        @NotBlank String status,
        @NotBlank String cardPayload,
        @NotNull BigDecimal totalAmount,
        Boolean lockRecord
) {
}
