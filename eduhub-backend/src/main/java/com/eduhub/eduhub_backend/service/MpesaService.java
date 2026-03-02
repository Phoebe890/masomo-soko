package com.eduhub.eduhub_backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
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

    // FIX: Read this from properties so it works in Prod & Dev (ngrok)
    @Value("${mpesa.callback.url}")
    private String callbackUrl;
@Value("${mpesa.shortcode}") // Add this property
private String businessShortCode;
@Value("${mpesa.transaction.type}") // Add this property (Paybill vs BuyGoods)
private String transactionType;
    private final OkHttpClient client = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 1. Get Access Token
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
            Map<String, Object> map = objectMapper.readValue(response.body().string(), Map.class);
            return (String) map.get("access_token");
        }
    }

    // 2. Initiate STK Push (Matches PaymentController call)
    public Map<String, String> initiateStkPush(String phoneNumber, BigDecimal amount) throws IOException {
        String token = getAccessToken();
        String timestamp = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        
         // Use the injected businessShortCode (Store Number)
    String password = Base64.getEncoder().encodeToString(
        (businessShortCode + passkey + timestamp).getBytes(StandardCharsets.UTF_8)
    );

        // Sanitize Phone Number (Must be 254...)
        if (phoneNumber.startsWith("0")) phoneNumber = "254" + phoneNumber.substring(1);
        else if (phoneNumber.startsWith("+")) phoneNumber = phoneNumber.substring(1);

        // M-Pesa expects integer amounts
        int amountInt = amount.intValue();

        Map<String, Object> jsonBody = new HashMap<>();
        jsonBody.put("BusinessShortCode", businessShortCode);
        jsonBody.put("Password", password);
        jsonBody.put("Timestamp", timestamp);
          jsonBody.put("TransactionType", transactionType); // CustomerBuyGoodsOnline for Till
        jsonBody.put("Amount", amountInt); // Use the actual amount passed
        jsonBody.put("PartyA", phoneNumber);
        jsonBody.put("PartyB", businessShortCode);
        jsonBody.put("PhoneNumber", phoneNumber);
        jsonBody.put("CallBackURL", callbackUrl);
        jsonBody.put("AccountReference", "Masomo Soko");
        jsonBody.put("TransactionDesc", "Course Purchase");

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
            if (!response.isSuccessful()) {
                throw new IOException("M-Pesa STK Push Failed: " + responseString);
            }
            
            // Return Map with Request IDs for the Controller
            Map<String, Object> map = objectMapper.readValue(responseString, Map.class);
            Map<String, String> result = new HashMap<>();
            result.put("MerchantRequestID", (String) map.get("MerchantRequestID"));
            result.put("CheckoutRequestID", (String) map.get("CheckoutRequestID"));
            
            return result;
        }
    }
}