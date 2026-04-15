package org.church.backend.dto;

import jakarta.validation.constraints.NotNull;

public record MovePersonRequest(
        @NotNull Long targetFamilyId
) {
}
