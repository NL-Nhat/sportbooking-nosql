package com.example.backend.repositories;

import com.example.backend.models.BlockedSlot;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface BlockedSlotRepository extends MongoRepository<BlockedSlot, String> {

    List<BlockedSlot> findByCourtIdOrderByStartAtDesc(String courtId);

    List<BlockedSlot> findByCourtIdInOrderByStartAtDesc(Collection<String> courtIds);
}
