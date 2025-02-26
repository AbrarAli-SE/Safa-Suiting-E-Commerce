document.addEventListener("DOMContentLoaded", function () {
    const deleteButtons = document.querySelectorAll('.delete-order');
  
    deleteButtons.forEach(button => {
      button.addEventListener('click', async function () {
        const orderId = this.getAttribute('data-order-id');
        const row = this.closest('tr');
  
        if (confirm('Are you sure you want to delete this canceled order?')) {
          try {
            const response = await fetch(`/admin/orders/cancel/${orderId}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' }
            });
  
            const result = await response.json();
            if (response.ok) {
              row.remove();
              if (document.querySelectorAll('.delete-order').length === 0) {
                document.getElementById('canceledOrdersList').innerHTML = `
                  <tr>
                    <td colspan="5" class="px-4 py-3 text-center text-[var(--color-gray-600)]">No canceled orders found.</td>
                  </tr>
                `;
              }
            } else {
              alert(result.message || 'Error deleting order.');
            }
          } catch (error) {
            console.error('Error deleting order:', error);
            alert('Network error. Please try again.');
          }
        }
      });
    });
  });