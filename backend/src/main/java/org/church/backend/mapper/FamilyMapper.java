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
        family.setFamilyCode(request.familyCode().trim());
        family.setFamilyName(request.familyName().trim());
        family.setResidentialAddress(request.residentialAddress());
        family.setOfficeAddress(request.officeAddress());
        family.setArea(request.area());
        family.setSubscriptionId(request.subscriptionId());
        return family;
    }

    public static void applyUpdate(Family family, FamilyUpdateRequest request) {
        if (request.familyCode() != null) {
            family.setFamilyCode(request.familyCode().trim());
        }
        if (request.familyName() != null) {
            family.setFamilyName(request.familyName().trim());
        }
        if (request.residentialAddress() != null) {
            family.setResidentialAddress(request.residentialAddress());
        }
        if (request.officeAddress() != null) {
            family.setOfficeAddress(request.officeAddress());
        }
        if (request.area() != null) {
            family.setArea(request.area());
        }
        if (request.subscriptionId() != null) {
            family.setSubscriptionId(request.subscriptionId());
        }
    }

    public static FamilyResponse toResponse(Family family, List<PersonResponse> members) {
        return new FamilyResponse(
                family.getId(),
                family.getFamilyCode(),
                family.getFamilyName(),
                family.getResidentialAddress(),
                family.getOfficeAddress(),
                family.getArea(),
                family.getSubscriptionId(),
                family.getCreatedAt(),
                family.getUpdatedAt(),
                members);
    }
}




