package com.teamflow.repository;

import com.teamflow.model.Task;
import com.teamflow.model.Task.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    @Query("""
        SELECT t FROM Task t
        LEFT JOIN FETCH t.assignedTo
        LEFT JOIN FETCH t.createdBy
        WHERE (:status IS NULL OR t.status = :status)
          AND (:assignedTo IS NULL OR t.assignedTo.id = :assignedTo)
        ORDER BY t.createdAt DESC
    """)
    List<Task> findAllFiltered(@Param("status") Status status,
                               @Param("assignedTo") Long assignedTo);

    @Query("""
        SELECT t FROM Task t
        LEFT JOIN FETCH t.assignedTo
        LEFT JOIN FETCH t.createdBy
        WHERE t.id = :id
    """)
    java.util.Optional<Task> findByIdWithUsers(@Param("id") Long id);
}
