// Create the async function for account creation
async function createAccount(id, name) {
    try {
        const response = await fetch('/a/account/web/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id, name: name })
        });

        if (!response.ok) {
            // If the response is not successful, throw an error
            const errorText = await response.text();
            throw new Error(errorText);
        }

        // Parse the response JSON
        const data = await response.json();

        // Display success message and hide error message
        document.getElementById('success-message').style.display = 'block';
        document.getElementById('error-message').style.display = 'none';

        // Optionally display alert or log the success data
        console.log('Account creation successful:', data);

    } catch (error) {
        // Display error message and hide success message
        document.getElementById('success-message').style.display = 'none';
        document.getElementById('error-message').style.display = 'block';

        // Log the error and show error alert
        console.error('Error creating account:', error);
        // alert('Error creating account: ' + error.message);
    }
}

// Ensure the DOM is fully loaded before binding the form submission event
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('account-form');

    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent default form submission
        
        const id = document.getElementById('id').value;
        const name = document.getElementById('name').value;

        // Simple validation to check if both fields are filled
        if (id && name) {
            // Call the createAccount function using the provided ID and Name
            await createAccount(id, name);

            // Optionally reset the form fields after successful submission
            form.reset();
        } else {
            alert('Please fill in all required fields.');
        }
    });

    // Handle the Cancel button click to redirect to account_maintenance
    document.getElementById('cancel-btn').addEventListener('click', function() {
        window.location.href = '/account_maintenance'; // Redirect to account_maintenance
    });
});
