package org.church.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PersonResponse(
        Long id,
        Long familyId,
        String memberNo,
        String membershipName,
        String firstName,
        String lastName,
        String gender,
        String maritalStatus,
        LocalDate dateOfBirth,
        LocalDate dateOfBaptism,
        LocalDate dateOfConfirmation,
        LocalDate dateOfMarriage,
        String bloodGroup,
        String profession,
        String mobileNo,
        String aadhaarNumber,
        String email,
        String relationshipType,
        Boolean isHead,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}


