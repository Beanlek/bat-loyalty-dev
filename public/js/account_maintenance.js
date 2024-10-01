$(async () => {
    let allAccounts = [];
    let currentPage = 1;
    const usersPerPage = 10;
    let totalPages = 1;

    // Fetch the accounts data from the server
    async function fetchUsers() {
        try {
            $('.loading-indicator').show();
            const response = await $.get("/a/account/web/list"); // Ensure this endpoint returns accounts with status info
            if (Array.isArray(response)) {
                allAccounts = response;
                console.log('Fetched users:', allAccounts);
                totalPages = Math.ceil(allAccounts.length / usersPerPage);
                filterAndUpdateTable(); // Initial load after fetching
            } else {
                console.error('Unexpected response structure:', response);
            }
        } catch (error) {
            console.error('Error fetching account:', error);
        } finally {
            $('.loading-indicator').hide();
        }
    }

    // Initial fetch on page load
    await fetchUsers();

    $('#create-account-btn').on('click', () => {
        window.location.href = '/create_account';
    });

    // Search input event listener
    $('input.search').on('input', function () {
        currentPage = 1;
        filterAndUpdateTable();
    });

    // Account status filter event listener
    $('#account_status').on('change', function () {
        currentPage = 1;
        filterAndUpdateTable();
    });

    // Pagination event listeners
    $('.prev').on('click', () => changePage(-1));
    $('.next').on('click', () => changePage(1));
    $('.current-page').on('change', goToPage);

    // Function to filter and update the table based on search and account status
    function filterAndUpdateTable() {
        let filteredAccounts = allAccounts;

        // Apply search filter by ID or Name
        const searchQuery = $('input.search').val().toLowerCase();
        if (searchQuery) {
            filteredAccounts = searchUsers(filteredAccounts, searchQuery);
        }

        // Apply account status filter
        const accountStatus = $('#account_status').val();
        if (accountStatus !== 'all') {
            filteredAccounts = filteredAccounts.filter(account => {
                return accountStatus === 'active' ? account.active : !account.active;
            });
        }

        // Update pagination details
        totalPages = Math.ceil(filteredAccounts.length / usersPerPage);
        updateTable(filteredAccounts);
        updatePagination();
    }

    // Helper function to search by ID or Name
    function searchUsers(accounts, query) {
        return accounts.filter(account => {
            return (account.id && account.id.toLowerCase().includes(query)) ||
                   (account.name && account.name.toLowerCase().includes(query));
        });
    }

    // Function to update the table with filtered accounts
    function updateTable(accounts) {
        const $tbody = $('.data-list tbody');
        $tbody.empty();
    
        const start = (currentPage - 1) * usersPerPage;
        const end = start + usersPerPage;
        const paginatedUsers = accounts.slice(start, end);
    
        paginatedUsers.forEach((account, index) => {
            let outletLink = `<a href="/outlets?accountId=${account.id}&accountName=${encodeURIComponent(account.name)}" class="view-link">View</a>`;
    
            let row = `
                <tr class="data">
                    <td>${start + index + 1}</td>
                    <td>${account.id || ''}</td>
                    <td>${account.name || ''}</td>
                    <td>
                        <label class="switch">
                            <input type="checkbox" class="toggle-status" data-account-id="${account.id}" ${account.active ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </td>
                    <td>${account.created_at || ''}</td>
                    <td>${account.created_by || ''}</td>
                    <td>${outletLink}</td>
                </tr>`;
    
            $tbody.append(row);
        });
    }

    // Function to handle pagination changes
    function updatePagination() {
        $('.current-page').val(currentPage);
        $('.total-pages').text(`of ${totalPages}`);
        $('.prev').prop('disabled', currentPage === 1);
        $('.next').prop('disabled', currentPage === totalPages);
    }

    // Function to change the page
    function changePage(delta) {
        currentPage += delta;
        if (currentPage < 1) currentPage = 1;
        if (currentPage > totalPages) currentPage = totalPages;
        filterAndUpdateTable();
    }

    // Function to jump to a specific page
    function goToPage() {
        const newPage = parseInt($('.current-page').val());
        if (newPage >= 1 && newPage <= totalPages) {
            currentPage = newPage;
            filterAndUpdateTable();
        } else {
            $('.current-page').val(currentPage); // Reset to current page if out of range
        }
    }

    // Update user status (activate/deactivate)
    async function updateUserStatus(accountId, isActive) {
        try {
            const response = await $.ajax({
                url: `/a/account/web/activate/${accountId}`,
                method: 'PUT',
                data: { active: isActive },
                success: function(data) {
                    console.log('Account status updated:', data);
                },
                error: function(xhr) {
                    console.error('Error updating account status:', xhr.responseText);
                    $(`input[data-account-id="${accountId}"]`).prop('checked', !isActive); // Revert the toggle
                }
            });
        } catch (error) {
            console.error('Error occurred while updating account status:', error);
            $(`input[data-account-id="${accountId}"]`).prop('checked', !isActive); // Revert the toggle
        }
    }

    // Handle status change toggle with confirmation
    $(document).on('change', '.toggle-status', function () {
        const accountId = $(this).data('account-id');
        const isActive = $(this).is(':checked');

        const confirmationMessage = isActive
            ? 'Are you sure you want to activate this account?'
            : 'Are you sure you want to deactivate this account?';

        showConfirmationModal(confirmationMessage, function (confirmed) {
            if (confirmed) {
                updateUserStatus(accountId, isActive);
            } else {
                $(`input[data-account-id="${accountId}"]`).prop('checked', !isActive); // Revert the toggle
            }
        });
    });

    // Function to show confirmation modal
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

});
