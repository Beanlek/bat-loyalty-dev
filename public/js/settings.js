
$(async()=>{
  let test = $('#test');
  let buttonGroup = $('#buttonGroup');

  test.on("click", function() {
    addButtons();
  })

  function deleteButtons(params) {
    $('.add').remove()
    $('.delete').remove()
  }

  function addButtons(params) {
    buttonAdd = new Button({
      parent: buttonGroup,
      id: 'buttonAdd',
      class: 'add',
      label: 'add',
      onClick: addButtons
    })

    if ($('.delete').length === 0) {
      buttonDelete = new Button({
        parent: buttonGroup,
        id: 'buttonDelete',
        class: 'delete',
        label: 'delete',
        onClick: deleteButtons
      })
    }

  }
})