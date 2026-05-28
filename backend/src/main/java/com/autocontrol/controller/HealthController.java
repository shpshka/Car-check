package com.autocontrol.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {
    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }

    @GetMapping("/db")
    public Map<String, Object> databaseHealth() {
        Map<String, Object> response = new HashMap<>();
        try {
            Integer check = jdbcTemplate.queryForObject("select 1", Integer.class);
            List<String> tables = jdbcTemplate.queryForList("""
                    select table_name
                    from information_schema.tables
                    where table_schema = 'public'
                    order by table_name
                    """, String.class);

            response.put("connected", check != null && check == 1);
            response.put("tables", tables);
        } catch (Exception exception) {
            response.put("connected", false);
            response.put("error", exception.getClass().getSimpleName());
            response.put("message", exception.getMessage());
        }
        return response;
    }
}
