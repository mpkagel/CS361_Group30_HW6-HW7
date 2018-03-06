function deleteTask(id){
    $.ajax({
        url: '/delete/' + id,
        type: 'PUT',
        success: function(result){
            window.location.replace("./");
        }
    })
};
