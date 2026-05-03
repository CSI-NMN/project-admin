package org.church.backend.dto;

public record PersonFilter(
        Long familyId,
        String memberNo,
        String firstName,
        String lastName,
        Boolean isHead
) {
}


