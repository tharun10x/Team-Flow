package com.teamflow.backend.Security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.util.StringUtils;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Autowired
    private JwtTokenProvider tokenProvider;
    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    )throws ServletException, IOException {
        
         try {
            // Step 1: Get the token from the request
            String jwt = getJwtFromRequest(request);
            // Step 2: If the token exists AND is valid...
            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                
                // Step 3: Get the email from the token
                String userEmail = tokenProvider.getUsernameFromToken(jwt);
                // Step 4: Load the user details from the database
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(userEmail);
                
                // Step 5: Tell Spring Security that this user is authenticated!
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            System.out.println("Could not set user authentication in security context");
        }
        filterChain.doFilter(request, response);
    }
     private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        // JWTs usually start with "Bearer " (with a space)
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // Remove "Bearer " and return just the token string
        }
        return null;
    }
    
}
