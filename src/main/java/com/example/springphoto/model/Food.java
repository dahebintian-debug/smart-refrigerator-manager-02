package com.example.springphoto.model;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.Data;

@Entity
@Data
public class Food {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY) 
	private Long id;

	@NotBlank(message = "食材名は必須です") 
	@Size(max = 50, message = "食材名は50文字以内で入力してください")
	private String name;
    
	@NotNull(message = "期限は必須です")
	@FutureOrPresent(message = "期限に過去の日付は設定できません") // 過去の日付を禁止
	private LocalDate expiryDate;

	private String category; // 肉、野菜、飲み物など
}
