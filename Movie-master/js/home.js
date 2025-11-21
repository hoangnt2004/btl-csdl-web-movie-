function initBanner() {
    let slides = document.querySelectorAll('.slide');
    if (!slides.length) return;

    let currentSlide = 0;

    function nextSlide() {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }

    function prevSlide() {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      slides[currentSlide].classList.add('active');
    }

    document.getElementById('nextBtn').addEventListener('click', nextSlide);
    document.getElementById('prevBtn').addEventListener('click', prevSlide);

    slides[0].classList.add('active');

    if (slides.length > 1) {
      setInterval(nextSlide, 3000);
    }
  }
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
    $.ajax({
        url: "http://localhost:8000/movie/banner/",
        type: "GET",
        data:{state:"NOW_SHOWING"},
        success: function (data) {
            var btn=$("#prevBtn");
            var bannerUrl="../asset/images/";
            data.movies.forEach((movie,index) =>{
                var urlimg=bannerUrl+movie.banner;
                var slide= $('<div class="slide"></div>');
                var img=$("<img>").attr("src",urlimg)
                slide.append(img);
                btn.after(slide);
            })
            initBanner()
        }
    })
    $.ajax({
    url: "http://localhost:8000/movie/recent",
    type: "GET",
    success: function (response) {
      var slider = $("#new");
      response.movies.forEach(function (movie, index) {
        var posterUrl = "../asset/images/" + movie.poster;
        var card = $("<div></div>").addClass("movie-card");
        var img = $("<img>").attr("src", posterUrl).attr("alt", "phim hanh moi");
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
      initSlider("slider-new");
    },
    error: function(xhr, status, error) {
      console.error("Lỗi khi gọi API : ", error);
    }
  });
    $.ajax({
    url: "http://localhost:8000/movie/",
    type: "GET",
    data: { state: "NOW_SHOWING" }, // Thay 28 bằng type_id của Phim Hành Động
    success: function (response) {
      var slider = $("#hot");

      response.movies.slice(0,10).forEach(function (movie, index) {

        var posterUrl = "../asset/images/" + movie.poster;
        var card = $("<div></div>").addClass("movie-card");
        var img = $("<img>").attr("src", posterUrl).attr("alt", "phim hot");
        var overlay = $("<div></div>").addClass("overlay").append($("<span></span>").text("Đặt Vé"));
        overlay.on("click", function (){
                    window.location.href="detail.html?id=" + movie.id_movie
                    // window.location.href="detail.html"
                })
        var info = $("<div></div>").addClass("info").append($("<h3></h3>").text(movie.name));
        card.append(img, overlay, info);
        slider.append(card);
      });
      initSlider("slider-hot");
    },
    error: function(xhr, status, error) {
      console.error("Lỗi khi gọi API : ", error);
    }
  });
})


