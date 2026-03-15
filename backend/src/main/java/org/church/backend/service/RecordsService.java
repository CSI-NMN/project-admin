package org.church.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.church.backend.common.RepositoryService.IRepositoryService;
import org.church.backend.common.entity.Family;
import org.church.backend.common.entity.Person;
import org.church.backend.common.odata.ODataCollectionResponse;
import org.church.backend.common.odata.ODataQueryOptions;
import org.church.backend.common.odata.ODataSortParser;
import org.church.backend.common.odata.OffsetBasedPageRequest;
import org.church.backend.abstraction.IRecordsService;
import org.church.backend.dto.FamilyCreateRequest;
import org.church.backend.dto.FamilyFilter;
import org.church.backend.dto.FamilyResponse;
import org.church.backend.dto.FamilyUpdateRequest;
import org.church.backend.dto.PersonCreateRequest;
import org.church.backend.dto.PersonFilter;
import org.church.backend.dto.PersonResponse;
import org.church.backend.dto.PersonUpdateRequest;
import org.church.backend.mapper.FamilyMapper;
import org.church.backend.mapper.PersonMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import java.util.NoSuchElementException;

@Service
@Transactional
@RequiredArgsConstructor
public class RecordsService implements IRecordsService {

    private static final int DEFAULT_TOP = 25;
    private static final int MAX_TOP = 200;

    private static final Set<String> ALLOWED_FAMILY_ORDER_FIELDS = Set.of(
            "id", "familyCode", "familyName", "area", "subscriptionId", "createdAt", "updatedAt");

    private static final Set<String> ALLOWED_PERSON_ORDER_FIELDS = Set.of(
            "id", "memberNo", "firstName", "lastName", "gender", "relationshipType", "createdAt", "updatedAt");

    private final IRepositoryService repositoryService;

    @Override
    @Transactional(readOnly = true)
    public ODataCollectionResponse<FamilyResponse> getFamilies(FamilyFilter filter, ODataQueryOptions queryOptions) {
        Specification<Family> specification = buildFamilySpecification(filter);
        Pageable pageable = toPageable(queryOptions, "createdAt", ALLOWED_FAMILY_ORDER_FIELDS);

        List<FamilyResponse> values = repositoryService.getAll(Family.class, specification, pageable)
                .getContent()
                .stream()
                .map(this::toFamilyResponseWithMembers)
                .toList();

        Long count = queryOptions.includeCount() ? repositoryService.count(Family.class, specification) : null;
        return new ODataCollectionResponse<>(values, count);
    }

    @Override
    @Transactional(readOnly = true)
    public FamilyResponse getFamilyById(UUID familyId) {
        Family family = repositoryService.getRequiredById(Family.class, familyId, "Family");
        return toFamilyResponseWithMembers(family);
    }

    @Override
    public FamilyResponse createFamily(FamilyCreateRequest request) {
        String code = request.familyCode().trim();
        if (repositoryService.exists(Family.class, hasFamilyCode(code))) {
            throw new IllegalArgumentException("Family code already exists: " + code);
        }

        Family created = repositoryService.insert(FamilyMapper.toEntity(request));
        return toFamilyResponseWithMembers(created);
    }

    @Override
    public FamilyResponse updateFamily(UUID familyId, FamilyUpdateRequest request) {
        Family family = repositoryService.getRequiredById(Family.class, familyId, "Family");

        if (request.familyCode() != null) {
            String code = request.familyCode().trim();
            if (repositoryService.exists(Family.class, hasFamilyCodeAndIdNot(code, familyId))) {
                throw new IllegalArgumentException("Family code already exists: " + code);
            }
        }

        FamilyMapper.applyUpdate(family, request);
        Family updated = repositoryService.update(family);
        return toFamilyResponseWithMembers(updated);
    }

    @Override
    public void deleteFamily(UUID familyId) {
        Family family = repositoryService.getRequiredById(Family.class, familyId, "Family");
        repositoryService.delete(family);
    }

    @Override
    @Transactional(readOnly = true)
    public ODataCollectionResponse<FamilyResponse> search(
            UUID familyId,
            String subscriptionId,
            String memberName,
            String phoneNumber,
            String aadhaarNumber,
            ODataQueryOptions queryOptions) {
        Specification<Family> specification = buildSearchSpecification(
                familyId,
                subscriptionId,
                memberName,
                phoneNumber,
                aadhaarNumber);
        Pageable pageable = toPageable(queryOptions, "createdAt", ALLOWED_FAMILY_ORDER_FIELDS);

        List<FamilyResponse> values = repositoryService.getAll(Family.class, specification, pageable)
                .getContent()
                .stream()
                .map(this::toFamilyResponseWithMembers)
                .toList();

        Long count = queryOptions.includeCount() ? repositoryService.count(Family.class, specification) : null;
        return new ODataCollectionResponse<>(values, count);
    }

    @Override
    @Transactional(readOnly = true)
    public ODataCollectionResponse<PersonResponse> getFamilyMembers(
            UUID familyId,
            PersonFilter filter,
            ODataQueryOptions queryOptions) {
        ensureFamilyExists(familyId);
        PersonFilter scopedFilter = mergeFamilyFilter(familyId, filter);

        Specification<Person> specification = buildPersonSpecification(scopedFilter);
        Pageable pageable = toPageable(queryOptions, "createdAt", ALLOWED_PERSON_ORDER_FIELDS);

        List<PersonResponse> values = repositoryService.getAll(Person.class, specification, pageable)
                .getContent()
                .stream()
                .map(PersonMapper::toResponse)
                .toList();

        Long count = queryOptions.includeCount() ? repositoryService.count(Person.class, specification) : null;
        return new ODataCollectionResponse<>(values, count);
    }

    @Override
    @Transactional(readOnly = true)
    public PersonResponse getFamilyMemberById(UUID familyId, UUID personId) {
        ensureFamilyExists(familyId);
        Person person = repositoryService.getRequiredById(Person.class, personId, "Person");
        ensurePersonBelongsToFamily(person, familyId);
        return PersonMapper.toResponse(person);
    }

    @Override
    public PersonResponse addFamilyMember(UUID familyId, PersonCreateRequest request) {
        Family family = repositoryService.getRequiredById(Family.class, familyId, "Family");
        validateUniqueAadhaarNumber(request.aadhaarNumber(), null);

        Person person = PersonMapper.toEntity(request);
        person.setFamily(family);

        if (Boolean.TRUE.equals(person.getIsHead())) {
            clearOtherHeads(family.getId(), null);
        }

        Person created = repositoryService.insert(person);
        return PersonMapper.toResponse(created);
    }

    @Override
    public PersonResponse updateFamilyMember(UUID familyId, UUID personId, PersonUpdateRequest request) {
        ensureFamilyExists(familyId);
        Person person = repositoryService.getRequiredById(Person.class, personId, "Person");
        ensurePersonBelongsToFamily(person, familyId);
        validateUniqueAadhaarNumber(request.aadhaarNumber(), personId);

        PersonMapper.applyUpdate(person, request);

        if (Boolean.TRUE.equals(person.getIsHead())) {
            clearOtherHeads(familyId, person.getId());
        }

        Person updated = repositoryService.update(person);
        return PersonMapper.toResponse(updated);
    }

    @Override
    public void deleteFamilyMember(UUID familyId, UUID personId) {
        ensureFamilyExists(familyId);
        Person person = repositoryService.getRequiredById(Person.class, personId, "Person");
        ensurePersonBelongsToFamily(person, familyId);
        repositoryService.delete(person);
    }

    private FamilyResponse toFamilyResponseWithMembers(Family family) {
        List<PersonResponse> members = repositoryService.findAll(
                Person.class,
                belongsToFamily(family.getId()),
                Sort.by(Sort.Direction.ASC, "createdAt"))
                .stream()
                .map(PersonMapper::toResponse)
                .toList();

        return FamilyMapper.toResponse(family, members);
    }

    private void clearOtherHeads(UUID familyId, UUID currentPersonId) {
        List<Person> existingHeads = repositoryService.findAll(
                Person.class,
                isHeadInFamily(familyId),
                Sort.unsorted());

        for (Person head : existingHeads) {
            if (currentPersonId == null || !head.getId().equals(currentPersonId)) {
                head.setIsHead(false);
            }
        }
    }

    private void ensureFamilyExists(UUID familyId) {
        if (!repositoryService.existsById(Family.class, familyId)) {
            throw new NoSuchElementException("Family not found for id: " + familyId);
        }
    }

    private void ensurePersonBelongsToFamily(Person person, UUID familyId) {
        if (!person.getFamily().getId().equals(familyId)) {
            throw new NoSuchElementException("Person " + person.getId() + " does not belong to family " + familyId);
        }
    }

    private PersonFilter mergeFamilyFilter(UUID familyId, PersonFilter filter) {
        if (filter == null) {
            return new PersonFilter(familyId, null, null, null, null);
        }
        return new PersonFilter(
                familyId,
                filter.memberNo(),
                filter.firstName(),
                filter.lastName(),
                filter.isHead());
    }

    private Specification<Family> buildFamilySpecification(FamilyFilter filter) {
        if (filter == null) {
            return (root, query, cb) -> cb.conjunction();
        }

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            addContainsPredicate(predicates, root.get("familyCode"), filter.familyCode(), cb);
            addContainsPredicate(predicates, root.get("familyName"), filter.familyName(), cb);
            addContainsPredicate(predicates, root.get("area"), filter.area(), cb);
            addContainsPredicate(predicates, root.get("subscriptionId"), filter.subscriptionId(), cb);

            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Specification<Person> buildPersonSpecification(PersonFilter filter) {
        if (filter == null) {
            return (root, query, cb) -> cb.conjunction();
        }

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.familyId() != null) {
                predicates.add(cb.equal(root.get("family").get("id"), filter.familyId()));
            }

            addContainsPredicate(predicates, root.get("memberNo"), filter.memberNo(), cb);
            addContainsPredicate(predicates, root.get("firstName"), filter.firstName(), cb);
            addContainsPredicate(predicates, root.get("lastName"), filter.lastName(), cb);

            if (filter.isHead() != null) {
                predicates.add(cb.equal(root.get("isHead"), filter.isHead()));
            }

            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private void addContainsPredicate(
            List<Predicate> predicates,
            jakarta.persistence.criteria.Path<String> path,
            String value,
            jakarta.persistence.criteria.CriteriaBuilder cb) {
        if (value == null || value.isBlank()) {
            return;
        }

        predicates.add(cb.like(cb.lower(path), "%" + value.trim().toLowerCase() + "%"));
    }

    private Specification<Family> hasFamilyCode(String code) {
        return (root, query, cb) -> cb.equal(cb.lower(root.get("familyCode")), code.toLowerCase());
    }

    private Specification<Family> hasFamilyCodeAndIdNot(String code, UUID excludedId) {
        return (root, query, cb) -> cb.and(
                cb.equal(cb.lower(root.get("familyCode")), code.toLowerCase()),
                cb.notEqual(root.get("id"), excludedId));
    }

    private Specification<Person> belongsToFamily(UUID familyId) {
        return (root, query, cb) -> cb.equal(root.get("family").get("id"), familyId);
    }

    private Specification<Person> isHeadInFamily(UUID familyId) {
        return (root, query, cb) -> cb.and(
                cb.equal(root.get("family").get("id"), familyId),
                cb.isTrue(root.get("isHead")));
    }

    private void validateUniqueAadhaarNumber(String aadhaarNumber, UUID currentPersonId) {
        if (!hasText(aadhaarNumber)) {
            return;
        }

        String normalized = aadhaarNumber.trim();
        Specification<Person> specification = currentPersonId == null
                ? hasAadhaarNumber(normalized)
                : hasAadhaarNumberAndIdNot(normalized, currentPersonId);

        if (repositoryService.exists(Person.class, specification)) {
            throw new IllegalArgumentException("Aadhaar number already exists: " + normalized);
        }
    }

    private Specification<Person> hasAadhaarNumber(String aadhaarNumber) {
        return (root, query, cb) -> cb.equal(cb.lower(root.get("aadhaarNumber")), aadhaarNumber.toLowerCase());
    }

    private Specification<Person> hasAadhaarNumberAndIdNot(String aadhaarNumber, UUID excludedId) {
        return (root, query, cb) -> cb.and(
                cb.equal(cb.lower(root.get("aadhaarNumber")), aadhaarNumber.toLowerCase()),
                cb.notEqual(root.get("id"), excludedId));
    }

    private Specification<Family> buildSearchSpecification(
            UUID familyId,
            String subscriptionId,
            String memberName,
            String phoneNumber,
            String aadhaarNumber) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (familyId != null) {
                predicates.add(cb.equal(root.get("id"), familyId));
            }

            if (hasText(subscriptionId)) {
                predicates.add(cb.like(
                        cb.lower(root.get("subscriptionId")),
                        "%" + subscriptionId.trim().toLowerCase() + "%"));
            }

            boolean personSearch = hasText(memberName) || hasText(phoneNumber) || hasText(aadhaarNumber);
            if (personSearch) {
                Join<Family, Person> memberJoin = root.join("members", JoinType.LEFT);
                query.distinct(true);

                if (hasText(memberName)) {
                    String term = "%" + memberName.trim().toLowerCase() + "%";
                    Predicate firstName = cb.like(cb.lower(memberJoin.get("firstName")), term);
                    Predicate lastName = cb.like(cb.lower(memberJoin.get("lastName")), term);
                    predicates.add(cb.or(firstName, lastName));
                }

                if (hasText(phoneNumber)) {
                    predicates.add(cb.like(
                            cb.lower(memberJoin.get("mobileNo")),
                            "%" + phoneNumber.trim().toLowerCase() + "%"));
                }

                if (hasText(aadhaarNumber)) {
                    predicates.add(cb.equal(
                            cb.lower(memberJoin.get("aadhaarNumber")),
                            aadhaarNumber.trim().toLowerCase()));
                }
            }

            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private Pageable toPageable(ODataQueryOptions queryOptions, String defaultSortField, Set<String> allowedOrderFields) {
        Sort sort = ODataSortParser.parseOrderBy(queryOptions.orderBy(), defaultSortField, allowedOrderFields);
        int top = queryOptions.resolvedTop(DEFAULT_TOP, MAX_TOP);
        int skip = queryOptions.resolvedSkip();
        return new OffsetBasedPageRequest(skip, top, sort);
    }
}

