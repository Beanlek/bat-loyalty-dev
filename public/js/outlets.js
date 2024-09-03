$(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const accountId = urlParams.get('accountId');
    const accountName = decodeURIComponent(urlParams.get('accountName'));

    $('#userName').text(accountName); // Display the accountName

    let allOutlets = [];
    let userOutlets = [];

    async function fetchOutlets() {
        try {
            const response = await $.get("/a/outlet/web/list");
            allOutlets = response;
            console.log('Fetched all outlets:', allOutlets);

            // Filter and show outlets on initial load
            showUserOutlets();
        } catch (error) {
            console.error('Error fetching outlets:', error);
        }
    }

    function showUserOutlets() {
        // Filter outlets where account_id matches accountId
        userOutlets = allOutlets.filter(outlet => outlet.account_id === accountId);
        
        console.log('Filtered user outlets:', userOutlets);
        updateOutletTable(userOutlets); // Update table with filtered outlets
    }

    function updateOutletTable(outlets) {
        const $tbody = $('.data-list tbody');
        $tbody.empty();

        outlets.forEach((outlet, index) => {
            let billingAddress = formatBillingAddress(outlet);
            let outletLink = `<a href="/cashier?OutletId=${outlet.id}" class="view-link">View</a>`;

            let row = `
                <tr class="data">
                    <td>${index + 1}</td>
                    <td>${outlet.id || ''}</td>
                    <td>${outlet.name || ''}</td>
                    <td>${billingAddress}</td>
                    <td>${outlet.active ? 'Active' : 'Inactive'}</td>
                    <td>${outlet.created_at || ''}</td>
                    <td>${outlet.created_by || ''}</td>
                    <td>${outletLink}</td>
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

    await fetchOutlets(); // Fetch outlets on page load
});
