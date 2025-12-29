package com.example.springphoto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.springphoto.model.Food;
import com.example.springphoto.model.User;

@Repository
public interface FoodRepository extends JpaRepository<Food, Long> {
	List<Food> findByUser(User user);
}