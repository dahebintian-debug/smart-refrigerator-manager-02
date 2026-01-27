package com.example.springphoto.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
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
	public String register(@RequestParam String username, @RequestParam String password, Model model) {
		try {
	        userService.registerUser(username, password);
	        return "redirect:/login?signup_success";
	    } catch (RuntimeException e) {
	        model.addAttribute("errorMessage", e.getMessage());
	        model.addAttribute("typedUsername", username);
	        return "signup"; 
	    }
	}

	@GetMapping("/api/auth/status")
	@ResponseBody
	public Map<String, Object> getAuthStatus() {
		Map<String, Object> status = new HashMap<>();
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();

		if (isAuthenticated()) {
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