package org.church.backend.dto;

public record FamilyFilter(
        String familyCode,
        String familyName,
        String address1,
        String area,
        String address2,
        String pincode,
        String city,
        String state,
        Long familyHeadId
) {
}


