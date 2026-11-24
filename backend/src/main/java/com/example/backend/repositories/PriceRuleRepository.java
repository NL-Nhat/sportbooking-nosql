package com.example.backend.repositories;

import com.example.backend.models.PriceRule;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PriceRuleRepository extends MongoRepository<PriceRule, String> {

    List<PriceRule> findByCourtIdOrderByPriorityDesc(String courtId);
}
