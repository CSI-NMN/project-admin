package org.church.backend.common.entity;

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
@Table(name = "subscription_audit_items")
@Getter
@Setter
@NoArgsConstructor
public class SubscriptionAuditItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "\"createdAt\"", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "\"subscriptionId\"", nullable = false)
    private Subscription subscription;

    @Column(name = "\"type\"", nullable = false, length = 40)
    private String type;

    @Column(name = "\"month\"", length = 10)
    private String month;

    @Column(name = "\"fieldName\"", nullable = false, length = 120)
    private String fieldName;

    @Column(name = "\"oldValue\"", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "\"newValue\"", columnDefinition = "TEXT")
    private String newValue;
}
