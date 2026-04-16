package org.church.backend.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateFinancialYearRequest(
        @NotBlank @Size(max = 20) String yearLabel,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        Boolean active
) {
}
