package org.church.backend.abstraction;

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

    FamilyResponse getFamilyById(Long familyId);

    FamilyResponse createFamily(FamilyCreateRequest request);

    FamilyResponse updateFamily(Long familyId, FamilyUpdateRequest request);

    void deleteFamily(Long familyId);

    ODataCollectionResponse<FamilyResponse> search(
            Long familyId,
            Long familyHeadId,
            String familyCode,
            String memberNo,
            String memberName,
            String phoneNumber,
            String aadhaarNumber,
            ODataQueryOptions queryOptions);

    CelebrationsResponse getCelebrations(Integer month);

    ODataCollectionResponse<PersonResponse> getFamilyMembers(Long familyId, PersonFilter filter, ODataQueryOptions queryOptions);

    PersonResponse getFamilyMemberById(Long familyId, Long personId);

    PersonResponse addFamilyMember(Long familyId, PersonCreateRequest request);

    PersonResponse updateFamilyMember(Long familyId, Long personId, PersonUpdateRequest request);

    void deleteFamilyMember(Long familyId, Long personId);

    PersonResponse moveFamilyMember(Long personId, MovePersonRequest request);
}

