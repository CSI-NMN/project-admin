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
@Table(name = "event_audit_items")
@Getter
@Setter
@NoArgsConstructor
public class EventAuditItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "\"createdAt\"", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "\"eventId\"", nullable = false)
    private Event event;

    @Column(name = "\"type\"", nullable = false, length = 20)
    private String type;

    @Column(name = "\"description\"", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "\"amount\"", precision = 12, scale = 2)
    private BigDecimal amount;
}
