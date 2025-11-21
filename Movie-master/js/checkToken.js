export function checkToken(token)  {
    return new Promise((resolve, reject)=> {
        $.ajax({
            url: "http://localhost:8000/token",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({access_token:token}),
            success: function (response) {
                resolve(response);
            },
            error: function (xhr,status,error) {
                if(xhr.status===401){
                    // window.location.href='/login.html';
                }
                else{
                    console.error("lỗi xác thực token:",xhr.responseText);

                }
                reject(error)
            }
        })
    })
}
