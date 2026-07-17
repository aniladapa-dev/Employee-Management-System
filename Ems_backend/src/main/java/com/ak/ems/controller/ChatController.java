package com.ak.ems.controller;

import com.ak.ems.entity.ChatMessage;
import com.ak.ems.entity.Employee;
import com.ak.ems.repository.ChatMessageRepository;
import com.ak.ems.repository.EmployeeRepository;
import com.ak.ems.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;
    private final EmployeeRepository employeeRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendPrivateMessage")
    public void sendPrivateMessage(ChatMessage message) {
        message.setTimestamp(LocalDateTime.now());
        message.setGroup(false);
        ChatMessage savedMessage = chatMessageRepository.save(message);

        // Route to /user/{recipient}/queue/messages
        messagingTemplate.convertAndSendToUser(
                savedMessage.getRecipientUsername(), "/queue/messages", savedMessage);
        
        // Echo back to sender's own queue
        if (!savedMessage.getSenderUsername().equalsIgnoreCase(savedMessage.getRecipientUsername())) {
            messagingTemplate.convertAndSendToUser(
                    savedMessage.getSenderUsername(), "/queue/messages", savedMessage);
        }
    }

    @MessageMapping("/chat.sendGroupMessage")
    public void sendGroupMessage(ChatMessage message) {
        message.setTimestamp(LocalDateTime.now());
        message.setGroup(true);
        ChatMessage savedMessage = chatMessageRepository.save(message);

        // Broadcast to /topic/group/{groupId}
        messagingTemplate.convertAndSend("/topic/group/" + savedMessage.getRecipientUsername(), savedMessage);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER', 'EMPLOYEE')")
    @GetMapping("/api/chat/private/{username}")
    public ResponseEntity<ApiResponse<List<ChatMessage>>> getPrivateChatHistory(@PathVariable String username) {
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        List<ChatMessage> history = chatMessageRepository.findPrivateChatHistory(currentUser, username);
        return ResponseEntity.ok(ApiResponse.success("Private chat history fetched", history));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER', 'EMPLOYEE')")
    @GetMapping("/api/chat/group/{groupId}")
    public ResponseEntity<ApiResponse<List<ChatMessage>>> getGroupChatHistory(@PathVariable String groupId) {
        List<ChatMessage> history = chatMessageRepository.findGroupChatHistory(groupId);
        return ResponseEntity.ok(ApiResponse.success("Group chat history fetched", history));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER', 'EMPLOYEE')")
    @GetMapping("/api/chat/recent-contacts")
    public ResponseEntity<ApiResponse<Map<String, LocalDateTime>>> getRecentContactTimestamps() {
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // 1. Get private message timestamps
        List<Object[]> results = chatMessageRepository.findLastMessageTimestamps(currentUser);
        Map<String, LocalDateTime> recentMap = new HashMap<>();
        for (Object[] row : results) {
            String sender = (String) row[0];
            String recipient = (String) row[1];
            LocalDateTime timestamp = (LocalDateTime) row[2];
            
            String partner = sender.equalsIgnoreCase(currentUser) ? recipient : sender;
            recentMap.merge(partner.toLowerCase(), timestamp, (existing, newTime) -> newTime.isAfter(existing) ? newTime : existing);
        }

        // 2. Find groups this user belongs to
        List<String> groupsList = new ArrayList<>();
        groupsList.add("GENERAL");
        
        Optional<Employee> empOpt = employeeRepository.findByUser_Username(currentUser);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            if (emp.getDepartment() != null) {
                groupsList.add("DEPT_" + emp.getDepartment().getId());
            }
            if (emp.getTeam() != null) {
                groupsList.add("TEAM_" + emp.getTeam().getId());
            }
        }
        
        // 3. Get group message timestamps
        List<Object[]> groupResults = chatMessageRepository.findLastGroupMessageTimestamps(groupsList);
        for (Object[] row : groupResults) {
            String groupId = (String) row[0];
            LocalDateTime timestamp = (LocalDateTime) row[1];
            recentMap.put(groupId.toLowerCase(), timestamp);
        }
        
        return ResponseEntity.ok(ApiResponse.success("Recent contact and group timestamps fetched", recentMap));
    }
}
