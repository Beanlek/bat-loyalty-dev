$(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const userName = decodeURIComponent(urlParams.get('userName'));

    $('#userName').text(userName); // Assuming you have an element with id="userName" to display the userName

    let allUserAccounts = [];
    let allOutlets = [];
    let userOutlets = [];

    async function fetchUserAccounts() {
        try {
            const response = await $.get("/a/user_account/web/list");
            allUserAccounts = response;
            console.log('Fetched user accounts:', allUserAccounts);
            filterUserOutlets();
        } catch (error) {
            console.error('Error fetching user accounts:', error);
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

    function filterUserOutlets() {
        console.log(userId);
        userOutlets = []; // Clear the array before populating it again

        // Filter all user accounts for the current userId
        const matchingUserAccounts = allUserAccounts.filter(account => account.user_id === userId);

        // Iterate through each matching user account and find the corresponding outlet
        matchingUserAccounts.forEach(userAccount => {
            const matchedOutlet = allOutlets.find(outlet => outlet.id === userAccount.outlet_id);
            if (matchedOutlet) {
                userOutlets.push(matchedOutlet);
            }
        });

        console.log('Filtered user outlets:', userOutlets);
        updateOutletTable(userOutlets);
    }

    function updateOutletTable(outlets) {
        const $tbody = $('.data-list tbody');
        $tbody.empty();

        outlets.forEach((outlet, index) => {
            let billingAddress = formatBillingAddress(outlet);

            let row =
                `<tr class="data">
                    <td>${index + 1}</td>
                    <td>${outlet.id || ''}</td>
                    <td>${outlet.name || ''}</td>
                    <td>${billingAddress}</td>
                    <td>${outlet.active ? 'Active' : 'Inactive'}</td>
                    <td>${outlet.created_at || ''}</td>
                    <td>${outlet.created_by || ''}</td>
                </tr>`;

            $tbody.append(row);
        });
    }

    function formatBillingAddress(outlet) {
        let addressParts = [
            outlet.address1,
            outlet.address2,
            outlet.address3,
            outlet.postcode,
            outlet.city,
            outlet.state
        ];

        return addressParts.filter(part => part).join(', ');
    }

    // Event listener for search input
    $('.searchbar input.search').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        const filteredOutlets = userOutlets.filter(outlet => {
            const idMatch = outlet.id.toLowerCase().includes(searchTerm);
            const nameMatch = outlet.name.toLowerCase().includes(searchTerm);
            const addressMatch = formatBillingAddress(outlet).toLowerCase().includes(searchTerm);
            return idMatch || nameMatch || addressMatch;
        });
        updateOutletTable(filteredOutlets);
    });

    await fetchOutlets();
    await fetchUserAccounts();
});
