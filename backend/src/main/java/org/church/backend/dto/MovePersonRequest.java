package org.church.backend.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record MovePersonRequest(
        @NotNull UUID targetFamilyId
) {
}

