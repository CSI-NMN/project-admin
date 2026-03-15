package org.church.backend.mapper;

import org.church.backend.dto.PersonCreateRequest;
import org.church.backend.dto.PersonResponse;
import org.church.backend.dto.PersonUpdateRequest;
import org.church.backend.common.entity.Person;

public final class PersonMapper {

    private PersonMapper() {
    }

    public static Person toEntity(PersonCreateRequest request) {
        Person person = new Person();
        person.setMemberNo(request.memberNo());
        person.setFirstName(request.firstName().trim());
        person.setLastName(request.lastName());
        person.setFatherName(request.fatherName());
        person.setMotherName(request.motherName());
        person.setGender(request.gender());
        person.setMaritalStatus(request.maritalStatus());
        person.setDateOfBirth(request.dateOfBirth());
        person.setDateOfBaptism(request.dateOfBaptism());
        person.setDateOfConfirmation(request.dateOfConfirmation());
        person.setDateOfMarriage(request.dateOfMarriage());
        person.setBloodGroup(request.bloodGroup());
        person.setProfession(request.profession());
        person.setMobileNo(request.mobileNo());
        person.setAadhaarNumber(normalize(request.aadhaarNumber()));
        person.setEmail(request.email());
        person.setRelationshipType(request.relationshipType());
        person.setIsHead(request.isHead() == null ? false : request.isHead());
        return person;
    }

    public static void applyUpdate(Person person, PersonUpdateRequest request) {
        if (request.memberNo() != null) {
            person.setMemberNo(request.memberNo());
        }
        if (request.firstName() != null) {
            person.setFirstName(request.firstName().trim());
        }
        if (request.lastName() != null) {
            person.setLastName(request.lastName());
        }
        if (request.fatherName() != null) {
            person.setFatherName(request.fatherName());
        }
        if (request.motherName() != null) {
            person.setMotherName(request.motherName());
        }
        if (request.gender() != null) {
            person.setGender(request.gender());
        }
        if (request.maritalStatus() != null) {
            person.setMaritalStatus(request.maritalStatus());
        }
        if (request.dateOfBirth() != null) {
            person.setDateOfBirth(request.dateOfBirth());
        }
        if (request.dateOfBaptism() != null) {
            person.setDateOfBaptism(request.dateOfBaptism());
        }
        if (request.dateOfConfirmation() != null) {
            person.setDateOfConfirmation(request.dateOfConfirmation());
        }
        if (request.dateOfMarriage() != null) {
            person.setDateOfMarriage(request.dateOfMarriage());
        }
        if (request.bloodGroup() != null) {
            person.setBloodGroup(request.bloodGroup());
        }
        if (request.profession() != null) {
            person.setProfession(request.profession());
        }
        if (request.mobileNo() != null) {
            person.setMobileNo(request.mobileNo());
        }
        if (request.aadhaarNumber() != null) {
            person.setAadhaarNumber(normalize(request.aadhaarNumber()));
        }
        if (request.email() != null) {
            person.setEmail(request.email());
        }
        if (request.relationshipType() != null) {
            person.setRelationshipType(request.relationshipType());
        }
        if (request.isHead() != null) {
            person.setIsHead(request.isHead());
        }
    }

    public static PersonResponse toResponse(Person person) {
        return new PersonResponse(
                person.getId(),
                person.getFamily().getId(),
                person.getMemberNo(),
                person.getFirstName(),
                person.getLastName(),
                person.getFatherName(),
                person.getMotherName(),
                person.getGender(),
                person.getMaritalStatus(),
                person.getDateOfBirth(),
                person.getDateOfBaptism(),
                person.getDateOfConfirmation(),
                person.getDateOfMarriage(),
                person.getBloodGroup(),
                person.getProfession(),
                person.getMobileNo(),
                person.getAadhaarNumber(),
                person.getEmail(),
                person.getRelationshipType(),
                person.getIsHead(),
                person.getCreatedAt(),
                person.getUpdatedAt());
    }

    private static String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}




