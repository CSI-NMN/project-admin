package org.church.backend.controller;

import java.util.UUID;

import org.church.backend.common.odata.ODataCollectionResponse;
import org.church.backend.common.odata.ODataQueryOptions;
import org.church.backend.abstraction.IRecordsService;
import org.church.backend.dto.FamilyCreateRequest;
import org.church.backend.dto.FamilyFilter;
import org.church.backend.dto.FamilyResponse;
import org.church.backend.dto.FamilyUpdateRequest;
import org.church.backend.dto.PersonCreateRequest;
import org.church.backend.dto.PersonFilter;
import org.church.backend.dto.PersonResponse;
import org.church.backend.dto.PersonUpdateRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/odata/Records")
@Validated
@RequiredArgsConstructor
public class RecordController {

    private final IRecordsService recordsService;

    @GetMapping
    public ODataCollectionResponse<FamilyResponse> listFamilies(
            @RequestParam(name = "familyCode", required = false) String familyCode,
            @RequestParam(name = "familyName", required = false) String familyName,
            @RequestParam(name = "area", required = false) String area,
            @RequestParam(name = "subscriptionId", required = false) String subscriptionId,
            @RequestParam(name = "$top", required = false) Integer top,
            @RequestParam(name = "$skip", required = false) Integer skip,
            @RequestParam(name = "$orderby", required = false) String orderBy,
            @RequestParam(name = "$count", defaultValue = "false") boolean count) {
        FamilyFilter filter = new FamilyFilter(familyCode, familyName, area, subscriptionId);
        return recordsService.getFamilies(filter, new ODataQueryOptions(top, skip, orderBy, count));
    }

    @GetMapping("({familyId})")
    public FamilyResponse getFamilyById(@PathVariable UUID familyId) {
        return recordsService.getFamilyById(familyId);
    }

    @PostMapping
    public ResponseEntity<FamilyResponse> createFamily(@RequestBody @Valid FamilyCreateRequest request) {
        FamilyResponse created = recordsService.createFamily(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("({familyId})")
    public FamilyResponse updateFamily(@PathVariable UUID familyId, @RequestBody @Valid FamilyUpdateRequest request) {
        return recordsService.updateFamily(familyId, request);
    }

    @DeleteMapping("({familyId})")
    public ResponseEntity<Void> deleteFamily(@PathVariable UUID familyId) {
        recordsService.deleteFamily(familyId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ODataCollectionResponse<FamilyResponse> search(
            @RequestParam(name = "familyId", required = false) UUID familyId,
            @RequestParam(name = "subscriptionId", required = false) String subscriptionId,
            @RequestParam(name = "memberName", required = false) String memberName,
            @RequestParam(name = "phoneNumber", required = false) String phoneNumber,
            @RequestParam(name = "aadhaarNumber", required = false) String aadhaarNumber,
            @RequestParam(name = "$top", required = false) Integer top,
            @RequestParam(name = "$skip", required = false) Integer skip,
            @RequestParam(name = "$orderby", required = false) String orderBy,
            @RequestParam(name = "$count", defaultValue = "false") boolean count) {
        return recordsService.search(
                familyId,
                subscriptionId,
                memberName,
                phoneNumber,
                aadhaarNumber,
                new ODataQueryOptions(top, skip, orderBy, count));
    }

    @GetMapping("({familyId})/Persons")
    public ODataCollectionResponse<PersonResponse> listFamilyMembers(
            @PathVariable UUID familyId,
            @RequestParam(name = "memberNo", required = false) String memberNo,
            @RequestParam(name = "firstName", required = false) String firstName,
            @RequestParam(name = "lastName", required = false) String lastName,
            @RequestParam(name = "isHead", required = false) Boolean isHead,
            @RequestParam(name = "$top", required = false) Integer top,
            @RequestParam(name = "$skip", required = false) Integer skip,
            @RequestParam(name = "$orderby", required = false) String orderBy,
            @RequestParam(name = "$count", defaultValue = "false") boolean count) {
        PersonFilter filter = new PersonFilter(familyId, memberNo, firstName, lastName, isHead);
        return recordsService.getFamilyMembers(familyId, filter, new ODataQueryOptions(top, skip, orderBy, count));
    }

    @GetMapping("({familyId})/Persons({personId})")
    public PersonResponse getFamilyMemberById(@PathVariable UUID familyId, @PathVariable UUID personId) {
        return recordsService.getFamilyMemberById(familyId, personId);
    }

    @PostMapping("({familyId})/Persons")
    public ResponseEntity<PersonResponse> addFamilyMember(
            @PathVariable UUID familyId,
            @RequestBody @Valid PersonCreateRequest request) {
        PersonResponse created = recordsService.addFamilyMember(familyId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("({familyId})/Persons({personId})")
    public PersonResponse updateFamilyMember(
            @PathVariable UUID familyId,
            @PathVariable UUID personId,
            @RequestBody @Valid PersonUpdateRequest request) {
        return recordsService.updateFamilyMember(familyId, personId, request);
    }

    @DeleteMapping("({familyId})/Persons({personId})")
    public ResponseEntity<Void> deleteFamilyMember(@PathVariable UUID familyId, @PathVariable UUID personId) {
        recordsService.deleteFamilyMember(familyId, personId);
        return ResponseEntity.noContent().build();
    }
}

