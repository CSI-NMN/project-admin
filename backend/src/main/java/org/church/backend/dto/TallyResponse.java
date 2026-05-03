package org.church.backend.dto;

import java.math.BigDecimal;

public record TallyResponse(
    Long id,
    Long financialYearId,
    String month,
    String incomePayload,
    String expensePayload,
    BigDecimal totalIncome,
    BigDecimal totalExpense,
    String lastSavedAt
) {}