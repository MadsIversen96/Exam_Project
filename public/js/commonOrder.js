function editOrderModal(order) {
    const modal = document.getElementById('editOrderModal');
  
    document.getElementById('editOrderInput0').value = order.orderId;
    document.getElementById('editOrderInput1').value = order.user.email;
    document.getElementById('editOrderInput2').value = order.status;
  
    // Shows the modal
    modal.style.display = 'block';
  }

  async function editOrder() {
    const modal = document.getElementById('editOrderModal');

    const orderId = document.getElementById('editOrderInput0').value
    const status = document.getElementById('editOrderInput2').value
    

    // Send PUT request to update the order
    await fetch(`/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({statusName: status}),
    })
      .then(response => response.json())
      .then(result => {
        
        console.log(result);
        window.location.reload()
        
        modal.style.display = 'none';
      })
      .catch(error => console.error('Error updating order:', error));
  }