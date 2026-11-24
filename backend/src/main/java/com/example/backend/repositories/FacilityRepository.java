package com.example.backend.repositories;

import com.example.backend.models.Facility;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacilityRepository extends MongoRepository<Facility, String> {

    List<Facility> findByOwnerIdOrderByCreatedAtDesc(String ownerId);

    List<Facility> findByOwnerIdAndStatusOrderByCreatedAtDesc(String ownerId, String status);
}
