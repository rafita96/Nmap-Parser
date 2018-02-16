function toastr(texto) {
    // Get the snackbar DIV
    var x = document.createElement('div');
    x.innerHTML = texto;
    x.setAttribute("class","toast show");
    document.body.appendChild(x);

    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){ document.body.removeChild(x); }, 3000);
} 