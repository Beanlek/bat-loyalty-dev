$(async () => {
    let allProcessReceipt = [];
    let currentPage = 1;
    const processPerPage = 10;
    let totalPages = 1;

    // Cache for signed URLs
    let signedUrlsCache = {};  // Store URLs with timestamps

    async function fetchReceipt() {
        try {
            $('.loading-indicator').show();
            const response = await $.get("/a/receipt/web/list");
            if (Array.isArray(response)) {
                allProcessReceipt = response;
                console.log('Fetched receipts:', allProcessReceipt);
                totalPages = Math.ceil(allProcessReceipt.length / processPerPage);
                filterAndUpdateTable(); // Initially display all receipts
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
                    <td><a href="#" class="view-image" data-receipt-id="${receipt.id}" data-type="original">View Original</a></td>
                    <td><a href="#" class="view-image" data-receipt-id="${receipt.id}" data-type="ocr">View OCR</a></td>
                </tr>`;

            $tbody.append(row);
        });

        updatePagination(receipts.length);

        // Add event listener for the "View" buttons
        $('.view-image').click(async function (event) {
            event.preventDefault();

            const receiptId = $(this).data('receipt-id');
            const imageType = $(this).data('type');

            // Check if we have cached the signed URL for this image
            const cachedUrlData = signedUrlsCache[receiptId]?.[imageType];
            if (cachedUrlData && !isUrlExpired(cachedUrlData.timestamp)) {
                // Use the cached URL if it's still valid
                const cachedUrl = cachedUrlData.url;
                console.log(`Reusing cached URL for ${imageType}:`, cachedUrl); // Log the cached URL
                previewImage(cachedUrl);
            } else {
                // If no valid cached URL, request a new one
                try {
                    const response = await $.get(`/a/s3/getReceiptImageUrl/${receiptId}`);
                    if (response.status === 'successfully get the signed url for the images.') {
                        const url = imageType === 'original' ? response.data.url_original : response.data.url_ocr;

                        // Cache the signed URL and its timestamp
                        if (!signedUrlsCache[receiptId]) {
                            signedUrlsCache[receiptId] = {};
                        }
                        signedUrlsCache[receiptId][imageType] = {
                            url,
                            timestamp: new Date().getTime() // Current timestamp in milliseconds
                        };

                        console.log(`Generated new signed URL for ${imageType}:`, url); // Log the new signed URL
                        // Preview the image
                        previewImage(url);
                    } else {
                        console.error('Error fetching signed URL:', response.errMsg);
                    }
                } catch (error) {
                    console.error('Error fetching signed URL:', error);
                }
            }
        });
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
        filterAndUpdateTable();  // Update the table after changing the page
    }

    function goToPage() {
        const newPage = parseInt($('.current-page').val());
        if (newPage >= 1 && newPage <= totalPages) {
            currentPage = newPage;
            filterAndUpdateTable();  // Update the table after changing the page
        } else {
            $('.current-page').val(currentPage);
        }
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

    // Handle both status change and search query filtering
    function applyFilters() {
        let filteredReceipts = allProcessReceipt;

        // Filter by status
        const receiptStatus = $('#status').val();
        if (receiptStatus !== 'all') {
            filteredReceipts = filteredReceipts.filter(receipt => receipt.status === receiptStatus);
        }

        // Filter by search query
        const searchQuery = $('input.search').val().toLowerCase();
        if (searchQuery) {
            filteredReceipts = searchReceipt(filteredReceipts, searchQuery);
        }

        // After filtering, update the table with filtered receipts
        filterAndUpdateTable(filteredReceipts);
    }

    // Function to filter and update table based on search and status
    function filterAndUpdateTable() {
        let filteredReceipts = allProcessReceipt;

        // Filter by status
        const receiptStatus = $('#status').val();
        if (receiptStatus !== 'all') {
            filteredReceipts = filteredReceipts.filter(receipt => receipt.status === receiptStatus);
        }

        // Filter by search query
        const searchQuery = $('input.search').val().toLowerCase();
        if (searchQuery) {
            filteredReceipts = searchReceipt(filteredReceipts, searchQuery);
        }

        // Update the pagination based on the filtered receipts
        totalPages = Math.ceil(filteredReceipts.length / processPerPage);
        updateTable(filteredReceipts);
    }

    // Trigger filtering when status changes
    $('#status').change(function () {
        filterAndUpdateTable();
    });

    // Trigger filtering when search query changes
    $('input.search').on('input', function () {
        filterAndUpdateTable();
    });

    $('.prev').on('click', () => changePage(-1));
    $('.next').on('click', () => changePage(1));
    $('.current-page').on('change', goToPage);

    // Search function to filter by user_id or outlet_id
    function searchReceipt(receipts, query) {
        return receipts.filter(receipt => {
            return (receipt.user_id && receipt.user_id.toLowerCase().includes(query)) ||
                (receipt.outlet_id && receipt.outlet_id.toLowerCase().includes(query));
        });
    }

    // Check if the cached URL has expired
    function isUrlExpired(timestamp) {
        const currentTime = new Date().getTime();
        const expirationTime = 30 * 60 * 1000; // 30 minutes in milliseconds
        return currentTime - timestamp > expirationTime;
    }
});
