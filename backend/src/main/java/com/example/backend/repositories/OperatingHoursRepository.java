package com.example.backend.repositories;

import com.example.backend.models.OperatingHours;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface OperatingHoursRepository extends MongoRepository<OperatingHours, String> {

    List<OperatingHours> findByCourtIdIn(Collection<String> courtIds);
}
