package com.leduc.spring.facedescriptor;

import com.leduc.spring.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FaceDescriptorRepository extends JpaRepository<FaceDescriptor, Long> {

    /**
     * Tìm face descriptor theo user
     */
    Optional<FaceDescriptor> findByUser(User user);

    /**
     * Tìm face descriptor theo user ID
     */
    @Query("SELECT fd FROM FaceDescriptor fd WHERE fd.user.id = :userId")
    Optional<FaceDescriptor> findByUserId(@Param("userId") Long userId);

    /**
     * Xóa face descriptor theo user
     */
    @Modifying
    @Query("DELETE FROM FaceDescriptor fd WHERE fd.user = :user")
    void deleteByUser(@Param("user") User user);

    /**
     * Kiểm tra user đã có face descriptor chưa
     */
    boolean existsByUser(User user);

    /**
     * Kiểm tra user đã có face descriptor chưa theo user ID
     */
    @Query("SELECT CASE WHEN COUNT(fd) > 0 THEN true ELSE false END FROM FaceDescriptor fd WHERE fd.user.id = :userId")
    boolean existsByUserId(@Param("userId") Long userId);
}
