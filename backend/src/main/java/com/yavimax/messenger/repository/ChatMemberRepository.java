package com.yavimax.messenger.repository;

import com.yavimax.messenger.entity.ChatMember;
import com.yavimax.messenger.entity.ChatMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMemberRepository extends JpaRepository<ChatMember, ChatMemberId> {

    @Query("SELECT cm FROM ChatMember cm JOIN FETCH cm.chat WHERE cm.id.userId = :userId ORDER BY cm.chat.createdAt DESC")
    List<ChatMember> findByUserIdWithDetails(@Param("userId") Long userId);

    @Query("SELECT cm FROM ChatMember cm JOIN FETCH cm.user WHERE cm.chat.id = :chatId")
    List<ChatMember> findByChatId(@Param("chatId") Long chatId);

    boolean existsByChatIdAndUserId(Long chatId, Long userId);
}
