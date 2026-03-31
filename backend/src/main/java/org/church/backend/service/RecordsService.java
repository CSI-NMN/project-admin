package org.church.backend.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.time.LocalDate;
import java.time.format.TextStyle;

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
import org.church.backend.dto.CelebrationFeedItemResponse;
import org.church.backend.dto.CelebrationsResponse;
import org.church.backend.dto.MovePersonRequest;
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
            "id", "familyCode", "familyName", "address1", "area", "address2", "pincode", "city", "state",
            "familyHeadId", "createdAt", "updatedAt");

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
        String code = resolveFamilyCode(request.familyCode());
        if (repositoryService.exists(Family.class, hasFamilyCode(code))) {
            throw new IllegalArgumentException("Family code already exists: " + code);
        }

        List<PersonCreateRequest> requestedMembers = request.members() == null ? List.of() : request.members();
        validateCreateMembers(requestedMembers);

        Family family = FamilyMapper.toEntity(request);
        family.setFamilyCode(code);
        Family created = repositoryService.insert(family);

        for (PersonCreateRequest memberRequest : requestedMembers) {
            validateUniqueAadhaarNumber(memberRequest.aadhaarNumber(), null);
            Person person = PersonMapper.toEntity(memberRequest);
            person.setFamily(created);
            repositoryService.insert(person);
        }

        refreshFamilyHeadId(created.getId());
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
            UUID familyHeadId,
            String memberName,
            String phoneNumber,
            String aadhaarNumber,
            ODataQueryOptions queryOptions) {
        Specification<Family> specification = buildSearchSpecification(
                familyId,
                familyHeadId,
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
    public CelebrationsResponse getCelebrations(Integer month) {
        int resolvedMonth = resolveMonth(month);
        String monthLabel = monthName(resolvedMonth);

        List<CelebrationFeedItemResponse> birthdays = new ArrayList<>();
        List<CelebrationFeedItemResponse> anniversaries = new ArrayList<>();

        List<Family> families = repositoryService.findAll(Family.class, null, Sort.by(Sort.Direction.ASC, "familyName"));
        for (Family family : families) {
            List<Person> members = repositoryService.findAll(
                    Person.class,
                    belongsToFamily(family.getId()),
                    Sort.by(Sort.Direction.ASC, "createdAt"));

            addBirthdayItems(birthdays, family, members, resolvedMonth);
            addAnniversaryItems(anniversaries, family, members, resolvedMonth);
        }

        birthdays.sort(Comparator
                .comparingInt(CelebrationFeedItemResponse::eventDay)
                .thenComparing(CelebrationFeedItemResponse::name, String.CASE_INSENSITIVE_ORDER));
        anniversaries.sort(Comparator
                .comparingInt(CelebrationFeedItemResponse::eventDay)
                .thenComparing(CelebrationFeedItemResponse::name, String.CASE_INSENSITIVE_ORDER));

        return new CelebrationsResponse(
                resolvedMonth,
                monthLabel,
                birthdays.size(),
                anniversaries.size(),
                birthdays,
                anniversaries);
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
        refreshFamilyHeadId(familyId);
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
        refreshFamilyHeadId(familyId);
        return PersonMapper.toResponse(updated);
    }

    @Override
    public void deleteFamilyMember(UUID familyId, UUID personId) {
        ensureFamilyExists(familyId);
        Person person = repositoryService.getRequiredById(Person.class, personId, "Person");
        ensurePersonBelongsToFamily(person, familyId);
        repositoryService.delete(person);
        refreshFamilyHeadId(familyId);
    }

    @Override
    public PersonResponse moveFamilyMember(UUID personId, MovePersonRequest request) {
        Person person = repositoryService.getRequiredById(Person.class, personId, "Person");
        UUID sourceFamilyId = person.getFamily().getId();
        Family targetFamily = repositoryService.getRequiredById(Family.class, request.targetFamilyId(), "Family");

        person.setFamily(targetFamily);
        if (Boolean.TRUE.equals(person.getIsHead())) {
            clearOtherHeads(targetFamily.getId(), person.getId());
        }

        Person updated = repositoryService.update(person);
        refreshFamilyHeadId(sourceFamilyId);
        refreshFamilyHeadId(targetFamily.getId());
        return PersonMapper.toResponse(updated);
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
            addContainsPredicate(predicates, root.get("address1"), filter.address1(), cb);
            addContainsPredicate(predicates, root.get("area"), filter.area(), cb);
            addContainsPredicate(predicates, root.get("address2"), filter.address2(), cb);
            addContainsPredicate(predicates, root.get("pincode"), filter.pincode(), cb);
            addContainsPredicate(predicates, root.get("city"), filter.city(), cb);
            addContainsPredicate(predicates, root.get("state"), filter.state(), cb);
            if (filter.familyHeadId() != null) {
                predicates.add(cb.equal(root.get("familyHeadId"), filter.familyHeadId()));
            }

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
            UUID familyHeadId,
            String memberName,
            String phoneNumber,
            String aadhaarNumber) {
        return (root, query, cb) -> {
            List<Predicate> searchPredicates = new ArrayList<>();

            if (familyId != null) {
                searchPredicates.add(cb.equal(root.get("id"), familyId));
            }

            if (familyHeadId != null) {
                searchPredicates.add(cb.equal(root.get("familyHeadId"), familyHeadId));
            }

            boolean personSearch = hasText(memberName) || hasText(phoneNumber) || hasText(aadhaarNumber);
            if (personSearch) {
                Join<Family, Person> memberJoin = root.join("members", JoinType.LEFT);
                query.distinct(true);

                if (hasText(memberName)) {
                    String term = "%" + memberName.trim().toLowerCase() + "%";
                    Predicate firstName = cb.like(cb.lower(memberJoin.get("firstName")), term);
                    Predicate lastName = cb.like(cb.lower(memberJoin.get("lastName")), term);
                    searchPredicates.add(cb.or(firstName, lastName));
                }

                if (hasText(phoneNumber)) {
                    searchPredicates.add(cb.like(
                            cb.lower(memberJoin.get("mobileNo")),
                            "%" + phoneNumber.trim().toLowerCase() + "%"));
                }

                if (hasText(aadhaarNumber)) {
                    searchPredicates.add(cb.equal(
                            cb.lower(memberJoin.get("aadhaarNumber")),
                            aadhaarNumber.trim().toLowerCase()));
                }
            }

            return searchPredicates.isEmpty() ? cb.conjunction() : cb.or(searchPredicates.toArray(new Predicate[0]));
        };
    }

    private int resolveMonth(Integer month) {
        int resolved = month == null ? LocalDate.now().getMonthValue() : month;
        if (resolved < 1 || resolved > 12) {
            throw new IllegalArgumentException("month must be between 1 and 12");
        }
        return resolved;
    }

    private String monthName(int month) {
        return java.time.Month.of(month).getDisplayName(TextStyle.FULL, Locale.ENGLISH);
    }

    private void addBirthdayItems(
            List<CelebrationFeedItemResponse> target,
            Family family,
            List<Person> members,
            int month) {
        for (Person person : members) {
            LocalDate date = person.getDateOfBirth();
            if (date == null || date.getMonthValue() != month) {
                continue;
            }

            target.add(new CelebrationFeedItemResponse(
                    person.getId() + "-birthday",
                    "birthday",
                    buildPersonFullName(person),
                    family.getFamilyName(),
                    family.getFamilyCode(),
                    formatCelebrationDateLabel(date),
                    date.getDayOfMonth(),
                    person.getMobileNo(),
                    person.getEmail(),
                    person.getId(),
                    family.getId()));
        }
    }

    private void addAnniversaryItems(
            List<CelebrationFeedItemResponse> target,
            Family family,
            List<Person> members,
            int month) {
        Map<LocalDate, List<Person>> groupedByMarriageDate = new LinkedHashMap<>();
        for (Person person : members) {
            LocalDate date = person.getDateOfMarriage();
            if (date == null || date.getMonthValue() != month) {
                continue;
            }
            groupedByMarriageDate.computeIfAbsent(date, ignored -> new ArrayList<>()).add(person);
        }

        for (Map.Entry<LocalDate, List<Person>> entry : groupedByMarriageDate.entrySet()) {
            LocalDate date = entry.getKey();
            List<Person> group = new ArrayList<>(entry.getValue());
            group.sort(this::compareAnniversaryGroupPeople);

            Person primaryPerson = group.get(0);
            String displayName = group.size() > 1
                    ? buildHonorificName(group.get(0)) + " & " + buildHonorificName(group.get(1))
                    : buildHonorificName(primaryPerson);

            target.add(new CelebrationFeedItemResponse(
                    primaryPerson.getId() + "-anniversary",
                    "anniversary",
                    displayName,
                    family.getFamilyName(),
                    family.getFamilyCode(),
                    formatCelebrationDateLabel(date),
                    date.getDayOfMonth(),
                    primaryPerson.getMobileNo(),
                    primaryPerson.getEmail(),
                    primaryPerson.getId(),
                    family.getId()));
        }
    }

    private int compareAnniversaryGroupPeople(Person left, Person right) {
        boolean leftHead = Boolean.TRUE.equals(left.getIsHead());
        boolean rightHead = Boolean.TRUE.equals(right.getIsHead());
        if (leftHead != rightHead) {
            return leftHead ? -1 : 1;
        }

        boolean leftSpouse = "spouse".equalsIgnoreCase(left.getRelationshipType());
        boolean rightSpouse = "spouse".equalsIgnoreCase(right.getRelationshipType());
        if (leftSpouse && !rightSpouse) {
            return 1;
        }
        if (rightSpouse && !leftSpouse) {
            return -1;
        }

        return buildPersonFullName(left).compareToIgnoreCase(buildPersonFullName(right));
    }

    private String buildHonorificName(Person person) {
        String name = buildPersonFullName(person);
        String gender = person.getGender() == null ? "" : person.getGender().trim().toLowerCase(Locale.ENGLISH);

        if ("male".equals(gender)) {
            return "Mr " + name;
        }
        if ("female".equals(gender)) {
            return "Mrs " + name;
        }
        return name;
    }

    private String buildPersonFullName(Person person) {
        String firstName = person.getFirstName() == null ? "" : person.getFirstName().trim();
        String lastName = person.getLastName() == null ? "" : person.getLastName().trim();
        String fullName = (firstName + " " + lastName).trim();
        return fullName.isEmpty() ? firstName : fullName;
    }

    private String formatCelebrationDateLabel(LocalDate date) {
        return String.format("%02d %s", date.getDayOfMonth(), monthName(date.getMonthValue()));
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private void refreshFamilyHeadId(UUID familyId) {
        Family family = repositoryService.getRequiredById(Family.class, familyId, "Family");
        List<Person> heads = repositoryService.findAll(Person.class, isHeadInFamily(familyId), Sort.unsorted());
        UUID resolvedHeadId = heads.isEmpty() ? null : heads.get(0).getId();
        family.setFamilyHeadId(resolvedHeadId);
        repositoryService.update(family);
    }

    private void validateCreateMembers(List<PersonCreateRequest> requestedMembers) {
        long headCount = requestedMembers.stream()
                .filter(member -> Boolean.TRUE.equals(member.isHead()))
                .count();
        if (headCount > 1) {
            throw new IllegalArgumentException("Only one person can be marked as family head");
        }

        Set<String> seenAadhaar = new HashSet<>();
        for (PersonCreateRequest member : requestedMembers) {
            if (!hasText(member.aadhaarNumber())) {
                continue;
            }

            String normalized = member.aadhaarNumber().trim().toLowerCase();
            if (!seenAadhaar.add(normalized)) {
                throw new IllegalArgumentException("Duplicate Aadhaar number in request: " + member.aadhaarNumber().trim());
            }
        }
    }

    private String resolveFamilyCode(String requestedCode) {
        String normalized = requestedCode == null ? "" : requestedCode.trim();
        if (hasText(normalized)) {
            return normalized;
        }
        return generateFamilyCode();
    }

    private String generateFamilyCode() {
        for (int attempt = 0; attempt < 100; attempt++) {
            String candidate = "FAM" + String.format("%06d", ThreadLocalRandom.current().nextInt(1_000_000));
            if (!repositoryService.exists(Family.class, hasFamilyCode(candidate))) {
                return candidate;
            }
        }
        throw new IllegalStateException("Unable to generate a unique family code");
    }

    private Pageable toPageable(ODataQueryOptions queryOptions, String defaultSortField, Set<String> allowedOrderFields) {
        Sort sort = ODataSortParser.parseOrderBy(queryOptions.orderBy(), defaultSortField, allowedOrderFields);
        int top = queryOptions.resolvedTop(DEFAULT_TOP, MAX_TOP);
        int skip = queryOptions.resolvedSkip();
        return new OffsetBasedPageRequest(skip, top, sort);
    }
}

