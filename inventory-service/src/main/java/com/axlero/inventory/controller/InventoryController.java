
package com.axlero.inventory.controller;

import com.axlero.inventory.entity.Inventory;
import com.axlero.inventory.service.InventoryService;

import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.web.bind.annotation.*;

import java.util.Enumeration;
import java.util.List;

@RestController
public class InventoryController {

    private static final Logger log =
            LoggerFactory.getLogger(InventoryController.class);

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/inventory")
    public List<Inventory> getInventory(HttpServletRequest request) {

        log.info("========== Inventory Service Called ==========");
        log.info("===== Incoming Headers =====");

        Enumeration<String> headerNames = request.getHeaderNames();

        while (headerNames.hasMoreElements()) {
            String name = headerNames.nextElement();
            log.info("{} : {}", name, request.getHeader(name));
        }

        return inventoryService.getAllInventory();
    }

    @GetMapping("/inventory/{productId}")
    public Inventory getInventoryByProductId(
            @PathVariable Integer productId) {

        return inventoryService.getInventoryByProductId(productId);
    }
}
