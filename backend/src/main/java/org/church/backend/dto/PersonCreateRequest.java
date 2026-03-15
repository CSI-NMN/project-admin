package org.church.backend.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PersonCreateRequest(
        @Size(max = 50) String memberNo,
        @NotBlank @Size(max = 100) String firstName,
        @Size(max = 100) String lastName,
        @Size(max = 100) String fatherName,
        @Size(max = 100) String motherName,
        @Size(max = 20) String gender,
        @Size(max = 30) String maritalStatus,
        LocalDate dateOfBirth,
        LocalDate dateOfBaptism,
        LocalDate dateOfConfirmation,
        LocalDate dateOfMarriage,
        @Size(max = 10) String bloodGroup,
        @Size(max = 120) String profession,
        @Size(max = 30) String mobileNo,
        @Size(min = 1, max = 20) String aadhaarNumber,
        @Email @Size(max = 120) String email,
        @Size(max = 50) String relationshipType,
        Boolean isHead
) {
}




