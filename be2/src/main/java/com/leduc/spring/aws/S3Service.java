package com.leduc.spring.aws;

import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;

@Service
public class S3Service {

    private final S3Client s3;

    public S3Service(S3Client s3) {
        this.s3 = s3;
    }

    public void putObject(String bucketName, String key, byte[] file, String contentType) {
        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(contentType) // 👈 Thêm content type ở đây
                .build();
        s3.putObject(objectRequest, RequestBody.fromBytes(file));
    }


    public byte[] getObject(String bucketName, String key) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        ResponseInputStream<GetObjectResponse> res = s3.getObject(getObjectRequest);

        try {
            return res.readAllBytes();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public void deleteObject(String bucketName, String key) {
        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();
        s3.deleteObject(deleteObjectRequest);
    }

    public void headObject(String bucketName, String key) {
        try {
            int maxRetries = 3;
            int retryCount = 0;
            boolean success = false;
            while (!success && retryCount < maxRetries) {
                try {
                    s3.headObject(HeadObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .build());
                    success = true;
                } catch (S3Exception e) {
                    if (e.statusCode() == 404 && retryCount < maxRetries - 1) {
                        Thread.sleep(1000); // Chờ 1 giây trước khi thử lại
                        retryCount++;
                    } else {
                        throw new RuntimeException("Failed to get S3 object metadata: " + e.getMessage(), e);
                    }
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Interrupted while retrying headObject", e);
        }
    }
}