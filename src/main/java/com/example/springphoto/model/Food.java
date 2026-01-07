package com.example.springphoto.model;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Data;

@Entity
@Table(name = "foods")
@Data
public class Food {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY) 
	private Long id;

	@NotBlank(message = "食材名は必須です") 
	@Size(max = 50, message = "食材名は50文字以内で入力してください")
	private String name;
    
	@NotNull(message = "期限は必須です")
	@FutureOrPresent(message = "期限に過去の日付は設定できません") 
	private LocalDate expiryDate;

	private String category;
	
	@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
	@JsonIgnore
    private User user;
	
    public String getStatus() {
        if (this.expiryDate == null) return "safe";

        long diffDays = java.time.temporal.ChronoUnit.DAYS.between(
            java.time.LocalDate.now(),
            this.expiryDate
        );

        if (diffDays <= 0) return "danger";
        if (diffDays <= 3) return "warning";
        return "safe";
    }

    public String getStatusMessage() {
        if (this.expiryDate == null) return "";

        long diffDays = java.time.temporal.ChronoUnit.DAYS.between(
            java.time.LocalDate.now(),
            this.expiryDate
        );

        if (diffDays <= 0) return "期限切れ！急いで！";
        if (diffDays <= 3) return "そろそろ危ない（あと" + diffDays + "日以内）";
        return "あと " + diffDays + " 日";
    }
	
}
