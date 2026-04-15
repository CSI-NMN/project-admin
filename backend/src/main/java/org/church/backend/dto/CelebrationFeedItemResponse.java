package org.church.backend.dto;

public record CelebrationFeedItemResponse(
        String id,
        String type,
        String name,
        String familyName,
        String familyCode,
        String eventDateLabel,
        int eventDay,
        String mobile,
        String email,
        Long actionPersonId,
        Long actionFamilyId
) {
}
