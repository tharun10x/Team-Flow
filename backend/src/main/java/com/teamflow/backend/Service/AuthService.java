package com.teamflow.backend.Service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.teamflow.backend.Entity.User;
import com.teamflow.backend.Repository.UserRepository;
import com.teamflow.backend.Security.JwtTokenProvider;
import com.teamflow.backend.dto.AuthResponse;
import com.teamflow.backend.dto.LoginRequest;
import com.teamflow.backend.dto.RegisterRequest;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepo;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepo,
            BCryptPasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public AuthResponse registerUser(RegisterRequest registerRequest){
        if(userRepo.existsByEmail(registerRequest.getEmail())){
            throw new RuntimeException("Error: Username is already taken!");
        }
        
        User user = User.builder()
                    .name(registerRequest.getName())
                    .email(registerRequest.getEmail())
                    .password(passwordEncoder.encode(registerRequest.getPassword()))
                    .role("USER")
                    .build();
        
        User savedUser = userRepo.save(user);

        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                registerRequest.getEmail(),
                registerRequest.getPassword())
        );

        String jwt = jwtTokenProvider.generateToken(authentication);
        return new AuthResponse(
                jwt, 
                "Bearer", 
                savedUser.getId(), 
                savedUser.getName(), 
                savedUser.getEmail()
        );
    }

    public AuthResponse loginUser(LoginRequest loginRequest){
        Authentication authentication = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(
            loginRequest.getEmail(),
            loginRequest.getPassword()
        )
    );
        String jwt = jwtTokenProvider.generateToken(authentication);
        User user = userRepo.findByEmail(loginRequest.getEmail())
                            .orElseThrow(()-> new RuntimeException("User not found"));
        
        return new AuthResponse(
            jwt,
            "Bearer",
            user.getId(),
            user.getName(),
            user.getEmail()
        );
    }
}
