package org.church.backend.common.RepositoryService;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

public interface IRepositoryService {

    <T> Page<T> getAll(Class<T> entityClass, Pageable pageable);

    <T> Page<T> getAll(Class<T> entityClass, Specification<T> specification, Pageable pageable);

    <T> List<T> findAll(Class<T> entityClass, Specification<T> specification, Sort sort);

    <T> long count(Class<T> entityClass);

    <T> long count(Class<T> entityClass, Specification<T> specification);

    <T> boolean exists(Class<T> entityClass, Specification<T> specification);

    <T> T getRequiredById(Class<T> entityClass, UUID id, String entityName);

    <T> T insert(T entity);

    <T> T update(T entity);

    <T> void delete(T entity);

    <T> boolean existsById(Class<T> entityClass, UUID id);
}
