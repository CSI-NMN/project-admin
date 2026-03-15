package org.church.backend.dto;

import java.util.UUID;

public record PersonFilter(
        UUID familyId,
        String memberNo,
        String firstName,
        String lastName,
        Boolean isHead
) {
}


