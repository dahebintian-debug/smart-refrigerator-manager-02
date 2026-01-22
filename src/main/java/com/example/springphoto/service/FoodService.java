package com.example.springphoto.service;

import java.time.LocalDate;
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
		return foodRepository.findByUserOrderByIdAsc(user);
	}

	public void saveFood(Food food, User user) {
		food.setUser(user);
		if (food.getQuantity() == null || food.getQuantity() < 1) {
			throw new IllegalArgumentException("数量は1以上で入力してください");
		}

		if (food.getNeedsRestock() == null)
			food.setNeedsRestock(false);
		foodRepository.save(food);
	}

	public Food updateFoodStatus(Long id, Integer quantity, Boolean needsRestock, LocalDate expiryDate, User user) {
		Food food = foodRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Food not found"));

		if (food.getUser() == null || user == null ||
				food.getUser().getId().longValue() != user.getId().longValue()) {
			throw new RuntimeException("権限がありません");
		}

		if (quantity != null) {
			if (quantity < 0) {
				throw new IllegalArgumentException("0より小さい値は入力できません");
			}
			food.setQuantity(quantity);
		}

		if (needsRestock != null) {
			food.setNeedsRestock(needsRestock);
		}

		if (expiryDate != null) {
			food.setExpiryDate(expiryDate);
		}

		return foodRepository.save(food);
	}

	public void deleteFood(Long id, User user) {
		Food food = foodRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Food not found"));
		if (food.getUser() == null || user == null ||
				food.getUser().getId().longValue() != user.getId().longValue()) {
			throw new RuntimeException("他人の食材は削除できません");
		}
		foodRepository.deleteById(id);
	}
}