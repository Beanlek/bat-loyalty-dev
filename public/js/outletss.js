$(async () => {

    let allOutlets = [];
    let filteredOutlets = [];
    let currentPage = 1;
    const outletsPerPage = 10; // Number of outlets per page
    let totalPages = 1;

    // Fetch all outlets from the server
    async function fetchOutlets() {
        try {
            const response = await $.get("/a/outlet/web/list");
            allOutlets = response;
            console.log('Fetched all outlets:', allOutlets);

            // Initially set filteredOutlets to all outlets
            filteredOutlets = allOutlets;

            // Calculate total pages and update table
            totalPages = Math.ceil(filteredOutlets.length / outletsPerPage);
            $('.total-pages').text(totalPages);

            // Show the first page of outlets
            updateOutletTable();
        } catch (error) {
            console.error('Error fetching outlets:', error);
        }
    }

    // Update the table with outlets for the current page
    function updateOutletTable() {
        const $tbody = $('.data-list tbody');
        $tbody.empty();

        // Calculate the range of outlets to show for the current page
        const startIndex = (currentPage - 1) * outletsPerPage;
        const endIndex = Math.min(startIndex + outletsPerPage, filteredOutlets.length);

        filteredOutlets.slice(startIndex, endIndex).forEach((outlet, index) => {
            let billingAddress = formatBillingAddress(outlet);
            let row = `
                <tr class="data">
                    <td>${startIndex + index + 1}</td>
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

        // Update the current page input
        $('.current-page').val(currentPage);
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

    // Helper function to format billing address
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

    // Search functionality: filter outlets by ID, Name, or Address
    $('.search').on('input', function () {
        const query = $(this).val().toLowerCase();

        // Filter based on ID, Name, or Address
        filteredOutlets = allOutlets.filter(outlet => {
            return (
                outlet.id.toLowerCase().includes(query) ||
                outlet.name.toLowerCase().includes(query) ||
                formatBillingAddress(outlet).toLowerCase().includes(query)
            );
        });

        // Reset to page 1 and update the table
        currentPage = 1;
        totalPages = Math.ceil(filteredOutlets.length / outletsPerPage);
        $('.total-pages').text(totalPages);
        updateOutletTable();
    });

    // Handle pagination: previous page
    $('.prev').click(() => {
        if (currentPage > 1) {
            currentPage--;
            updateOutletTable();
        }
    });

    // Handle pagination: next page
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

    // Fetch outlets and update the table on page load
    await fetchOutlets();
});
