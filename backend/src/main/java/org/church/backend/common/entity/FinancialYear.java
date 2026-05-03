package org.church.backend.common.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "financial_years")
@Getter
@Setter
@NoArgsConstructor
public class FinancialYear {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "\"yearLabel\"", nullable = false, unique = true, length = 20)
    private String yearLabel;

    @Column(name = "\"startDate\"", nullable = false)
    private LocalDate startDate;

    @Column(name = "\"endDate\"", nullable = false)
    private LocalDate endDate;

    @Column(name = "\"active\"", nullable = false)
    private Boolean active = true;
}
