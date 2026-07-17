package com.ak.ems.repository;

import com.ak.ems.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT m FROM ChatMessage m WHERE " +
           "m.isGroup = false AND (" +
           "(m.senderUsername = :user1 AND m.recipientUsername = :user2) OR " +
           "(m.senderUsername = :user2 AND m.recipientUsername = :user1)" +
           ") ORDER BY m.timestamp ASC")
    List<ChatMessage> findPrivateChatHistory(@Param("user1") String user1, @Param("user2") String user2);

    @Query("SELECT m.senderUsername, m.recipientUsername, MAX(m.timestamp) " +
           "FROM ChatMessage m " +
           "WHERE m.isGroup = false AND (m.senderUsername = :username OR m.recipientUsername = :username) " +
           "GROUP BY m.senderUsername, m.recipientUsername")
    List<Object[]> findLastMessageTimestamps(@Param("username") String username);

    @Query("SELECT m FROM ChatMessage m WHERE m.recipientUsername = :groupId AND m.isGroup = true ORDER BY m.timestamp ASC")
    List<ChatMessage> findGroupChatHistory(@Param("groupId") String groupId);

    @Query("SELECT m.recipientUsername, MAX(m.timestamp) " +
           "FROM ChatMessage m " +
           "WHERE m.isGroup = true AND m.recipientUsername IN :groupIds " +
           "GROUP BY m.recipientUsername")
    List<Object[]> findLastGroupMessageTimestamps(@Param("groupIds") List<String> groupIds);
}
