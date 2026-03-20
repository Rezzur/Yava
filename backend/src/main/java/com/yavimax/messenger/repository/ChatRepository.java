package com.yavimax.messenger.repository;

import com.yavimax.messenger.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {

    @Query("SELECT c FROM Chat c JOIN ChatMember cm ON c.id = cm.id.chatId WHERE cm.id.userId = :userId")
    List<Chat> findByUserId(@Param("userId") Long userId);

    @Query("SELECT cm.chat FROM ChatMember cm " +
           "WHERE cm.id.userId = :userId1 " +
           "AND EXISTS (SELECT 1 FROM ChatMember cm2 WHERE cm2.chat = cm.chat AND cm2.id.userId = :userId2) " +
           "AND cm.chat.type = 'PRIVATE'")
    Optional<Chat> findPrivateChatBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}
