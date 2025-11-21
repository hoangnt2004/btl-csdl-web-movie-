import {checkToken} from "./checkToken.js"

$(document).ready(function () {
    const token = localStorage.getItem("access_token");
    const authMenu = $("#auth_menu");
    if (token){
        checkToken(token)
            .then(data=>{
                var l1=$("<li></li>")
                var a1= $("<a></a>").text("Hồ Sơ").attr("id","profile-btn");
                l1.append(a1);
                var l2=$("<li></li>")
                var a2= $("<a></a>").text("Đăng Xuất").attr("href","#").attr("id","logout-btn");
               l2.append(a2);
                authMenu.append(l1,l2);
                $("#logout-btn").on("click",function () {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("id_user")
                    window.location.href="../template/home.html"
                });
                $("#profile-btn").on("click",function (){
                    if (data.id_role==1) {
                        window.location.href="../template/profile.html";
                    }
                    else{
                        window.location.href="../template/admin.html";
                    }
                })
                localStorage.setItem("id_user",data.id)

            })
            .catch(()=>{
                var l1=$("<li></li>")
                var a1= $("<a></a>").text("Đăng Nhập / Đăng Ký").attr("id","login-btn");
                l1.append(a1);
                authMenu.append(l1);
                $("#login-btn").on("click",function () {
                    window.location.href="../template/login.html";

                })
            })
    }
    else{
        var l1=$("<li></li>")
                var a1= $("<a></a>").text("Đăng Nhập / Đăng Ký").attr("id","login-btn");
                l1.append(a1);
                authMenu.append(l1);
                $("#login-btn").on("click",function () {
                    window.location.href="../template/login.html";

                })
    }
})