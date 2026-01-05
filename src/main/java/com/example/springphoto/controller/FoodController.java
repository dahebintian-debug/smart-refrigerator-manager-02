package com.example.springphoto.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.springphoto.model.Food;
import com.example.springphoto.security.CustomUserDetails;
import com.example.springphoto.service.FoodService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FoodController {
	@Autowired
	private final FoodService foodService;
	
	@GetMapping("/foods")
	@ResponseBody
	public List<Food> getFoods(@AuthenticationPrincipal CustomUserDetails userDetails) {
	    // ログイン中のユーザー情報を取得
	    return foodService.getAllFoods(userDetails.getUser());
	}

	@PostMapping("/foods")
	@ResponseBody
	public void addFood(@RequestBody Food food, @AuthenticationPrincipal CustomUserDetails userDetails) {
	    foodService.saveFood(food, userDetails.getUser());
	}

	@DeleteMapping("/foods/{id}")
	public void removeFood(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
		foodService.deleteFood(id, userDetails.getUser());
	}
}