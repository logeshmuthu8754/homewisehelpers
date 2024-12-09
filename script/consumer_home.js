// JavaScript for Search and Filter
document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('searchBar');
    const rolesContainer = document.getElementById('roleContainer');
    const roles = Array.from(rolesContainer.getElementsByClassName('role'));

    // Function to filter and sort roles
    function filterRoles() {
        const searchInput = searchBar.value.toLowerCase().trim();

        // If search input is empty, display all roles
        if (searchInput === '') {
            displayRoles(roles.sort(sortAlphabetically));
            return;
        }

        // Filter roles based on the search query
        const filteredRoles = roles.filter(role => {
            const roleName = role.dataset.name.toLowerCase();
            return roleName.includes(searchInput);
        });

        // Sort filtered roles alphabetically and display
        displayRoles(filteredRoles.sort(sortAlphabetically));
    }

    // Function to sort roles alphabetically
    function sortAlphabetically(a, b) {
        const nameA = a.dataset.name.toLowerCase();
        const nameB = b.dataset.name.toLowerCase();
        return nameA.localeCompare(nameB);
    }

    // Function to display roles in the container
    function displayRoles(rolesToDisplay) {
        rolesContainer.innerHTML = '';
        rolesToDisplay.forEach(role => rolesContainer.appendChild(role));
    }

    // Event listener for the search bar
    searchBar.addEventListener('input', filterRoles);

    // Initial render of all roles on page load
    displayRoles(roles.sort(sortAlphabetically));
});



