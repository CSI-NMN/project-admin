package org.church.backend.controller;

import java.util.List;
import java.util.Map;

import org.church.backend.dto.CreateFinancialYearRequest;
import org.church.backend.dto.FamilySubscriptionBulkUpdateRequest;
import org.church.backend.dto.SubscriptionAuditItemResponse;
import org.church.backend.dto.SubscriptionCardResponse;
import org.church.backend.dto.SubscriptionFinancialYearResponse;
import org.church.backend.dto.SubscriptionUpsertRequest;
import org.church.backend.service.SubscriptionService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/odata/Subscriptions")
@Validated
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping("/financial-years")
    public List<SubscriptionFinancialYearResponse> financialYears() {
        return subscriptionService.getFinancialYears();
    }

    @PostMapping("/financial-years")
    public SubscriptionFinancialYearResponse createFinancialYear(@RequestBody @Valid CreateFinancialYearRequest request) {
        return subscriptionService.createFinancialYear(request);
    }

    @GetMapping
    public SubscriptionCardResponse getCard(
            @RequestParam(name = "personId") Long personId,
            @RequestParam(name = "financialYearId") Long financialYearId) {
        return subscriptionService.getByPersonAndYear(personId, financialYearId);
    }

    @GetMapping("/audit")
    public List<SubscriptionAuditItemResponse> getAuditTrail(
            @RequestParam(name = "personId") Long personId,
            @RequestParam(name = "financialYearId") Long financialYearId) {
        return subscriptionService.getAuditTrail(personId, financialYearId);
    }

    @PutMapping
    public SubscriptionCardResponse upsert(@RequestBody @Valid SubscriptionUpsertRequest request) {
        return subscriptionService.upsert(request);
    }

    @PatchMapping("/family-contributions")
    public Map<String, Integer> updateFamilyContributions(@RequestBody @Valid FamilySubscriptionBulkUpdateRequest request) {
        int updated = subscriptionService.bulkUpdateFamilyContributions(request);
        return Map.of("updatedMembers", updated);
    }
}
