$(document).ready(function () {
    // Toggle sidebar
    $('.brand i').click(function () {
        $('body').toggleClass('sidebar-collapsed');
        $('.sidebar').toggleClass('collapsed');
    });

    // Home button
    $('.home-button').click(function () {
        window.location.href = "./home.html";
    });

    // Biến lưu ID phim đang được chỉnh sửa
    let selectedMovieId = null;

    // Pagination variables
    let currentPage = 1;
    let pageSize = 10;
    let totalMovies = 0;
    let allMovies = [];

    // Initialize pagination
    function initPagination() {
        // Set default page size from dropdown
        pageSize = parseInt($('#pageSize').val());
        
        // Update pagination when page size changes
        $('#pageSize').on('change', function() {
            pageSize = parseInt($(this).val());
            currentPage = 1; // Reset to first page when changing page size
            renderMovies();
            updatePaginationControls();
        });

        // Previous page button click
        $('.prev-page').on('click', function() {
            if (currentPage > 1) {
                currentPage--;
                renderMovies();
                updatePaginationControls();
            }
        });

        // Next page button click
        $('.next-page').on('click', function() {
            const totalPages = Math.ceil(totalMovies / pageSize);
            if (currentPage < totalPages) {
                currentPage++;
                renderMovies();
                updatePaginationControls();
            }
        });
    }

    // Update pagination controls (numbers and buttons)
    function updatePaginationControls() {
        const totalPages = Math.ceil(totalMovies / pageSize);
        
        // Enable/disable previous/next buttons
        $('.prev-page').prop('disabled', currentPage === 1);
        $('.next-page').prop('disabled', currentPage === totalPages);
        
        // Generate page numbers
        const $paginationNumbers = $('#pagination-numbers');
        $paginationNumbers.empty();
        
        // Calculate range of pages to show
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        // First page
        if (startPage > 1) {
            $paginationNumbers.append(`<button class="page-number" data-page="1">1</button>`);
            if (startPage > 2) {
                $paginationNumbers.append(`<span>...</span>`);
            }
        }
        
        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === currentPage ? 'active' : '';
            $paginationNumbers.append(`<button class="page-number ${activeClass}" data-page="${i}">${i}</button>`);
        }
        
        // Last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                $paginationNumbers.append(`<span>...</span>`);
            }
            $paginationNumbers.append(`<button class="page-number" data-page="${totalPages}">${totalPages}</button>`);
        }
        
        // Add click event to page numbers
        $('.page-number').on('click', function() {
            currentPage = parseInt($(this).data('page'));
            renderMovies();
            updatePaginationControls();
        });
        
        // Update page summary
        const start = (currentPage - 1) * pageSize + 1;
        const end = Math.min(currentPage * pageSize, totalMovies);
        $('#page-summary').text(`Hiển thị ${start}-${end} của ${totalMovies} phim`);
    }

    // Render movies for current page
    function renderMovies() {
        const tbody = $("#tbody");
        tbody.empty();
        
        // Calculate start and end indices for current page
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, allMovies.length);
        
        // Filter movies based on status if filter is active
        const statusFilter = $('#statusFilter').val();
        const filteredMovies = statusFilter ? 
            allMovies.filter(movie => movie.state === statusFilter) : 
            allMovies;
        
        totalMovies = filteredMovies.length;
        
        // Get movies for current page
        const moviesToShow = filteredMovies.slice(startIndex, endIndex);
        
        // Render movies
        moviesToShow.forEach(function (movie) {
            let tr = $("<tr></tr>").attr("data-state", movie.state);
            let id = $("<td></td>").text(movie.id_movie);
            let name = $("<td></td>").text(movie.name);
            let time = $("<td></td>").text(movie.time + " phút");
            let time_release = $("<td></td>").text(movie.time_release);

            let state = $("<td></td>");
            let span = $("<span></span>").text(movie.state);
            if (movie.state === "NOW_SHOWING") {
                span.attr("class", "status status-active");
            } else if (movie.state === "COMING_SOON") {
                span.attr("class", "status status-upcoming");
            } else {
                span.attr("class", "status status-ended");
            }
            state.append(span);

            // Các nút thao tác
            let actionTd = $("<td></td>");
            let actionDiv = $("<div class='action-buttons'></div>");

            // Nút xem chi tiết
            let viewBtn = $("<button class='action-button view-button' title='Xem'><i class='fas fa-eye'></i></button>");
            viewBtn.on("click", function () {
                $("#movieModal").fadeIn();
                $.ajax({
                    url: "http://localhost:8000/movie/" + movie.id_movie,
                    type: "GET",
                    success: function (res) {
                        let path = "../asset/images/" + res.poster;
                        $('#title').text(res.name);
                        $('#poster').attr("src", path);
                        $('#duration').text(res.time + " phút");
                        $('#genre').text(Array.isArray(res.type) ? res.type.join(', ') : "");
                        $('#director').text(res.director);
                        $('#cast').text(res.actor);
                        $('#synopsis').text(res.overview);
                        $('#status').text(res.state === "COMING_SOON" ? "Sắp chiếu" : res.state === "ENDED" ? "Đã kết thúc" : "Đang chiếu");
                    }
                });
            });

            // Nút chỉnh sửa
            let editBtn = $("<button class='action-button edit-button' title='Chỉnh sửa'><i class='fas fa-edit'></i></button>");
            editBtn.on("click", function () {
                selectedMovieId = movie.id_movie;
                $("#editName").val(movie.name);
                $("#editTime").val(movie.time);
                $("#editDirector").val(movie.director);
                $("#editActor").val(movie.actor);
                $("#editOverview").val(movie.overview);
                $("#editState").val(movie.state);
                $("#editGenres").val(movie.id_type).trigger('change');  // Nếu có sẵn id_type

                $("#editMovieModal").fadeIn();
            });

            // Nút xoá
            let deleteBtn = $("<button class='action-button delete-button' title='Xóa'><i class='fas fa-trash-alt'></i></button>");
            deleteBtn.on("click", function () {
                if (!confirm("Bạn có chắc chắn muốn xoá phim này?")) return;
                $.ajax({
                    url: "http://localhost:8000/movie/" + movie.id_movie,
                    type: "DELETE",
                    success: function () {
                        alert("Phim đã được xoá thành công!");
                        location.reload();
                    },
                    error: function (xhr, status, error) {
                        console.error("Lỗi xoá phim:", error);
                        alert("Không thể xoá phim. Vui lòng thử lại!");
                    }
                });
            });

            actionDiv.append(viewBtn, editBtn, deleteBtn);
            actionTd.append(actionDiv);
            tr.append(id, name, time, time_release, state, actionTd);
            tbody.append(tr);
        });
    }

    // Gọi API để load danh sách phim
    $.ajax({
        url: "http://localhost:8000/movie/all",
        type: "GET",
        success: function (response) {
            // Save all movies
            allMovies = response.movies;
            totalMovies = allMovies.length;
            
            // Initialize pagination
            initPagination();
            
            // Render initial page
            renderMovies();
            updatePaginationControls();
        }
    });

    // Nút đóng modal xem chi tiết
    $("#close").on("click", function () {
        $("#movieModal").fadeOut();
    });
    $("#cancelEdit").on("click", function () {
        $("#editMovieModal").fadeOut();
    });
    // Gửi form cập nhật phim
    $('#editMovieForm').on('submit', function (e) {
        e.preventDefault();
        const url = `http://localhost:8000/movie/revise/${selectedMovieId}`;

        const data = {
            name: $('#editName').val(),
            time: parseInt($('#editTime').val()),
            age_limit: "NONE",
            director: $('#editDirector').val(),
            actor: $('#editActor').val(),
            overview: $('#editOverview').val(),
            state: $('#editState').val(),
            id_type: $('#editGenres').val().map(Number),
            poster: null,
            banner: null,
            time_release: null
        };

        $.ajax({
            url: url,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function () {
                Swal.fire({
                    icon: 'success',
                    title: 'Cập nhật thành công!',
                    text: 'Thông tin phim đã được cập nhật.',
                    showConfirmButton: false,
                    timer: 2000
                });
                $("#editMovieModal").fadeOut();
                setTimeout(() => location.reload(), 1000);
            },
            error: function (xhr, status, error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi cập nhật!',
                    text: 'Vui lòng kiểm tra lại dữ liệu và thử lại.',
                });
                console.error("Lỗi khi cập nhật phim:", error);
            }
        });
    });

    // Bộ lọc theo trạng thái phim
    $('#statusFilter').on('change', function () {
        currentPage = 1; // Reset to first page when filtering
        renderMovies();
        updatePaginationControls();
    });
});

$(document).ready(function () {
    // Mở modal thêm phim
    $('.add-button').click(function () {
        $("#addMovieModal").fadeIn();
    });

    // Hủy thêm phim
    $('#cancelAdd').click(function () {
        $("#addMovieModal").fadeOut();
    });

    // Gửi form thêm phim
    $('#addMovieForm').on('submit', async function (e) {
        e.preventDefault();

        const form = document.getElementById("addMovieForm");
        const formData = new FormData(form);

        // Upload poster trước
        const uploadPoster = await fetch("http://localhost:8000/movie/upload-poster", {
            method: "POST",
            body: formData.get("poster") ? (() => {
                const data = new FormData();
                data.append("file", formData.get("poster"));
                return data;
            })() : null
        }).then(res => res.json());

        // Upload banner
        const uploadBanner = await fetch("http://localhost:8000/movie/upload-banner", {
            method: "POST",
            body: formData.get("banner") ? (() => {
                const data = new FormData();
                data.append("file", formData.get("banner"));
                return data;
            })() : null
        }).then(res => res.json());

        // Chuẩn bị dữ liệu JSON
        const data = {
            name: formData.get("name"),
            time: parseInt(formData.get("time")),
            age_limit: "NONE",
            director: formData.get("director"),
            actor: formData.get("actor"),
            poster: uploadPoster?.poster || null,
            banner: uploadBanner?.banner || null,
            time_release: new Date(formData.get("time_release")).toISOString(),
            overview: formData.get("overview"),
            state: formData.get("state"),
            id_type: $('#newTypes').val().map(Number)
        };

        // Gửi lên API tạo phim
        $.ajax({
            url: "http://localhost:8000/movie/",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function () {
                Swal.fire({
                    icon: 'success',
                    title: 'Thêm phim thành công!',
                    showConfirmButton: false,
                    timer: 2000
                });
                $("#addMovieModal").fadeOut();
                setTimeout(() => location.reload(), 1000);
            },
            error: function (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi khi thêm phim!',
                    text: 'Vui lòng kiểm tra lại dữ liệu.'
                });
                console.error(err);
            }
        });
    });
});

