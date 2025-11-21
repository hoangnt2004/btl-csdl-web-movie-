// ================== BIẾN TOÀN CỤC ==================
let type_room;
let basePrice = 0;
let cinemaId, date, time, showtimeId, roomId;
let totalbill = 0;
let checkInterval = null; // để clearInterval khi cần

// ================== HÀM LOAD GHẾ ==================
function loadSeats(id_showtime) {
  $.ajax({
    url: "http://localhost:8000/seat/" + id_showtime,
    method: "GET",
    success: function (data) {
      const seats = data.seats || [];
      const seatMap = $("#seatMap");
      roomId = data.id_room;

      seatMap.empty();

      // Sort theo tên ghế: A1, A2, B1...
      seats.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true })
      );

      // Gom theo hàng (chữ cái đầu)
      const rows = {};
      seats.forEach((seat) => {
        const rowName = seat.name.charAt(0);
        if (!rows[rowName]) {
          rows[rowName] = [];
        }
        rows[rowName].push(seat);
      });

      // Tạo DOM từng hàng ghế
      Object.keys(rows)
        .sort()
        .forEach((rowName) => {
          const rowSeats = rows[rowName];

          const rowDiv = $('<div class="seat-row"></div>');
          rowDiv.append(`<div class="row-label">${rowName}</div>`);

          rowSeats.forEach((seat) => {
            const seatDiv = $("<div></div>");
            seatDiv.addClass("seat");
            seatDiv.attr("data-seat", seat.name);
            seatDiv.attr("id", seat.id_seat); // id ghế
            seatDiv.text(seat.name);

            // Loại ghế
            if (seat.type === "VIP") {
              seatDiv.addClass("vip");
            } else {
              seatDiv.addClass("regular");
            }

            // Trạng thái
            if (seat.state === "BOOKED") {
              seatDiv.addClass("booked");
            } else {
              seatDiv.addClass("available");
            }

            rowDiv.append(seatDiv);
          });

          seatMap.append(rowDiv);
        });
    },
    error: function (xhr) {
      console.error("Lỗi khi tải ghế:", xhr.responseText);
      alert("Không thể tải danh sách ghế. Vui lòng thử lại sau.");
    },
  });
}

// ================== HÀM TÍNH TỔNG TIỀN ==================
function calculateTotal() {
  let total = 0;

  // Giá cơ bản theo loại phòng
  if (type_room === "2D") {
    basePrice = 50000;
  } else {
    basePrice = 80000; // ví dụ 3D / IMAX...
  }

  // Ghế
  $(".seat.selected").each(function () {
    const isVip = $(this).hasClass("vip");
    if (isVip) {
      total += basePrice + 70000;
    } else {
      total += basePrice + 50000;
    }
  });

  // Đồ ăn
  $(".food-item").each(function () {
    const quantity = parseInt($(this).find(".quantity").text()) || 0;
    const price = parseInt($(this).attr("data-price")) || 0;
    total += quantity * price;
  });

  totalbill = total;

  $(".total-price").text(
    `THANH TOÁN: ${total.toLocaleString("vi-VN")} VND`
  );
}

// ================== XỬ LÝ THANH TOÁN ==================
function startCheckTransaction() {
  // Clear interval cũ nếu có
  if (checkInterval) {
    clearInterval(checkInterval);
  }

  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];

  checkInterval = setInterval(function () {
    $.ajax({
      url: "http://localhost:8000/receipt/check-transaction/",
      method: "GET",
      data: {
        transaction_date_min: formattedDate,
        amount_in: totalbill,
      },
      success: function (response) {
        const hasSuccess = response.messages?.success;
        const hasTransactions = Array.isArray(response.transactions) && response.transactions.length > 0;

        if (hasSuccess && hasTransactions) {
          let $toast = $("#paymentToastCenter");
          $toast.addClass("show");
          $("#confirmBox").fadeOut();

          // Tạo dữ liệu hóa đơn
          const receiptData = {
            id_user: parseInt(localStorage.getItem("id_user")) || null,
            method_pay: "VNPAY",
            tickets: [],
            foods: [],
          };

          // Ghế
          $(".seat.selected").each(function () {
            const idSeat = parseInt($(this).attr("id"));
            if (!idSeat || !showtimeId || !roomId) return;

            const isVip = $(this).hasClass("vip");
            const price = isVip ? basePrice + 70000 : basePrice + 50000;

            receiptData.tickets.push({
              id_seat: idSeat,
              id_room: parseInt(roomId),
              id_showtime: parseInt(showtimeId),
              price: price,
            });
          });

          // Đồ ăn
          $(".food-item").each(function () {
            const quantity = parseInt($(this).find(".quantity").text()) || 0;
            if (quantity > 0) {
              const idFood = parseInt($(this).data("id"));
              if (!idFood) return;
              receiptData.foods.push({
                id_food: idFood,
                quantity: quantity,
              });
            }
          });

          // Gửi hóa đơn lên backend
          $.ajax({
            url: "http://localhost:8000/receipt/",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(receiptData),
            success: function (response) {
              console.log("Tạo hóa đơn thành công:", response);
            },
            error: function (xhr) {
              console.error("Lỗi khi tạo hóa đơn:", xhr.responseText);
              alert("Đã xảy ra lỗi khi tạo hóa đơn!");
            },
          });

          // Ẩn toast và chuyển trang
          setTimeout(function () {
            $toast.removeClass("show");
          }, 2000);

          setTimeout(function () {
            window.location.href = "home.html";
          }, 1000);

          clearInterval(checkInterval);
          checkInterval = null;
        } else {
          console.log("⏳ Chưa thấy giao dịch hợp lệ, tiếp tục kiểm tra...");
        }
      },
      error: function (xhr) {
        console.error("Lỗi khi gọi API check transaction:", xhr.responseText);
      },
    });
  }, 5000);
}

// ================== READY ==================
$(document).ready(function () {
  // ================== LOAD FOOD ==================
  $.ajax({
    url: "http://localhost:8000/food/",
    type: "GET",
    success: function (data) {
      $(".food-items").empty();
      (data.foods || []).forEach(function (food) {
        const foodHtml = `
          <div class="food-item" data-price="${food.price}" data-id="${food.id_food}">
            <div class="food-name">${food.name}</div>
            <div class="quantity-selector">
              <button class="minus">-</button>
              <span class="quantity">0</span>
              <button class="plus">+</button>
            </div>
          </div>
        `;
        $(".food-items").append(foodHtml);
      });
    },
    error: function (xhr) {
      console.error("Lỗi khi load food:", xhr.responseText);
    },
  });

  // Sự kiện +/-
  $(".food-order").on("click", ".plus", function () {
    const quantitySpan = $(this).siblings(".quantity");
    let quantity = parseInt(quantitySpan.text()) || 0;
    quantitySpan.text(quantity + 1);
    calculateTotal();
  });

  $(".food-order").on("click", ".minus", function () {
    const quantitySpan = $(this).siblings(".quantity");
    let quantity = parseInt(quantitySpan.text()) || 0;
    if (quantity > 0) quantitySpan.text(quantity - 1);
    calculateTotal();
  });

  // ================== LẤY MOVIE ID TỪ URL ==================
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const movieId = urlParams.get("id");

  // ================== LẤY DANH SÁCH RẠP ==================
  $.ajax({
    url: "http://localhost:8000/cinema/get_cinema/" + movieId,
    type: "GET",
    success: function (response) {
      const cinemaList = $(".cinema-buttons");
      (response.cinemas || []).forEach(function (cinema) {
        const button = $("<button></button>");
        button.text(cinema.name);
        button.attr("data-cinema-id", cinema.id_cinema);
        cinemaList.append(button);
      });
    },
    error: function (xhr) {
      console.error("Lỗi load cinema:", xhr.responseText);
    },
  });

  // ================== CHỌN RẠP ==================
  $(document).on("click", ".cinema-buttons button", function () {
    $(".cinema-buttons button").removeClass("active");
    $(this).addClass("active");

    cinemaId = $(this).attr("data-cinema-id");

    $("#dateButtons").empty();
    $("#timeButtons").empty();
    $("#seatMap").empty();

    $.ajax({
      url: "http://localhost:8000/cinema/get_date/" + movieId + "/" + cinemaId,
      type: "GET",
      success: function (response) {
        const dateList = $("#dateButtons");
        (response.dates || []).forEach(function (d) {
          const button = $("<button></button>");
          button.text(d);
          button.attr("data-date", d);
          dateList.append(button);
        });
      },
      error: function (xhr) {
        console.error("Lỗi load dates:", xhr.responseText);
      },
    });
  });

  // ================== CHỌN NGÀY ==================
  $(document).on("click", "#dateButtons button", function () {
    $("#dateButtons button").removeClass("active");
    $(this).addClass("active");

    date = $(this).attr("data-date");

    $("#timeButtons").empty();
    $("#seatMap").empty();

    $.ajax({
      url:
        "http://localhost:8000/cinema/get_time/" +
        movieId +
        "/" +
        cinemaId +
        "/" +
        date,
      type: "GET",
      success: function (response) {
        const timeList = $("#timeButtons");

        // GIẢ ĐỊNH BACKEND TRẢ VỀ:
        // { "showtimes": [ { "time": "09:00", "id_showtime": 1 }, ... ] }
        const showtimes = response.showtimes || response.times || [];

        showtimes.forEach(function (st) {
          let timeText;
          let sid;

          if (typeof st === "string") {
            // Nếu backend vẫn trả times = ["09:00", ...] + kèm mảng id_showtime tương ứng
            timeText = st;
            // Bạn cần đảm bảo backend trả thêm mảng id_showtime[] nếu muốn xử lý kiểu này.
            // Ở đây tạm để sid = response.id_showtime (cũ), nhưng NÊN sửa backend để trả đúng.
            sid = response.id_showtime;
          } else {
            timeText = st.time || st.time_start || "";
            sid = st.id_showtime || st.id || null;
          }

          if (!timeText || !sid) return;

          const button = $("<button></button>");
          button.text(timeText);
          button.attr("data-time", timeText);
          button.attr("data-showtime-id", sid);
          timeList.append(button);
        });
      },
      error: function (xhr) {
        console.error("Lỗi load times:", xhr.responseText);
      },
    });
  });

  // ================== CHỌN GIỜ ==================
  $(document).on("click", "#timeButtons button", function () {
    $("#timeButtons button").removeClass("active");
    $(this).addClass("active");

    time = $(this).attr("data-time");
    showtimeId = $(this).attr("data-showtime-id");

    $("#seatMap").empty();

    $.ajax({
      url: "http://localhost:8000/room/",
      type: "GET",
      data: { id_showtime: showtimeId },
      success: function (response) {
        type_room = response.type;
        loadSeats(showtimeId);
      },
      error: function (xhr) {
        console.error("Lỗi load room:", xhr.responseText);
      },
    });
  });

  // ================== CLICK CHỌN GHẾ (DELEGATION) ==================
  $("#seatMap").on("click", ".seat.available", function () {
    $(this).toggleClass("selected");
    calculateTotal();
  });

  // ================== NÚT THANH TOÁN ==================
  $(".payment-button").on("click", function () {
    const seats = $(".seat.selected");

    if (seats.length === 0) {
      alert("Vui lòng chọn ít nhất 1 ghế để thanh toán!");
      return;
    }

    // Danh sách ghế đã chọn
    const seatList = [];
    seats.each(function () {
      const name = $(this).attr("data-seat");
      const type = $(this).hasClass("vip") ? "VIP" : "Thường";
      seatList.push(`${name} (${type})`);
    });

    // Đồ ăn
    const foods = [];
    $(".food-item").each(function () {
      const name = $(this).find(".food-name").text();
      const quantity = parseInt($(this).find(".quantity").text()) || 0;
      const price = parseInt($(this).attr("data-price")) || 0;
      if (quantity > 0) {
        foods.push(
          `${name} x ${quantity} = ${(quantity * price).toLocaleString(
            "vi-VN"
          )} VND`
        );
      }
    });

    const totalText = $(".total-price").text();

    $("#confirmSeats").html(
      `<p><strong>Ghế đã chọn:</strong><br>${seatList.join(", ")}</p>`
    );
    $("#confirmFoods").html(
      `<p><strong>Đồ ăn đã chọn:</strong><br>${
        foods.join("<br>") || "Không có"
      }</p>`
    );
    $("#confirmTotal").text(totalText);

    let amount = totalbill;
    console.log("Tổng tiền:", amount);

    const qrurl = `https://img.vietqr.io/image/MB-96029686-compact2.png?amount=${amount}&addInfo=thanh%20toan%20&accountName=PCINEMA`;
    const qr = $("#qr");
    qr.attr("src", qrurl);

    $("#confirmBox").fadeIn();

    // Bắt đầu polling check giao dịch
    startCheckTransaction();
  });

  // ================== ĐÓNG POPUP XÁC NHẬN ==================
  $(document).on("click", "#closeConfirmBox", function () {
    $("#confirmBox").fadeOut();
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
  });
});
