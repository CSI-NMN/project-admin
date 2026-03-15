package org.church.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record PersonResponse(
        UUID id,
        UUID familyId,
        String memberNo,
        String firstName,
        String lastName,
        String fatherName,
        String motherName,
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


