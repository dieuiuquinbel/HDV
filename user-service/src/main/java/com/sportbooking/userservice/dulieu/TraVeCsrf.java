/**
 * File: TraVeCsrf.java
 * Muc dich: DTO tra ve ma CSRF token cho phia frontend su dung co che Double-Submit Cookie.
 * Chuc nang: Chon token vao body phan hoi tu endpoint GET /auth/csrf.
 */
package com.sportbooking.userservice.dulieu;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TraVeCsrf {
    private String token;
}
