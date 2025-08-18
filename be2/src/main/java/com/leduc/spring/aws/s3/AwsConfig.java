package com.leduc.spring.aws.s3;

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

    @Value("${aws.region}")
    private String awsRegion;

    @Value("${aws.s3.mock}")
    private boolean mock;

    @Value("${aws.rekognition.collection:students-faces}") // Giá trị mặc định nếu không có
    private String faceCollectionId;

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

            if (!listResponse.collectionIds().contains(faceCollectionId)) {
                CreateCollectionRequest createRequest = CreateCollectionRequest.builder()
                        .collectionId(faceCollectionId)
                        .build();
                CreateCollectionResponse createResponse = client.createCollection(createRequest);
                if (createResponse.statusCode() == 200) {
                    System.out.println("Collection " + faceCollectionId + " created successfully");
                } else {
                    throw new RuntimeException("Failed to create collection: " + faceCollectionId);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to check or create Rekognition collection: " + e.getMessage(), e);
        }
    }
}