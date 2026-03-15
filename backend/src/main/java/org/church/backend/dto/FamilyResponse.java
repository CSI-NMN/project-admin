package org.church.backend.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record FamilyResponse(
        UUID id,
        String familyCode,
        String familyName,
        String residentialAddress,
        String officeAddress,
        String area,
        String subscriptionId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<PersonResponse> members
) {
}


