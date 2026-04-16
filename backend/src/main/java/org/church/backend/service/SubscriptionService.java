package org.church.backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import org.church.backend.common.RepositoryService.IRepositoryService;
import org.church.backend.common.entity.Family;
import org.church.backend.common.entity.FinancialYear;
import org.church.backend.common.entity.Person;
import org.church.backend.common.entity.Subscription;
import org.church.backend.dto.FamilySubscriptionBulkUpdateRequest;
import org.church.backend.dto.CreateFinancialYearRequest;
import org.church.backend.dto.SubscriptionCardResponse;
import org.church.backend.dto.SubscriptionFinancialYearResponse;
import org.church.backend.dto.SubscriptionUpsertRequest;
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

        applyPayload(working, request.status(), request.cardPayload(), request.totalAmount(), request.lockRecord());
        Subscription saved = existing == null ? repositoryService.insert(working) : repositoryService.update(working);
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
            if (existing == null) {
                repositoryService.insert(working);
            } else {
                repositoryService.update(working);
            }
            updatedCount += 1;
        }
        return updatedCount;
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

    private Specification<FinancialYear> hasYearLabel(String yearLabel) {
        return (root, query, cb) -> cb.equal(cb.lower(root.get("yearLabel")), yearLabel.toLowerCase(Locale.ENGLISH));
    }

    private Specification<FinancialYear> isActiveYear() {
        return (root, query, cb) -> cb.isTrue(root.get("active"));
    }
}
