package org.church.backend.common.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tally", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"\"financialYearId\"", "\"month\""})
})
@Getter
@Setter
@NoArgsConstructor
public class Tally {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "\"financialYearId\"", nullable = false)
    private FinancialYear financialYear;

    @Column(name = "\"month\"", nullable = false, length = 10)
    private String month;

    @Column(name = "\"incomePayload\"", nullable = false, columnDefinition = "TEXT")
    private String incomePayload = "{}";

    @Column(name = "\"expensePayload\"", nullable = false, columnDefinition = "TEXT")
    private String expensePayload = "{}";

    @Column(name = "\"totalIncome\"", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalIncome = BigDecimal.ZERO;

    @Column(name = "\"totalExpense\"", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalExpense = BigDecimal.ZERO;

    @Column(name = "\"lastSavedAt\"")
    private LocalDateTime lastSavedAt;
}