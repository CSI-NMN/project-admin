package org.church.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record FamilyResponse(
        Long id,
        String familyCode,
        String familyName,
        String address1,
        String area,
        String address2,
        String pincode,
        String city,
        String state,
        Long familyHeadId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<PersonResponse> members
) {
}


