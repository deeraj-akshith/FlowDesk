package com.teamflow.dto;

import com.teamflow.model.Task.Status;
import com.teamflow.model.User.Role;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

public class Dtos {

    // ---- Auth ----

    @Data public static class LoginRequest {
        @NotBlank @Email public String email;
        @NotBlank public String password;
    }

    @Data public static class RegisterRequest {
        @NotBlank @Size(min = 2, max = 100) public String name;
        @NotBlank @Email public String email;
        @NotBlank @Size(min = 8, max = 72) public String password;
    }

    @Data @AllArgsConstructor public static class AuthResponse {
        public String token;
        public UserResponse user;
    }

    // ---- Users ----

    @Data @AllArgsConstructor public static class UserResponse {
        public Long id;
        public String name;
        public String email;
        public Role role;
        public boolean active;
        public LocalDateTime createdAt;
    }

    @Data public static class UserSummary {
        public Long id;
        public String name;
    }

    // ---- Tasks ----

    @Data public static class TaskRequest {
        @NotBlank @Size(max = 255) public String title;
        public String description;
        public Status status = Status.TODO;
        public Long assignedToId;
    }

    @Data @AllArgsConstructor public static class TaskResponse {
        public Long id;
        public String title;
        public String description;
        public Status status;
        public UserSummary assignedTo;
        public UserSummary createdBy;
        public LocalDateTime createdAt;
        public LocalDateTime updatedAt;
    }

    // ---- Errors ----

    @Data @AllArgsConstructor public static class ErrorResponse {
        public String message;
    }

    @Data @AllArgsConstructor public static class ValidationErrorResponse {
        public String message;
        public java.util.Map<String, String> errors;
    }
}
