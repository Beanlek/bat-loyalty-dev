$(async () => {
  function setCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    dateElement.textContent = new Date().toLocaleDateString('en-GB', options);
  }

  // Call the setCurrentDate function to update the date immediately
  setCurrentDate();

  async function fetchUsers() {
      try {
          $('.loading-indicator').show();
          const response = await $.get("/a/user/web/list");
          allUsers = response.user_listing.rows;

          // Count users where usertype is 'cashier'
          const cashierCount = allUsers.filter(user => user.user_type === 'cashier').length;
          console.log('Total cashiers:', cashierCount);

          // Update the cashier count in the DOM
          $('#totalCashiers').text(cashierCount);

      } catch (error) {
          console.error('Error fetching users:', error);
          $('.loading-indicator').hide();
      }
  }

  async function fetchOutlets() {
      try {
          const response = await $.get("/a/outlet/web/list");
          allOutlets = response;

          // Count the number of outlets
          const outletCount = allOutlets.length;
          console.log('Total outlets:', outletCount);

          // Update the outlet count in the DOM
          $('#totalOutlets').text(outletCount);

      } catch (error) {
          console.error('Error fetching outlets:', error);
      }
  }

  async function fetchUserAccounts() {
      try {
          const response = await $.get("/a/user_account/web/list");
          allUserAccount = response;

          // Count the number of user accounts
          const accountCount = allUserAccount.length;
          console.log('Total user accounts:', accountCount);

          // Update the account count in the DOM
          $('#totalAccounts').text(accountCount);

      } catch (error) {
          console.error('Error fetching user accounts:', error);
      }
  }

  async function fetchReceipt() {
    try {
        $('.loading-indicator').show();
        const response = await $.get("/a/receipt/web/list");
        if (Array.isArray(response)) {
            allProcessReceipt = response;

            // Count the number of receipts with images (assuming a field 'has_image' or similar exists)
            const imageReceiptCount = allProcessReceipt.length;
            console.log('Total receipts with images:', imageReceiptCount);

            // Update the receipt count in the DOM
            $('#totalReceiptsTaken').text(imageReceiptCount);
        
        }
    } catch (error) {
        console.error('Error fetching receipt:', error);
    } finally {
        $('.loading-indicator').hide();
    }
  }

  // Fetch all data and update the dashboard
  await fetchReceipt();
  await fetchUsers();
  await fetchOutlets();
  await fetchUserAccounts();

});
