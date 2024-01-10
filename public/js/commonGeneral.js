function closeModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
        modal.style.display = 'none';
    }
}