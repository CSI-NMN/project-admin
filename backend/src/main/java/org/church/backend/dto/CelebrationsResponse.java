package org.church.backend.dto;

import java.util.List;

public record CelebrationsResponse(
        int month,
        String monthLabel,
        long birthdaysCount,
        long anniversariesCount,
        List<CelebrationFeedItemResponse> birthdays,
        List<CelebrationFeedItemResponse> anniversaries
) {
}

