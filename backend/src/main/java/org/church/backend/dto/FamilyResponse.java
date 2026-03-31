package org.church.backend.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record FamilyResponse(
        UUID id,
        String familyCode,
        String familyName,
        String address1,
        String area,
        String address2,
        String pincode,
        String city,
        String state,
        UUID familyHeadId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<PersonResponse> members
) {
}


