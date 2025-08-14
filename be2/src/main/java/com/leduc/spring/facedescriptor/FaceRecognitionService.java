package com.leduc.spring.facedescriptor;

import com.leduc.spring.user.User;
import com.leduc.spring.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FaceRecognitionService {

    private final FaceDescriptorRepository faceDescriptorRepository;
    private final UserRepository userRepository;

    /**
     * Đăng ký descriptor cho user
     */
    @Transactional
    public FaceDescriptor registerFaceDescriptor(Long userId, String descriptor) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Kiểm tra xem user đã có descriptor chưa
        Optional<FaceDescriptor> existingDescriptor = faceDescriptorRepository.findByUser(user);

        if (existingDescriptor.isPresent()) {
            // Cập nhật descriptor cũ
            FaceDescriptor faceDescriptor = existingDescriptor.get();
            faceDescriptor.setDescriptor(descriptor);
            return faceDescriptorRepository.save(faceDescriptor);
        } else {
            // Tạo descriptor mới
            FaceDescriptor faceDescriptor = FaceDescriptor.builder()
                    .user(user)
                    .descriptor(descriptor)
                    .build();
            return faceDescriptorRepository.save(faceDescriptor);
        }
    }

    /**
     * Lấy descriptor của user
     */
    public Optional<FaceDescriptor> getFaceDescriptorByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return faceDescriptorRepository.findByUser(user);
    }

    /**
     * Xóa descriptor của user
     */
    @Transactional
    public void deleteFaceDescriptor(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        faceDescriptorRepository.deleteByUser(user);
    }

    /**
     * Lấy tất cả descriptor để so sánh khi điểm danh
     */
    public List<FaceDescriptor> getAllFaceDescriptors() {
        return faceDescriptorRepository.findAll();
    }

    /**
     * Tìm user dựa trên descriptor giống nhất
     * (Logic so sánh sẽ được thực hiện ở FE với face-api.js)
     */
    public List<FaceDescriptor> getAllDescriptorsForComparison() {
        // Trả về tất cả descriptor để FE so sánh
        return getAllFaceDescriptors();
    }

    /**
     * Kiểm tra user đã đăng ký khuôn mặt chưa
     */
    public boolean hasRegisteredFace(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return faceDescriptorRepository.findByUser(user).isPresent();
    }
}
