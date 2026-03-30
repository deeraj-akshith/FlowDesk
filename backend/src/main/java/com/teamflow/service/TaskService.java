package com.teamflow.service;

import com.teamflow.dto.Dtos.*;
import com.teamflow.model.Task;
import com.teamflow.model.Task.Status;
import com.teamflow.model.User;
import com.teamflow.repository.TaskRepository;
import com.teamflow.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public List<TaskResponse> listAll(String statusStr, Long assignedTo) {
        Status status = statusStr != null ? Status.valueOf(statusStr) : null;
        return taskRepository.findAllFiltered(status, assignedTo)
                .stream().map(this::toResponse).toList();
    }

    public TaskResponse getById(Long id) {
        Task task = taskRepository.findByIdWithUsers(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found: " + id));
        return toResponse(task);
    }

    public TaskResponse create(TaskRequest req, String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        User assignedTo = null;
        if (req.assignedToId != null) {
            assignedTo = userRepository.findById(req.assignedToId)
                    .orElseThrow(() -> new EntityNotFoundException("Assigned user not found: " + req.assignedToId));
        }

        Task task = Task.builder()
                .title(req.title)
                .description(req.description)
                .status(req.status != null ? req.status : Status.TODO)
                .assignedTo(assignedTo)
                .createdBy(creator)
                .build();

        return toResponse(taskRepository.save(task));
    }

    public TaskResponse update(Long id, TaskRequest req, String editorEmail, boolean isAdmin) {
        Task task = taskRepository.findByIdWithUsers(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found: " + id));

        User editor = userRepository.findByEmail(editorEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        boolean isCreator = task.getCreatedBy().getId().equals(editor.getId());
        boolean isAssignee = task.getAssignedTo() != null && task.getAssignedTo().getId().equals(editor.getId());

        if (!isAdmin && !isCreator && !isAssignee) {
            throw new AccessDeniedException("You are not allowed to edit this task.");
        }

        task.setTitle(req.title);
        task.setDescription(req.description);
        task.setStatus(req.status != null ? req.status : task.getStatus());

        if (isAdmin && req.assignedToId != null) {
            User assignedTo = userRepository.findById(req.assignedToId)
                    .orElseThrow(() -> new EntityNotFoundException("Assigned user not found"));
            task.setAssignedTo(assignedTo);
        } else if (isAdmin && req.assignedToId == null) {
            task.setAssignedTo(null);
        }

        return toResponse(taskRepository.save(task));
    }

    public void delete(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new EntityNotFoundException("Task not found: " + id);
        }
        taskRepository.deleteById(id);
    }

    private TaskResponse toResponse(Task t) {
        UserSummary assignedTo = null;
        if (t.getAssignedTo() != null) {
            assignedTo = new UserSummary();
            assignedTo.id = t.getAssignedTo().getId();
            assignedTo.name = t.getAssignedTo().getName();
        }
        UserSummary createdBy = new UserSummary();
        createdBy.id = t.getCreatedBy().getId();
        createdBy.name = t.getCreatedBy().getName();

        return new TaskResponse(t.getId(), t.getTitle(), t.getDescription(),
                t.getStatus(), assignedTo, createdBy, t.getCreatedAt(), t.getUpdatedAt());
    }
}
