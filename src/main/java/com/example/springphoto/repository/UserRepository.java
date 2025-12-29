package com.example.springphoto.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.springphoto.model.User;

public interface UserRepository extends JpaRepository<User, Integer> {
    // ユーザー名で検索するためのメソッド
    Optional<User> findByUsername(String username);
}