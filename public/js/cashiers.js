$(async () => {

    let allUsers = [];
    let cashiers = [];
    let filteredCashiers = [];
    let currentPage = 1;
    const usersPerPage = 10; // Set users per page
    let totalPages = 1;

    // Fetch users from the server
    async function fetchUsers() {
        try {
            const response = await $.get("/a/user/web/list");
            allUsers = response.user_listing.rows;
            console.log('Fetched users:', allUsers);

            // Filter users where user_type is 'cashier'
            cashiers = allUsers.filter(user => user.user_type === 'cashier');
            console.log('Filtered cashiers:', cashiers);

            // Set filtered cashiers initially to all cashiers
            filteredCashiers = cashiers;

            // Calculate total pages
            totalPages = Math.ceil(filteredCashiers.length / usersPerPage);
            $('.total-pages').text(totalPages);

            // Display the first page of users
            updateOutletTable();
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    // Update the table with the current page of filtered cashiers
    function updateOutletTable() {
        const $tbody = $('.data-list tbody');
        $tbody.empty();

        // Determine the start and end indices for the current page
        const startIndex = (currentPage - 1) * usersPerPage;
        const endIndex = Math.min(startIndex + usersPerPage, filteredCashiers.length);

        // Display the users for the current page
        filteredCashiers.slice(startIndex, endIndex).forEach((user, index) => {
            let billingAddress = formatBillingAddress(user);

            let row = `
                <tr class="data">
                    <td>${startIndex + index + 1}</td>
                    <td>${user.id || ''}</td>
                    <td>${user.email || ''}</td>
                    <td>${user.name || ''}</td>
                    <td>${billingAddress}</td>
                    <td>${user.last_login_at || ''}</td>
                    <td>
                        <label class="switch">
                            <input type="checkbox" class="toggle-status" data-user-id="${user.id}" ${user.active ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </td>
                    <td>${user.created_at || ''}</td>
                    <td>${user.created_by || ''}</td>
                </tr>`;

            $tbody.append(row);
        });

        // Update the current page in the paginator
        $('.current-page').val(currentPage);
    }

    async function updateCashierStatus(userId, isActive) {
        try {
            const response = await $.ajax({
                url: `/a/user/web/activateCashier/${userId}`,
                method: 'PUT',
                data: { active: isActive }, 
                success: function(data) {
                    console.log('User status updated:', data);
                    // Optionally show a success message or toast
                },
                error: function(xhr) {
                    console.error('Error updating user status:', xhr.responseText);
                    // Revert the checkbox if the request fails
                    $(`input[data-user-id="${userId}"]`).prop('checked', !isActive);
                    // Optionally show an error message to the user
                }
            });
        } catch (error) {
            console.error('Error occurred while updating user status:', error);
            // Revert the checkbox if the update fails
            $(`input[data-user-id="${userId}"]`).prop('checked', !isActive);
        }
    }

    function showConfirmationModal(message, onConfirm) {
        $('#confirmationModal .modal-message').text(message);
        $('#confirmationModal').fadeIn().css('display', 'flex');  // Show the modal with flexbox for centering

        $('#confirmBtn').off('click').on('click', function () {
            $('#confirmationModal').fadeOut();
            onConfirm(true);
        });

        $('#cancelBtn').off('click').on('click', function () {
            $('#confirmationModal').fadeOut();
            onConfirm(false);
        });
    }
    $(document).on('change', '.toggle-status', function () {
        const userId = $(this).data('user-id');
        const isActive = $(this).is(':checked');

        const confirmationMessage = isActive
            ? 'Are you sure you want to activate this user account?'
            : 'Are you sure you want to deactivate this user account?';

        showConfirmationModal(confirmationMessage, function (confirmed) {
            if (confirmed) {
                updateCashierStatus(userId, isActive);
            } else {
                $(`input[data-user-id="${userId}"]`).prop('checked', !isActive);
            }
        });
    });

    // Helper function to format billing address
    function formatBillingAddress(user) {
        let addressParts = [
            user.address1,
            user.address2,
            user.address3,
            user.postcode,
            user.city,
            user.state
        ];

        return addressParts.filter(part => part).join(', ');
    }

    // Handle pagination controls
    $('.prev').click(() => {
        if (currentPage > 1) {
            currentPage--;
            updateOutletTable();
        }
    });

    $('.next').click(() => {
        if (currentPage < totalPages) {
            currentPage++;
            updateOutletTable();
        }
    });

    // Handle manual page input
    $('.current-page').on('change', function () {
        const inputPage = parseInt($(this).val(), 10);
        if (inputPage >= 1 && inputPage <= totalPages) {
            currentPage = inputPage;
            updateOutletTable();
        } else {
            $(this).val(currentPage); // Reset to current page if invalid
        }
    });

    // Search functionality: filter users by ID, Email, or Name
    $('.search').on('input', function () {
        const query = $(this).val().toLowerCase();

        // Filter based on ID, Email, or Name
        filteredCashiers = cashiers.filter(user => {
            return (
                user.id.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                user.name.toLowerCase().includes(query)
            );
        });

        // Reset to page 1 and update the table
        currentPage = 1;
        totalPages = Math.ceil(filteredCashiers.length / usersPerPage);
        $('.total-pages').text(totalPages);
        updateOutletTable();
    });

    // Fetch users and update the table on page load
    await fetchUsers();
});
