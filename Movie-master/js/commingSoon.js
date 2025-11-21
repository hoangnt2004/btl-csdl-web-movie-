function initSlider() {
    let slides = document.querySelectorAll('.slide');
    // Nếu không có slide nào, thoát sớm
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

    // Gắn sự kiện cho nút
    document.getElementById('nextBtn').addEventListener('click', nextSlide);
    document.getElementById('prevBtn').addEventListener('click', prevSlide);

    // Slide đầu tiên active
    slides[0].classList.add('active');

    // Tự động chuyển slide
    if (slides.length > 1) {
      setInterval(nextSlide, 3000);
    }
  }

  // Khi DOM đã sẵn sàng
  $(document).ready(function() {
    // Gọi AJAX để lấy danh sách banner
    $.ajax({
      url: "http://localhost:8000/movie/banner/", // Backend API
      type: "GET",
      data: { state: "COMING_SOON" },
      success: function(response) {
        var arrowRight = $("#nextBtn");
        // Thêm slide vào DOM
        $.each(response.movies, function(index, movie) {
          var bannerSrc = "../asset/images/" + movie.banner;
          var slide = $('<div class="slide"></div>');
          var img = $('<img>').attr("src", bannerSrc).attr("alt", "Banner " + (index + 1));
          slide.append(img);
          // Chèn trước nút mũi tên phải
          slide.insertBefore(arrowRight);
        });
        // Gọi hàm khởi tạo slider sau khi đã thêm slide
        initSlider();
      },
      error: function(xhr, status, error) {
        console.error("Lỗi khi gọi API: ", error);
      }
    });
    $.ajax({
        url: "http://localhost:8000/movie/",
        type: "GET",
        data: { state: "COMING_SOON"},
        success: function (response){
            var h2 =$(".movie-grid");
            response.movies.forEach( function (movie,index) {
                var imgsrc ="../asset/images/" + movie.poster;
                var card = $('<div class ="movie-card"></div>');
                var img =$('<img>').attr("src",imgsrc).attr("alt","phim" +(index+1));
                var overlay = $('<div class="overlay">Chi tiết</div>').attr('id',movie.id_movie);
                var h3 = $('<h3>').text(movie.name)
                overlay.on("click", function (){
                    window.location.href="detail.html?id=" + movie.id_movie
                    // window.location.href="detail.html"
                })
                card.append(img)
                card.append(overlay)
                card.append(h3)
                h2.append(card)
            })
        },
        error: function(xhr, status, error) {
        console.error("Lỗi khi gọi API: ", error);
      }
    })
  });