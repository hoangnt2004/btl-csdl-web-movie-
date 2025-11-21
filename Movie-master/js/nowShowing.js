// Hàm khởi tạo slider cho mỗi container slider
function initSlider(wrapperId) {
  const wrapper = document.getElementById(wrapperId);
  if (!wrapper) return;

  const slider = wrapper.querySelector('.movie-slider');
  const cards = slider.querySelectorAll('.movie-card');
  // Giả sử id của container dots là "dots-" + phần đuôi của wrapperId, ví dụ: slider-hanhdong => dots-hanhdong
  const dotsContainer = document.getElementById(`dots-${wrapperId.split('-')[1]}`);

  // Số phim hiển thị cùng lúc
  const cardsToShow = window.innerWidth <= 768 ? 2 : 4;

  let currentPosition = 0;
  const maxPosition = Math.max(0, cards.length - cardsToShow);

  // Xóa nội dung cũ của dotsContainer nếu có
  dotsContainer.innerHTML = "";

  // Tạo dots cho slider
  const totalDots = maxPosition + 1;
  for (let i = 0; i < totalDots; i++) {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.dataset.position = i;
    dot.addEventListener('click', () => {
      currentPosition = i;
      updateSlider();
    });
    dotsContainer.appendChild(dot);
  }

  // function updateSlider() {
  //   if (cards.length === 0) return;
  //   const cardWidth = cards[0].offsetWidth;
  //   const translateX = -currentPosition * cardWidth;
  //   slider.style.transform = `translateX(${translateX}px)`;
  //
  //   // Cập nhật trạng thái active cho dots
  //   const dots = dotsContainer.querySelectorAll('.dot');
  //   dots.forEach((dot, index) => {
  //     dot.classList.toggle('active', index === currentPosition);
  //   });
  // }
  function updateSlider() {
  if (cards.length === 0) return;

  // Lấy CSS thực tế của thẻ .movie-card đầu tiên
  const cardStyle = window.getComputedStyle(cards[0]);
  const marginLeft = parseInt(cardStyle.marginLeft) || 0;
  const marginRight = parseInt(cardStyle.marginRight) || 0;

  // Tính tổng chiều rộng thực tế của mỗi card = width + margin
  const cardWidth = cards[0].offsetWidth + marginLeft + marginRight;

  // Đảm bảo currentPosition không vượt quá maxPosition
  if (currentPosition > maxPosition) {
    currentPosition = maxPosition;
  }

  // Tính toán vị trí dịch chuyển
  const translateX = -currentPosition * cardWidth;
  slider.style.transform = `translateX(${translateX}px)`;

  // Cập nhật trạng thái dot
  const dots = dotsContainer.querySelectorAll('.dot');
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentPosition);
  });
}


  document.getElementById(`prev-${wrapperId.split('-')[1]}`).addEventListener('click', function() {
    if (currentPosition > 0) {
      currentPosition--;
      updateSlider();
    }
  });

  document.getElementById(`next-${wrapperId.split('-')[1]}`).addEventListener('click', function() {
    if (currentPosition < maxPosition) {
      currentPosition++;
      updateSlider();
    }
  });

  updateSlider();
}

$(document).ready(function () {
  // Phim Hành Động
  $.ajax({
    url: "http://localhost:8000/movie/",
    type: "GET",
    data: { state: "NOW_SHOWING", type_id: 28 }, // Thay 28 bằng type_id của Phim Hành Động
    success: function (response) {
      var slider = $("#hanhdong");
      response.movies.forEach(function (movie, index) {
        var posterUrl = "../asset/images/" + movie.poster;
        var card = $("<div></div>").addClass("movie-card");
        var img = $("<img>").attr("src", posterUrl).attr("alt", "phim hanh dong");
        var overlay = $("<div></div>").addClass("overlay").append($("<span></span>").text("Đặt Vé"));
        overlay.on("click", function (){
                    window.location.href="detail.html?id=" + movie.id_movie
                    // window.location.href="detail.html"
                })
        var info = $("<div></div>").addClass("info").append($("<h3></h3>").text(movie.name));
        card.append(img, overlay, info);
        slider.append(card);
      });
      console.log("Phim Hành Động loaded");
      initSlider("slider-hanhdong");
    },
    error: function(xhr, status, error) {
      console.error("Lỗi khi gọi API (Phim Hành Động): ", error);
    }
  });

  // Phim Hoạt Hình
  $.ajax({
    url: "http://localhost:8000/movie/",
    type: "GET",
    data: { state: "NOW_SHOWING", type_id: 16 }, // Thay 29 bằng type_id của Phim Hoạt Hình
    success: function (response) {
      var slider = $("#hoathinh");
      response.movies.forEach(function (movie, index) {
        var posterUrl = "../asset/images/" + movie.poster;
        var card = $("<div></div>").addClass("movie-card");
        var img = $("<img>").attr("src", posterUrl).attr("alt", "phim hoat hinh");
        var overlay = $("<div></div>").addClass("overlay").append($("<span></span>").text("Đặt Vé"));
        overlay.on("click", function (){
                    window.location.href="detail.html?id=" + movie.id_movie
                    // window.location.href="detail.html"
                })
        var info = $("<div></div>").addClass("info").append($("<h3></h3>").text(movie.name));
        card.append(img, overlay, info);
        slider.append(card);
      });
      console.log("Phim Hoạt Hình loaded");
      initSlider("slider-hoathinh");
    },
    error: function(xhr, status, error) {
      console.error("Lỗi khi gọi API (Phim Hoạt Hình): ", error);
    }
  });

  // Phim Hài
  $.ajax({
    url: "http://localhost:8000/movie/",
    type: "GET",
    data: { state: "NOW_SHOWING", type_id: 35 }, // Thay 30 bằng type_id của Phim Hài
    success: function (response) {
      var slider = $("#hai");
      response.movies.forEach(function (movie, index) {
        var posterUrl = "../asset/images/" + movie.poster;
        var card = $("<div></div>").addClass("movie-card");
        var img = $("<img>").attr("src", posterUrl).attr("alt", "phim hai");
        var overlay = $("<div></div>").addClass("overlay").append($("<span></span>").text("Đặt Vé"));
        overlay.on("click", function (){
                    window.location.href="detail.html?id=" + movie.id_movie
                    // window.location.href="detail.html"
                })
        var info = $("<div></div>").addClass("info").append($("<h3></h3>").text(movie.name));
        card.append(img, overlay, info);
        slider.append(card);
      });
      console.log("Phim Hài loaded");
      initSlider("slider-hai");
    },
    error: function(xhr, status, error) {
      console.error("Lỗi khi gọi API (Phim Hài): ", error);
    }
  });

  // Phim Gia Đình
  $.ajax({
    url: "http://localhost:8000/movie/",
    type: "GET",
    data: { state: "NOW_SHOWING", type_id: 10751 }, // Thay 31 bằng type_id của Phim Gia Đình
    success: function (response) {
      var slider = $("#giadinh");
      response.movies.forEach(function (movie, index) {
        var posterUrl = "../asset/images/" + movie.poster;
        var card = $("<div></div>").addClass("movie-card");
        var img = $("<img>").attr("src", posterUrl).attr("alt", "phim gia dinh");
        var overlay = $("<div></div>").addClass("overlay").append($("<span></span>").text("Đặt Vé"));
        overlay.on("click", function (){
                    window.location.href="detail.html?id=" + movie.id_movie
                    // window.location.href="detail.html"
                })
        var info = $("<div></div>").addClass("info").append($("<h3></h3>").text(movie.name));
        card.append(img, overlay, info);
        slider.append(card);
      });
      console.log("Phim Gia Đình loaded");
      initSlider("slider-giadinh");
    },
    error: function(xhr, status, error) {
      console.error("Lỗi khi gọi API (Phim Gia Đình): ", error);
    }
  });

  // Phim Kinh Dị
  $.ajax({
    url: "http://localhost:8000/movie/",
    type: "GET",
    data: { state: "NOW_SHOWING", type_id: 27 }, // Thay 32 bằng type_id của Phim Kinh Dị
    success: function (response) {
      var slider = $("#kinhdi");
      response.movies.forEach(function (movie, index) {
        var posterUrl = "../asset/images/" + movie.poster;
        var card = $("<div></div>").addClass("movie-card");
        var img = $("<img>").attr("src", posterUrl).attr("alt", "phim kinh di");
        var overlay = $("<div></div>").addClass("overlay").append($("<span></span>").text("Đặt Vé"));
        overlay.on("click", function (){
                    window.location.href="detail.html?id=" + movie.id_movie
                    // window.location.href="detail.html"
                })
        var info = $("<div></div>").addClass("info").append($("<h3></h3>").text(movie.name));
        card.append(img, overlay, info);
        slider.append(card);
      });
      console.log("Phim Kinh Dị loaded");
      initSlider("slider-kinhdi");
    },
    error: function(xhr, status, error) {
      console.error("Lỗi khi gọi API (Phim Kinh Dị): ", error);
    }
  });

  // Phim Lãng Mạn
  $.ajax({
    url: "http://localhost:8000/movie/",
    type: "GET",
    data: { state: "NOW_SHOWING", type_id: 10749 }, // Thay 33 bằng type_id của Phim Lãng Mạn
    success: function (response) {
      var slider = $("#langman");
      response.movies.forEach(function (movie, index) {
        var posterUrl = "../asset/images/" + movie.poster;
        var card = $("<div></div>").addClass("movie-card");
        var img = $("<img>").attr("src", posterUrl).attr("alt", "phim lang man");
        var overlay = $("<div></div>").addClass("overlay").append($("<span></span>").text("Đặt Vé"));
        overlay.on("click", function (){
                    window.location.href="detail.html?id=" + movie.id_movie
                    // window.location.href="detail.html"
                })
        var info = $("<div></div>").addClass("info").append($("<h3></h3>").text(movie.name));
        card.append(img, overlay, info);
        slider.append(card);
      });
      console.log("Phim Lãng Mạn loaded");
      initSlider("slider-langman");
    },
    error: function(xhr, status, error) {
      console.error("Lỗi khi gọi API (Phim Lãng Mạn): ", error);
    }
  });

  // Phim Khoa Học Viễn Tưởng
  $.ajax({
    url: "http://localhost:8000/movie/",
    type: "GET",
    data: { state: "NOW_SHOWING", type_id: 878 }, // Thay 34 bằng type_id của Phim Khoa Học Viễn Tưởng
    success: function (response) {
      var slider = $("#khoahoc");
      response.movies.forEach(function (movie, index) {
        var posterUrl = "../asset/images/" + movie.poster;
        var card = $("<div></div>").addClass("movie-card");
        var img = $("<img>").attr("src", posterUrl).attr("alt", "phim khoa hoc");
        var overlay = $("<div></div>").addClass("overlay").append($("<span></span>").text("Đặt Vé"));
        overlay.on("click", function (){
                    window.location.href="detail.html?id=" + movie.id_movie
                    // window.location.href="detail.html"
                })
        var info = $("<div></div>").addClass("info").append($("<h3></h3>").text(movie.name));
        card.append(img, overlay, info);
        slider.append(card);
      });
      console.log("Phim Khoa Học Viễn Tưởng loaded");
      initSlider("slider-khoahoc");
    },
    error: function(xhr, status, error) {
      console.error("Lỗi khi gọi API (Phim Khoa Học Viễn Tưởng): ", error);
    }
  });
});
