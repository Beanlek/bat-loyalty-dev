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
                allUserAccounts = response; // Assuming this is where you store user account data
                console.log('Fetched user accounts:', allUserAccounts);
                showUserOutlets(); // Call function to process user accounts after fetching
            }
        } catch (error) {
            console.error('Error fetching user accounts:', error);
        }
    }

    function showUserOutlets() {
        cashiers = []; // Clear the array before populating it again
        // Filter user accounts where outlet_id matches outletId
        const matchingUserAccounts = allUserAccounts.filter(userAccount => userAccount.outlet_id === outletId);
        
        // For each matching user account, find the corresponding user and check if they are a cashier
        matchingUserAccounts.forEach(userAccount => {
            const matchedUser = allUsers.find(user => user.id === userAccount.user_id);
            if (matchedUser) {
                cashiers.push(matchedUser);
            }
        });
        console.log('Filtered users:', cashiers);
        updateOutletTable();
    }

    function updateOutletTable() {
        const $tbody = $('.data-list tbody');
        $tbody.empty();

        cashiers.forEach((user, index) => {
            let billingAddress = formatBillingAddress(user);

            let row = `
                <tr class="data">
                    <td>${index + 1}</td>
                    <td>${user.id || ''}</td>
                    <td>${user.email || ''}</td>
                    <td>${user.name || ''}</td>
                    <td>${billingAddress}</td>
                    <td>${user.last_login_at || ''}</td>
                    <td>${user.active ? 'Active' : 'Inactive'}</td>
                    <td>${user.created_at || ''}</td>
                    <td>${user.created_by || ''}</td>
                </tr>`;

            $tbody.append(row);
        });
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

    // Fetch users and user accounts on page load
    await fetchUsers();
    await fetchUserAccounts();
});
