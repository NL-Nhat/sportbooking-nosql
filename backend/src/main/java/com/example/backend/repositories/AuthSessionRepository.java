package com.example.backend.repositories;

import com.example.backend.models.AuthSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuthSessionRepository extends MongoRepository<AuthSession, String> {

    Optional<AuthSession> findByRefreshTokenHash(String refreshTokenHash);

    Optional<AuthSession> findByPreviousTokenHash(String previousTokenHash);

    List<AuthSession> findByFamilyId(String familyId);
}
