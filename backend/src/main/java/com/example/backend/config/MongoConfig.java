package com.example.backend.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.IndexOptions;
import com.mongodb.client.model.Indexes;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.convert.DefaultMongoTypeMapper;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import java.util.Arrays;
import java.util.concurrent.TimeUnit;

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
    public MongoClient mongoClient() {
        ConnectionString connectionString = new ConnectionString(mongoUri);
        MongoClientSettings mongoClientSettings = MongoClientSettings.builder()
                .applyConnectionString(connectionString)
                .build();
        return MongoClients.create(mongoClientSettings);
    }

    /**
     * Cấu hình MongoTemplate và loại bỏ trường _class dư thừa khi lưu document vào MongoDB
     */
    @Bean
    public MongoTemplate mongoTemplate(MongoDatabaseFactory databaseFactory, MappingMongoConverter converter) {
        converter.setTypeMapper(new DefaultMongoTypeMapper(null));
        return new MongoTemplate(databaseFactory, converter);
    }

    /**
     * Kiểm tra kết nối MongoDB và đảm bảo các Partial / 2dsphere / TTL Indexes đặc thù
     * theo đúng thiết kế trong Database_Design.md và HuongdantaoDB.md
     */
    @Bean
    public CommandLineRunner initMongoIndexes(MongoClient mongoClient) {
        return args -> {
            try {
                MongoDatabase db = mongoClient.getDatabase(databaseName);
                db.runCommand(new Document("ping", 1));
                log.info("Kết nối MongoDB thành công tới database: {}", databaseName);

                // 1. GeoJSON 2dsphere index cho facilities.location
                MongoCollection<Document> facilities = db.getCollection("facilities");
                facilities.createIndex(Indexes.geo2dsphere("location"));

                // 2. Partial Unique Index chống trùng lịch đặt sân (Double-Booking Prevention)
                // Unique trên (courtId, slotDate, startAt) khi status thuộc ["HOLD", "BOOKED"]
                MongoCollection<Document> bookingSlots = db.getCollection("booking_slots");
                bookingSlots.createIndex(
                        Indexes.ascending("courtId", "slotDate", "startAt"),
                        new IndexOptions()
                                .name("uniq_active_court_slot")
                                .unique(true)
                                .partialFilterExpression(
                                        Filters.in("status", Arrays.asList("HOLD", "BOOKED"))
                                )
                );

                // 3. Partial Unique Index cho payments (transactionCode và providerEventId)
                MongoCollection<Document> payments = db.getCollection("payments");
                payments.createIndex(
                        Indexes.ascending("transactionCode"),
                        new IndexOptions()
                                .name("uniq_payment_transaction_code")
                                .unique(true)
                                .partialFilterExpression(
                                        Filters.type("transactionCode", "string")
                                )
                );
                payments.createIndex(
                        Indexes.ascending("providerEventId"),
                        new IndexOptions()
                                .name("uniq_payment_provider_event")
                                .unique(true)
                                .partialFilterExpression(
                                        Filters.type("providerEventId", "string")
                                )
                );

                // 4. TTL Index tự động dọn dẹp auth_sessions khi hết hạn (expiresAt)
                MongoCollection<Document> authSessions = db.getCollection("auth_sessions");
                authSessions.createIndex(
                        Indexes.ascending("expiresAt"),
                        new IndexOptions()
                                .name("ttl_auth_sessions_expires_at")
                                .expireAfter(0L, TimeUnit.SECONDS)
                );

                log.info("Đã đồng bộ các Index đặc thù cho 16 collections trên database {}", databaseName);
            } catch (Exception e) {
                log.warn("Không thể khởi tạo kết nối hoặc tạo Index tự động trên MongoDB ({}): {}", mongoUri, e.getMessage());
            }
        };
    }
}

