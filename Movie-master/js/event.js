function initSlider(wrapperId, sliderSelector, prevBtnId, nextBtnId, progressId) {
    const wrapper = document.getElementById(wrapperId);
    const slider = wrapper.querySelector(sliderSelector);
    const items = Array.from(slider.children); // chuyển NodeList thành mảng
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);
    const progressBar = document.getElementById(progressId).querySelector('.progress-bar');

    let position = 0;
    const showCount = 3;
    const totalItems = items.length;

    function renderSlider() {
        items.forEach(item => item.style.display = 'none');
        for (let i = 0; i < showCount; i++) {
            const index = (position + i) % totalItems;
            items[index].style.display = 'block';
        }
        updateProgress();
    }

    function updateProgress() {
        const progress = (position % totalItems) / totalItems * 100;
        progressBar.style.width = `${progress}%`;
    }

    nextBtn.addEventListener('click', () => {
        position = (position + 1) % totalItems;
        renderSlider();
    });

    prevBtn.addEventListener('click', () => {
        position = (position - 1 + totalItems) % totalItems;
        renderSlider();
    });

    renderSlider(); // lần đầu khi load
}


    // Khởi tạo slider cho Khuyến mãi
    initSlider("slider-promo", ".slider", "prev-promo", "next-promo", "progress-promo");
    // Khởi tạo slider cho Tin tức
    initSlider("slider-news", ".slider", "prev-news", "next-news", "progress-news");
const promotions = [
    {
        id: 1,
        title: "CÓN BÁO SALE SIÊU KHỦNG TẠI BHD STAR",
        date: "20/12/2024",
        image: "../asset/image/pro1.jpg",
        content: `
            <h2>CÓN BÁO "SALE" SIÊU KHỦNG TẠI BHD STAR</h2>
            <p>ĐÓN NHẬN CƠN BÃO "SALE" SIÊU KHỦNG KHIẾP TẠI BHD STAR CINEPLEX.</p>
            <p>+ Tặng ngay 01 PEPSI (trị giá 36.000đ) khi mua 2 vé xem phim bất kì.</p>
            <p>+ Chỉ với 59.000đ có ngay COMBO "ĐÃ KHÁT ĐÃ THÈM" (1 Bắp + 1 nước).</p>
            <p>* Ưu đãi áp dụng từ: 04.01.2024 – 28.01.2025 (Không giới hạn số lần sử dụng).</p>
            <p>* Áp dụng cho tất cả các cụm rạp tại Hồ Chí Minh, Hà Nội và Huế.</p>
        `
    },
    {
    id: 2,
    title: "Đã quá Pepsi ơi",
    date: "15/12/2024",
    image: "../asset/image/pro2.jpg",
    content: `
        <h2>ĐÃ QUÁ PEPSI ƠI – MUA VÉ TẶNG NGAY PEPSI</h2>
        <p>Chỉ cần mua vé xem phim tại PCINEMA, bạn sẽ được nhận ngay 1 lon Pepsi mát lạnh hoàn toàn miễn phí!</p>
        <p>+ Áp dụng cho tất cả các vé xem phim tại quầy hoặc đặt online.</p>
        <p>+ Mỗi vé tương ứng với 1 Pepsi (không giới hạn số lần nhận trong thời gian khuyến mãi).</p>
        <p>* Thời gian: Từ 15/12/2024 đến hết 15/01/2025.</p>
        <p>* Áp dụng tại tất cả các cụm rạp PCINEMA trên toàn quốc.</p>
    `
}
,
    {
    id: 3,
    title: "Bắp Free đi cả nhà ơi",
    date: "10/12/2024",
    image: "../asset/image/pro3.jpg",
    content: `
        <h2>BẮP FREE ĐI CẢ NHÀ ƠI – TẶNG NGAY BẮP RANG VÀNG KHI MUA VÉ</h2>
        <p>Đi xem phim vui là phải có bắp! Từ nay, chỉ cần mua vé là bạn đã được tặng ngay 1 phần bắp rang bơ size S.</p>
        <p>+ Áp dụng cho mọi suất chiếu từ Thứ 2 đến Chủ nhật.</p>
        <p>+ Áp dụng cho cả vé thường và vé combo.</p>
        <p>* Thời gian: 10/12/2024 – 10/01/2025.</p>
        <p>* Không áp dụng đồng thời với các chương trình khuyến mãi khác.</p>
    `
}
,
    {
    id: 4,
    title: "Đổi ảnh lấy nước",
    date: "05/12/2024",
    image: "../asset/image/pro4.jpg",
    content: `
        <h2>CHECK-IN NGAY – ĐỔI ẢNH LẤY NƯỚC MIỄN PHÍ</h2>
        <p>Chỉ cần chụp ảnh check-in tại rạp PCINEMA, đăng lên Facebook cá nhân ở chế độ công khai kèm hashtag #PCINEMA, bạn sẽ nhận ngay 1 phần nước miễn phí.</p>
        <p>+ Áp dụng cho tất cả các cụm rạp.</p>
        <p>+ Mỗi tài khoản Facebook chỉ được đổi 1 lần/ngày.</p>
        <p>* Chương trình áp dụng từ 05/12/2024 đến 31/12/2024.</p>
    `
}
,
    {
    id: 5,
    title: "Xuân An Khang",
    date: "01/12/2024",
    image: "../asset/image/pro2.jpg",
    content: `
        <h2>XUÂN AN KHANG – COMBO ĂN VẶT CHỈ 49K</h2>
        <p>Chào đón Tết 2025 rộn ràng cùng ưu đãi siêu tiết kiệm: Combo 1 bắp + 1 nước ngọt chỉ với 49.000đ!</p>
        <p>+ Không giới hạn số lần mua trong thời gian khuyến mãi.</p>
        <p>+ Áp dụng cho tất cả các suất chiếu từ 9:00 đến 22:00 mỗi ngày.</p>
        <p>* Thời gian: 01/12/2024 – 15/02/2025.</p>
        <p>* Áp dụng tại tất cả các rạp PCINEMA toàn quốc.</p>
    `
}

];

// Dữ liệu mẫu cho các tin tức
const news = [
    {
    id: 1,
    title: "Bom Tấn Tết 2025 - Siêu Phẩm 'Hài Chiến Mã' Ra Mắt!",
    date: "20/12/2024",
    image: "../asset/image/new1.jpg",
    content: `
        <h2>SIÊU PHẨM TẾT 2025: "HÀI CHIẾN MÃ" CHÍNH THỨC CÔNG CHIẾU</h2>
        <p>Bộ phim hài hành động "Hài Chiến Mã" với sự góp mặt của Trấn Thành và Thu Trang hứa hẹn sẽ khuấy đảo phòng vé dịp Tết 2025.</p>
        <p>Đặt vé ngay hôm nay tại PCINEMA để nhận ngay combo ưu đãi siêu hot!</p>
    `
}
,
    {
    id: 2,
    title: "PCINEMA Khai Trương Rạp Mới Tại Đà Nẵng",
    date: "15/12/2024",
    image: "../asset/image/new2.jpg",
    content: `
        <h2>CHÀO MỪNG PCINEMA ĐÀ NẴNG - ƯU ĐÃI NGẬP TRÀN</h2>
        <p>PCINEMA chính thức khai trương cụm rạp hiện đại tại Vincom Đà Nẵng với 6 phòng chiếu đạt chuẩn quốc tế.</p>
        <p>Khách hàng đến xem phim từ 15/12 - 31/12 sẽ được tặng combo bắp + nước miễn phí!</p>
    `
}
,
    {
    id: 3,
    title: "Cập Nhật Lịch Chiếu Phim Tết 2025",
    date: "10/12/2024",
    image: "../asset/image/new3.jpg",
    content: `
        <h2>LỊCH CHIẾU PHIM TẾT 2025 ĐÃ CÓ TRÊN PCINEMA</h2>
        <p>Khách hàng có thể đặt vé sớm cho các suất chiếu Tết từ ngày 10/12/2024 tại toàn bộ hệ thống PCINEMA.</p>
        <p>Đặt vé online sớm để tránh tình trạng cháy vé và nhận nhiều phần quà hấp dẫn.</p>
    `
}
,
    {
    id: 4,
    title: "Ưu Đãi Đặc Biệt Cho Thành Viên PCINEMA",
    date: "05/12/2024",
    image: "../asset/image/new4.jpg",
    content: `
        <h2>THÀNH VIÊN PCINEMA ƯU ĐÃI LÊN ĐẾN 50%</h2>
        <p>Từ 05/12, tất cả thành viên PCINEMA sẽ được giảm giá vé, nhận quà sinh nhật và điểm thưởng khi đặt vé trực tuyến.</p>
        <p>Hãy đăng ký thành viên miễn phí ngay hôm nay để không bỏ lỡ những đặc quyền hấp dẫn!</p>
    `
}
,
    {
    id: 5,
    title: "Sự Kiện Cosplay Phim Hoạt Hình Tại PCINEMA",
    date: "01/12/2024",
    image: "../asset/image/new5.jpg",
    content: `
        <h2>ĐÊM COSPLAY CỰC CHẤT - NHẬN VÉ MIỄN PHÍ!</h2>
        <p>Đến PCINEMA trong trang phục cosplay các nhân vật hoạt hình yêu thích và nhận ngay vé xem phim miễn phí cho buổi chiếu đặc biệt ngày 01/12.</p>
        <p>Sự kiện giới hạn số lượng – chỉ áp dụng tại PCINEMA Landmark và Vincom Center.</p>
    `
}

];

// Hàm để hiển thị popup với nội dung được chỉ định
function showPopup(contentHTML) {
    const popup = document.getElementById('popup-overlay');
    const popupContent = popup.querySelector('.popup-content');

    popupContent.innerHTML = contentHTML;
    popup.style.display = 'flex';

    // Ngăn cuộn trang khi popup đang mở
    document.body.style.overflow = 'hidden';
}

// Hàm để ẩn popup
function hidePopup() {
    const popup = document.getElementById('popup-overlay');
    popup.style.display = 'none';

    // Cho phép cuộn trang trở lại
    document.body.style.overflow = 'auto';
}

// Thêm sự kiện click cho nút đóng popup
document.addEventListener('DOMContentLoaded', function() {
    const closeBtn = document.querySelector('.close-popup');
    closeBtn.addEventListener('click', hidePopup);

    // Đóng popup khi click vào overlay (ngoài vùng nội dung)
    const popupOverlay = document.getElementById('popup-overlay');
    popupOverlay.addEventListener('click', function(e) {
        if (e.target === popupOverlay) {
            hidePopup();
        }
    });

    // Thêm sự kiện click cho tất cả các card khuyến mãi
    const promoCards = document.querySelectorAll('.promo-card');
    promoCards.forEach((card, index) => {
        card.addEventListener('click', function() {
            if (index < promotions.length) {
                showPopup(promotions[index].content);
            }
        });
    });

    // Thêm sự kiện click cho tất cả các card tin tức
    const newsCards = document.querySelectorAll('.news-card');
    newsCards.forEach((card, index) => {
        card.addEventListener('click', function() {
            if (index < news.length) {
                showPopup(news[index].content);
            }
        });
    });
});
