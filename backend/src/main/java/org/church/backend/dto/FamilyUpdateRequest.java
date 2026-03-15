package org.church.backend.dto;

import jakarta.validation.constraints.Size;

public record FamilyUpdateRequest(
        @Size(min = 1, max = 50) String familyCode,
        @Size(min = 1, max = 150) String familyName,
        String residentialAddress,
        String officeAddress,
        @Size(max = 100) String area,
        @Size(max = 100) String subscriptionId
) {
}


