$(async () => {
    let allProcessReceipt = [];
    let currentPage = 1;
    const processPerPage = 10;
    let totalPages = 1;

    async function fetchReceipt() {
        try {
            $('.loading-indicator').show();
            const response = await $.get("/a/receipt/web/list");
            if (Array.isArray(response)) {
                allProcessReceipt = response;
                console.log('Fetched receipts:', allProcessReceipt);
                totalPages = Math.ceil(allProcessReceipt.length / processPerPage);
                updateTable(allProcessReceipt); // Initially display all receipts
            } else {
                console.error('Unexpected response structure:', response);
            }
        } catch (error) {
            console.error('Error fetching receipt:', error);
        } finally {
            $('.loading-indicator').hide();
        }
    }

    await fetchReceipt();

    function updateTable(receipts) {
        const $tbody = $('.data-list tbody');
        $tbody.empty();

        const start = (currentPage - 1) * processPerPage;
        const end = start + processPerPage;
        const paginatedReceipts = receipts.slice(start, end);

        paginatedReceipts.forEach((receipt, index) => {
            let row = `
                <tr class="data">
                    <td>${start + index + 1}</td>
                    <td>${receipt.user_id || ''}</td>
                    <td>${receipt.outlet_id || ''}</td>
                    <td>${receipt.status || ''}</td>
                    <td>${receipt.image_points || ''}</td>
                    <td>${receipt.created_by || ''}</td>
                    <td><button class="view-image" data-image-url="${receipt.image}">View</button></td>
                    <td><button class="view-image" data-image-url="${receipt.image_ocr}">View</button></td>
                </tr>`;

            $tbody.append(row);
        });

        updatePagination();

        // Add event listener for the "View" buttons
        $('.view-image').click(function () {
            const imageUrl = $(this).data('image-url');
            previewImage(imageUrl);
        });
    }

    function updatePagination() {
        $('.current-page').val(currentPage);
        $('.total-pages').text(`of ${totalPages}`);
    }

    // Function to preview image in a modal
    function previewImage(imageUrl) {
        if (imageUrl) {
            $('#imagePreview').attr('src', imageUrl);
            $('#imagePreviewModal').show();
        }
    }

    // Close modal when the user clicks the "close" button
    $('.close-button').click(function () {
        $('#imagePreviewModal').hide();
    });

    // Close modal when the user clicks outside of the modal content
    $(window).click(function (event) {
        if ($(event.target).is('#imagePreviewModal')) {
            $('#imagePreviewModal').hide();
        }
    });

    // Updated filter functionality for #status
    $('#status').change(function() {
        let filteredReceipts = allProcessReceipt;

        const receiptStatus = $('#status').val();
        if (receiptStatus !== 'all') {
            filteredReceipts = filteredReceipts.filter(receipt => receipt.status === receiptStatus);
        }

        // After filtering, update the table with filtered receipts
        updateTable(filteredReceipts);
    });

});
