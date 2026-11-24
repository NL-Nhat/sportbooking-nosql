package com.example.backend.repositories;

import com.example.backend.models.Court;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface CourtRepository extends MongoRepository<Court, String> {

    List<Court> findByFacilityIdIn(Collection<String> facilityIds);
}
