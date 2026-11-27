package com.example.backend.repositories;

import com.example.backend.models.BookingSlot;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

@Repository
public interface BookingSlotRepository extends MongoRepository<BookingSlot, String> {

    List<BookingSlot> findByCourtIdAndStatusInAndEndAtGreaterThan(
            String courtId,
            Collection<String> statuses,
            Instant now
    );
}
