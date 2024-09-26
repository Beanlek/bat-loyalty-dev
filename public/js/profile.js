$(async () => {
    async function fetchUserProfile() {
        try {
            const response = await $.get("/a/user/web/profile");
            // Extract currentUser data
            const currentUser = response.currentUser; // Assuming `currentUser` is a property in the response
            if (currentUser) {
                const userName = currentUser.name;  // Access user name
                const userEmail = currentUser.email; // Access user email
    
                console.log('Current User Name:', userName);
                console.log('Current User Email:', userEmail);
                $('#headerUserName').text(userName);
                $('#profileUserName').text(userName);
                $('#UserName').text(userName);
                $('#UserEmail').text(userEmail);
    
                // Use userName and userEmail as needed in your code
            } else {
                console.error('No currentUser data found in the response.');
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    }
    await fetchUserProfile();
})