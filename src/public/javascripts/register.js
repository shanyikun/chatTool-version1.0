$('#register').bind({
    'submit': function(event){
        var dataForm=$(this).serialize()
        if(dataForm.indexOf('=&')!==-1||dataForm.search(/=$/)!==-1){
            $('#inform').text('输入框不能为空!')
        }
        else {
            $.ajax({
                type: 'post',
                dataType: 'json',
                url: '/register',
                data: dataForm,
                success: function(data){
                    if(data.err_code===500){
                        $('#inform').text(data.message)
                    }
                    else if(data.err_code===1){
                        $('#inform').text(data.message)
                    }
                    else {
                        window.location.href='/chat'
                    }
                }
            })
        }
        event.preventDefault()
    }
})

$('fieldset input').bind({
    'focus': function(){
        if($(this).val()===''){
            $(this).next().animate({
                fontSize: '14px',
                top: '-22px'
            },{
                duration: 200,
                complete: function(){
                    let legendElement=$('<legend></legend>')
                    let legendText=$(this).text()
                    legendElement.text(legendText)
                    $(this).prev().before(legendElement)
                    $(this).remove()
                }
            })
        }
        $('#inform').text('')
    },
    'blur': function(){
        if($(this).val()===''){
            let floatPlaceHolder=$('<p></p>')
            floatPlaceHolder.text($(this).prev().text()).addClass('floatPlaceholder')
            $(this).after(floatPlaceHolder)
            $(this).prev().remove()
        }
    }
})

/*
$('input[name=name]').focus()*/
