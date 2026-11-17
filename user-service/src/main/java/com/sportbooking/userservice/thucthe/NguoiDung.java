/**
 * File: NguoiDung.java
 * Muc dich: Thuc the anh xa bang 'users' trong co so du lieu user_db.
 * Chuc nang: Luu thong tin tai khoan, mat khau da ma hoa, vai tro, trang thai va token_version.
 */
package com.sportbooking.userservice.thucthe;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NguoiDung {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VaiTro role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TrangThaiNguoiDung status;

    @Column(name = "token_version", nullable = false)
    @Builder.Default
    private Integer tokenVersion = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        if (this.tokenVersion == null) {
            this.tokenVersion = 0;
        }
        if (this.status == null) {
            this.status = TrangThaiNguoiDung.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
