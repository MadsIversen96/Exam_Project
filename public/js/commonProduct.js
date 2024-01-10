function showEditModal(product) {
  const modal = document.getElementById('editProductModal');

  document.getElementById('input0').value = product.id;
  document.getElementById('input1').value = product.name;
  document.getElementById('input2').value = product.description;
  document.getElementById('input3').value = product.quantity;
  document.getElementById('input4').value = product.price;
  document.getElementById('input5').value = product.brandName;
  document.getElementById('input6').value = product.categoryName;
  document.getElementById('input7').value = product.imgurl;

  // Shows the modal
  modal.style.display = 'block';
}

function showAddModal() {
  const modal = document.getElementById('addProductModal');

  document.getElementById('addInput1').value = "";
  document.getElementById('addInput2').value = "";
  document.getElementById('addInput3').value = "";
  document.getElementById('addInput4').value = "";
  document.getElementById('addInput5').value = "";
  document.getElementById('addInput6').value = "";
  document.getElementById('addInput7').value = "";

  // Shows the modal
  modal.style.display = 'block';
}


  async function addProduct(){
    const modal = document.getElementById('addProductModal');

    const requestData = {
      name: document.getElementById('addInput1').value,
      description: document.getElementById('addInput2').value,
      quantity: parseInt(document.getElementById('addInput3').value, 10),
      price: parseFloat(document.getElementById('addInput4').value),
      brandId: document.getElementById('addInput5').value,
      categoryId: document.getElementById('addInput6').value,
      imgurl: document.getElementById('addInput7').value
    };
  
    try {
      const response = await fetch('/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
  
      const result = await response.json();
  
      console.log(result);
      window.location.reload()
  
      modal.style.display = 'none';
    } catch (error) {
      console.error('Error adding new product:', error);
    }
  }


 async function saveUpdates() {
    const modal = document.getElementById('editProductModal');
    const productId = document.getElementById('input0').value

    const updatedData = {
      name: document.getElementById('input1').value,
      description: document.getElementById('input2').value,
      quantity: parseInt(document.getElementById('input3').value, 10),
      price: parseFloat(document.getElementById('input4').value),
      brandId: document.getElementById('input5').value,
      categoryId: document.getElementById('input6').value,
      imgurl: document.getElementById('input7').value
    };

    // Send PUT request to update the product
    await fetch(`/products/${productId}`, {
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
      .catch(error => console.error('Error updating product:', error));
  }

  async function toggleIsDeleted(productId, checkbox) {
    const isDeleted = checkbox.checked;
  
    await fetch(`/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isDeleted }),
    })
      .then(response => response.json())
      .then(result => {
        console.log(result);
      })
      .catch(error => console.error('Error updating isDeleted property:', error));
  }


  async function deleteProduct(productId){
    await fetch(`/products/${productId}` , {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(result => {
      
      console.log(result);
      window.location.reload()
  })
  .catch(error => console.error('Error deleting product:', error));
  }


  document.addEventListener("DOMContentLoaded", function() {
    var form = document.querySelector("form");
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      filterTable();
    });
    var categoryDropdown = document.getElementById("category");
    var brandDropdown = document.getElementById("brand");

    categoryDropdown.addEventListener("change", filterTable);
    brandDropdown.addEventListener("change", filterTable);

  });

  function filterTable() {
    var input, filter, table, tbody, tr, td, i, txtValue;
    input = document.getElementById("searchInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("table");
    tbody = table.getElementsByTagName("tbody")[0];
    tr = tbody.getElementsByTagName("tr");

    var selectedCategory = document.getElementById("category").value;
    var selectedBrand = document.getElementById("brand").value;

    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[1]; 
      var categoryCell = tr[i].getElementsByTagName("td")[6]; 
      var brandCell = tr[i].getElementsByTagName("td")[5]; 
  
      if (
        (td && td.textContent.toUpperCase().indexOf(filter) > -1) &&
        (selectedCategory === "All" || categoryCell.textContent === selectedCategory) &&
        (selectedBrand === "All" || brandCell.textContent === selectedBrand)
      ) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }

  