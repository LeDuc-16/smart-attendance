package com.leduc.spring.aws.s3;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.EnvironmentVariableCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.rekognition.RekognitionClient;
import software.amazon.awssdk.services.rekognition.model.CreateCollectionRequest;
import software.amazon.awssdk.services.rekognition.model.CreateCollectionResponse;
import software.amazon.awssdk.services.rekognition.model.ListCollectionsRequest;
import software.amazon.awssdk.services.rekognition.model.ListCollectionsResponse;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class AwsConfig {

    private static final Logger logger = LoggerFactory.getLogger(AwsConfig.class);

    @Value("${aws.region}")
    private String awsRegion;

    @Value("${aws.s3.mock}")
    private boolean mock;

    private static final String FACE_COLLECTION_ID = "student_faces";

    @Bean
    public S3Client s3Client() {
        if (mock) {
            return new FakeS3();
        }
        return S3Client.builder()
                .region(Region.of(awsRegion))
                .credentialsProvider(EnvironmentVariableCredentialsProvider.create())
                .build();
    }

    @Bean
    public RekognitionClient rekognitionClient() {
        RekognitionClient client = RekognitionClient.builder()
                .region(Region.of(awsRegion))
                .credentialsProvider(EnvironmentVariableCredentialsProvider.create())
                .build();

        createCollectionIfNotExists(client);
        return client;
    }

    private void createCollectionIfNotExists(RekognitionClient client) {
        try {
            ListCollectionsRequest listRequest = ListCollectionsRequest.builder().build();
            ListCollectionsResponse listResponse = client.listCollections(listRequest);

            if (!listResponse.collectionIds().contains(FACE_COLLECTION_ID)) {
                CreateCollectionRequest createRequest = CreateCollectionRequest.builder()
                        .collectionId(FACE_COLLECTION_ID)
                        .build();
                CreateCollectionResponse createResponse = client.createCollection(createRequest);
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