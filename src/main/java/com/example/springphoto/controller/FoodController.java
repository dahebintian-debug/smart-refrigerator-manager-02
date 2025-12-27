package com.example.springphoto.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.springphoto.model.Food;
import com.example.springphoto.service.FoodService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/foods")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") 
public class FoodController {
	@Autowired
    private final FoodService foodService;
    

    @GetMapping
    public List<Food> getFoods() {
        return foodService.getAllFoods();
    }

    @PostMapping
    public Food addFood(@Valid @RequestBody Food food) {
        return foodService.saveFood(food);
    }

    @DeleteMapping("/{id}")
    public void removeFood(@PathVariable Long id) {
        foodService.deleteFood(id);
    }
}