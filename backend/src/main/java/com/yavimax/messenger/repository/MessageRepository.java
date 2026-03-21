package com.yavimax.messenger.repository;

import com.yavimax.messenger.entity.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByChatIdOrderByCreatedAtDesc(Long chatId, Pageable pageable);

    Optional<Message> findFirstByChatIdOrderByCreatedAtDesc(Long chatId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.chat.id = :chatId AND m.sender.id != :userId AND m.isRead = false")
    Long countUnreadMessages(@Param("chatId") Long chatId, @Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.chat.id = :chatId AND m.sender.id != :userId AND m.isRead = false")
    void markMessagesAsRead(@Param("chatId") Long chatId, @Param("userId") Long userId);
}
