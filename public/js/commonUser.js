function editUserModal(user) {
    const modal = document.getElementById('editUserModal');
  
    document.getElementById('editUserInput0').value = user.id;
    document.getElementById('editUserInput1').value = user.email;
    document.getElementById('editUserInput2').value = user.username;
    document.getElementById('editUserInput3').value = user.firstname;
    document.getElementById('editUserInput4').value = user.lastname;
    document.getElementById('editUserInput5').value = user.telephone;
    document.getElementById('editUserInput6').value = user.address;
    document.getElementById('editUserInput7').value = user.role.name;
  
    // Shows the modal
    modal.style.display = 'block';
  }

  async function editUser() {
    const modal = document.getElementById('editUserModal');
    const userId = document.getElementById('editUserInput0').value

    const updatedData = {
      email: document.getElementById('editUserInput1').value,
      username: document.getElementById('editUserInput2').value,
      firstname: document.getElementById('editUserInput3').value,
      lastname: document.getElementById('editUserInput4').value,
      telephone: document.getElementById('editUserInput5').value,
      address: document.getElementById('editUserInput6').value,
      roleId: document.getElementById('editUserInput7').value,
    };

    // Send PUT request to update the user
    await fetch(`/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    })
      .then(response => response.json())
      .then(result => {
        
        console.log(result);
        window.location.reload()
        modal.style.display = 'none';
      })
      .catch(error => console.error('Error updating user:', error));
  }
