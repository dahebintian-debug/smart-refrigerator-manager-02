package com.example.springphoto.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.example.springphoto.service.UserService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;

	@GetMapping("/")
	public String index() {
		return "index";
	}

	@GetMapping("/login")
	public String loginForm() {
		if (isAuthenticated()) {
			return "redirect:/";
		}
		return "login";
	}

	@GetMapping("/signup")
	public String signupForm() {
		if (isAuthenticated()) {
			return "redirect:/";
		}
		return "signup";
	}

	@PostMapping("/signup")
	public String register(@RequestParam String username, @RequestParam String password,
			org.springframework.ui.Model model) {
		try {
	        userService.registerUser(username, password);
	        // 成功時はログイン画面へ（メッセージ付き）
	        return "redirect:/login?signup_success";
	    } catch (RuntimeException e) {
	        // 【重要】重複エラーメッセージなどをModelに詰めて画面に戻す
	        model.addAttribute("errorMessage", e.getMessage());
	        // 入力したユーザー名を残しておきたい場合は、以下も追加
	        model.addAttribute("typedUsername", username);
	        return "signup"; 
	    }
	}

	@GetMapping("/api/auth/status")
	@ResponseBody
	public Map<String, Object> getAuthStatus() {
		Map<String, Object> status = new HashMap<>();
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();

		if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
			status.put("isLoggedIn", true);
			status.put("username", auth.getName());
		} else {
			status.put("isLoggedIn", false);
		}
		return status;
	}

	private boolean isAuthenticated() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		return auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken);
	}
}