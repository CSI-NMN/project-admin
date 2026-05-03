package org.church.backend.controller;

import java.util.List;

import org.church.backend.dto.EventAuditEventCreateRequest;
import org.church.backend.dto.EventAuditEventDetailResponse;
import org.church.backend.dto.EventAuditEventResponse;
import org.church.backend.dto.EventAuditEventUpdateRequest;
import org.church.backend.dto.EventAuditRecordCreateRequest;
import org.church.backend.dto.EventAuditRecordResponse;
import org.church.backend.dto.EventAuditRecordUpdateRequest;
import org.church.backend.service.EventAuditService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/odata/EventAudit")
@Validated
@RequiredArgsConstructor
public class EventAuditController {

    private final EventAuditService eventAuditService;

    @GetMapping("/events")
    public List<EventAuditEventResponse> listEvents() {
        return eventAuditService.listEvents();
    }

    @PostMapping("/events")
    public ResponseEntity<EventAuditEventResponse> createEvent(@RequestBody @Valid EventAuditEventCreateRequest request) {
        EventAuditEventResponse created = eventAuditService.createEvent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/events/{eventId}")
    public EventAuditEventDetailResponse getEvent(@PathVariable Long eventId) {
        return eventAuditService.getEventById(eventId);
    }

    @PatchMapping("/events/{eventId}")
    public EventAuditEventResponse updateEvent(
            @PathVariable Long eventId,
            @RequestBody @Valid EventAuditEventUpdateRequest request) {
        return eventAuditService.updateEvent(eventId, request);
    }

    @DeleteMapping("/events/{eventId}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long eventId) {
        eventAuditService.deleteEvent(eventId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/events/{eventId}/records")
    public List<EventAuditRecordResponse> listRecords(@PathVariable Long eventId) {
        return eventAuditService.getEventRecords(eventId);
    }

    @PostMapping("/events/{eventId}/records")
    public ResponseEntity<EventAuditRecordResponse> createRecord(
            @PathVariable Long eventId,
            @RequestBody @Valid EventAuditRecordCreateRequest request) {
        EventAuditRecordResponse created = eventAuditService.createRecord(eventId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/events/{eventId}/records/{recordId}")
    public EventAuditRecordResponse updateRecord(
            @PathVariable Long eventId,
            @PathVariable Long recordId,
            @RequestBody @Valid EventAuditRecordUpdateRequest request) {
        return eventAuditService.updateRecord(eventId, recordId, request);
    }

    @DeleteMapping("/events/{eventId}/records/{recordId}")
    public ResponseEntity<Void> deleteRecord(
            @PathVariable Long eventId,
            @PathVariable Long recordId) {
        eventAuditService.deleteRecord(eventId, recordId);
        return ResponseEntity.noContent().build();
    }
}
