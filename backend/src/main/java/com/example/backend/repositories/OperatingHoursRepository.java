package com.example.backend.repositories;

import com.example.backend.models.OperatingHours;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface OperatingHoursRepository extends MongoRepository<OperatingHours, String> {

    List<OperatingHours> findByCourtIdIn(Collection<String> courtIds);

    Optional<OperatingHours> findByCourtId(String courtId);
}
