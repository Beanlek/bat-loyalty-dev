$(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const outletId = urlParams.get('outletId');
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
                    <td>
                        <label class="switch">
                            <input type="checkbox" class="toggle-status" data-outlet-id="${outlet.id}" ${outlet.active ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </td>
                    <td>${outlet.created_at || ''}</td>
                    <td>${outlet.created_by || ''}</td>
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

    await fetchOutlets();
    await fetchUserAccounts();
});
