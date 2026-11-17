/**
 * File: CauHinhBaoMat.java
 * Muc dich: Thiet lap bao mat cho ung dung user-service bang Spring Security.
 * Chuc nang: Khai bao PasswordEncoder BCrypt, tat session stateless va cho phep filter Gateway kiem soat.
 */
package com.sportbooking.userservice.cauhinh;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class CauHinhBaoMat {

    @Bean
    public PasswordEncoder boMaHoaMatKhau() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain chuoiBaoMat(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

        return http.build();
    }
}
