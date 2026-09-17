package com.teamflow.backend.Controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teamflow.backend.Service.UserService;
import com.teamflow.backend.dto.ApiResponse;
import com.teamflow.backend.dto.UpdateProfileRequest;
import com.teamflow.backend.dto.UserProfileResponse;

import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    UserService userService;

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getMyProfile(Principal principal){
        String email = principal.getName();
        UserProfileResponse user = userService.getCurrentUser(email);
        return ApiResponse.success(user, "Success");

    }

    @PutMapping("/me")
    public ApiResponse<UserProfileResponse> updateMyProfile(Principal principal, @Valid @RequestBody UpdateProfileRequest request) {
        String email = principal.getName();
        
        // Call your service to update the profile, and wrap it in ApiResponse.success()
        UserProfileResponse user = userService.updateProfile(email, request);
        return ApiResponse.success(user, "Success");
    } 
}
