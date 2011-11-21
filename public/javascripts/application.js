$('.destory').live('click', function(e) {
  e.preventDefault();
  if (confirm('Are you sure you want to delete that item?')) {
    var element = $(this), // this는 클릭된 놈
        form = $('<form></form>');
    form.attr({
        method: 'POST',
        action: element.attr('href')
      })
      .hide()
      .append('<input type="hidden" />')
      .find('input')
      .attr({
        'name': '_method',
        'value': 'delete'
      })
      .end()
      .submit();
  }
})
