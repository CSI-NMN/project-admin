package org.church.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FamilyCreateRequest(
        @NotBlank @Size(max = 50) String familyCode,
        @NotBlank @Size(max = 150) String familyName,
        String residentialAddress,
        String officeAddress,
        @Size(max = 100) String area,
        @Size(max = 100) String subscriptionId
) {
}


