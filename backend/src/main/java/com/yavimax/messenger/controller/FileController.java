package com.yavimax.messenger.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

/**
 * Контроллер для работы с файлами.
 * Обеспечивает загрузку медиафайлов (фото, документы, голосовые сообщения) на сервер.
 */
@RestController
@RequestMapping("/api/v1/files")
@Tag(name = "Files", description = "Загрузка и хранение файлов")
@Slf4j
public class FileController {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    /**
     * Загружает файл на сервер и возвращает его публичный URL.
     *
     * @param file объект файла (multipart request)
     * @return JSON с URL-адресом файла или ошибку
     */
    @PostMapping("/upload")
    @Operation(summary = "Загрузить файл", description = "Загружает фото, документ или голосовое сообщение и возвращает URL")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty or null"));
        }

        log.info("Received upload request: {}, size: {}", file.getOriginalFilename(), file.getSize());

        try {
            Path root = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(root)) {
                Files.createDirectories(root);
                log.info("Created upload directory: {}", root);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;
            Path targetPath = root.resolve(filename);

            // Сохранение файла с перезаписью (REPLACE_EXISTING) для безопасности
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            
            log.info("File saved to: {}", targetPath);

            String fileUrl = "/uploads/" + filename;
            return ResponseEntity.ok(Map.of(
                "url", fileUrl, 
                "filename", originalFilename,
                "status", "success"
            ));

        } catch (Exception e) {
            log.error("Upload failed: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Server failed to save file",
                "message", e.getMessage(),
                "path", uploadDir
            ));
        }
    }
}
