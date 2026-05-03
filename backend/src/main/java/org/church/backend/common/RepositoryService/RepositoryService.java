package org.church.backend.common.RepositoryService;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.From;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

@Repository
public class RepositoryService implements IRepositoryService {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public <T> Page<T> getAll(Class<T> entityClass, Pageable pageable) {
        return getAll(entityClass, null, pageable);
    }

    @Override
    public <T> Page<T> getAll(Class<T> entityClass, Specification<T> specification, Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<T> query = cb.createQuery(entityClass);
        Root<T> root = query.from(entityClass);

        applySpecification(query, root, cb, specification);
        applySort(query, root, cb, pageable.getSort());

        TypedQuery<T> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<T> content = typedQuery.getResultList();
        long total = count(entityClass, specification);
        return new PageImpl<>(content, pageable, total);
    }

    @Override
    public <T> List<T> findAll(Class<T> entityClass, Specification<T> specification, Sort sort) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<T> query = cb.createQuery(entityClass);
        Root<T> root = query.from(entityClass);

        applySpecification(query, root, cb, specification);
        applySort(query, root, cb, sort);
        return entityManager.createQuery(query).getResultList();
    }

    @Override
    public <T> long count(Class<T> entityClass) {
        return count(entityClass, null);
    }

    @Override
    public <T> long count(Class<T> entityClass, Specification<T> specification) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Long> query = cb.createQuery(Long.class);
        Root<T> root = query.from(entityClass);

        Predicate predicate = toPredicate(specification, root, query, cb);
        query.select(query.isDistinct() ? cb.countDistinct(root) : cb.count(root));
        query.where(predicate);

        return entityManager.createQuery(query).getSingleResult();
    }

    @Override
    public <T> boolean exists(Class<T> entityClass, Specification<T> specification) {
        return count(entityClass, specification) > 0;
    }

    @Override
    public <T> T getRequiredById(Class<T> entityClass, Object id, String entityName) {
        T entity = entityManager.find(entityClass, id);
        if (entity == null) {
            throw new NoSuchElementException(entityName + " not found for id: " + id);
        }
        return entity;
    }

    @Override
    public <T> T insert(T entity) {
        applyAuditOnInsert(entity);
        entityManager.persist(entity);
        return entity;
    }

    @Override
    public <T> T update(T entity) {
        applyAuditOnUpdate(entity);
        return entityManager.merge(entity);
    }

    @Override
    public <T> void delete(T entity) {
        T managed = entityManager.contains(entity) ? entity : entityManager.merge(entity);
        entityManager.remove(managed);
    }

    @Override
    public <T> boolean existsById(Class<T> entityClass, Object id) {
        return entityManager.find(entityClass, id) != null;
    }

    private <T> void applySpecification(
            CriteriaQuery<T> query,
            Root<T> root,
            CriteriaBuilder cb,
            Specification<T> specification) {
        Predicate predicate = toPredicate(specification, root, query, cb);
        query.select(root);
        query.where(predicate);
    }
    
    private <T> Predicate toPredicate(
            Specification<T> specification,
            Root<T> root,
            CriteriaQuery<?> query,
            CriteriaBuilder cb) {
        if (specification == null) {
            return cb.conjunction();
        }

        Predicate predicate = specification.toPredicate(root, query, cb);
        return predicate == null ? cb.conjunction() : predicate;
    }

    private void applySort(CriteriaQuery<?> query, Root<?> root, CriteriaBuilder cb, Sort sort) {
        List<Order> orders = new ArrayList<>();
        for (Sort.Order current : sort) {
            Path<?> path = resolvePath(root, current.getProperty());
            orders.add(current.isAscending() ? cb.asc(path) : cb.desc(path));
        }
        if (!orders.isEmpty()) {
            query.orderBy(orders);
        }
    }

    private Path<?> resolvePath(From<?, ?> from, String dottedPath) {
        Path<?> path = from;
        for (String segment : dottedPath.split("\\.")) {
            path = path.get(segment);
        }
        return path;
    }

    private void applyAuditOnInsert(Object entity) {
        LocalDateTime now = LocalDateTime.now();
        setLocalDateTimeIfPresent(entity, "createdAt", now, true);
        setLocalDateTimeIfPresent(entity, "updatedAt", now, false);
    }

    private void applyAuditOnUpdate(Object entity) {
        LocalDateTime now = LocalDateTime.now();
        setLocalDateTimeIfPresent(entity, "updatedAt", now, false);
    }

    private void setLocalDateTimeIfPresent(Object entity, String fieldName, LocalDateTime value, boolean onlyIfNull) {
        Field field = findField(entity.getClass(), fieldName);
        if (field == null || !LocalDateTime.class.isAssignableFrom(field.getType())) {
            return;
        }

        try {
            field.setAccessible(true);
            Object current = field.get(entity);
            if (!onlyIfNull || current == null) {
                field.set(entity, value);
            }
        } catch (IllegalAccessException ignored) {
            // No-op if field cannot be set.
        }
    }

    private Field findField(Class<?> type, String fieldName) {
        Class<?> current = type;
        while (current != null) {
            try {
                return current.getDeclaredField(fieldName);
            } catch (NoSuchFieldException ignored) {
                current = current.getSuperclass();
            }
        }
        return null;
    }
}
