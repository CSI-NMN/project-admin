package org.church.backend.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.church.backend.common.RepositoryService.IRepositoryService;
import org.church.backend.common.entity.Event;
import org.church.backend.common.entity.EventAuditItem;
import org.church.backend.dto.EventAuditEventCreateRequest;
import org.church.backend.dto.EventAuditEventDetailResponse;
import org.church.backend.dto.EventAuditEventResponse;
import org.church.backend.dto.EventAuditEventUpdateRequest;
import org.church.backend.dto.EventAuditRecordCreateRequest;
import org.church.backend.dto.EventAuditRecordResponse;
import org.church.backend.dto.EventAuditRecordUpdateRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class EventAuditService {

    private static final Set<String> ALLOWED_TYPES = Set.of("DECISION", "PURCHASE", "INCOME", "EXPENSE");
    private final IRepositoryService repositoryService;

    @Transactional(readOnly = true)
    public List<EventAuditEventResponse> listEvents() {
        return repositoryService.findAll(Event.class, null, Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::toEventResponse)
                .toList();
    }

    public EventAuditEventResponse createEvent(EventAuditEventCreateRequest request) {
        validateEventDates(request.startDate(), request.endDate());
        Event event = new Event();
        event.setName(request.name().trim());
        event.setStartDate(request.startDate());
        event.setEndDate(request.endDate());
        event.setDescription(normalizeNullable(request.description()));
        event.setStatus("LIVE");
        Event saved = repositoryService.insert(event);
        return toEventResponse(saved);
    }

    @Transactional(readOnly = true)
    public EventAuditEventDetailResponse getEventById(Long eventId) {
        Event event = repositoryService.getRequiredById(Event.class, eventId, "Event");
        List<EventAuditRecordResponse> records = getEventRecords(eventId);
        return new EventAuditEventDetailResponse(
                event.getId(),
                event.getName(),
                event.getStartDate(),
                event.getEndDate(),
                resolveStatus(event),
                isLive(event),
                event.getDescription(),
                event.getCreatedAt(),
                records);
    }

    public EventAuditEventResponse updateEvent(Long eventId, EventAuditEventUpdateRequest request) {
        Event event = repositoryService.getRequiredById(Event.class, eventId, "Event");
        ensureLive(event, "Only live events can be edited");
        validateEventDates(request.startDate(), request.endDate());

        event.setName(request.name().trim());
        event.setStartDate(request.startDate());
        event.setEndDate(request.endDate());
        event.setDescription(normalizeNullable(request.description()));
        Event saved = repositoryService.update(event);
        return toEventResponse(saved);
    }

    public void deleteEvent(Long eventId) {
        Event event = repositoryService.getRequiredById(Event.class, eventId, "Event");
        ensureLive(event, "Only live events can be deleted");
        repositoryService.delete(event);
    }

    @Transactional(readOnly = true)
    public List<EventAuditRecordResponse> getEventRecords(Long eventId) {
        repositoryService.getRequiredById(Event.class, eventId, "Event");
        return repositoryService.findAll(
                EventAuditItem.class,
                byEventId(eventId),
                Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::toRecordResponse)
                .toList();
    }

    public EventAuditRecordResponse createRecord(Long eventId, EventAuditRecordCreateRequest request) {
        Event event = repositoryService.getRequiredById(Event.class, eventId, "Event");
        ensureLive(event, "Cannot add records to a past event");
        String type = normalizeType(request.type());
        validateRecordData(type, request.amount(), request.itemName(), request.quantity());

        EventAuditItem item = new EventAuditItem();
        item.setEvent(event);
        item.setType(type);
        item.setDescription(request.description().trim());
        item.setAmount(request.amount());
        item.setItemName(normalizeNullable(request.itemName()));
        item.setQuantity(request.quantity());
        item.setUnit(normalizeNullable(request.unit()));
        EventAuditItem saved = repositoryService.insert(item);
        return toRecordResponse(saved);
    }

    public EventAuditRecordResponse updateRecord(Long eventId, Long recordId, EventAuditRecordUpdateRequest request) {
        Event event = repositoryService.getRequiredById(Event.class, eventId, "Event");
        ensureLive(event, "Cannot edit records for a past event");

        EventAuditItem item = repositoryService.getRequiredById(EventAuditItem.class, recordId, "Event audit record");
        if (!item.getEvent().getId().equals(eventId)) {
            throw new IllegalArgumentException("Record does not belong to the selected event");
        }

        String type = normalizeType(request.type());
        validateRecordData(type, request.amount(), request.itemName(), request.quantity());

        item.setType(type);
        item.setDescription(request.description().trim());
        item.setAmount(request.amount());
        item.setItemName(normalizeNullable(request.itemName()));
        item.setQuantity(request.quantity());
        item.setUnit(normalizeNullable(request.unit()));
        EventAuditItem saved = repositoryService.update(item);
        return toRecordResponse(saved);
    }

    public void deleteRecord(Long eventId, Long recordId) {
        Event event = repositoryService.getRequiredById(Event.class, eventId, "Event");
        ensureLive(event, "Cannot delete records for a past event");
        EventAuditItem item = repositoryService.getRequiredById(EventAuditItem.class, recordId, "Event audit record");
        if (!item.getEvent().getId().equals(eventId)) {
            throw new IllegalArgumentException("Record does not belong to the selected event");
        }
        repositoryService.delete(item);
    }

    private EventAuditEventResponse toEventResponse(Event event) {
        int recordCount = (int) repositoryService.count(EventAuditItem.class, byEventId(event.getId()));
        return new EventAuditEventResponse(
                event.getId(),
                event.getName(),
                event.getStartDate(),
                event.getEndDate(),
                resolveStatus(event),
                isLive(event),
                event.getDescription(),
                event.getCreatedAt(),
                recordCount);
    }

    private EventAuditRecordResponse toRecordResponse(EventAuditItem item) {
        return new EventAuditRecordResponse(
                item.getId(),
                item.getType(),
                item.getDescription(),
                item.getAmount(),
                item.getItemName(),
                item.getQuantity(),
                item.getUnit(),
                item.getCreatedAt());
    }

    private Specification<EventAuditItem> byEventId(Long eventId) {
        return (root, query, cb) -> cb.equal(root.get("event").get("id"), eventId);
    }

    private void validateEventDates(LocalDate startDate, LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("startDate must be before or equal to endDate");
        }
    }

    private void validateRecordData(String type, BigDecimal amount, String itemName, BigDecimal quantity) {
        if (("INCOME".equals(type) || "EXPENSE".equals(type)) && (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0)) {
            throw new IllegalArgumentException("amount must be greater than zero for INCOME and EXPENSE");
        }
        if ("PURCHASE".equals(type)) {
            if (itemName == null || itemName.isBlank()) {
                throw new IllegalArgumentException("itemName is required for PURCHASE");
            }
            if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("quantity must be greater than zero for PURCHASE");
            }
        }
    }

    private String normalizeType(String rawType) {
        String type = rawType.trim().toUpperCase(Locale.ENGLISH);
        if (!ALLOWED_TYPES.contains(type)) {
            throw new IllegalArgumentException("type must be one of DECISION, PURCHASE, INCOME, EXPENSE");
        }
        return type;
    }

    private String normalizeNullable(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private boolean isLive(Event event) {
        if (event.getEndDate() == null) return false;
        return !LocalDate.now().isAfter(event.getEndDate());
    }

    private String resolveStatus(Event event) {
        return isLive(event) ? "LIVE" : "PAST";
    }

    private void ensureLive(Event event, String message) {
        if (!isLive(event)) {
            throw new IllegalArgumentException(message);
        }
    }
}
