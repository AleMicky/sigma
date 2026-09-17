package com.endecorani.sigma_api.shared.infrastructure.report;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import lombok.extern.slf4j.Slf4j;

import java.awt.image.BufferedImage;

@Slf4j
public final class BarcodeUtil {

    private BarcodeUtil() {
    }

    /**
     * Genera un código de barras en formato CODE_128 como imagen BufferedImage.
     *
     * @param text   Texto o código a codificar (ej. "SM-2026-0001")
     * @param width  Ancho en píxeles
     * @param height Alto en píxeles
     * @return BufferedImage con el código de barras o null si ocurre un error
     */
    public static BufferedImage generateBarcode128(String text, int width, int height) {
        if (text == null || text.isBlank()) {
            return null;
        }
        try {
            MultiFormatWriter writer = new MultiFormatWriter();
            BitMatrix matrix = writer.encode(text.trim(), BarcodeFormat.CODE_128, width, height);
            return MatrixToImageWriter.toBufferedImage(matrix);
        } catch (Exception e) {
            log.warn("No se pudo generar código de barras para '{}': {}", text, e.getMessage());
            return null;
        }
    }
}
