package org.church.backend.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record EventAuditEventUpdateRequest(
        @NotBlank @Size(max = 150) String name,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @Size(max = 2000) String description) {
}
