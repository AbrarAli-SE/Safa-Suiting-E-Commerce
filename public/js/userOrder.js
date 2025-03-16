// public/js/orderManagement.js
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('order-search');
    const orderList = document.getElementById('order-list');
    const initialMessage = document.getElementById('initial-message');
    const noOrderMessage = document.getElementById('no-order-message');
    const modal = document.getElementById('cancel-modal');
    const modalOrderId = document.getElementById('modal-order-id');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    let currentOrderId = null;
  
    // Filter orders based on search input
    function filterOrders() {
      const searchValue = searchInput.value.toLowerCase().trim();
      const orderCards = document.querySelectorAll('.order-card');
      let hasVisibleOrders = false;
  
      orderCards.forEach(card => {
        const orderId = card.getAttribute('data-order-id').toLowerCase();
        if (searchValue === '' || orderId === searchValue) { // Show all if empty, exact match otherwise
          card.classList.remove('hidden');
          hasVisibleOrders = true;
        } else {
          card.classList.add('hidden');
        }
      });
  
      if (searchValue === '') {
        initialMessage.classList.remove('hidden');
        noOrderMessage.classList.add('hidden');
        orderList.classList.add('hidden');
      } else if (hasVisibleOrders) {
        initialMessage.classList.add('hidden');
        noOrderMessage.classList.add('hidden');
        orderList.classList.remove('hidden');
      } else {
        initialMessage.classList.add('hidden');
        noOrderMessage.classList.remove('hidden');
        orderList.classList.add('hidden');
      }
    }
  
    // Show cancellation reason input
    function showCancelReason(orderId) {
      document.getElementById(`cancel-btn-${orderId}`).classList.add('hidden');
      document.getElementById(`reason-section-${orderId}`).classList.remove('hidden');
    }
  
    // Hide cancellation reason input
    function hideCancelReason(orderId) {
      document.getElementById(`cancel-btn-${orderId}`).classList.remove('hidden');
      document.getElementById(`reason-section-${orderId}`).classList.add('hidden');
      document.getElementById(`cancel-reason-${orderId}`).value = ''; // Clear input
    }
  
    // Show cancellation modal
    function showModal(orderId) {
      currentOrderId = orderId;
      modalOrderId.textContent = orderId;
      modal.classList.remove('hidden');
    }
  
    // Hide cancellation modal
    function hideModal() {
      modal.classList.add('hidden');
      currentOrderId = null;
    }
  
    // Submit cancellation with reason
    async function submitCancel(orderId) {
      const reason = document.getElementById(`cancel-reason-${orderId}`).value.trim();
      if (!reason) {
        alert('Please provide a reason for cancellation.');
        return;
      }
  
      showModal(orderId);
    }
  
    // Handle modal confirmation
    modalConfirmBtn.addEventListener('click', async () => {
      if (!currentOrderId) return;
  
      const reason = document.getElementById(`cancel-reason-${currentOrderId}`).value.trim();
      try {
        const response = await fetch(`/user/orders/orders/cancel/${currentOrderId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason })
        });
  
        const data = await response.json();
        console.log(`Response status for ${currentOrderId}: ${response.status}`);
        console.log('Response data:', data);
  
        if (data.success) {
          location.reload();
        } else {
          alert(data.message || 'Failed to cancel order.');
        }
      } catch (error) {
        console.error('Error cancelling order:', error);
      } finally {
        hideModal();
      }
    });
  
    // Handle modal cancellation
    modalCancelBtn.addEventListener('click', () => {
      hideModal();
    });
  
    // Event Listeners
    searchInput.addEventListener('input', filterOrders);
  
    document.querySelectorAll('.btn-red').forEach(btn => {
      if (btn.textContent.trim() === 'Cancel Order') {
        btn.addEventListener('click', (e) => {
          const orderId = e.target.dataset.orderId;
          showCancelReason(orderId);
        });
      } else if (btn.textContent.trim() === 'Submit Cancellation') {
        btn.addEventListener('click', (e) => {
          const orderId = e.target.dataset.orderId;
          submitCancel(orderId);
        });
      }
    });
  
    document.querySelectorAll('.btn-gray').forEach(btn => {
      if (btn.textContent.trim() === 'Cancel') {
        btn.addEventListener('click', (e) => {
          const orderId = e.target.dataset.orderId;
          hideCancelReason(orderId);
        });
      }
    });
  });