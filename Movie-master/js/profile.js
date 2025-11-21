$(document).ready(function () {
    let ticketlist = $(".tickets-list");
    $.ajax({
        url: "http://localhost:8000/receipt/list/",
        type: "GET",
        data: { "id_user": parseInt(localStorage.getItem("id_user")) },
        success: function (response) {
            response.forEach(function (data) {
                let ticket = $("<div></div>").addClass("ticket-card");

                // Image
                let divimg = $("<div></div>").addClass("ticket-image");
                let img = $("<img>").attr("src", "../asset/images/receipt.png").attr("alt", "Movie poster");
                divimg.append(img);
                ticket.append(divimg);

                // Details container
                let detail = $("<div></div>").addClass("ticket-details");

                // Title
                let title = $("<div></div>").addClass("movie-title").text(data.movie_name);
                detail.append(title);

                // Info blocks
                function createInfo(labelText, valueText) {
                    let info = $("<div></div>").addClass("ticket-info");
                    let label = $("<span></span>").addClass("ticket-info-label").text(labelText);
                    let value = $("<span></span>").text(valueText);
                    info.append(label).append(value);
                    return info;
                }

                detail.append(createInfo("Ngày:", data.date_begin));
                detail.append(createInfo("Giờ:", data.time_begin));
                detail.append(createInfo("Rạp:", data.cinema_name));
                detail.append(createInfo("Ghế:", data.seats.join(", ")));

                // Actions
                // let actions = $("<div></div>").addClass("ticket-actions");
                // let btn = $("<button></button>").addClass("action-button view-details").text("Xem chi tiết");
                // actions.append(btn);
                // detail.append(actions);

                // Add to main card
                ticket.append(detail);
                ticketlist.append(ticket);
            });
        },
        error: function (xhr) {
            let empty = $(".empty-state").fadeIn()
        }
    });
});
