package com.example.backend.repositories;

import com.example.backend.models.SportsCategory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SportsCategoryRepository extends MongoRepository<SportsCategory, String> {
}
