package org.church.backend.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FamilyCreateRequest(
        @NotBlank @Size(max = 150) String familyName,
        @Size(max = 200) String address1,
        @Size(max = 100) String area,
        @Size(max = 200) String address2,
        @Size(max = 20) String pincode,
        @Size(max = 100) String city,
        @Size(max = 100) String state,
        List<@Valid PersonCreateRequest> members
) {
}


