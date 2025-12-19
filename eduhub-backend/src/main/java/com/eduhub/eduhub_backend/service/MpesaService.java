package com.eduhub.eduhub_backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class MpesaService {

    @Value("${mpesa.consumer.key}")
    private String consumerKey;

    @Value("${mpesa.consumer.secret}")
    private String consumerSecret;

    @Value("${mpesa.stkpush.url}")
    private String stkPushUrl;

    @Value("${mpesa.auth.url}")
    private String authUrl;
    
    @Value("${mpesa.passkey}")
    private String passkey;

    // --- FIX: Use your active Ngrok URL ---
    private final String callbackUrl = "https://glandulous-depressively-tamia.ngrok-free.dev/api/payment/callback";

    private final OkHttpClient client = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 1. Get Access Token from Safaricom
    public String getAccessToken() throws IOException {
        String credentials = consumerKey + ":" + consumerSecret;
        String encodedCredentials = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));

        Request request = new Request.Builder()
                .url(authUrl)
                .get()
                .addHeader("Authorization", "Basic " + encodedCredentials)
                .addHeader("Cache-Control", "no-cache")
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Failed to get Access Token: " + response.body().string());
            }
            Map<String, String> map = objectMapper.readValue(response.body().string(), Map.class);
            return map.get("access_token");
        }
    }

    // 2. Send STK Push and return CheckoutRequestID
    public String sendStkPush(String phoneNumber, Double amount, String reference) throws IOException {
        String token = getAccessToken();
        String timestamp = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        // 174379 is the Standard Sandbox Business Shortcode
        String password = Base64.getEncoder().encodeToString(("174379" + passkey + timestamp).getBytes());

        Map<String, Object> jsonBody = new HashMap<>();
        jsonBody.put("BusinessShortCode", "174379");
        jsonBody.put("Password", password);
        jsonBody.put("Timestamp", timestamp);
        jsonBody.put("TransactionType", "CustomerPayBillOnline");
        jsonBody.put("Amount", amount.intValue()); // Amount must be an Integer
        jsonBody.put("PartyA", phoneNumber);
        jsonBody.put("PartyB", "174379");
        jsonBody.put("PhoneNumber", phoneNumber);
        jsonBody.put("CallBackURL", callbackUrl);
        jsonBody.put("AccountReference", reference);
        jsonBody.put("TransactionDesc", "Purchase Resource");

        RequestBody body = RequestBody.create(
                objectMapper.writeValueAsString(jsonBody),
                MediaType.get("application/json; charset=utf-8")
        );

        Request request = new Request.Builder()
                .url(stkPushUrl)
                .post(body)
                .addHeader("Authorization", "Bearer " + token)
                .build();

        try (Response response = client.newCall(request).execute()) {
            String responseString = response.body().string();
            System.out.println("M-Pesa Response: " + responseString);

            if (!response.isSuccessful()) {
                throw new IOException("M-Pesa STK Push Failed: " + responseString);
            }

            // Parse response to get the ID needed for the database
            Map<String, Object> map = objectMapper.readValue(responseString, Map.class);
            return (String) map.get("CheckoutRequestID");
        }
    }
}