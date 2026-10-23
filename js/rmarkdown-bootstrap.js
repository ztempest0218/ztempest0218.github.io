// Keep the exported document's tab styling in sync with Bootstrap 5.
document.addEventListener('shown.bs.tab', function(event) {
    var list = event.target.closest('[role="tablist"]');
    if (list) {
        Array.from(list.children).forEach(function(item) {
            item.classList.toggle('active', item.contains(event.target));
        });
    }
});
