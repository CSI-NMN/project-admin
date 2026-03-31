package org.church.backend.abstraction;

import java.util.UUID;

import org.church.backend.common.odata.ODataCollectionResponse;
import org.church.backend.common.odata.ODataQueryOptions;
import org.church.backend.dto.FamilyCreateRequest;
import org.church.backend.dto.FamilyFilter;
import org.church.backend.dto.FamilyResponse;
import org.church.backend.dto.FamilyUpdateRequest;
import org.church.backend.dto.CelebrationsResponse;
import org.church.backend.dto.MovePersonRequest;
import org.church.backend.dto.PersonFilter;
import org.church.backend.dto.PersonCreateRequest;
import org.church.backend.dto.PersonResponse;
import org.church.backend.dto.PersonUpdateRequest;

public interface IRecordsService {

    ODataCollectionResponse<FamilyResponse> getFamilies(FamilyFilter filter, ODataQueryOptions queryOptions);

    FamilyResponse getFamilyById(UUID familyId);

    FamilyResponse createFamily(FamilyCreateRequest request);

    FamilyResponse updateFamily(UUID familyId, FamilyUpdateRequest request);

    void deleteFamily(UUID familyId);

    ODataCollectionResponse<FamilyResponse> search(
            UUID familyId,
            UUID familyHeadId,
            String memberName,
            String phoneNumber,
            String aadhaarNumber,
            ODataQueryOptions queryOptions);

    CelebrationsResponse getCelebrations(Integer month);

    ODataCollectionResponse<PersonResponse> getFamilyMembers(UUID familyId, PersonFilter filter, ODataQueryOptions queryOptions);

    PersonResponse getFamilyMemberById(UUID familyId, UUID personId);

    PersonResponse addFamilyMember(UUID familyId, PersonCreateRequest request);

    PersonResponse updateFamilyMember(UUID familyId, UUID personId, PersonUpdateRequest request);

    void deleteFamilyMember(UUID familyId, UUID personId);

    PersonResponse moveFamilyMember(UUID personId, MovePersonRequest request);
}

