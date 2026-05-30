package org.church.backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.church.backend.common.RepositoryService.IRepositoryService;
import org.church.backend.common.entity.FinancialYear;
import org.church.backend.common.entity.Subscription;
import org.church.backend.common.entity.Tally;
import org.church.backend.dto.TallyResponse;
import org.church.backend.dto.TallyUpsertRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class TallyService {

    private final IRepositoryService repositoryService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional(readOnly = true)
    public TallyResponse getByYearAndMonth(Long financialYearId, String month) {
        FinancialYear financialYear = repositoryService.getRequiredById(FinancialYear.class, financialYearId, "Financial year");
        Tally tally = findByYearAndMonth(financialYearId, month);
        if (tally == null) {
            tally = newDraft(financialYear, month);
            // Calculate subscription total
            BigDecimal subscriptionTotal = calculateSubscriptionTotal(financialYearId, month);
            tally.setIncomePayload(updateSubscriptionInPayload(tally.getIncomePayload(), subscriptionTotal));
            tally.setTotalIncome(subscriptionTotal);
        }
        return toResponse(tally);
    }

    public TallyResponse upsert(TallyUpsertRequest request) {
        FinancialYear financialYear = repositoryService.getRequiredById(FinancialYear.class, request.financialYearId(), "Financial year");

        Tally existing = findByYearAndMonth(request.financialYearId(), request.month());
        Tally working = existing == null ? newDraft(financialYear, request.month()) : existing;

        working.setIncomePayload(request.incomePayload());
        working.setExpensePayload(request.expensePayload());
        working.setTotalIncome(request.totalIncome());
        working.setTotalExpense(request.totalExpense());
        working.setLastSavedAt(LocalDateTime.now());

        Tally saved = existing == null ? repositoryService.insert(working) : repositoryService.update(working);
        return toResponse(saved);
    }

    private BigDecimal calculateSubscriptionTotal(Long financialYearId, String month) {
        // Sum totalAmount from subscriptions where financialYearId and cardPayload contains the month
        List<Subscription> subscriptions = repositoryService.findAll(
                Subscription.class,
                byFinancialYear(financialYearId),
                Sort.unsorted());

        BigDecimal total = BigDecimal.ZERO;
        for (Subscription sub : subscriptions) {
            try {
                JsonNode payload = objectMapper.readTree(sub.getCardPayload());
                JsonNode valuesByMonth = payload.get("valuesByMonth");
                if (valuesByMonth != null && valuesByMonth.has(month)) {
                    JsonNode monthData = valuesByMonth.get(month);
                    if (monthData != null) {
                        // Sum all category amounts for the month
                        BigDecimal monthTotal = BigDecimal.ZERO;
                        for (JsonNode amount : monthData) {
                            if (amount.isNumber()) {
                                monthTotal = monthTotal.add(amount.decimalValue());
                            }
                        }
                        total = total.add(monthTotal);
                    }
                }
            } catch (Exception e) {
                // Ignore invalid payload
            }
        }
        return total;
    }

    private String updateSubscriptionInPayload(String payload, BigDecimal amount) {
        try {
            JsonNode root = objectMapper.readTree(payload);
            JsonNode categories = root.get("categories");
            if (categories != null && categories.isArray()) {
                for (JsonNode category : categories) {
                    if ("subscription".equals(category.get("key").asText())) {
                        ((com.fasterxml.jackson.databind.node.ObjectNode) category).put("amount", amount);
                        break;
                    }
                }
            }
            return objectMapper.writeValueAsString(root);
        } catch (Exception e) {
            return payload;
        }
    }

    private Tally findByYearAndMonth(Long financialYearId, String month) {
        List<Tally> tallies = repositoryService.findAll(
                Tally.class,
                byYearAndMonth(financialYearId, month),
                Sort.unsorted());
        return tallies.isEmpty() ? null : tallies.get(0);
    }

    private Tally newDraft(FinancialYear financialYear, String month) {
        Tally tally = new Tally();
        tally.setFinancialYear(financialYear);
        tally.setMonth(month);
        tally.setIncomePayload("{\"categories\": [{\"key\": \"subscription\", \"label\": \"Subscription\", \"amount\": 0, \"editable\": false}, {\"key\": \"offerings\", \"label\": \"Offerings\", \"amount\": 0, \"editable\": true}]}");
        tally.setExpensePayload("{\"categories\": [{\"key\": \"maintenance\", \"label\": \"Maintenance\", \"amount\": 0, \"editable\": true}]}");
        tally.setTotalIncome(BigDecimal.ZERO);
        tally.setTotalExpense(BigDecimal.ZERO);
        return tally;
    }

    private TallyResponse toResponse(Tally tally) {
        return new TallyResponse(
                tally.getId(),
                tally.getFinancialYear().getId(),
                tally.getMonth(),
                tally.getIncomePayload(),
                tally.getExpensePayload(),
                tally.getTotalIncome(),
                tally.getTotalExpense(),
                tally.getLastSavedAt() != null ? tally.getLastSavedAt().toString() : null);
    }

    private Specification<Tally> byYearAndMonth(Long financialYearId, String month) {
        return (root, query, cb) -> cb.and(
                cb.equal(root.get("financialYear").get("id"), financialYearId),
                cb.equal(root.get("month"), month));
    }

    private Specification<Subscription> byFinancialYear(Long financialYearId) {
        return (root, query, cb) -> cb.equal(root.get("financialYear").get("id"), financialYearId);
    }
}