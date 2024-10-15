$(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    let accountId = urlParams.get('accountId');
    let accountName = decodeURIComponent(urlParams.get('accountName'));
    let outletId = urlParams.get('outletId'); // Assuming outletId comes from the URL

    // Retrieve account details from localStorage if not provided in URL
    if (!accountId || accountId === 'null' || !accountName || accountName === 'null') {
        accountId = localStorage.getItem('accountId');
        accountName = localStorage.getItem('accountName');
    }

    console.log('accountId:', accountId);
    console.log('accountName:', accountName);
    console.log('outletId:', outletId); // Log the outletId for debugging

    $('#userName').text(accountName); // Display the accountName
    $('#outletBreadcrumb').attr('href', `/outlets?accountId=${accountId}&accountName=${encodeURIComponent(accountName)}`);

    let allOutlets = [];
    let userOutlets = [];

    // Update the Create Outlet button click event to include outletId in the URL
    $('#create-outlet-btn').on('click', () => {
        let createOutletUrl = `/create_outlet?accountId=${accountId}&accountName=${encodeURIComponent(accountName)}`;
        
        // Include outletId in the URL if it exists
        if (outletId) {
            createOutletUrl += `&outletId=${outletId}`;
        }

        window.location.href = createOutletUrl; // Redirect to the create outlet page with all parameters
    });

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
            let outletLink = `<a href="/cashier?OutletId=${outlet.id}&accountId=${accountId}&accountName=${encodeURIComponent(accountName)}" class="view-link">View</a>`;
    
            let row = `
                <tr class="data">
                    <td>${index + 1}</td>
                    <td>${outlet.id || ''}</td>
                    <td>${outlet.name || ''}</td>
                    <td>${billingAddress}</td>
                    <td>
                        <label class="switch">
                            <input type="checkbox" class="toggle-status" data-outlet-id="${outlet.id}" ${outlet.active ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </td>
                    <td>${outlet.created_at || ''}</td>
                    <td>${outlet.created_by || ''}</td>
                    <td>${outletLink}</td>
                </tr>`;
    
            $tbody.append(row);
        });
    }

    async function updateOutletStatus(outletId, isActive) {
        try {
            const response = await $.ajax({
                url: `/a/outlet/web/activate/${outletId}`,
                method: 'PUT',
                data: { active: isActive }, 
                success: function(data) {
                    console.log('Outlet status updated:', data);
                    // Optionally show a success message or toast
                },
                error: function(xhr) {
                    console.error('Error updating Outlet status:', xhr.responseText);
                    // Revert the checkbox if the request fails
                    $(`input[data-outlet-id="${outletId}"]`).prop('checked', !isActive);
                    // Optionally show an error message to the user
                }
            });
        } catch (error) {
            console.error('Error occurred while updating outlet status:', error);
            // Revert the checkbox if the update fails
            $(`input[data-outlet-id="${outletId}"]`).prop('checked', !isActive);
        }
    }
    
    function showConfirmationModal(message, onConfirm) {
        $('#confirmationModal .modal-message').text(message);
        $('#confirmationModal').fadeIn().css('display', 'flex');  // Show the modal with flexbox for centering

        $('#confirmBtn').off('click').on('click', function () {
            $('#confirmationModal').fadeOut();
            onConfirm(true);  // Proceed with the confirmation
        });

        $('#cancelBtn').off('click').on('click', function () {
            $('#confirmationModal').fadeOut();
            onConfirm(false);  // Cancel the confirmation
        });
    }
    $(document).on('change', '.toggle-status', function () {
        const outletId = $(this).data('outlet-id');
        const isActive = $(this).is(':checked'); // Capture current state of the checkbox

        const confirmationMessage = isActive
            ? 'Are you sure you want to activate this Outlet?'
            : 'Are you sure you want to deactivate this Outlet?';

        showConfirmationModal(confirmationMessage, function (confirmed) {
            if (confirmed) {
                updateOutletStatus(outletId, isActive);
            } else {
                // Revert checkbox state if the action is canceled
                $(`input[data-outlet-id="${outletId}"]`).prop('checked', !isActive);
            }
        });
    });

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
