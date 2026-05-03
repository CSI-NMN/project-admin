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
        person.setFirstName(request.firstName().trim());
        person.setLastName(normalize(request.lastName()));
        person.setGender(normalize(request.gender()));
        person.setMaritalStatus(normalize(request.maritalStatus()));
        person.setDateOfBirth(request.dateOfBirth());
        person.setDateOfBaptism(request.dateOfBaptism());
        person.setDateOfConfirmation(request.dateOfConfirmation());
        person.setDateOfMarriage(request.dateOfMarriage());
        person.setBloodGroup(normalize(request.bloodGroup()));
        person.setProfession(normalize(request.profession()));
        person.setMobileNo(normalize(request.mobileNo()));
        person.setAadhaarNumber(normalize(request.aadhaarNumber()));
        person.setEmail(normalize(request.email()));
        person.setRelationshipType(normalize(request.relationshipType()));
        person.setIsHead(request.isHead() == null ? false : request.isHead());
        return person;
    }

    public static void applyUpdate(Person person, PersonUpdateRequest request) {
        if (request.firstName() != null) {
            person.setFirstName(request.firstName().trim());
        }
        if (request.lastName() != null) {
            person.setLastName(normalize(request.lastName()));
        }
        if (request.gender() != null) {
            person.setGender(normalize(request.gender()));
        }
        if (request.maritalStatus() != null) {
            person.setMaritalStatus(normalize(request.maritalStatus()));
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
            person.setBloodGroup(normalize(request.bloodGroup()));
        }
        if (request.profession() != null) {
            person.setProfession(normalize(request.profession()));
        }
        if (request.mobileNo() != null) {
            person.setMobileNo(normalize(request.mobileNo()));
        }
        if (request.aadhaarNumber() != null) {
            person.setAadhaarNumber(normalize(request.aadhaarNumber()));
        }
        if (request.email() != null) {
            person.setEmail(normalize(request.email()));
        }
        if (request.relationshipType() != null) {
            person.setRelationshipType(normalize(request.relationshipType()));
        }
        if (request.isHead() != null) {
            person.setIsHead(request.isHead());
        }
    }

    public static PersonResponse toResponse(Person person) {
        return new PersonResponse(
                person.getId(),
                person.getFamily().getId(),
                person.getMembership() == null ? null : person.getMembership().getId().toString(),
                person.getMembership() == null ? null : person.getMembership().getName(),
                person.getFirstName(),
                person.getLastName(),
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




