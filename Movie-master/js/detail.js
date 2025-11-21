import {checkToken} from "./checkToken.js";
let movieId
$(document).ready(function (){
    const queryString = window.location.search;
    // Tạo đối tượng URLSearchParams từ chuỗi query
    const urlParams = new URLSearchParams(queryString);
    // Lấy giá trị của tham số "id"
    movieId = urlParams.get("id");
    let currentPage = 1;
    const pageSize = 5;
    let totalPages = 0;
    
    // Khởi tạo mảng để lưu trữ phân bố đánh giá
    let ratingDistribution = [0, 0, 0, 0, 0]; // [1 sao, 2 sao, 3 sao, 4 sao, 5 sao]
    let totalRatings = 0;
    let averageRating = 0;

    // Load movie details
    $.ajax({
        url: "http://localhost:8000/movie/"+movieId,
        type: "GET",
        data: {id: movieId},
        success: function (response) {
            var poster = $(".movie-poster");
            var imgsrc="../asset/images/"+response.poster;
            var img =$("<img>");
            img.attr("src",imgsrc);
            img.attr('alt',`poster phim ${response.id_movie}`);
            poster.prepend(img);

            var divTiltle =$(".movie-info-text");
            var h1 =$("<h1></h1>").text(response.name).attr('class',"movie-title").attr('id',response.id_movie);
            divTiltle.prepend(h1);

            var div = $(".movie-info");

            // Nội Dung
            var pOverview = $("<p></p>");
            var strongOverview = $("<strong></strong>").text("Nội Dung: ");
            pOverview.append(strongOverview);
            if (response.overview != null) {
                pOverview.append(response.overview);
            } else {
                pOverview.append("(Đang cập nhật)");
            }
            div.append(pOverview);

            // Diễn viên
            var pActor = $("<p></p>");
            var strongActor = $("<strong></strong>").text("Diễn viên: ");
            pActor.append(strongActor);
            if (response.actor != null && response.actor.trim() !== "") {
                pActor.append(response.actor);
            } else {
                pActor.append("(Đang cập nhật)");
            }
            div.append(pActor);

            // Đạo diễn
            var pDirector = $("<p></p>");
            var strongDirector = $("<strong></strong>").text("Đạo diễn: ");
            pDirector.append(strongDirector);
            if (response.director != null && response.director.trim() !== "") {
                pDirector.append(response.director);
            } else {
                pDirector.append("(Đang cập nhật)");
            }
            div.append(pDirector);

            // Thể loại
            var pType = $("<p></p>");
            var strongType = $("<strong></strong>").text("Thể loại: ");
            pType.append(strongType);
            if (response.type != null && response.type.length > 0) {
                // Nếu response.type là mảng, ghép các phần tử bằng dấu phẩy
                if (Array.isArray(response.type)) {
                    pType.append(response.type.join(", "));
                } else {
                    pType.append(response.type);
                }
            } else {
                pType.append("(Đang cập nhật)");
            }
            div.append(pType);

            // Thời lượng
            var pTime = $("<p></p>");
            var strongTime = $("<strong></strong>").text("Thời lượng: ");
            pTime.append(strongTime);
            if (response.time != null && response.time !== "") {
                // Giả sử thời lượng được tính bằng phút
                pTime.append(response.time + " phút");
            } else {
                pTime.append("(Đang cập nhật)");
            }
            div.append(pTime);

            var state = response.state;
            if (state=="NOW_SHOWING"){
                var tmp=$(".movie-actions");
                var button =$("<button></button>");
                button.text("Chọn Ghế");
                button.attr("class","choose-seat");
                tmp.append(button);

                button.on("click",function () {
                    const token = localStorage.getItem("access_token");
                    if (token){
                        checkToken(token)
                            .then(data => {
                                window.location.href="seat.html?id="+movieId;
                            })
                            .catch(()=>{
                                window.location.href="login.html";
                        });
                    }
                    else{
                        window.location.href="login.html";
                    }
                });
            }

            // Trailer: luôn hiển thị khối, có URL thì nhúng video, không thì thông báo
            const trailerContainer = $("#movieTrailer");
            trailerContainer.empty();
            if (response.trailer_url) {
                const embedUrl = getYoutubeEmbedUrl(response.trailer_url);
                if (embedUrl) {
                    const iframe = $("<iframe>", {
                        width: "560",
                        height: "315",
                        src: embedUrl,
                        title: "Trailer phim",
                        frameborder: "0",
                        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
                        referrerpolicy: "strict-origin-when-cross-origin",
                        allowfullscreen: true
                    });
                    trailerContainer.append(iframe);
                } else {
                    trailerContainer.append(`<p class="trailer-placeholder">Trailer hiện chưa sẵn sàng.</p>`);
                }
            } else {
                trailerContainer.append(`<p class="trailer-placeholder">Trailer hiện chưa sẵn sàng.</p>`);
            }

            // Load đánh giá phim sau khi load chi tiết phim
            loadRatingSummary(movieId);
            loadReviews(movieId, currentPage);
        },
        error: function(xhr, status, error) {
            console.error("Lỗi khi gọi API: ", error);
        }
    });

    // Xử lý sự kiện click vào sao đánh giá
    $(document).on('click', '.star', function() {
        // Kiểm tra đăng nhập trước khi cho phép đánh giá
        const token = localStorage.getItem("access_token");
        if (!token) {
            alert("Vui lòng đăng nhập để đánh giá phim!");
            window.location.href = "login.html";
            return;
        }

        // Lấy giá trị đánh giá
        const rating = $(this).data('rating');
        
        // Cập nhật giao diện
        $('.star').removeClass('selected');
        for (let i = 1; i <= rating; i++) {
            $(`.star[data-rating='${i}']`).addClass('selected');
        }
        
        // Lưu rating vào biến toàn cục để sử dụng khi gửi đánh giá
        window.currentRating = rating;
    });

    // Xử lý gửi đánh giá
    $('.rating-form').on('submit', function(e) {
        e.preventDefault();
        
        const token = localStorage.getItem("access_token");
        if (!token) {
            alert("Vui lòng đăng nhập để đánh giá phim!");
            window.location.href = "login.html";
            return;
        }

        // Kiểm tra đánh giá
        const rating = window.currentRating || 0;
        if (rating === 0) {
            alert("Vui lòng chọn số sao (1-5) trước khi gửi đánh giá!");
            return;
        }

        const description = $('.rating-form textarea').val().trim();
        
        // Gửi đánh giá lên API
        $.ajax({
            url: "http://localhost:8000/review/",
            type: "POST",

            contentType: "application/json",
            data: JSON.stringify({
                "score": rating,
                "description": description,
                "id_movie": parseInt(movieId),
                "id_user": parseInt(localStorage.getItem("id_user"))
            }),
            success: function(response) {
                // Xóa nội dung form và reset đánh giá
                $('.rating-form textarea').val('');
                $('.star').removeClass('selected');
                window.currentRating = 0;
                
                // Tải lại thống kê đánh giá và danh sách đánh giá
                loadRatingSummary(parseInt(movieId));
                loadReviews(parseInt(movieId), 1);
                
                alert("Cảm ơn bạn đã đánh giá phim!");
            },
            error: function(xhr, status, error) {
                console.error("Lỗi khi gửi đánh giá:", error);
                alert("Không thể gửi đánh giá. Vui lòng thử lại sau!");
            }
        });
    });

    // Xử lý nút "Xem thêm đánh giá"
    $('#loadMoreBtn').on('click', function(e) {
        e.preventDefault();
        
        if (currentPage < totalPages) {
            currentPage++;
            loadReviews(movieId, currentPage, true);
        } else {
            $(this).text('Không còn đánh giá nào khác');
            $(this).addClass('disabled');
        }
    });

    // Hàm tải thống kê đánh giá
    function loadRatingSummary(movieId) {
        $.ajax({
            url: `http://localhost:8000/review/movie/${movieId}/summary`,
            type: "GET",
            success: function(response) {
                if (response && response.averageScore !== undefined) {
                    // Cập nhật điểm trung bình và tổng số đánh giá
                    averageRating = response.averageScore;
                    totalRatings = response.totalReviews;
                    
                    // Hiển thị điểm trung bình với 1 số sau dấu phẩy
                    $('.score-display').text(averageRating.toFixed(1));
                    
                    // Hiển thị số lượng đánh giá
                    $('.total-ratings').text(`${totalRatings} đánh giá`);
                    
                    // Tạo hiển thị sao cho điểm trung bình
                    const starsHtml = generateStarsForRating(averageRating);
                    $('.star-display-large').html(starsHtml);
                    
                    // Cập nhật phân bố đánh giá nếu có
                    if (response.distribution) {
                        ratingDistribution = response.distribution;
                        updateRatingDistribution();
                    }
                } else {
                    // Mặc định khi không có đánh giá
                    $('.score-display').text('0.0');
                    $('.total-ratings').text('0 đánh giá');
                    $('.star-display-large').html('☆☆☆☆☆');
                }
            },
            error: function(xhr, status, error) {
                console.error("Lỗi khi tải tổng quan đánh giá:", error);
            }
        });
    }

    // Hàm cập nhật hiển thị phân bố đánh giá
    function updateRatingDistribution() {
        // Tính tổng số đánh giá từ phân bố
        const total = ratingDistribution.reduce((acc, val) => acc + val, 0);
        
        if (total > 0) {
            // Cập nhật thanh phân bố và phần trăm cho mỗi mức đánh giá
            for (let i = 1; i <= 5; i++) {
                const count = ratingDistribution[i-1];
                const percentage = Math.round((count / total) * 100);
                
                $(`.rating-bar:nth-child(${6-i}) .progress`).css('width', `${percentage}%`);
                $(`.rating-bar:nth-child(${6-i}) .percentage`).text(`${percentage}%`);
            }
        }
    }

    // Hàm tải đánh giá
    function loadReviews(movieId, page, append = false) {
        $.ajax({
            url: `http://localhost:8000/review/movie/${movieId}?page=${page-1}&size=${pageSize}`,
            type: "GET",
            success: function(response) {
                if (!append) {
                    // Xóa đánh giá cũ nếu không phải chế độ append
                    $('#reviewsContainer').empty();
                }

                // Lưu tổng số trang
                totalPages = response.totalPages || 1;
                
                // Ẩn nút "Xem thêm" nếu đã hết đánh giá
                if (page >= totalPages) {
                    $('#loadMoreBtn').text('Không còn đánh giá nào khác');
                    $('#loadMoreBtn').addClass('disabled');
                } else {
                    $('#loadMoreBtn').text('XEM THÊM ĐÁNH GIÁ');
                    $('#loadMoreBtn').removeClass('disabled');
                }

                // Hiển thị đánh giá
                if (response.reviews && response.reviews.length > 0) {
                    response.reviews.forEach(function(review) {
                        const reviewHtml = createReviewHtml(review);
                        $('#reviewsContainer').append(reviewHtml);
                    });
                } else if (!append) {
                    // Nếu không có đánh giá và không phải chế độ append, hiển thị thông báo
                    $('#reviewsContainer').html('<p class="no-reviews">Chưa có đánh giá nào cho phim này. Hãy là người đầu tiên đánh giá!</p>');
                }
            },
            error: function(xhr, status, error) {
                console.error("Lỗi khi tải đánh giá:", error);
                if (!append) {
                    $('#reviewsContainer').html('<p class="error-message">Không thể tải đánh giá. Vui lòng thử lại sau!</p>');
                }
            }
        });
    }

    // Hàm tạo HTML cho mỗi đánh giá
    function createReviewHtml(review) {
        const starsHtml = generateStarsForRating(review.score);
        const description = review.description ? `<p class="review-content">${review.description}</p>` : '';
        
        return `
            <div class="review" data-id="${review.id_review}">
                <div class="review-header">
                    <span class="review-author">${review.user_name || 'Người dùng ẩn danh'}</span>
                    <span class="review-date">${formatDate(new Date())}</span>
                </div>
                <div class="review-rating">${starsHtml}</div>
                ${description}
            </div>
        `;
    }

    // Hàm tạo HTML cho số sao dựa trên rating
    function generateStarsForRating(rating) {
        const fullStar = '★';
        const emptyStar = '☆';
        const roundedRating = Math.round(rating);
        
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= roundedRating) {
                starsHtml += `<span class="star-display">${fullStar}</span>`;
            } else {
                starsHtml += `<span class="star-display">${emptyStar}</span>`;
            }
        }
        
        return starsHtml;
    }

    // Hàm định dạng ngày tháng
    function formatDate(date) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    }

    // Chuyển link YouTube thành link embed
    function getYoutubeEmbedUrl(url) {
        if (!url) return null;

        // Nếu đã là link embed thì trả luôn
        if (url.includes("embed")) {
            return url;
        }

        // Lấy VIDEO_ID từ các dạng URL phổ biến
        const regex = /(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        const videoId = match ? match[1] : null;

        if (!videoId) return null;

        return `https://www.youtube.com/embed/${videoId}`;
    }
}); 