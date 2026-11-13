package com.example.backend.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;
import org.springframework.data.mongodb.core.convert.DefaultMongoTypeMapper;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Slf4j
@Configuration
@EnableMongoAuditing
@EnableMongoRepositories(basePackages = "com.example.backend.repositories")
public class MongoConfig {

    @Value("${spring.data.mongodb.uri:mongodb://localhost:27017/sportbooking_db}")
    private String mongoUri;

    @Value("${spring.data.mongodb.database:sportbooking_db}")
    private String databaseName;

    /**
     * Khởi tạo kết nối MongoClient tới MongoDB (mặc định: mongodb://localhost:27017/sportbooking_db)
     */
    @Bean
    @Primary
    public MongoClient mongoClient() {
        ConnectionString connectionString = new ConnectionString(mongoUri);
        MongoClientSettings mongoClientSettings = MongoClientSettings.builder()
                .applyConnectionString(connectionString)
                .build();
        return MongoClients.create(mongoClientSettings);
    }

    /**
     * Cố định MongoDatabaseFactory trỏ thẳng vào database "sportbooking_db"
     */
    @Bean
    @Primary
    public MongoDatabaseFactory mongoDatabaseFactory(MongoClient mongoClient) {
        return new SimpleMongoClientDatabaseFactory(mongoClient, databaseName);
    }

    /**
     * Cấu hình MongoTemplate dùng đúng mongoDatabaseFactory (sportbooking_db)
     * và dùng MappingMongoConverter chuẩn của Spring Boot (hỗ trợ đầy đủ Instant, LocalDate, Decimal128)
     */
    @Bean
    @Primary
    public MongoTemplate mongoTemplate(
            MongoDatabaseFactory mongoDatabaseFactory,
            MappingMongoConverter converter
    ) {
        converter.setTypeMapper(new DefaultMongoTypeMapper(null));
        return new MongoTemplate(mongoDatabaseFactory, converter);
    }

    /**
     * Kiểm tra kết nối tới database sportbooking_db khi ứng dụng khởi động
     */
    @Bean
    public CommandLineRunner verifyMongoConnection(MongoTemplate mongoTemplate) {
        return args -> {
            try {
                MongoDatabase db = mongoTemplate.getDb();
                db.runCommand(new Document("ping", 1));
                log.info("Kết nối MongoDB thành công! Đang sử dụng database: {}", db.getName());
            } catch (Exception e) {
                log.warn("Không thể kiểm tra kết nối MongoDB ({}): {}", mongoUri, e.getMessage());
            }
        };
    }
}
