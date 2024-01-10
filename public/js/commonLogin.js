function loginAsGuest() {
    alert('Mainpage for users and guests is not funtional yet')
}

async function loginUser() {
    const emailOrUsername = document.getElementById('emailOrUsername').value;
    const password = document.getElementById('password').value;
  
    try {
        const response = await fetch('/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ emailOrUsername, password }),
        });
    
        const data = await response.json();
    
        if (response.ok) {
          console.log('Login successful:', data);
    
          if (data.roleId === 1) {
            window.location.href = '/admin/products';
          } else if(data.roleId === 2){
            alert('Only admin site is functional at the moment')
          }
        } else {
          console.error('Login failed:', data.message);
          alert(data.message);
        }
      } catch (error) {
        console.error('Error during login:', error);
      }
  }


