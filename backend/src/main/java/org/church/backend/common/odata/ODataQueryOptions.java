package org.church.backend.common.odata;

public record ODataQueryOptions(
        Integer top,
        Integer skip,
        String orderBy,
        boolean includeCount
) {

    public int resolvedTop(int defaultTop, int maxTop) {
        int requestedTop = top == null ? defaultTop : top;
        if (requestedTop < 1) {
            throw new IllegalArgumentException("$top must be greater than 0");
        }
        return Math.min(requestedTop, maxTop);
    }

    public int resolvedSkip() {
        int requestedSkip = skip == null ? 0 : skip;
        if (requestedSkip < 0) {
            throw new IllegalArgumentException("$skip cannot be negative");
        }
        return requestedSkip;
    }
}

