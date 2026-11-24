package com.sportbooking.userservice.dulieu;

import com.sportbooking.userservice.thucthe.VaiTro;
import lombok.Data;

@Data
public class YeuCauCapNhatNguoiDungAdmin {
    private String fullName;
    private String phone;
    private VaiTro role;
}
