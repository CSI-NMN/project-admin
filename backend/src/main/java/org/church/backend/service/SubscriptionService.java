package org.church.backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

import org.church.backend.common.RepositoryService.IRepositoryService;
import org.church.backend.common.entity.Family;
import org.church.backend.common.entity.FinancialYear;
import org.church.backend.common.entity.Person;
import org.church.backend.common.entity.Subscription;
import org.church.backend.common.entity.SubscriptionAuditItem;
import org.church.backend.dto.FamilySubscriptionBulkUpdateRequest;
import org.church.backend.dto.CreateFinancialYearRequest;
import org.church.backend.dto.SubscriptionAuditItemResponse;
import org.church.backend.dto.SubscriptionCardResponse;
import org.church.backend.dto.SubscriptionFinancialYearResponse;
import org.church.backend.dto.SubscriptionUpsertRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class SubscriptionService {

    private final IRepositoryService repositoryService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final String[] MONTHS = { "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar" };
    private static final String[] CATEGORY_KEYS = {
            "subscriptionOffering",
            "MensfellowshipContribution",
            "womenfellowshipContribution",
            "churchBuildingFund",
            "ezhilanFund",
            "ims",
            "dbm",
            "fmpb",
            "evangelism",
            "elderlySupport",
            "emaaki"
    };

    @Transactional(readOnly = true)
    public List<SubscriptionFinancialYearResponse> getFinancialYears() {
        return repositoryService.findAll(FinancialYear.class, null, Sort.by(Sort.Direction.DESC, "startDate"))
                .stream()
                .map(year -> new SubscriptionFinancialYearResponse(
                        year.getId(),
                        year.getYearLabel(),
                        year.getStartDate(),
                        year.getEndDate(),
                        year.getActive()))
                .toList();
    }

    public SubscriptionFinancialYearResponse createFinancialYear(CreateFinancialYearRequest request) {
        if (request.startDate().isAfter(request.endDate())) {
            throw new IllegalArgumentException("startDate must be before or equal to endDate");
        }

        if (repositoryService.exists(FinancialYear.class, hasYearLabel(request.yearLabel().trim()))) {
            throw new IllegalArgumentException("Financial year label already exists: " + request.yearLabel().trim());
        }

        boolean makeActive = Boolean.TRUE.equals(request.active());
        if (makeActive) {
            List<FinancialYear> activeYears = repositoryService.findAll(
                    FinancialYear.class,
                    isActiveYear(),
                    Sort.unsorted());
            for (FinancialYear year : activeYears) {
                year.setActive(false);
                repositoryService.update(year);
            }
        }

        FinancialYear financialYear = new FinancialYear();
        financialYear.setYearLabel(request.yearLabel().trim());
        financialYear.setStartDate(request.startDate());
        financialYear.setEndDate(request.endDate());
        financialYear.setActive(makeActive);
        FinancialYear created = repositoryService.insert(financialYear);
        return new SubscriptionFinancialYearResponse(
                created.getId(),
                created.getYearLabel(),
                created.getStartDate(),
                created.getEndDate(),
                created.getActive());
    }

    @Transactional(readOnly = true)
    public SubscriptionCardResponse getByPersonAndYear(Long personId, Long financialYearId) {
        Person person = repositoryService.getRequiredById(Person.class, personId, "Person");
        FinancialYear financialYear = repositoryService.getRequiredById(FinancialYear.class, financialYearId, "Financial year");
        Subscription subscription = findByPersonAndYear(personId, financialYearId);
        if (subscription == null) {
            return toResponse(newDraft(person, financialYear));
        }
        return toResponse(subscription);
    }

    public SubscriptionCardResponse upsert(SubscriptionUpsertRequest request) {
        Person person = repositoryService.getRequiredById(Person.class, request.personId(), "Person");
        FinancialYear financialYear = repositoryService.getRequiredById(FinancialYear.class, request.financialYearId(), "Financial year");

        Subscription existing = findByPersonAndYear(request.personId(), request.financialYearId());
        Subscription working = existing == null ? newDraft(person, financialYear) : existing;
        String beforePayload = existing == null ? "{}" : existing.getCardPayload();
        String beforeStatus = existing == null ? "DRAFT" : existing.getStatus();

        applyPayload(working, request.status(), request.cardPayload(), request.totalAmount(), request.lockRecord());
        Subscription saved = existing == null ? repositoryService.insert(working) : repositoryService.update(working);
        writeAuditEntries(saved, beforePayload, saved.getCardPayload(), beforeStatus, saved.getStatus(), existing == null ? "CREATED" : "UPDATED");
        return toResponse(saved);
    }

    public int bulkUpdateFamilyContributions(FamilySubscriptionBulkUpdateRequest request) {
        Family family = repositoryService.getRequiredById(Family.class, request.familyId(), "Family");
        FinancialYear financialYear = repositoryService.getRequiredById(FinancialYear.class, request.financialYearId(), "Financial year");

        List<Person> members = repositoryService.findAll(
                Person.class,
                belongsToFamily(family.getId()),
                Sort.by(Sort.Direction.ASC, "createdAt"));

        int updatedCount = 0;
        for (Person member : members) {
            Subscription existing = findByPersonAndYear(member.getId(), financialYear.getId());
            Subscription working = existing == null ? newDraft(member, financialYear) : existing;
            applyPayload(working, "DRAFT", request.cardPayload(), request.totalAmount(), false);
            String beforePayload = existing == null ? "{}" : existing.getCardPayload();
            if (existing == null) {
                Subscription created = repositoryService.insert(working);
                writeAuditEntries(created, beforePayload, created.getCardPayload(), "DRAFT", created.getStatus(), "FAMILY_BULK_UPDATE");
            } else {
                Subscription updated = repositoryService.update(working);
                writeAuditEntries(updated, beforePayload, updated.getCardPayload(), existing.getStatus(), updated.getStatus(), "FAMILY_BULK_UPDATE");
            }
            updatedCount += 1;
        }
        return updatedCount;
    }

    @Transactional(readOnly = true)
    public List<SubscriptionAuditItemResponse> getAuditTrail(Long personId, Long financialYearId) {
        Subscription subscription = findByPersonAndYear(personId, financialYearId);
        if (subscription == null || subscription.getId() == null) {
            return List.of();
        }

        return repositoryService.findAll(
                SubscriptionAuditItem.class,
                bySubscription(subscription.getId()),
                Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(item -> new SubscriptionAuditItemResponse(
                        item.getId(),
                        item.getCreatedAt(),
                        item.getType(),
                        item.getMonth(),
                        item.getFieldName(),
                        item.getOldValue(),
                        item.getNewValue()))
                .toList();
    }

    private void applyPayload(
            Subscription subscription,
            String status,
            String cardPayload,
            BigDecimal totalAmount,
            Boolean lockRecord) {
        String normalizedStatus = status == null ? "DRAFT" : status.trim().toUpperCase(Locale.ENGLISH);
        if (!"DRAFT".equals(normalizedStatus) && !"SUBMITTED".equals(normalizedStatus)) {
            throw new IllegalArgumentException("status must be either DRAFT or SUBMITTED");
        }

        subscription.setStatus(normalizedStatus);
        subscription.setCardPayload(cardPayload == null || cardPayload.isBlank() ? "{}" : cardPayload);
        subscription.setTotalAmount(totalAmount == null ? BigDecimal.ZERO : totalAmount);
        subscription.setLastSavedAt(LocalDateTime.now());

        if ("SUBMITTED".equals(normalizedStatus)) {
            subscription.setSubmittedAt(LocalDateTime.now());
            subscription.setIsLocked(false);
        } else {
            subscription.setIsLocked(false);
        }
    }

    private Subscription findByPersonAndYear(Long personId, Long financialYearId) {
        List<Subscription> subscriptions = repositoryService.findAll(
                Subscription.class,
                byPersonAndFinancialYear(personId, financialYearId),
                Sort.unsorted());
        return subscriptions.isEmpty() ? null : subscriptions.get(0);
    }

    private Subscription newDraft(Person person, FinancialYear financialYear) {
        Subscription subscription = new Subscription();
        subscription.setFamily(person.getFamily());
        subscription.setPerson(person);
        subscription.setFinancialYear(financialYear);
        subscription.setStatus("DRAFT");
        subscription.setCardPayload("{}");
        subscription.setTotalAmount(BigDecimal.ZERO);
        subscription.setSanthaAmount(BigDecimal.ZERO);
        subscription.setMinistryAmount(BigDecimal.ZERO);
        subscription.setMainAmount(BigDecimal.ZERO);
        subscription.setIsLocked(false);
        return subscription;
    }

    private SubscriptionCardResponse toResponse(Subscription subscription) {
        Person person = subscription.getPerson();
        String fullName = person == null
                ? ""
                : ((person.getFirstName() == null ? "" : person.getFirstName()) + " "
                        + (person.getLastName() == null ? "" : person.getLastName())).trim();
        String memberNo = person != null && person.getMembership() != null
                ? String.valueOf(person.getMembership().getId())
                : null;

        return new SubscriptionCardResponse(
                subscription.getId(),
                person == null ? null : person.getId(),
                subscription.getFamily().getId(),
                fullName,
                subscription.getFamily().getFamilyName(),
                memberNo,
                subscription.getFinancialYear().getId(),
                subscription.getFinancialYear().getYearLabel(),
                subscription.getStatus(),
                subscription.getIsLocked(),
                subscription.getTotalAmount(),
                subscription.getLastSavedAt(),
                subscription.getCardPayload());
    }

    private Specification<Subscription> byPersonAndFinancialYear(Long personId, Long financialYearId) {
        return (root, query, cb) -> cb.and(
                cb.equal(root.get("person").get("id"), personId),
                cb.equal(root.get("financialYear").get("id"), financialYearId));
    }

    private Specification<Person> belongsToFamily(Long familyId) {
        return (root, query, cb) -> cb.equal(root.get("family").get("id"), familyId);
    }

    private Specification<SubscriptionAuditItem> bySubscription(Long subscriptionId) {
        return (root, query, cb) -> cb.equal(root.get("subscription").get("id"), subscriptionId);
    }

    private Specification<FinancialYear> hasYearLabel(String yearLabel) {
        return (root, query, cb) -> cb.equal(cb.lower(root.get("yearLabel")), yearLabel.toLowerCase(Locale.ENGLISH));
    }

    private Specification<FinancialYear> isActiveYear() {
        return (root, query, cb) -> cb.isTrue(root.get("active"));
    }

    private void writeAuditEntries(
            Subscription subscription,
            String oldPayload,
            String newPayload,
            String oldStatus,
            String newStatus,
            String type) {
        List<SubscriptionAuditItem> items = new ArrayList<>();
        JsonNode oldRoot = parsePayload(oldPayload);
        JsonNode newRoot = parsePayload(newPayload);

        for (String month : MONTHS) {
            for (String categoryKey : CATEGORY_KEYS) {
                String oldValue = readCategoryValue(oldRoot, month, categoryKey);
                String newValue = readCategoryValue(newRoot, month, categoryKey);
                if (!Objects.equals(oldValue, newValue)) {
                    items.add(newAuditItem(subscription, type, month, "value." + categoryKey, oldValue, newValue));
                }
            }
            String oldDate = readDateValue(oldRoot, month);
            String newDate = readDateValue(newRoot, month);
            if (!Objects.equals(oldDate, newDate)) {
                items.add(newAuditItem(subscription, type, month, "date", oldDate, newDate));
            }
        }

        if (!Objects.equals(oldStatus, newStatus)) {
            items.add(newAuditItem(subscription, type, null, "status", oldStatus, newStatus));
        }

        for (SubscriptionAuditItem item : items) {
            repositoryService.insert(item);
        }
    }

    private SubscriptionAuditItem newAuditItem(
            Subscription subscription,
            String type,
            String month,
            String fieldName,
            String oldValue,
            String newValue) {
        SubscriptionAuditItem item = new SubscriptionAuditItem();
        item.setSubscription(subscription);
        item.setType(type);
        item.setMonth(month);
        item.setFieldName(fieldName);
        item.setOldValue(oldValue);
        item.setNewValue(newValue);
        return item;
    }

    private JsonNode parsePayload(String payload) {
        try {
            return objectMapper.readTree(payload == null || payload.isBlank() ? "{}" : payload);
        } catch (Exception ignored) {
            return objectMapper.createObjectNode();
        }
    }

    private String readCategoryValue(JsonNode root, String month, String categoryKey) {
        JsonNode valueNode = root.path("valuesByMonth").path(month).path(categoryKey);
        if (valueNode.isMissingNode() || valueNode.isNull()) {
            return "";
        }
        return valueNode.asText("");
    }

    private String readDateValue(JsonNode root, String month) {
        JsonNode valueNode = root.path("datesByMonth").path(month);
        if (valueNode.isMissingNode() || valueNode.isNull()) {
            return "";
        }
        return valueNode.asText("");
    }
}
