package com.teamflow.backend.Controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teamflow.backend.Service.AuthService;
import com.teamflow.backend.dto.ApiResponse;
import com.teamflow.backend.dto.AuthResponse;
import com.teamflow.backend.dto.LoginRequest;
import com.teamflow.backend.dto.RegisterRequest;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("api/auth")
public class AuthController {

    @Autowired
    AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(
        @Valid @RequestBody RegisterRequest registerRequest){
        try {
            AuthResponse authResponse = authService.registerUser(registerRequest);
            return ResponseEntity.status(201).body(ApiResponse.success(authResponse, "User registered successfully!"));
        } catch (Exception e) {
             return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(
        @Valid @RequestBody LoginRequest loginRequest
    ){
        
        try {
            AuthResponse authResponse = authService.loginUser(loginRequest);

            return ResponseEntity.ok(ApiResponse.success(authResponse, "Login successful!"));
        } catch (Exception e) {
             return ResponseEntity.status(401).body(ApiResponse.error("Invalid email or password"));
        }
    }
}
