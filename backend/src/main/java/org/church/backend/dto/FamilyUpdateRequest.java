package org.church.backend.dto;

import jakarta.validation.constraints.Size;

public record FamilyUpdateRequest(
        @Size(min = 1, max = 50) String familyCode,
        @Size(min = 1, max = 150) String familyName,
        @Size(max = 200) String address1,
        @Size(max = 100) String area,
        @Size(max = 200) String address2,
        @Size(max = 20) String pincode,
        @Size(max = 100) String city,
        @Size(max = 100) String state
) {
}


