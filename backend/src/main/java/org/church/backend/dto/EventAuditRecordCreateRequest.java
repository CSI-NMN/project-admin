package org.church.backend.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EventAuditRecordCreateRequest(
        @NotBlank @Size(max = 20) String type,
        @NotBlank @Size(max = 2000) String description,
        BigDecimal amount,
        @Size(max = 200) String itemName,
        BigDecimal quantity,
        @Size(max = 50) String unit) {
}
