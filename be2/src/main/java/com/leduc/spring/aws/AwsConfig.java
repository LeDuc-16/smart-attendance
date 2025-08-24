package com.leduc.spring.aws;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.rekognition.RekognitionClient;
import software.amazon.awssdk.services.rekognition.model.CreateCollectionRequest;
import software.amazon.awssdk.services.rekognition.model.CreateCollectionResponse;
import software.amazon.awssdk.services.rekognition.model.ListCollectionsRequest;
import software.amazon.awssdk.services.rekognition.model.ListCollectionsResponse;
import software.amazon.awssdk.services.s3.S3Client;

import java.net.URI;

@Configuration
public class AwsConfig {

    private static final Logger logger = LoggerFactory.getLogger(AwsConfig.class);
    private static final String FACE_COLLECTION_ID = "student_faces";

    private final String awsRegion = System.getenv().getOrDefault("AWS_REGION", "ap-southeast-2");
    private final boolean mock = Boolean.parseBoolean(System.getenv().getOrDefault("AWS_S3_MOCK", "false"));

    @Bean
    public S3Client s3Client() {
        if (mock) {
            return new FakeS3();
        }
        return S3Client.builder()
                .region(Region.of(awsRegion))
                .endpointOverride(URI.create("https://s3.ap-southeast-2.amazonaws.com"))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }


    @Bean
    public RekognitionClient rekognitionClient() {
        RekognitionClient client = RekognitionClient.builder()
                .region(Region.of(awsRegion))// region hỗ trợ Face Liveness
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();

        createCollectionIfNotExists(client);
        return client;
    }



    private void createCollectionIfNotExists(RekognitionClient client) {
        try {
            ListCollectionsResponse listResponse = client.listCollections(ListCollectionsRequest.builder().build());

            if (!listResponse.collectionIds().contains(FACE_COLLECTION_ID)) {
                CreateCollectionResponse createResponse = client.createCollection(
                        CreateCollectionRequest.builder()
                                .collectionId(FACE_COLLECTION_ID)
                                .build()
                );
                if (createResponse.statusCode() == 200) {
                    logger.info("Collection {} created successfully", FACE_COLLECTION_ID);
                } else {
                    logger.error("Failed to create collection: {}", FACE_COLLECTION_ID);
                }
            } else {
                logger.info("Collection {} already exists", FACE_COLLECTION_ID);
            }
        } catch (Exception e) {
            logger.error("Failed to check or create Rekognition collection: {}", e.getMessage(), e);
        }
    }
}