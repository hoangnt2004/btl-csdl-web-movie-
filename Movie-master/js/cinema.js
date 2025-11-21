$(document).ready(function() {
    // Toggle sidebar
    $('.brand i').click(function() {
        $('body').toggleClass('sidebar-collapsed');
        $('.sidebar').toggleClass('collapsed');
    });

    // Home button functionality
    $('.home-button').click(function() {
        window.location.href="./home.html"
    });
});

$(document).ready(function () {
    // Biến phân trang
    let currentPage = 1;
    let pageSize = 10;
    let totalCinemas = 0;
    let allCinemas = [];
    
    let selectedCinema = null;
    let selectedCinemaId = null;
    let selectedRoom = null;

    // Khởi tạo phân trang
    function initPagination() {
        // Đặt kích thước trang mặc định từ dropdown
        pageSize = parseInt($('#pageSize').val());
        
        // Cập nhật phân trang khi kích thước trang thay đổi
        $('#pageSize').on('change', function() {
            pageSize = parseInt($(this).val());
            currentPage = 1; // Đặt lại về trang đầu tiên khi thay đổi kích thước trang
            renderCinemas();
            updatePaginationControls();
        });

        // Nút trang trước
        $('.prev-page').on('click', function() {
            if (currentPage > 1) {
                currentPage--;
                renderCinemas();
                updatePaginationControls();
            }
        });

        // Nút trang sau
        $('.next-page').on('click', function() {
            const totalPages = Math.ceil(totalCinemas / pageSize);
            if (currentPage < totalPages) {
                currentPage++;
                renderCinemas();
                updatePaginationControls();
            }
        });
    }

    // Cập nhật điều khiển phân trang (số trang và nút)
    function updatePaginationControls() {
        const totalPages = Math.ceil(totalCinemas / pageSize);
        
        // Bật/tắt nút trang trước/sau
        $('.prev-page').prop('disabled', currentPage === 1);
        $('.next-page').prop('disabled', currentPage === totalPages);
        
        // Tạo số trang
        const $paginationNumbers = $('#pagination-numbers');
        $paginationNumbers.empty();
        
        // Tính toán phạm vi trang hiển thị
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        // Trang đầu tiên
        if (startPage > 1) {
            $paginationNumbers.append(`<button class="page-number" data-page="1">1</button>`);
            if (startPage > 2) {
                $paginationNumbers.append(`<span>...</span>`);
            }
        }
        
        // Số trang
        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === currentPage ? 'active' : '';
            $paginationNumbers.append(`<button class="page-number ${activeClass}" data-page="${i}">${i}</button>`);
        }
        
        // Trang cuối cùng
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                $paginationNumbers.append(`<span>...</span>`);
            }
            $paginationNumbers.append(`<button class="page-number" data-page="${totalPages}">${totalPages}</button>`);
        }
        
        // Thêm sự kiện click cho số trang
        $('.page-number').on('click', function() {
            currentPage = parseInt($(this).data('page'));
            renderCinemas();
            updatePaginationControls();
        });
        
        // Cập nhật thông tin tóm tắt trang
        const start = (currentPage - 1) * pageSize + 1;
        const end = Math.min(currentPage * pageSize, totalCinemas);
        $('#page-summary').text(`Hiển thị ${start}-${end} của ${totalCinemas} rạp`);
    }

    // Hiển thị rạp chiếu phim cho trang hiện tại
    function renderCinemas() {
        let tbody = $("#tbody");
        tbody.empty();
        
        // Tính toán chỉ số bắt đầu và kết thúc cho trang hiện tại
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, allCinemas.length);
        
        // Lấy rạp chiếu cho trang hiện tại
        const cinemasToShow = allCinemas.slice(startIndex, endIndex);
        
        // Hiển thị rạp chiếu
        cinemasToShow.forEach(function (cinema) {
            let tr = $("<tr></tr>").attr("data-id", cinema.id_cinema);
            let id = $("<td></td>").text(cinema.id_cinema);
            let name = $("<td></td>").text(cinema.name);
            let address = $("<td></td>").text(cinema.address);
            let actionTd = $("<td></td>");
            let actionDiv = $("<div class='action-buttons'></div>");
            
            let viewBtn = $("<button class='action-button view-button' title='Xem'><i class='fas fa-eye'></i></button>");
            viewBtn.on("click", function () {
                selectedCinemaId = cinema.id_cinema;
                $.ajax({
                    url: `http://localhost:8000/room/by_cinema`,
                    type: "GET",
                    data: {
                        id_cinema: cinema.id_cinema
                    },
                    success: function (response) {
                        const tbody = $("#roomTableBody");
                        tbody.empty()
                        response.rooms.forEach(function (room) {
                            const tr = $("<tr></tr>");
                            const nameTd = $("<td></td>").text(room.name);
                            const seatTd = $("<td></td>").text(room.total_seat);
                            const typeTd = $("<td></td>").text(room.type);
                            let deleteRoomBtn = $("<button class='action-button delete-button room' title='Xóa'><i class='fas fa-trash-alt'></i></button>");
                            deleteRoomBtn.attr("data-id", room.id_room);
                            tr.append(nameTd, seatTd, typeTd, deleteRoomBtn);
                            tbody.append(tr);
                        });

                        $("#cinemaDetailModal").fadeIn();
                    },
                    error: function (xhr, status, error) {
                        const tbody = $("#roomTableBody");
                        tbody.empty()
                        $("#cinemaDetailModal").fadeIn();
                    }
                });
            });
            
            $("#closeCinemaDetail").click(function () {
                $("#cinemaDetailModal").fadeOut();
            });
            
            let editBtn = $("<button class='action-button edit-button' title='Chỉnh sửa'><i class='fas fa-edit'></i></button>");
            editBtn.on("click", function () {
                selectedCinema = cinema.id_cinema;
                $("#editCinemaName").val(cinema.name);
                $("#editCinemaAddress").val(cinema.address);
                $("#editCinemaModal").fadeIn();
            });
            
            let deleteBtn = $("<button class='action-button delete-button' title='Xóa'><i class='fas fa-trash-alt'></i></button>");
            deleteBtn.on("click", function () {
                if (!confirm("Bạn có chắc chắn muốn xoá Rạp này?")) return;
                $.ajax({
                    url: `http://localhost:8000/cinema/${cinema.id_cinema}`,
                    type: "DELETE",
                    success: function () {
                        alert("Rạp đã được xoá thành công!");
                        
                        // Cập nhật lại dữ liệu trong danh sách thay vì tải lại trang
                        allCinemas = allCinemas.filter(c => c.id_cinema !== cinema.id_cinema);
                        totalCinemas = allCinemas.length;
                        
                        // Kiểm tra nếu trang hiện tại không còn dữ liệu thì quay về trang trước đó
                        const totalPages = Math.ceil(totalCinemas / pageSize);
                        if (currentPage > totalPages && currentPage > 1) {
                            currentPage--;
                        }
                        
                        renderCinemas();
                        updatePaginationControls();
                    },
                    error: function (xhr, status, error) {
                        console.error("Lỗi xoá rạp:", error);
                        alert("Không thể xoá rạp. Vui lòng thử lại!");
                    }
                });
            });

            $("#cancelEdit").on("click", function () {
                $("#editCinemaModal").fadeOut();
            });
            
            actionDiv.append(viewBtn, editBtn, deleteBtn);
            actionTd.append(actionDiv);
            tr.append(id, name, address, actionTd);
            tbody.append(tr);
            
            $("#addRoom").on("click", function () {
                $("#addRoomModal").fadeIn();
            });

            $("#cancelAddRoom").on("click", function () {
                $("#addRoomModal").fadeOut();
            });
        });
    }

    // Tải dữ liệu từ API
    function loadCinemas() {
        $.ajax({
            url: "http://localhost:8000/cinema/all",
            type: "GET",
            success: function (response) {
                // Lưu tất cả rạp chiếu phim
                allCinemas = response.cinemas;
                totalCinemas = allCinemas.length;
                
                // Khởi tạo phân trang
                initPagination();
                
                // Hiển thị trang đầu tiên
                renderCinemas();
                updatePaginationControls();
                
                // Set up event handlers
                setupFormHandlers();
            },
            error: function (xhr, status, error) {
                console.error("Lỗi khi tải danh sách rạp:", error);
                alert("Không thể tải danh sách rạp. Vui lòng thử lại!");
            }
        });
    }

    // Thiết lập các sự kiện xử lý form
    function setupFormHandlers() {
        $("#editCinemaForm").on("submit", function (e) {
            e.preventDefault();
            const data = {
                name: $("#editCinemaName").val(),
                address: $("#editCinemaAddress").val()
            }
            $.ajax({
                url: `http://localhost:8000/cinema/${selectedCinema}`,
                type: "PUT",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function () {
                    $("#editCinemaModal").fadeOut();
                    
                    // Cập nhật dữ liệu trong danh sách thay vì tải lại trang
                    const index = allCinemas.findIndex(c => c.id_cinema === selectedCinema);
                    if (index !== -1) {
                        allCinemas[index].name = data.name;
                        allCinemas[index].address = data.address;
                        renderCinemas();
                    } else {
                        // Nếu không tìm thấy rạp, tải lại danh sách
                        loadCinemas();
                    }
                },
                error: function (xhr, status, error) {
                    console.error("Lỗi cập nhật rạp:", error);
                    alert("Không thể cập nhật rạp. Vui lòng thử lại!");
                }
            });
        });

        $("#addRoomForm").on("submit", function (e) {
            e.preventDefault();
            $.ajax({
                url: "http://localhost:8000/room/create",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    "name": $("#RoomName").val(),
                    "type": $("#RoomType").val(),
                    "id_cinema": selectedCinemaId,
                    "numbers_seat": $("#RoomNumber").val()
                }),
                success: function () {
                    alert("Thêm mới phòng thành công !!");
                    $("#addRoomModal").fadeOut();
                     currentPage = 1; // Reset về trang đầu
                     $.ajax({
                        url: "http://localhost:8000/cinema/all",
                        type: "GET",
                        success: function (response) {
                            allCinemas = response.cinemas;
                            totalCinemas = allCinemas.length;
                            renderCinemas();
                            updatePaginationControls();
                        }
                    });

                    // Cập nhật danh sách phòng trong modal chi tiết rạp
                    $.ajax({
                        url: `http://localhost:8000/room/by_cinema`,
                        type: "GET",
                        data: {
                            id_cinema: selectedCinemaId
                        },
                        success: function (response) {
                            const tbody = $("#roomTableBody");
                            tbody.empty();
                            response.rooms.forEach(function (room) {
                                const tr = $("<tr></tr>");
                                const nameTd = $("<td></td>").text(room.name);
                                const seatTd = $("<td></td>").text(room.total_seat);
                                const typeTd = $("<td></td>").text(room.type);
                                let deleteRoomBtn = $("<button class='action-button delete-button room' title='Xóa'><i class='fas fa-trash-alt'></i></button>");
                                deleteRoomBtn.attr("data-id", room.id_room);
                                tr.append(nameTd, seatTd, typeTd, deleteRoomBtn);
                                tbody.append(tr);
                            });
                        }
                    });

                },
                error: function (xhr, status, error) {
                    console.error("Lỗi thêm phòng:", error);
                    alert("Không thể thêm phòng. Vui lòng thử lại!");
                }
            });
        });
    }

    // Tìm kiếm rạp
    $('.search-container button').click(function() {
        const searchTerm = $('.search-container input').val().toLowerCase();
        
        if (searchTerm) {
            const filteredCinemas = allCinemas.filter(cinema => 
                cinema.name.toLowerCase().includes(searchTerm) || 
                cinema.address.toLowerCase().includes(searchTerm)
            );
            
            const tbody = $("#tbody");
            tbody.empty();
            
            filteredCinemas.forEach(function (cinema) {
                // Duplicate the rendering logic for search results
                let tr = $("<tr></tr>").attr("data-id", cinema.id_cinema);
                let id = $("<td></td>").text(cinema.id_cinema);
                let name = $("<td></td>").text(cinema.name);
                let address = $("<td></td>").text(cinema.address);
                let actionTd = $("<td></td>");
                let actionDiv = $("<div class='action-buttons'></div>");
                
                // Same button logic as in renderCinemas (viewBtn, editBtn, deleteBtn)
                // ... (buttons code same as in renderCinemas)
                
                let viewBtn = $("<button class='action-button view-button' title='Xem'><i class='fas fa-eye'></i></button>");
                viewBtn.on("click", function () {
                    selectedCinemaId = cinema.id_cinema;
                    $.ajax({
                        url: `http://localhost:8000/room/by_cinema`,
                        type: "GET",
                        data: {
                            id_cinema: cinema.id_cinema
                        },
                        success: function (response) {
                            const tbody = $("#roomTableBody");
                            tbody.empty()
                            response.rooms.forEach(function (room) {
                                const tr = $("<tr></tr>");
                                const nameTd = $("<td></td>").text(room.name);
                                const seatTd = $("<td></td>").text(room.total_seat);
                                const typeTd = $("<td></td>").text(room.type);
                                let deleteRoomBtn = $("<button class='action-button delete-button room' title='Xóa'><i class='fas fa-trash-alt'></i></button>");
                                deleteRoomBtn.attr("data-id", room.id_room);
                                tr.append(nameTd, seatTd, typeTd, deleteRoomBtn);
                                tbody.append(tr);
                            });

                            $("#cinemaDetailModal").fadeIn();
                        },
                        error: function (xhr, status, error) {
                            const tbody = $("#roomTableBody");
                            tbody.empty();
                            $("#cinemaDetailModal").fadeIn();
                        }
                    });
                });
                
                let editBtn = $("<button class='action-button edit-button' title='Chỉnh sửa'><i class='fas fa-edit'></i></button>");
                editBtn.on("click", function () {
                    selectedCinema = cinema.id_cinema;
                    $("#editCinemaName").val(cinema.name);
                    $("#editCinemaAddress").val(cinema.address);
                    $("#editCinemaModal").fadeIn();
                });
                
                let deleteBtn = $("<button class='action-button delete-button' title='Xóa'><i class='fas fa-trash-alt'></i></button>");
                deleteBtn.on("click", function () {
                    if (!confirm("Bạn có chắc chắn muốn xoá Rạp này?")) return;
                    $.ajax({
                        url: `http://localhost:8000/cinema/${cinema.id_cinema}`,
                        type: "DELETE",
                        success: function () {
                            alert("Rạp đã được xoá thành công!");
                            allCinemas = allCinemas.filter(c => c.id_cinema !== cinema.id_cinema);
                            totalCinemas = allCinemas.length;
                            renderCinemas();
                            updatePaginationControls();
                        },
                        error: function (xhr, status, error) {
                            console.error("Lỗi xoá rạp:", error);
                            alert("Không thể xoá rạp. Vui lòng thử lại!");
                        }
                    });
                });
                
                actionDiv.append(viewBtn, editBtn, deleteBtn);
                actionTd.append(actionDiv);
                tr.append(id, name, address, actionTd);
                tbody.append(tr);
            });
            
            // Cập nhật thông tin phân trang cho kết quả tìm kiếm
            $('#page-summary').text(`Hiển thị ${filteredCinemas.length} kết quả tìm kiếm`);
            $('#pagination-numbers').empty();
            $('.prev-page, .next-page').prop('disabled', true);
        } else {
            // Nếu không có từ khóa, hiển thị lại toàn bộ danh sách có phân trang
            renderCinemas();
            updatePaginationControls();
        }
    });

    // Tải danh sách rạp
    loadCinemas();
});

$(document).on("click", ".delete-button.room", function () {
    const idRoom = $(this).attr("data-id");
    if (!confirm("Bạn có chắc chắn muốn xoá phòng này?")) return;

    $.ajax({
        url: `http://localhost:8000/room/${idRoom}`,
        type: "DELETE",
        success: function () {
            alert("Phòng đã được xoá thành công!");
            $(this).closest('tr').remove();
        },
        error: function (xhr, status, error) {
            console.error("Lỗi xoá phòng:", error);
            alert("Không thể xoá phòng. Vui lòng thử lại!");
        }
    });
});

$(document).ready(function () {
    $(".add-button").on("click", function () {
        $("#addCinemaModal").fadeIn();
    });
    
    $("#cancelAdd").on("click", function () {
        $("#addCinemaModal").fadeOut();
    });
    
    $("#addCinemaForm").on("submit", function (e) {
        e.preventDefault();
        const data = {
            name: $("#cinemaName").val(),
            address: $("#cinemaAddress").val()
        }

        $.ajax({
            url: "http://localhost:8000/cinema/",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Thêm mới thành công!',
                    text: 'Đã hoàn thành thêm mới rạp chiếu phim!!',
                    showConfirmButton: false,
                    timer: 2000
                });
                $("#addCinemaModal").fadeOut();
                currentPage = 1
                // Thêm rạp mới vào danh sách và cập nhật giao diện
                $.ajax({
                    url: "http://localhost:8000/cinema/all",
                    type: "GET",
                    success: function (response) {
                        allCinemas = response.cinemas;
                        totalCinemas = allCinemas.length;
                        renderCinemas();
                        updatePaginationControls();
                    }
                });
            },
            error: function (xhr, status, error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi thêm mới!',
                    text: 'Vui lòng kiểm tra lại dữ liệu và thử lại.',
                });
                console.error("Lỗi khi thêm mới rạp:", error);
            }
        });
    });
});
