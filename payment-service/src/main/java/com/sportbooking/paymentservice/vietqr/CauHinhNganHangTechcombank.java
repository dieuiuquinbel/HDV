/**
 * File: CauHinhNganHangTechcombank.java
 * Muc dich: Dinh nghia thong tin tai khoan thu huong mac dinh cua he thong qua Techcombank.
 */
package com.sportbooking.paymentservice.vietqr;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Getter
public class CauHinhNganHangTechcombank {

    @Value("${payment.vietqr.bank-bin:970407}")
    private String bankBin; // 970407 la Ma BIN Napas cua Techcombank

    @Value("${payment.vietqr.bank-code:TCB}")
    private String bankCode;

    @Value("${payment.vietqr.bank-name:Techcombank}")
    private String bankName;

    @Value("${payment.vietqr.account-number:72271020058888}")
    private String accountNumber; // So tai khoan: 72271020058888

    @Value("${payment.vietqr.account-name:Nguyen Xuan Dieu}")
    private String accountName; // Chu tai khoan: Nguyen Xuan Dieu
}
