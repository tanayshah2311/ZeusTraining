
function validateform() {
    var name = document.getElementById("yourname and surname").value.trim();
    var comments = document.getElementById("yourcomments").value.trim();
    var male = document.getElementById("male");
    var female = document.getElementById("female");


  if (name === "") {
    alert("All fields are compulsory");
    document.getElementById("yourname").focus();
    
    } else if (comments === "") {
    alert("All fields are compulsory");
    document.getElementById("yourcomments").focus();
    
    } else if (!male.checked && !female.checked) {
    alert("All fields are compulsory");
   
    }
    else{
    alert("Form Successfully filled");
    }

   
}
