package com.example.backend.repositories;

import com.example.backend.models.SportsCategory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SportsCategoryRepository extends MongoRepository<SportsCategory, String> {

    List<SportsCategory> findByStatusOrderByNameAsc(String status);

    Optional<SportsCategory> findByCode(String code);
}
