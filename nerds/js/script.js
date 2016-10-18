var link = document.querySelector(".write-to-us");
var popup = document.querySelector(".modal-form");
var close = popup.querySelector(".modal-form__close-btn");
var form = popup.querySelector("form");
var user_name = popup.querySelector("[name = user-name]");
var user_email = popup.querySelector("[name = user-email]");
var user_message = popup.querySelector("[name = note]");
var storage_user_name = localStorage.getItem("user-name");
var storage_user_email = localStorage.getItem("user-email");

link.addEventListener("click", function(event){
    event.preventDefault();
    popup.classList.add("modal-form--show");

    if (storage_user_name) {
        user_name.value = storage_user_name;
        if (storage_user_email) {
            user_email.value = storage_user_email;
            user_message.focus();
        } else {
            user_email.focus();
        }
    } else {
        user_name.focus();
    }
});

close.addEventListener("click", function(event){
    event.preventDefault();
    popup.classList.remove("modal-form--show");
});

form.addEventListener("submit", function(event){
    if (!(user_name.value && user_email.value )){
        event.preventDefault();
        popup.classList.add("modal-form-error");
    } else{
        if (!(user_message.value)){
            event.preventDefault();
            popup.classList.add("modal-form-error");
        }else{
            localStorage.setItem("user-name",user_name.value);
            localStorage.setItem("user-email",user_email.value);
        }
    }
});

window.addEventListener("keydown", function(event){
    if (event.keyCode == 27){
        if (popup.classList.contains("modal-form--show")){
            popup.classList.remove("modal-form--show");
        }
    }
});
