package org.church.backend.common.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
public class TransactionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "\"createdAt\"", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "\"type\"", nullable = false, length = 20)
    private String type;

    @Column(name = "\"category\"", nullable = false, length = 20)
    private String category;

    @Column(name = "\"amount\"", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "\"financialYearId\"", nullable = false)
    private FinancialYear financialYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"eventId\"")
    private Event event;

    @Column(name = "\"month\"")
    private Integer month;

    @Column(name = "\"description\"", columnDefinition = "TEXT")
    private String description;
}
