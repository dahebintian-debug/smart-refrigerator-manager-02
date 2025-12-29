package com.example.springphoto.controller;

import java.util.HashMap;
import java.util.Map;

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
		return "login";
	}

	// 登録画面を表示
	@GetMapping("/signup")
	public String signupForm() {
		return "signup";
	}

	// 登録処理を実行
	@PostMapping("/signup")
	public String register(@RequestParam String username, @RequestParam String password) {
		userService.registerUser(username, password);
		return "redirect:/login?signup_success";
	}


	@GetMapping("/api/auth/status")
	@ResponseBody
	public Map<String, Object> getAuthStatus() {
		Map<String, Object> status = new HashMap<>();
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();

		// ログイン済み かつ 匿名ユーザー（anonymousUser）でないかチェック処理
		if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
			status.put("isLoggedIn", true);
			status.put("username", auth.getName());
		} else {
			status.put("isLoggedIn", false);
		}
		return status;
	}
}