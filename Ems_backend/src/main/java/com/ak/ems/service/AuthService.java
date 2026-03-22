package com.ak.ems.service;

import com.ak.ems.dto.auth.JwtAuthResponse;
import com.ak.ems.dto.auth.LoginDto;
import com.ak.ems.dto.auth.RegisterDto;

public interface AuthService {
    String register(RegisterDto registerDto);
    JwtAuthResponse login(LoginDto loginDto);
    String changePassword(String oldPassword, String newPassword);
}
