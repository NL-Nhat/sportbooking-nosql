package com.example.backend.repositories;

import com.example.backend.models.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {

    List<Payment> findByBookingIdOrderByCreatedAtDesc(String bookingId);

    List<Payment> findByBookingIdInOrderByCreatedAtDesc(Collection<String> bookingIds);
}
