$(async () => {
    let allAccounts = [];
    let currentPage = 1;
    const usersPerPage = 10;
    let totalPages = 1;

    async function fetchUsers() {
        try {
            $('.loading-indicator').show();
            const response = await $.get("/a/account/web/list");
            if (Array.isArray(response)) {
                allAccounts = response;
                console.log('Fetched users:', allAccounts);
                totalPages = Math.ceil(allAccounts.length / usersPerPage);
                updateTable(allAccounts);
                updatePagination();
            } else {
                console.error('Unexpected response structure:', response);
            }
        } catch (error) {
            console.error('Error fetching account:', error);
        } finally {
            $('.loading-indicator').hide();
        }
    }

    await fetchUsers();

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
        let filteredAccounts = allAccounts;

        const searchQuery = $('input.search').val().toLowerCase();
        if (searchQuery) {
            filteredAccounts = searchUsers(filteredAccounts, searchQuery);
        }

        totalPages = Math.ceil(filteredAccounts.length / usersPerPage);
        updateTable(filteredAccounts);
        updatePagination();
    }

    function searchUsers(accounts, query) {
        return accounts.filter(account => {
            return (account.id && account.id.toLowerCase().includes(query)) ||
                (account.name && account.name.toLowerCase().includes(query));
        });
    }

    function updateTable(accounts) {
        const $tbody = $('.data-list tbody');
        $tbody.empty();
    
        const start = (currentPage - 1) * usersPerPage;
        const end = start + usersPerPage;
        const paginatedUsers = accounts.slice(start, end);
    
        paginatedUsers.forEach((account, index) => {
    
            let outletLink = `<a href="/outlets?accountId=${account.id}&accountName=${encodeURIComponent(account.name)}" class="view-link">View</a>`;
    
            let row =
                `<tr class="data">
                    <td>${start + index + 1}</td>
                    <td>${account.id || ''}</td>
                    <td>${account.name || ''}</td>
                    <td>${account.active ? 'Active' : 'Inactive'}</td>
                    <td>${account.created_at || ''}</td>
                    <td>${account.created_by || ''}</td>
                    <td>${outletLink}</td>
                </tr>`;
    
            $tbody.append(row);
        });
    
        updatePagination();
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
