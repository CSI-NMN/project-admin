package org.church.backend.common.odata;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public class OffsetBasedPageRequest implements Pageable {

    private final long offset;
    private final int limit;
    private final Sort sort;

    public OffsetBasedPageRequest(long offset, int limit, Sort sort) {
        if (offset < 0) {
            throw new IllegalArgumentException("Offset cannot be negative");
        }
        if (limit < 1) {
            throw new IllegalArgumentException("Limit must be at least 1");
        }

        this.offset = offset;
        this.limit = limit;
        this.sort = sort == null ? Sort.unsorted() : sort;
    }

    @Override
    public int getPageNumber() {
        return (int) (offset / limit);
    }

    @Override
    public int getPageSize() {
        return limit;
    }

    @Override
    public long getOffset() {
        return offset;
    }

    @Override
    public Sort getSort() {
        return sort;
    }

    @Override
    public Pageable next() {
        return new OffsetBasedPageRequest(offset + limit, limit, sort);
    }

    @Override
    public Pageable previousOrFirst() {
        long newOffset = Math.max(offset - limit, 0);
        return new OffsetBasedPageRequest(newOffset, limit, sort);
    }

    @Override
    public Pageable first() {
        return new OffsetBasedPageRequest(0, limit, sort);
    }

    @Override
    public Pageable withPage(int pageNumber) {
        if (pageNumber < 0) {
            throw new IllegalArgumentException("Page number cannot be negative");
        }
        return new OffsetBasedPageRequest((long) pageNumber * limit, limit, sort);
    }

    @Override
    public boolean hasPrevious() {
        return offset > 0;
    }
}


