document.addEventListener('DOMContentLoaded', function() {
    var stateSelect = document.getElementById('state');
    var citySelect = document.getElementById('city');
    var postcodeInput = document.getElementById('postcode');
    var form = document.getElementById('outlet-form');

    // Retrieve accountId, accountName, and outletId from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    let accountId = urlParams.get('accountId') || localStorage.getItem('accountId');
    let accountName = decodeURIComponent(urlParams.get('accountName') || localStorage.getItem('accountName'));
    let outletId = urlParams.get('outletId'); // Assuming outletId may be optional

    // Log accountId for debugging
    console.log('account id: ', accountId);

    // If accountId or accountName are missing, you should probably prevent the user from proceeding
    if (!accountId || !accountName) {
        alert("Account ID or Account Name is missing!");
        return; // Prevent further execution if critical data is missing
    }

    // Store accountId and accountName in localStorage for persistence
    localStorage.setItem('accountId', accountId);
    localStorage.setItem('accountName', accountName);

    // Update the breadcrumb links
    $('#cashierBreadcrumb').attr('href', `/cashier?OutletId=${outletId}&accountId=${accountId}&accountName=${encodeURIComponent(accountName)}`);
    $('#outletBreadcrumb').attr('href', `/outlets?accountId=${accountId}&accountName=${encodeURIComponent(accountName)}`);

    // Populate the state dropdown
    var states = malaysiaPostcodes.getStates();
    for (var i = 0; i < states.length; i++) {
        var option = document.createElement('option');
        option.value = states[i];
        option.textContent = states[i];
        stateSelect.appendChild(option);
    }

    // Listen for changes to the state dropdown
    stateSelect.addEventListener('change', function() {
        var selectedState = stateSelect.value;

        // Reset the city dropdown
        citySelect.innerHTML = '<option value="">Select a city</option>';
        postcodeInput.value = ''; // Reset the postcode input

        if (selectedState) {
            var cities = malaysiaPostcodes.getCities(selectedState);
            citySelect.disabled = false;

            // Populate the city dropdown
            for (var i = 0; i < cities.length; i++) {
                var option = document.createElement('option');
                option.value = cities[i];
                option.textContent = cities[i];
                citySelect.appendChild(option);
            }
        } else {
            citySelect.disabled = true;
        }
    });

    // Listen for changes to the city dropdown
    citySelect.addEventListener('change', function() {
        var selectedState = stateSelect.value;
        var selectedCity = citySelect.value;

        if (selectedState && selectedCity) {
            // Fetch the postcodes based on the selected state and city
            var postcodes = malaysiaPostcodes.getPostcodes(selectedState, selectedCity);

            if (postcodes && postcodes.length > 0) {
                // Auto-fill the first postcode found
                postcodeInput.value = postcodes[0];
            } else {
                postcodeInput.value = ''; // Clear if no postcode found
            }
        }
    });

    // Handle form submission
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        var id = document.getElementById('id').value;
        var name = document.getElementById('name').value;
        var address1 = document.getElementById('address1').value;
        var address2 = document.getElementById('address2').value;
        var address3 = document.getElementById('address3').value;
        var postcode = postcodeInput.value;
        var city = citySelect.value;
        var state = stateSelect.value;

        if (id && name && address1 && postcode && city && state) {
            console.log('Creating outlet with accountId:', accountId); // Log accountId before submission
            createOutlet(id, name, address1, address2, address3, postcode, city, state, accountId); // Pass accountId
        } else {
            alert('Please fill in all required fields.');
        }
    });

    // Cancel button redirect
    document.getElementById('cancel-btn').addEventListener('click', function() {
        window.location.href = '/account_maintenance';
    });
});

// The createOutlet function for making the POST request
function createOutlet(id, name, address1, address2, address3, postcode, city, state, accountId) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/a/outlet/web/create', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            const response = JSON.parse(xhr.responseText);

            if (xhr.status === 200 || xhr.status === 201) {
                if (response.status === "Success") {
                    document.getElementById('success-message').style.display = 'block';
                    document.getElementById('error-message').style.display = 'none';
                    console.log('Outlet creation successful:', response.message);
                } else {
                    document.getElementById('success-message').style.display = 'none';
                    document.getElementById('error-message').style.display = 'block';
                    console.error('Error creating outlet:', response.message);
                }
            } else {
                document.getElementById('success-message').style.display = 'none';
                document.getElementById('error-message').style.display = 'block';
                console.error('Error creating outlet:', response.message || 'Unknown error occurred');
            }
        }
    };

    const data = JSON.stringify({
        id: id,
        name: name,
        address1: address1,
        address2: address2,
        address3: address3,
        postcode: postcode,
        city: city,
        state: state,
        account_id: accountId
    });

    xhr.send(data);
}
