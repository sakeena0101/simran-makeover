document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Scroll Reveal Animation Logic ---
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: stop observing after reveal
                // observer.unobserve(entry.target);
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
        threshold: 0.15 // Triggers when 15% of the element is visible
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- 2. Query Form Handling ---
    const queryForm = document.getElementById('queryForm');
    if (queryForm) {
        queryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(queryForm);
            const data = Object.fromEntries(formData.entries());

            try {
                // Example API endpoint
                console.log("Sending Data:", data);
                alert("Thank you! Your query has been received.");
                queryForm.reset();
            } catch (error) {
                console.error("Error submitting form:", error);
            }
        });
    }
});