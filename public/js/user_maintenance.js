$(async () => {
    let user_type = new Dropdown({ id: '#user_type' });
    let time = new Dropdown({ id: '#time' });

    let allUsers = [];
    let allOutlets = [];
    let allUserAccount = []; // Assuming this is where you store user account data
    let currentPage = 1;
    const usersPerPage = 10;
    let totalPages = 1;

    async function fetchUsers() {
        try {
            $('.loading-indicator').show();
            const response = await $.get("/a/user/web/list");
            allUsers = response.user_listing.rows;
            console.log('Fetched users:', allUsers);
            totalPages = Math.ceil(allUsers.length / usersPerPage);
            filterAndUpdateTable();
            $('.loading-indicator').hide();
        } catch (error) {
            console.error('Error fetching users:', error);
            $('.loading-indicator').hide();
        }
    }

    async function fetchOutlets() {
        try {
            const response = await $.get("/a/outlet/web/list");
            allOutlets = response;
            console.log('Fetched outlets:', allOutlets);
        } catch (error) {
            console.error('Error fetching outlets:', error);
        }
    }

    async function fetchUserAccounts() {
        try {
            const response = await $.get("/a/user_account/web/list");
            allUserAccount = response; // Assuming this is where you store user account data
            console.log('Fetched user accounts:', allUserAccount);
        } catch (error) {
            console.error('Error fetching user accounts:', error);
        }
    }

    await fetchUsers();
    await fetchOutlets();
    await fetchUserAccounts();

    $('#user_type').on('change', function () {
        currentPage = 1;
        filterAndUpdateTable();
    });

    $('#time').on('change', function () {
        currentPage = 1;
        filterAndUpdateTable();
    });

    $('input.search').on('input', function () {
        currentPage = 1;
        filterAndUpdateTable();
    });

    $('.prev').on('click', () => changePage(-1));
    $('.next').on('click', () => changePage(1));
    $('.current-page').on('change', goToPage);

    $(document).on('click', '.view-link', function (e) {
        e.preventDefault();
        const href = $(this).attr('href');
        window.location.href = href;
    });

    function filterAndUpdateTable() {
        let filteredUsers = allUsers;

        const selectedUserType = $('#user_type').val();
        if (selectedUserType !== 'all') {
            filteredUsers = filteredUsers.filter(user => user.user_type === selectedUserType);
        }

        const selectedTime = $('#time').val();
        filteredUsers = filterUsersByTime(filteredUsers, selectedTime);

        const searchQuery = $('input.search').val().toLowerCase();
        if (searchQuery) {
            filteredUsers = searchUsers(filteredUsers, searchQuery);
        }

        totalPages = Math.ceil(filteredUsers.length / usersPerPage);
        updateTable(filteredUsers);
        updatePagination();
    }

    function filterUsersByTime(users, timeFilter) {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        switch (timeFilter) {
            case 'today':
                return users.filter(user => new Date(user.created_at) >= startOfDay);
            case 'week-to-date':
                return users.filter(user => new Date(user.created_at) >= startOfWeek);
            case 'month-to-date':
                return users.filter(user => new Date(user.created_at) >= startOfMonth);
            case 'year-to-date':
                return users.filter(user => new Date(user.created_at) >= startOfYear);
            default:
                return users;
        }
    }

    function searchUsers(users, query) {
        return users.filter(user => {
            return (user.id && user.id.toLowerCase().includes(query)) ||
                (user.name && user.name.toLowerCase().includes(query)) ||
                (user.email && user.email.toLowerCase().includes(query));
        });
    }

    function updateTable(users) {
        const $tbody = $('.data-list tbody');
        $tbody.empty();
    
        const start = (currentPage - 1) * usersPerPage;
        const end = start + usersPerPage;
        const paginatedUsers = users.slice(start, end);
    
        paginatedUsers.forEach((user, index) => {
            let billingAddress = formatBillingAddress(user);
    
            // Generate outlet link based on user's ID
            let outletLink = `<a href="/outlet?userId=${user.id}&userName=${encodeURIComponent(user.name)}" class="view-link">View</a>`;
    
            let row =
                `<tr class="data">
                    <td>${start + index + 1}</td>
                    <td>${user.id || ''}</td>
                    <td>${user.name || ''}</td>
                    <td>${user.email || ''}</td>
                    <td>${billingAddress}</td>
                    <td>${user.last_login_at || ''}</td>
                    <td>${user.active ? 'Active' : 'Inactive'}</td>
                    <td>${user.created_at || ''}</td>
                    <td>${user.created_by || ''}</td>
                    <td>${outletLink}</td>
                </tr>`;
    
            $tbody.append(row);
        });
    
        updatePagination();
    }    

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

    function updatePagination() {
        $('.current-page').val(currentPage);
        $('.total-pages').text(`of ${totalPages}`);
        $('.prev').prop('disabled', currentPage === 1);
        $('.next').prop('disabled', currentPage === totalPages);
    }

    function changePage(delta) {
        currentPage += delta;
        if (currentPage < 1) currentPage = 1;
        if (currentPage > totalPages) currentPage = totalPages;
        filterAndUpdateTable();
    }

    function goToPage() {
        const newPage = parseInt($('.current-page').val());
        if (newPage >= 1 && newPage <= totalPages) {
            currentPage = newPage;
            filterAndUpdateTable();
        } else {
            $('.current-page').val(currentPage);
        }
    }

});
