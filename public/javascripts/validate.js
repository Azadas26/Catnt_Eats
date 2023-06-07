document.ready(function () {
    $("#usersignup").validate({
        rules:
        {
            name:
            {
                required: true,
                minlength: 4,
                maxlength:10
            },
            ph:
            {

            }
        }
    })
})