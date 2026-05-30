package org.church.backend.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;

public record TallyUpsertRequest(
    @NotNull Long financialYearId,
    @NotNull String month,
    @NotNull String incomePayload,
    @NotNull String expensePayload,
    @NotNull BigDecimal totalIncome,
    @NotNull BigDecimal totalExpense
) {}