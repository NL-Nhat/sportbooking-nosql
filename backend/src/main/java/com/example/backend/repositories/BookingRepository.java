package com.example.backend.repositories;

import com.example.backend.models.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByFacilityIdInOrderByCreatedAtDesc(Collection<String> facilityIds);

    List<Booking> findByCourtIdOrderByCreatedAtDesc(String courtId);
}
