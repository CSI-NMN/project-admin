package org.church.backend.dto;

public record FamilyFilter(
        String familyCode,
        String familyName,
        String area,
        String subscriptionId
) {
}


