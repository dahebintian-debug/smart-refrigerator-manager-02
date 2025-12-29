package com.example.springphoto.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.springphoto.model.User;
import com.example.springphoto.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 新規ユーザーを登録処理
    public void registerUser(String username, String password) {
        User user = new User();
        user.setUsername(username);
        // パスワードを暗号化（ハッシュ化）して保存処理
        user.setPassword(passwordEncoder.encode(password));
        user.setEnabled(true);
        // 権限設定が必要な場合はここで設定（例: "ROLE_USER"）
        userRepository.save(user);
    }
}