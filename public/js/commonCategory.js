function addCategoryModal() {
    const modal = document.getElementById('addCategoryModal');
    document.getElementById('addCategoryInput1').value = "";
    modal.style.display = 'block';
}


async function addCategory() {
    const modal = document.getElementById('addCategoryModal');
    const name = document.getElementById('addCategoryInput1').value
    try {
        const response = await fetch('/Categories', {
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


function editCategoryModal(Category){
    const modal = document.getElementById('editCategoryModal');

    document.getElementById('editCategoryInput0').value = Category.id;
    document.getElementById('editCategoryInput1').value = Category.name;

    modal.style.display = 'block';
}


async function editCategory(){
    const modal = document.getElementById('editCategoryModal');
    const CategoryId = document.getElementById('editCategoryInput0').value;
    const name = { 
        name: document.getElementById('editCategoryInput1').value
    } 
    try {
        const response = await fetch(`/Categories/${CategoryId}`, {
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



async function deleteCategory(categoryId) {
  try {
      const response = await fetch(`/Categories/${categoryId}`, {
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
      console.error('Error deleting category:', error);
      alert('An error occurred while trying to delete the category.'); 
  }
}