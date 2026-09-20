package com.teamflow.backend.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.teamflow.backend.Entity.User;
import com.teamflow.backend.Repository.UserRepository;
import com.teamflow.backend.dto.UpdateProfileRequest;
import com.teamflow.backend.dto.UserProfileResponse;

@Service
public class UserService {
    @Autowired
    UserRepository userRepo;

    public UserProfileResponse getCurrentUser(String email){
        User user = userRepo.findByEmail(email)
                .orElseThrow(()-> new RuntimeException("User not Found"));
        
        return UserProfileResponse.builder()
           .id(user.getId())
           .name(user.getName())
           .avatarUrl(user.getAvatarUrl())
           .designation(user.getDesignation())
           .bio(user.getBio())
           .build(); 
    }

    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(()-> new RuntimeException("User not Found"));
        
        user.setName(request.getName());
        user.setDesignation(request.getDesignation());
        user.setBio(request.getBio());
        userRepo.save(user);
        return UserProfileResponse.builder()
           .id(user.getId())
           .name(user.getName())
           .avatarUrl(user.getAvatarUrl())
           .designation(user.getDesignation())
           .bio(user.getBio())
           .build(); 
    }
    public User getUser(String email){
        return userRepo.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
