package com.example.springphoto.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping; // インポートを整理
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException; // 追加

import com.example.springphoto.model.Food;
import com.example.springphoto.security.CustomUserDetails;
import com.example.springphoto.service.FoodService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FoodController {
	private final FoodService foodService;

	private void checkUser(CustomUserDetails userDetails) {
		if (userDetails == null || userDetails.getUser() == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "ログインが必要です");
		}
	}

	@GetMapping("/foods")
	public List<Food> getFoods(@AuthenticationPrincipal CustomUserDetails userDetails) {
		checkUser(userDetails);
		return foodService.getAllFoods(userDetails.getUser());
	}

	@PostMapping("/foods")
	public void addFood(@RequestBody Food food, @AuthenticationPrincipal CustomUserDetails userDetails) {
		checkUser(userDetails);
		foodService.saveFood(food, userDetails.getUser());
	}

	@DeleteMapping("/foods/{id}")
	public void removeFood(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
		checkUser(userDetails);
		foodService.deleteFood(id, userDetails.getUser());
	}

	@PatchMapping("/foods/{id}")
	public Food updateFood(@PathVariable Long id, @RequestBody Food foodUpdate,
			@AuthenticationPrincipal CustomUserDetails userDetails) {
		checkUser(userDetails);
		return foodService.updateFoodStatus(
				id,
				foodUpdate.getQuantity(),
				foodUpdate.getNeedsRestock(),
				foodUpdate.getExpiryDate(),
				userDetails.getUser());
	}
}