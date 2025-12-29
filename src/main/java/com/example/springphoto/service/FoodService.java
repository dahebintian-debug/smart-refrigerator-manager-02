package com.example.springphoto.service;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.springphoto.model.Food;
import com.example.springphoto.model.User;
import com.example.springphoto.repository.FoodRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FoodService {
    private final FoodRepository foodRepository;

    public List<Food> getAllFoods(User user) {
        return foodRepository.findByUser(user);
    }

    public void saveFood(Food food, User user) {
        food.setUser(user);
        foodRepository.save(food);
    }

    public void deleteFood(Long id, User user) {
        Food food = foodRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Food not found"));       
        // 食材の持ち主と、今ログインしている人が一致するかチェック処理
        if (!food.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("他人の食材は削除できません");
        }
        foodRepository.deleteById(id);
    }
}