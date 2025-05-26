
let selectedMovie = null;
let selectedTime = null;
let selectedSeats = [];
let moviePrice = 0;

// UPI configuration
const UPI_CONFIG = {
    upiId: 'your-upi-id@paytm', 
    merchantName: 'CinemaWave', 
    merchantCode: 'CINEMA001' 
};

// Generate seats
function generateSeats() {
    const container = document.getElementById('seatsContainer');
    const occupiedSeats = [12, 13, 25, 26, 40, 55, 56, 72]; // Pre-occupied seats
    
    container.innerHTML = ''; 
    
    for (let i = 1; i <= 80; i++) {
        const seat = document.createElement('div');
        seat.className = 'seat';
        seat.dataset.seatNumber = i;
        
        if (occupiedSeats.includes(i)) {
            seat.classList.add('occupied');
            seat.textContent = '❌';
        } else {
            seat.classList.add('available');
            seat.textContent = i;
            seat.addEventListener('click', () => toggleSeat(i));
        }
        
        container.appendChild(seat);
    }
}

// Toggle seat selection
function toggleSeat(seatNumber) {
    const seat = document.querySelector(`[data-seat-number="${seatNumber}"]`);
    
    if (seat.classList.contains('selected')) {
        seat.classList.remove('selected');
        seat.classList.add('available');
        selectedSeats = selectedSeats.filter(s => s !== seatNumber);
    } else {
        seat.classList.remove('available');
        seat.classList.add('selected');
        selectedSeats.push(seatNumber);
    }
    
    updateSummary();
}

// Movie selection
document.querySelectorAll('.movie-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.movie-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedMovie = card.querySelector('.movie-title').textContent;
        moviePrice = parseInt(card.dataset.price);
        updateSummary();
    });
});

// Time selection
document.querySelectorAll('.time-slot').forEach(slot => {
    slot.addEventListener('click', () => {
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        slot.classList.add('selected');
        selectedTime = slot.dataset.time;
        updateSummary();
    });
});

// Update booking summary
function updateSummary() {
    document.getElementById('selectedMovie').textContent = selectedMovie || 'Select a movie';
    document.getElementById('selectedTime').textContent = selectedTime || 'Select time';
    document.getElementById('selectedSeats').textContent = selectedSeats.length > 0 ? 
        selectedSeats.sort((a, b) => a - b).join(', ') : 'No seats selected';
    
    const total = selectedSeats.length * moviePrice;
    document.getElementById('totalPrice').textContent = `$${total}`;
    
    const bookBtn = document.getElementById('bookBtn');
    bookBtn.disabled = !selectedMovie || !selectedTime || selectedSeats.length === 0;
}

// Proceed to payment
document.getElementById('bookBtn').addEventListener('click', () => {
    if (selectedMovie && selectedTime && selectedSeats.length > 0) {
        showPaymentModal();
    }
});

// Show payment modal
function showPaymentModal() {
    const total = selectedSeats.length * moviePrice;
    const totalInRupees = Math.round(total * 75); 
    
    // Update payment modal content
    document.getElementById('paymentMovie').textContent = selectedMovie;
    document.getElementById('paymentTime').textContent = selectedTime;
    document.getElementById('paymentSeats').textContent = selectedSeats.sort((a, b) => a - b).join(', ');
    document.getElementById('paymentTotal').textContent = `₹${totalInRupees}`;
    document.getElementById('upiAmount').textContent = totalInRupees;
    document.getElementById('upiId').textContent = UPI_CONFIG.upiId;
    
    
    document.getElementById('paymentModal').style.display = 'flex';
}

// Copy UPI ID to clipboard
function copyUpiId() {
    const upiId = UPI_CONFIG.upiId;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(upiId).then(() => {
            showCopySuccess();
        }).catch(() => {
            fallbackCopyTextToClipboard(upiId);
        });
    } else {
        fallbackCopyTextToClipboard(upiId);
    }
}

// Fallback copy function
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopySuccess();
        }
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }
    
    document.body.removeChild(textArea);
}

// Show copy success message
function showCopySuccess() {
    const copyBtn = document.querySelector('.copy-btn');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    copyBtn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
    
    setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
    }, 2000);
}

// Verify payment
function verifyPayment() {
    const transactionId = document.getElementById('transactionId').value.trim();
    
    if (!transactionId) {
        alert('Please enter a valid transaction ID');
        return;
    }
    
    if (transactionId.length < 8) {
        alert('Transaction ID seems to short. Please check and try again.');
        return;
    }
    
    
    
    // Simulate verification process
    const verifyBtn = document.querySelector('.verify-btn');
    verifyBtn.textContent = 'Verifying...';
    verifyBtn.disabled = true;
    
    setTimeout(() => {
        completeBooking(transactionId);
    }, 2000);
}

// Complete booking process
function completeBooking(transactionId) {
    const bookingId = 'CW' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const bookingDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Update success modal
    document.getElementById('bookingId').textContent = bookingId;
    document.getElementById('confirmedTransactionId').textContent = transactionId;
    document.getElementById('bookingDate').textContent = bookingDate;
    
    // Hide payment modal and show success modal
    document.getElementById('paymentModal').style.display = 'none';
    document.getElementById('successModal').style.display = 'flex';
    
    // Reset form after a delay
    setTimeout(() => {
        resetBooking();
    }, 5000);
}

// Close payment modal
function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
    
    // Reset verify button
    const verifyBtn = document.querySelector('.verify-btn');
    verifyBtn.textContent = 'Verify Payment';
    verifyBtn.disabled = false;
    
    // Clear transaction ID
    document.getElementById('transactionId').value = '';
}

// Close success modal
function closeModal() {
    document.getElementById('successModal').style.display = 'none';
}

// Reset booking form
function resetBooking() {
    selectedMovie = null;
    selectedTime = null;
    selectedSeats = [];
    moviePrice = 0;
    
    // Reset UI elements
    document.querySelectorAll('.movie-card').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    document.querySelectorAll('.seat.selected').forEach(seat => {
        seat.classList.remove('selected');
        seat.classList.add('available');
    });
    
    // Reset verify button
    const verifyBtn = document.querySelector('.verify-btn');
    if (verifyBtn) {
        verifyBtn.textContent = 'Verify Payment';
        verifyBtn.disabled = false;
    }
    
    // Clear transaction ID
    const transactionInput = document.getElementById('transactionId');
    if (transactionInput) {
        transactionInput.value = '';
    }
    
    updateSummary();
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const paymentModal = document.getElementById('paymentModal');
    const successModal = document.getElementById('successModal');
    
    if (event.target === paymentModal) {
        closePaymentModal();
    }
    
    if (event.target === successModal) {
        closeModal();
    }
});

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    generateSeats();
    updateSummary();
    
    // Set focus on transaction ID when payment modal opens
    const paymentModal = document.getElementById('paymentModal');
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                if (paymentModal.style.display === 'flex') {
                    setTimeout(() => {
                        const transactionInput = document.getElementById('transactionId');
                        if (transactionInput) {
                            transactionInput.focus();
                        }
                    }, 300);
                }
            }
        });
    });
    
    observer.observe(paymentModal, { attributes: true });
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Escape key to close modals
    if (event.key === 'Escape') {
        const paymentModal = document.getElementById('paymentModal');
        const successModal = document.getElementById('successModal');
        
        if (paymentModal.style.display === 'flex') {
            closePaymentModal();
        }
        
        if (successModal.style.display === 'flex') {
            closeModal();
        }
    }
    
    // Enter key in transaction input to verify payment
    if (event.key === 'Enter' && event.target.id === 'transactionId') {
        verifyPayment();
    }
});

// Add some visual feedback for better UX
function addVisualFeedback() {
    // Add loading animation for verification
    const style = document.createElement('style');
    style.textContent = `
        .verify-btn:disabled {
            background: linear-gradient(135deg, #bdc3c7, #95a5a6) !important;
            cursor: not-allowed;
            position: relative;
        }
        
        .verify-btn:disabled::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            margin: -10px 0 0 -10px;
            border: 2px solid transparent;
            border-top-color: #ffffff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// Initialize visual feedback
addVisualFeedback();

// Theme toggle logic
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    if (document.body.classList.contains('dark')) {
        themeToggle.textContent = '☀️ Light Mode';
    } else {
        themeToggle.textContent = '🌙 Dark Mode';
    }
});

// Optional: Remember theme preference
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    themeToggle.textContent = '☀️ Light Mode';
}
themeToggle.addEventListener('click', () => {
    if (document.body.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});