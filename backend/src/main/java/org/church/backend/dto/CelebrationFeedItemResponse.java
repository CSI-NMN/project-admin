package org.church.backend.dto;

import java.util.UUID;

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
        UUID actionPersonId,
        UUID actionFamilyId
) {
}
