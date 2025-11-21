$(document).ready(function () {

    function loadShowtimes() {
        $.ajax({
            url: "http://localhost:8000/showtime/all",
            type: "GET",
            success: function (response) {
                const tbody = $("tbody");
                tbody.empty();
                response.forEach(function (showtime) {
                    const tr = $("<tr></tr>");
                    const idTd = $("<td></td>").text(showtime.id_showtime);
                    const movieNameTd = $("<td></td>").text(showtime.movie_name);

                    // Format start_time to display date and time
                    const startTime = new Date(showtime.time_begin);
                    const formattedStartTime = startTime.toLocaleString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                    });
                    const startTimeTd = $("<td></td>").text(formattedStartTime);

                    const cinemaNameTd = $("<td></td>").text(showtime.cinema_name);
                    const roomNameTd = $("<td></td>").text(showtime.room_name);

                    const actionTd = $("<td></td>");
                    const actionDiv = $("<div class='action-buttons'></div>");

                    const editBtn = $("<button class='action-button edit-button' title='Chỉnh sửa'><i class='fas fa-edit'></i></button>");
                    editBtn.data("id", showtime.id_showtime);

                    const deleteBtn = $("<button class='action-button delete-button' title='Xóa'><i class='fas fa-trash-alt'></i></button>");
                    deleteBtn.data("id", showtime.id_showtime);

                    actionDiv.append(editBtn, deleteBtn);
                    actionTd.append(actionDiv);

                    tr.append(idTd, movieNameTd, startTimeTd, cinemaNameTd, roomNameTd, actionTd);
                    tbody.append(tr);
                });
            },
            error: function (xhr, status, error) {
                console.error("Lỗi khi tải danh sách suất chiếu:", error);
                alert("Không thể tải danh sách suất chiếu. Vui lòng thử lại!");
            }
        });
    }

    loadShowtimes();

    $(".add-button").on("click", function () {
        $("#addShowtimeModal").fadeIn();

        $.ajax({
            url:"http://localhost:8000/movie/",
            type:"GET",
            data:{
                state:"NOW_SHOWING"
            },
            success:function (response) {
                let addMovie=$("#addMovie")
                response.movies.forEach(function (movie) {
                    let op=$("<option></option>").text(movie.name);
                    op.attr("value",movie.id_movie)
                    addMovie.append(op)

                })
            }
        })
        $.ajax({
            url:"http://localhost:8000/cinema/all",
            type:"GET",

            success:function (response) {

                let cinemaName=$("#cinemaName")
                response.cinemas.forEach(function (cinema) {
                    let op=$("<option></option>").text(cinema.name);
                    op.attr("value",cinema.id_cinema)
                    cinemaName.append(op)

                })
            }
        })
        $.ajax({
            url:"http://localhost:8000/room/by_cinema/",
            type:"GET",
            data:{
                "id_cinema":parseInt($("#cinemaName").val())
            },
            success:function (response) {

                let roomName=$("#roomName")
                response.rooms.forEach(function (room) {
                    let op=$("<option></option>").text(room.name);
                    op.attr("value",room.id_cinema)
                    roomName.append(op)

                })
            }
        })

    });

    $("#cinemaName").on("change", function () {
        const selectedCinemaId = $(this).val();

        if (selectedCinemaId) {
            $.ajax({
                url: "http://localhost:8000/room/by_cinema/",
                type: "GET",
                data: { id_cinema: parseInt(selectedCinemaId) },
                success: function (response) {
                    const roomName = $("#roomName");
                    roomName.empty(); // Clear previous options

                    response.rooms.forEach(function (room) {
                        const option = $("<option></option>").text(room.name).val(room.id_room);
                        roomName.append(option);
                    });
                },
                error: function (xhr, status, error) {
                    console.error("Lỗi khi tải danh sách phòng:", error);
                    alert("Không thể tải danh sách phòng. Vui lòng thử lại!");
                }
            });
        }
    });

    $("#cancelAddShowtime").on("click", function () {
        $("#addShowtimeModal").fadeOut();
    });

    // Submit Add Showtime Form
    $("#addShowtimeForm").on("submit", function (e) {
        e.preventDefault();
        const data = {
            "id_movie": parseInt($("#addMovie").val()),
            "time_begin": new Date($("#startTime").val()).toISOString(),

            "id_room": parseInt($("#roomName").val()),
        };

        $.ajax({
            url: "http://localhost:8000/showtime/",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function () {
                alert("Thêm suất chiếu thành công!");
                $("#addShowtimeModal").fadeOut();
                setTimeout(() => location.reload(), 1000);
            },
            error: function (xhr, status, error) {
                console.error("Lỗi thêm suất chiếu:", error);
                alert("Không thể thêm suất chiếu. Vui lòng thử lại!");
            }
        });
    });

    // Open Edit Showtime Modal
    $(document).on("click", ".edit-button", function () {
        const showtimeId = $(this).data("id");
        $("#editShowtimeModal").fadeIn();

        // Load movies for the dropdown
        $.ajax({
            url: "http://localhost:8000/movie/",
            type: "GET",
            data: { state: "NOW_SHOWING" },
            success: function (response) {
                const movieDropdown = $("#editMovieName");
                movieDropdown.empty();
                response.movies.forEach(function (movie) {
                    const option = $("<option></option>").text(movie.name).val(movie.id_movie);
                    movieDropdown.append(option);
                });
            },
            error: function (xhr, status, error) {
                console.error("Lỗi khi tải danh sách phim:", error);
            }
        });

        // Load cinemas for the dropdown
        $.ajax({
            url: "http://localhost:8000/cinema/all",
            type: "GET",
            success: function (response) {
                const cinemaDropdown = $("#editCinemaName");
                cinemaDropdown.empty();
                response.cinemas.forEach(function (cinema) {
                    const option = $("<option></option>").text(cinema.name).val(cinema.id_cinema);
                    cinemaDropdown.append(option);
                });
            },
            error: function (xhr, status, error) {
                console.error("Lỗi khi tải danh sách rạp:", error);
            }
        });

        // Load rooms based on selected cinema
        $("#editCinemaName").on("change", function () {
            const selectedCinemaId = $(this).val();

            if (selectedCinemaId) {
                $.ajax({
                    url: "http://localhost:8000/room/by_cinema/",
                    type: "GET",
                    data: { id_cinema: parseInt(selectedCinemaId) },
                    success: function (response) {
                        const roomDropdown = $("#editRoomName");
                        roomDropdown.empty();
                        response.rooms.forEach(function (room) {
                            const option = $("<option></option>").text(room.name).val(room.id_room);
                            roomDropdown.append(option);
                        });
                    },
                    error: function (xhr, status, error) {
                        console.error("Lỗi khi tải danh sách phòng:", error);
                    }
                });
            }
        });
    });

    // Close Edit Showtime Modal
    $("#cancelEditShowtime").on("click", function () {
        $("#editShowtimeModal").fadeOut();
    });

    // Submit Edit Showtime Form
    $("#editShowtimeForm").on("submit", function (e) {
        e.preventDefault();
        const showtimeId = $(".edit-button").data("id");
        const data = {
            "id_movie": parseInt($("#editMovieName").val()),
            "time_begin": new Date($("#editStartTime").val()).toISOString(),
            "id_room": parseInt($("#editRoomName").val()),
        };

        $.ajax({
            url: `http://localhost:8000/showtime/${showtimeId}`,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function () {
                alert("Cập nhật thông tin suất chiếu thành công!");
                $("#editShowtimeModal").fadeOut();
                setTimeout(() => location.reload(), 1000);
            },
            error: function (xhr, status, error) {
                console.error("Lỗi cập nhật suất chiếu:", error);
                alert("Không thể cập nhật suất chiếu. Vui lòng thử lại!");
            }
        });
    });

    // Delete Showtime
    $(document).on("click", ".delete-button", function () {
        const showtimeId = $(this).data("id");
        if (!confirm("Bạn có chắc chắn muốn xoá suất chiếu này?")) return;

        $.ajax({
            url: `http://localhost:8000/showtime/${showtimeId}`,
            type: "DELETE",
            success: function () {
                alert("Đã xóa suất chiếu thành công");
                setTimeout(() => location.reload(), 1000);
            },
            error: function (xhr, status, error) {
                console.error("Lỗi xóa suất chiếu:", error);
                alert("Không thể xóa suất chiếu. Vui lòng thử lại!");
            }
        });
    });

    $("#editCinemaName").on("change", function () {
        const selectedCinemaId = $(this).val();

        if (selectedCinemaId) {
            $.ajax({
                url: "http://localhost:8000/room/by_cinema/",
                type: "GET",
                data: { id_cinema: parseInt(selectedCinemaId) },
                success: function (response) {
                    const roomName = $("#editRoomName");
                    roomName.empty(); // Clear previous options

                    response.rooms.forEach(function (room) {
                        const option = $("<option></option>").text(room.name).val(room.id_room);
                        roomName.append(option);
                    });
                },
                error: function (xhr, status, error) {
                    console.error("Lỗi khi tải danh sách phòng:", error);
                    alert("Không thể tải danh sách phòng. Vui lòng thử lại!");
                }
            });
        }
    });

    $("#editShowtimeModal").on("show", function () {
        // Load movies for the dropdown
        $.ajax({
            url: "http://localhost:8000/movie/",
            type: "GET",
            data: { state: "NOW_SHOWING" },
            success: function (response) {
                const movieDropdown = $("#editMovieName");
                movieDropdown.empty();
                response.movies.forEach(function (movie) {
                    const option = $("<option></option>").text(movie.name).val(movie.id_movie);
                    movieDropdown.append(option);
                });
            },
            error: function (xhr, status, error) {
                console.error("Lỗi khi tải danh sách phim:", error);
            }
        });

        // Load cinemas for the dropdown
        $.ajax({
            url: "http://localhost:8000/cinema/all",
            type: "GET",
            success: function (response) {
                const cinemaDropdown = $("#editCinemaName");
                cinemaDropdown.empty();
                response.cinemas.forEach(function (cinema) {
                    const option = $("<option></option>").text(cinema.name).val(cinema.id_cinema);
                    cinemaDropdown.append(option);
                });
            },
            error: function (xhr, status, error) {
                console.error("Lỗi khi tải danh sách rạp:", error);
            }
        });
    });
});