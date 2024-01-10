
function addBrandModal() {
    const modal = document.getElementById('addBrandModal');
    document.getElementById('addBrandInput1').value = "";
    modal.style.display = 'block';
}


async function addBrand() {
    const modal = document.getElementById('addBrandModal');
    const name = document.getElementById('addBrandInput1').value
    try {
        const response = await fetch('/brands', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name
          }),
        });
    
        const result = await response.json();
    
        console.log(result);
        window.location.reload()
        modal.style.display = 'none';
      } catch (error) {
        console.error('Error adding new product:', error);
      }
    }


function editBrandModal(brand){
    const modal = document.getElementById('editBrandModal');

    document.getElementById('editBrandInput0').value = brand.id;
    document.getElementById('editBrandInput1').value = brand.name;

    modal.style.display = 'block';
}


async function editBrand(){
    const modal = document.getElementById('editBrandModal');
    const brandId = document.getElementById('editBrandInput0').value;
    const name = { 
        name: document.getElementById('editBrandInput1').value
    } 
    try {
        const response = await fetch(`/brands/${brandId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(name),
        });
    
        const result = await response.json();
    
        console.log(result);
        window.location.reload()
        modal.style.display = 'none';
      } catch (error) {
        console.error('Error adding new product:', error);
      }
}



async function deleteBrand(brandId) {
  try {
      const response = await fetch(`/brands/${brandId}`, {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json'
          }
      });
      
      const result = await response.json();

      if (response.status === 409) {
          alert(result.message);
      } else {
          console.log(result);
          window.location.reload()
      }
  } catch (error) {
      console.error('Error deleting brand:', error);
      alert('An error occurred while trying to delete the brand.'); 
  }
}

