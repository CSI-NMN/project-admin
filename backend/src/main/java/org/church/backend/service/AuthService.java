package org.church.backend.service;

import java.util.Map;
import java.util.Optional;

import org.church.backend.common.entity.Role;
import org.church.backend.common.entity.User;
import org.church.backend.common.security.JwtTokenProvider;
import org.church.backend.dto.AuthResponse;
import org.church.backend.dto.DevLoginRequest;
import org.church.backend.dto.UserResponse;
import org.church.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.oauth.google.client-id:}")
    private String configuredGoogleClientId;

    @Transactional
    public AuthResponse authenticateWithGoogle(String credential) {
        if (!StringUtils.hasText(credential)) {
            throw new IllegalArgumentException("Google credential token is missing");
        }

        Map<String, Object> tokenInfo;
        try {
            String tokenInfoUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + credential;
            ResponseEntity<Map> response = restTemplate.getForEntity(tokenInfoUrl, Map.class);
            tokenInfo = response.getBody();
        } catch (RestClientException ex) {
            log.error("Failed to verify Google ID token with Google tokeninfo endpoint: {}", ex.getMessage());
            throw new IllegalArgumentException("Invalid Google token: " + ex.getMessage());
        }

        if (tokenInfo == null || !tokenInfo.containsKey("email")) {
            throw new IllegalArgumentException("Invalid Google token payload");
        }

        String email = (String) tokenInfo.get("email");
        String name = (String) tokenInfo.getOrDefault("name", email);
        String picture = (String) tokenInfo.get("picture");
        String googleId = (String) tokenInfo.get("sub");
        String aud = (String) tokenInfo.get("aud");

        if (StringUtils.hasText(configuredGoogleClientId) && !configuredGoogleClientId.equals(aud)) {
            log.warn("Audience mismatch: expected {}, received {}", configuredGoogleClientId, aud);
            throw new IllegalArgumentException("Google token was not issued for this client ID");
        }

        User user = upsertUser(email, name, picture, googleId, null);
        String token = tokenProvider.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .user(UserResponse.fromEntity(user))
                .build();
    }

    @Transactional
    public AuthResponse devLogin(DevLoginRequest request) {
        Role role = request.getRole() != null ? request.getRole() : Role.CHURCH_MEMBER;
        User user = upsertUser(request.getEmail(), request.getName(), request.getAvatarUrl(), null, role);
        String token = tokenProvider.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .user(UserResponse.fromEntity(user))
                .build();
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("Email cannot be empty");
        }

        return userRepository.findByEmail(email)
                .map(UserResponse::fromEntity)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }

    private User upsertUser(String email, String name, String avatarUrl, String googleId, Role explicitRole) {
        Optional<User> existingUserOpt = userRepository.findByEmail(email);

        if (existingUserOpt.isPresent()) {
            User user = existingUserOpt.get();
            if (StringUtils.hasText(name)) {
                user.setName(name);
            }
            if (StringUtils.hasText(avatarUrl)) {
                user.setAvatarUrl(avatarUrl);
            }
            if (StringUtils.hasText(googleId)) {
                user.setGoogleId(googleId);
            }
            if (explicitRole != null) {
                user.setRole(explicitRole);
            }
            return userRepository.save(user);
        }

        long userCount = userRepository.count();
        Role assignedRole;
        if (explicitRole != null) {
            assignedRole = explicitRole;
        } else if (userCount == 0 || email.toLowerCase().contains("admin")) {
            assignedRole = Role.ADMIN;
        } else {
            assignedRole = Role.CHURCH_MEMBER;
        }

        User newUser = User.builder()
                .email(email)
                .name(StringUtils.hasText(name) ? name : email)
                .avatarUrl(avatarUrl)
                .googleId(googleId)
                .role(assignedRole)
                .build();

        return userRepository.save(newUser);
    }
}
