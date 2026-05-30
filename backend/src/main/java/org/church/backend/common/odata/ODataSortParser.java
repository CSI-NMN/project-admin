package org.church.backend.common.odata;

import java.util.Set;

import org.springframework.data.domain.Sort;

public final class ODataSortParser {

    private ODataSortParser() {
    }

    public static Sort parseOrderBy(String orderBy, String defaultField, Set<String> allowedFields) {
        if (orderBy == null || orderBy.isBlank()) {
            return Sort.by(Sort.Direction.DESC, defaultField);
        }

        String[] parts = orderBy.trim().split("\\s+");
        String field = parts[0];

        if (!allowedFields.contains(field)) {
            throw new IllegalArgumentException("Unsupported $orderby field: " + field);
        }

        Sort.Direction direction = Sort.Direction.ASC;
        if (parts.length > 1) {
            String directionToken = parts[1].toLowerCase();
            if ("desc".equals(directionToken)) {
                direction = Sort.Direction.DESC;
            } else if (!"asc".equals(directionToken)) {
                throw new IllegalArgumentException("Unsupported $orderby direction: " + parts[1]);
            }
        }

        return Sort.by(direction, field);
    }
}

