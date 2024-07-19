
$(async ()=>{
    let btnLogin = $('#btnLogin');
    let username = $('#username');
    let password = $('#password');

    console.log("public/js/logging_in.js")
    console.log({username})
    console.log({password})

    let logging_in = false;
  
    $('form').on('submit', async function(e){
      let form = this;
      e.preventDefault();
  
      if(logging_in) return false;
      logging_in = true;
      btnLogin.prop('disabled', true);
      btnLogin.text('Logging in...');
  
      form.submit();
    });
  
});
  
  