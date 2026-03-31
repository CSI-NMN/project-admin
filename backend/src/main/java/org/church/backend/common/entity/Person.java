package org.church.backend.common.entity;

import java.time.LocalDate;
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
@Table(name = "persons")
@Getter
@Setter
@NoArgsConstructor
public class Person {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "\"createdAt\"", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "\"updatedAt\"")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "\"familyId\"", nullable = false)
    private Family family;

    @Column(name = "\"memberNo\"", length = 50)
    private String memberNo;

    @Column(name = "\"firstName\"", nullable = false, length = 100)
    private String firstName;

    @Column(name = "\"lastName\"", length = 100)
    private String lastName;

    @Column(name = "\"fatherName\"", length = 100)
    private String fatherName;

    @Column(name = "\"motherName\"", length = 100)
    private String motherName;

    @Column(name = "\"gender\"", length = 20)
    private String gender;

    @Column(name = "\"maritalStatus\"", length = 30)
    private String maritalStatus;

    @Column(name = "\"dateOfBirth\"")
    private LocalDate dateOfBirth;

    @Column(name = "\"dateOfBaptism\"")
    private LocalDate dateOfBaptism;

    @Column(name = "\"dateOfConfirmation\"")
    private LocalDate dateOfConfirmation;

    @Column(name = "\"dateOfMarriage\"")
    private LocalDate dateOfMarriage;

    @Column(name = "\"bloodGroup\"", length = 10)
    private String bloodGroup;

    @Column(name = "\"profession\"", length = 120)
    private String profession;

    @Column(name = "\"mobileNo\"", length = 30)
    private String mobileNo;

    @Column(name = "\"aadhaarNumber\"", unique = true, length = 20)
    private String aadhaarNumber;

    @Column(name = "\"email\"", length = 120)
    private String email;

    @Column(name = "\"relationshipType\"", length = 50)
    private String relationshipType;

    @Column(name = "\"isHead\"", nullable = false)
    private Boolean isHead = false;
}
