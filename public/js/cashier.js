$(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const outletId = urlParams.get('OutletId');
    const accountId = urlParams.get('accountId');
    const accountName = decodeURIComponent(urlParams.get('accountName'));

    $('#cashierBreadcrumb').attr('href', `/cashier?OutletId=${outletId}&accountId=${accountId}&accountName=${encodeURIComponent(accountName)}`);
    $('#outletBreadcrumb').attr('href', `/outlets?accountId=${accountId}&accountName=${encodeURIComponent(accountName)}`);
    
    let allUsers = [];
    let allUserAccounts = [];
    let cashiers = [];
    let currentPage = 1;
    const usersPerPage = 10; // Limit 10 users per page
    let filteredCashiers = [];

    async function fetchUsers() {
        try {
            const response = await $.get("/a/user/web/list");
            allUsers = response.user_listing.rows;
            console.log('Fetched users:', allUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    async function fetchUserAccounts() {
        try {
            const response = await $.get("/a/user_account/web/list");
            if (Array.isArray(response)) {
                allUserAccounts = response;
                console.log('Fetched user accounts:', allUserAccounts);
                showUserOutlets(); // Process user accounts after fetching
            }
        } catch (error) {
            console.error('Error fetching user accounts:', error);
        }
    }

    function showUserOutlets() {
        cashiers = [];
        const matchingUserAccounts = allUserAccounts.filter(userAccount => userAccount.outlet_id === outletId);

        matchingUserAccounts.forEach(userAccount => {
            const matchedUser = allUsers.find(user => user.id === userAccount.user_id);
            if (matchedUser) {
                cashiers.push(matchedUser);
            }
        });
        console.log('Filtered users:', cashiers);
        filteredCashiers = [...cashiers]; // Initialize with full list for search
        updateOutletTable();
    }

    function updateOutletTable() {
        const $tbody = $('.data-list tbody');
        $tbody.empty();
        
        // Calculate the starting and ending indices for pagination
        const start = (currentPage - 1) * usersPerPage;
        const end = start + usersPerPage;
        const paginatedUsers = filteredCashiers.slice(start, end); // Get users for current page

        paginatedUsers.forEach((user, index) => {
            let billingAddress = formatBillingAddress(user);
            let row = `
                <tr class="data">
                    <td>${start + index + 1}</td>
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

        // Update pagination display
        $('.current-page').val(currentPage);
        const totalPages = Math.ceil(filteredCashiers.length / usersPerPage);
        $('.total-pages').text(`of ${totalPages}`);
    }

    async function updateCashierStatus(userId, isActive) {
        try {
            const response = await $.ajax({
                url: `/a/user/web/activateCashier/${userId}`,
                method: 'PUT',
                data: { active: isActive }, 
                success: function(data) {
                    console.log('User status updated:', data);
                },
                error: function(xhr) {
                    console.error('Error updating user status:', xhr.responseText);
                    $(`input[data-user-id="${userId}"]`).prop('checked', !isActive); // Revert checkbox
                }
            });
        } catch (error) {
            console.error('Error occurred while updating user status:', error);
            $(`input[data-user-id="${userId}"]`).prop('checked', !isActive);
        }
    }

    function showConfirmationModal(message, onConfirm) {
        $('#confirmationModal .modal-message').text(message);
        $('#confirmationModal').fadeIn().css('display', 'flex');
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

    // Search functionality
    $('.searchbar input.search').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        filteredCashiers = cashiers.filter(user => {
            const idMatch = user.id.toLowerCase().includes(searchTerm);
            const nameMatch = user.name.toLowerCase().includes(searchTerm);
            const addressMatch = formatBillingAddress(user).toLowerCase().includes(searchTerm);
            return idMatch || nameMatch || addressMatch;
        });
        currentPage = 1; // Reset to first page on new search
        updateOutletTable();
    });

    // Pagination controls
    $('.prev').click(() => {
        if (currentPage > 1) {
            currentPage--;
            updateOutletTable();
        }
    });

    $('.next').click(() => {
        const totalPages = Math.ceil(filteredCashiers.length / usersPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            updateOutletTable();
        }
    });

    await fetchUsers();
    await fetchUserAccounts();
});
