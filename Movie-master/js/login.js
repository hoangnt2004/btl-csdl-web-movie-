function signup()
{
    document.querySelector(".login-form-container").style.cssText = "display: none;";
    document.querySelector(".signup-form-container").style.cssText = "display: block;";
    document.querySelector(".container").style.cssText = "background: linear-gradient(to bottom, rgb(56, 189, 149),  rgb(28, 139, 106));";
    document.querySelector(".button-1").style.cssText = "display: none";
    document.querySelector(".button-2").style.cssText = "display: block";

};

function login()
{
    document.querySelector(".signup-form-container").style.cssText = "display: none;";
    document.querySelector(".login-form-container").style.cssText = "display: block;";
    document.querySelector(".container").style.cssText = "background: linear-gradient(to bottom, rgb(6, 108, 224),  rgb(14, 48, 122));";
    document.querySelector(".button-2").style.cssText = "display: none";
    document.querySelector(".button-1").style.cssText = "display: block";

}

$(document).ready(function () {
    $(".signup-button").click(function () {
        var name =$("#signupName").val()
        var phone= $("#signupPhone").val()
        var email= $("#signupEmail").val()
        var pass = $("#signupPassword").val()
        var repass =$("#resignupPassword").val()
        if (!name || !phone || !email || !pass) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }
        if( pass != repass){
            alert("Mật khẩu không trùng nhau");
            return;
        }
        var phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(phone)) {
            alert("Số điện thoại không hợp lệ!");
            return;
}
        $.ajax({
            url: "http://localhost:8000/register",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                name: name,
                phone_number: phone,
                email: email,
                password: pass
            }),
            success: function (response) {
                 $("#signupMessage").text("Đăng ký thành công! Hãy đăng nhập.").css("color", "green");
                login()

            },
            error: function (xhr) {
                if(xhr.status==400){
                    $("#signupMessage").text("Email đã tồn tại!").css("color", "red");

                }
                else{
                     $("#signupMessage").text("Lỗi hệ thống, vui lòng thử lại sau.").css("color", "red");
                }
            }

        })

    })
    $(".login-button").click(function() {
        var email = $("#loginForm input[type='email']").val();
        var password = $("#loginForm input[type='password']").val();

        if (!email || !password) {
            alert("Vui lòng nhập đầy đủ email và mật khẩu!");
            return;
        }

        $.ajax({
            url: "http://localhost:8000/login",
            type: "POST",
            contentType: "application/x-www-form-urlencoded",
            data: {
                username: email,
                password: password
            },
            success: function(response) {
                localStorage.setItem("access_token", response.access_token); // Lưu token
                localStorage.setItem("id_user", response.id_user);
                window.location.href = "home.html"; // Chuyển hướng sau khi đăng nhập thành công
            },
            error: function(xhr) {
                if (xhr.status === 403) {
                    $("#loginMessage").text("Email hoặc mật khẩu không đúng!").css("color", "red");

                } else {
                     $("#loginMessage").text("Lỗi hệ thống, vui lòng thử lại sau.").css("color", "red");

                }
            }
        });
    });


})