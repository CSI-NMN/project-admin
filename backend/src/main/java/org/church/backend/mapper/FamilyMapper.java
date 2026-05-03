package org.church.backend.mapper;

import java.util.List;

import org.church.backend.dto.FamilyCreateRequest;
import org.church.backend.dto.FamilyResponse;
import org.church.backend.dto.FamilyUpdateRequest;
import org.church.backend.dto.PersonResponse;
import org.church.backend.common.entity.Family;

public final class FamilyMapper {

    private FamilyMapper() {
    }

    public static Family toEntity(FamilyCreateRequest request) {
        Family family = new Family();
        family.setFamilyName(request.familyName().trim());
        family.setAddress1(trimToNull(request.address1()));
        family.setArea(trimToNull(request.area()));
        family.setAddress2(trimToNull(request.address2()));
        family.setPincode(trimToNull(request.pincode()));
        family.setCity(trimToNull(request.city()));
        family.setState(trimToNull(request.state()));
        return family;
    }

    public static void applyUpdate(Family family, FamilyUpdateRequest request) {
        if (request.familyName() != null) {
            family.setFamilyName(request.familyName().trim());
        }
        if (request.address1() != null) {
            family.setAddress1(trimToNull(request.address1()));
        }
        if (request.area() != null) {
            family.setArea(trimToNull(request.area()));
        }
        if (request.address2() != null) {
            family.setAddress2(trimToNull(request.address2()));
        }
        if (request.pincode() != null) {
            family.setPincode(trimToNull(request.pincode()));
        }
        if (request.city() != null) {
            family.setCity(trimToNull(request.city()));
        }
        if (request.state() != null) {
            family.setState(trimToNull(request.state()));
        }
    }

    public static FamilyResponse toResponse(Family family, List<PersonResponse> members) {
        return new FamilyResponse(
                family.getId(),
                family.getFamilyCode(),
                family.getFamilyName(),
                family.getAddress1(),
                family.getArea(),
                family.getAddress2(),
                family.getPincode(),
                family.getCity(),
                family.getState(),
                family.getFamilyHeadId(),
                family.getCreatedAt(),
                family.getUpdatedAt(),
                members);
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}




