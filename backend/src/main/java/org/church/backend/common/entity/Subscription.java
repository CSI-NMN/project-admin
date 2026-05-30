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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "subscriptions")
@Getter
@Setter
@NoArgsConstructor
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "\"familyId\"", nullable = false)
    private Family family;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"personId\"")
    private Person person;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "\"financialYearId\"", nullable = false)
    private FinancialYear financialYear;

    @Column(name = "\"santhaAmount\"", nullable = false, precision = 12, scale = 2)
    private BigDecimal santhaAmount = BigDecimal.ZERO;

    @Column(name = "\"ministryAmount\"", nullable = false, precision = 12, scale = 2)
    private BigDecimal ministryAmount = BigDecimal.ZERO;

    @Column(name = "\"mainAmount\"", nullable = false, precision = 12, scale = 2)
    private BigDecimal mainAmount = BigDecimal.ZERO;

    @Column(name = "\"totalAmount\"", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "\"status\"", nullable = false, length = 20)
    private String status = "DRAFT";

    @Column(name = "\"lastSavedAt\"")
    private LocalDateTime lastSavedAt;

    @Column(name = "\"cardPayload\"", nullable = false, columnDefinition = "TEXT")
    private String cardPayload = "{}";

    @Column(name = "\"submittedAt\"")
    private LocalDateTime submittedAt;

    @Column(name = "\"isLocked\"", nullable = false)
    private Boolean isLocked = false;
}
