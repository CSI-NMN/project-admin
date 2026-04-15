package org.church.backend.common.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "families")
@Getter
@Setter
@NoArgsConstructor
public class Family {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "\"createdAt\"", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "\"updatedAt\"")
    private LocalDateTime updatedAt;

    @Column(name = "\"familyCode\"", nullable = false, unique = true, length = 50)
    private String familyCode;

    @Column(name = "\"familyName\"", nullable = false, length = 150)
    private String familyName;

    @Column(name = "\"area\"", length = 100)
    private String area;

    @Column(name = "\"address1\"", length = 200)
    private String address1;

    @Column(name = "\"address2\"", length = 200)
    private String address2;

    @Column(name = "\"pincode\"", length = 20)
    private String pincode;

    @Column(name = "\"city\"", length = 100)
    private String city;

    @Column(name = "\"state\"", length = 100)
    private String state;

    @Column(name = "\"familyHeadId\"")
    private Long familyHeadId;

    @OneToMany(mappedBy = "family", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Person> members = new ArrayList<>();
}
