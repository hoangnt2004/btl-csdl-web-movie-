$(document).ready(function () {
    // Biến phân trang
    let currentPage = 1;
    let pageSize = 10;
    let totalCustomers = 0;
    let allCustomers = [];

    // Khởi tạo phân trang
    function initPagination() {
        // Đặt kích thước trang mặc định từ dropdown
        pageSize = parseInt($('#pageSize').val());
        
        // Cập nhật phân trang khi kích thước trang thay đổi
        $('#pageSize').on('change', function() {
            pageSize = parseInt($(this).val());
            currentPage = 1; // Đặt lại về trang đầu tiên khi thay đổi kích thước trang
            renderCustomers();
            updatePaginationControls();
        });

        // Nút trang trước
        $('.prev-page').on('click', function() {
            if (currentPage > 1) {
                currentPage--;
                renderCustomers();
                updatePaginationControls();
            }
        });

        // Nút trang sau
        $('.next-page').on('click', function() {
            const totalPages = Math.ceil(totalCustomers / pageSize);
            if (currentPage < totalPages) {
                currentPage++;
                renderCustomers();
                updatePaginationControls();
            }
        });
    }

    // Cập nhật điều khiển phân trang (số trang và nút)
    function updatePaginationControls() {
        const totalPages = Math.ceil(totalCustomers / pageSize);
        
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
            renderCustomers();
            updatePaginationControls();
        });
        
        // Cập nhật thông tin tóm tắt trang
        const start = (currentPage - 1) * pageSize + 1;
        const end = Math.min(currentPage * pageSize, totalCustomers);
        $('#page-summary').text(`Hiển thị ${start}-${end} của ${totalCustomers} khách hàng`);
    }

    // Hiển thị khách hàng cho trang hiện tại
    function renderCustomers() {
        const tbody = $("tbody");
        tbody.empty();
        
        // Tính toán chỉ số bắt đầu và kết thúc cho trang hiện tại
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, allCustomers.length);
        
        // Lấy khách hàng cho trang hiện tại
        const customersToShow = allCustomers.slice(startIndex, endIndex);
        
        // Hiển thị khách hàng
        customersToShow.forEach(function (customer) {
            const tr = $("<tr></tr>");
            const idTd = $("<td></td>").text(customer.id_user);
            const nameTd = $("<td></td>").text(customer.name);
            const emailTd = $("<td></td>").text(customer.email);
            const phoneTd = $("<td></td>").text(customer.phone_number);

            const actionTd = $("<td></td>");
            const actionDiv = $("<div class='action-buttons'></div>");

            const editBtn = $("<button class='action-button edit-button' title='Chỉnh sửa'><i class='fas fa-edit'></i></button>");
            editBtn.data("id", customer.id_user);

            const deleteBtn = $("<button class='action-button delete-button' title='Xóa'><i class='fas fa-trash-alt'></i></button>");
            deleteBtn.data("id", customer.id_user);

            actionDiv.append(editBtn, deleteBtn);
            actionTd.append(actionDiv);

            tr.append(idTd, nameTd, emailTd, phoneTd, actionTd);
            tbody.append(tr);
        });
    }

    // Tải danh sách khách hàng
    function loadCustomers() {
        $.ajax({
            url: "http://localhost:8000/user/all",
            type: "GET",
            success: function (response) {
                // Lưu tất cả khách hàng
                allCustomers = response.users;
                totalCustomers = allCustomers.length;
                
                // Khởi tạo phân trang
                initPagination();
                
                // Hiển thị trang đầu tiên
                renderCustomers();
                updatePaginationControls();
            },
            error: function (xhr, status, error) {
                console.error("Lỗi khi tải danh sách khách hàng:", error);
                alert("Không thể tải danh sách khách hàng. Vui lòng thử lại!");
            }
        });
    }

    // Tải danh sách khách hàng khi trang tải xong
    loadCustomers();

    // Sự kiện tìm kiếm khách hàng
    $('.search-container button').click(function() {
        const searchTerm = $('.search-container input').val().toLowerCase();
        
        // Tìm kiếm trong toàn bộ danh sách và hiển thị lại
        if (searchTerm) {
            const filteredCustomers = allCustomers.filter(customer => 
                customer.name.toLowerCase().includes(searchTerm) || 
                customer.email.toLowerCase().includes(searchTerm) ||
                customer.phone_number.toLowerCase().includes(searchTerm)
            );
            
            const tbody = $("tbody");
            tbody.empty();
            
            filteredCustomers.forEach(function (customer) {
                const tr = $("<tr></tr>");
                const idTd = $("<td></td>").text(customer.id_user);
                const nameTd = $("<td></td>").text(customer.name);
                const emailTd = $("<td></td>").text(customer.email);
                const phoneTd = $("<td></td>").text(customer.phone_number);
    
                const actionTd = $("<td></td>");
                const actionDiv = $("<div class='action-buttons'></div>");
    
                const editBtn = $("<button class='action-button edit-button' title='Chỉnh sửa'><i class='fas fa-edit'></i></button>");
                editBtn.data("id", customer.id_user);
    
                const deleteBtn = $("<button class='action-button delete-button' title='Xóa'><i class='fas fa-trash-alt'></i></button>");
                deleteBtn.data("id", customer.id_user);
    
                actionDiv.append(editBtn, deleteBtn);
                actionTd.append(actionDiv);
    
                tr.append(idTd, nameTd, emailTd, phoneTd, actionTd);
                tbody.append(tr);
            });
            
            // Cập nhật thông tin phân trang cho kết quả tìm kiếm
            $('#page-summary').text(`Hiển thị ${filteredCustomers.length} kết quả tìm kiếm`);
            $('#pagination-numbers').empty();
            $('.prev-page, .next-page').prop('disabled', true);
        } else {
            // Nếu không có từ khóa, hiển thị lại toàn bộ danh sách có phân trang
            renderCustomers();
            updatePaginationControls();
        }
    });

    // Thêm khách hàng mới
    $(".add-button").on("click", function () {
        $("#addCustomerModal").fadeIn();
    });

    // Đóng modal thêm khách hàng
    $("#cancelAddCustomer").on("click", function () {
        $("#addCustomerModal").fadeOut();
    });

    // Xử lý form thêm khách hàng
    $("#addCustomerForm").on("submit", function (e) {
        e.preventDefault();
        const data = {
            name: $("#customerName").val(),
            email: $("#customerEmail").val(),
            phone_number: $("#customerPhone").val(),
            password: $("#password").val()
        };

        $.ajax({
            url: "http://localhost:8000/user/",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function () {
                alert("Thêm khách hàng thành công!");
                $("#addCustomerModal").fadeOut();
                setTimeout(() => location.reload(), 1000);
            },
            error: function (xhr, status, error) {
                console.error("Lỗi thêm khách hàng:", error);
                alert("Không thể thêm khách hàng. Vui lòng thử lại!");
            }
        });
    });

    // Mở modal chỉnh sửa khách hàng
    $(document).on("click", ".edit-button", function () {
        const customerId = $(this).data("id");
        
        // Tìm thông tin khách hàng từ danh sách đã có
        const customer = allCustomers.find(c => c.id_user === customerId);
        
        if (customer) {
            $("#editCustomerName").val(customer.name);
            $("#editCustomerEmail").val(customer.email);
            $("#editCustomerPhone").val(customer.phone_number);
        }
        
        // Lưu ID khách hàng đang chỉnh sửa vào nút lưu
        $("#editCustomerForm").data("id", customerId);
        
        $("#editCustomerModal").fadeIn();
    });

    // Đóng modal chỉnh sửa khách hàng
    $("#cancelEditCustomer").on("click", function () {
        $("#editCustomerModal").fadeOut();
    });

    // Xử lý form cập nhật khách hàng
    $("#editCustomerForm").on("submit", function (e) {
        e.preventDefault();
        const customerId = $(this).data("id");
        const data = {
            name: $("#editCustomerName").val(),
            email: $("#editCustomerEmail").val(),
            phone_number: $("#editCustomerPhone").val()
        };

        $.ajax({
            url: `http://localhost:8000/user/${parseInt(customerId)}`,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function () {
                alert("Cập nhật thông tin khách hàng thành công!");
                $("#editCustomerModal").fadeOut();
                
                // Cập nhật lại dữ liệu trong danh sách thay vì tải lại trang
                const index = allCustomers.findIndex(c => c.id_user === customerId);
                if (index !== -1) {
                    allCustomers[index] = { ...allCustomers[index], ...data };
                    renderCustomers();
                    updatePaginationControls();
                } else {
                    setTimeout(() => location.reload(), 1000);
                }
            },
            error: function (xhr, status, error) {
                console.error("Lỗi cập nhật khách hàng:", error);
                alert("Không thể cập nhật khách hàng. Vui lòng thử lại!");
            }
        });
    });
    
    // Xóa khách hàng
    $(document).on("click", ".delete-button", function () {
        const customerId = $(this).data("id");
        if (!confirm("Bạn có chắc chắn muốn xoá khách hàng này?")) return;
        $.ajax({
            url:`http://localhost:8000/user/${parseInt(customerId)}`,
            type:"DELETE",
            success: function () {
                alert("Đã xóa khách hàng thành công");
                
                // Cập nhật lại dữ liệu trong danh sách thay vì tải lại trang
                allCustomers = allCustomers.filter(c => c.id_user !== customerId);
                totalCustomers = allCustomers.length;
                
                // Kiểm tra nếu trang hiện tại không còn dữ liệu thì quay về trang trước đó
                const totalPages = Math.ceil(totalCustomers / pageSize);
                if (currentPage > totalPages && currentPage > 1) {
                    currentPage--;
                }
                
                renderCustomers();
                updatePaginationControls();
            },
            error:function (xhr,status,error) {
                console.error("Lỗi xóa khách hàng:", error);
                alert("Không thể xóa khách hàng. Vui lòng thử lại!");
            }
        });
    });
});