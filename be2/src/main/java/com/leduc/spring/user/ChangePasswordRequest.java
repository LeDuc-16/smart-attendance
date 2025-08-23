package com.leduc.spring.user;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordRequest {

    private String currentPassword;
    private String newPassword;
    private String confirmationPassword;

    @Override
    public String toString() {
        return "ChangePasswordRequest{" +
                "currentPassword=" + (currentPassword != null ? "***(" + currentPassword.length() + " chars)" : "null") +
                ", newPassword=" + (newPassword != null ? "***(" + newPassword.length() + " chars)" : "null") +
                ", confirmationPassword=" + (confirmationPassword != null ? "***(" + confirmationPassword.length() + " chars)" : "null") +
                '}';
    }

    public boolean isCurrentPasswordEmpty() {
        return currentPassword == null || currentPassword.trim().isEmpty();
    }

    public boolean isNewPasswordEmpty() {
        return newPassword == null || newPassword.trim().isEmpty();
    }

    public boolean isConfirmationPasswordEmpty() {
        return confirmationPassword == null || confirmationPassword.trim().isEmpty();
    }

    public boolean isPasswordsMatch() {
        return newPassword != null && newPassword.equals(confirmationPassword);
    }

    public boolean isNewPasswordValid() {
        return newPassword != null && newPassword.length() >= 6;
    }

    public boolean isValid() {
        return !isCurrentPasswordEmpty()
                && !isNewPasswordEmpty()
                && !isConfirmationPasswordEmpty()
                && isPasswordsMatch()
                && isNewPasswordValid();
    }
}
