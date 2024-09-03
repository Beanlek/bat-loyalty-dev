
$(async()=>{
  console.log(`initialized ${$('h1').first().text()} page`)
})

class Dropdown{
  constructor(options){
    if(options){
      this.id = options.id;
    }
    
    let _this = this;

    $(`${_this.id}`).select2();

  }
}