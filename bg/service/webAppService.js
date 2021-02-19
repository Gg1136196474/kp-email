exports.get_test_data = ()=>{
    var content = 'static/img/category.png';
    return content;
};

exports.get_template_list = ()=>{
    var content = [
        {
          name: '生日祝福模板',
          id: 1,
          nameLeft: 50,
          nameTop: 25,
          htmlStr: '<div>888</div>'
        },
        {
          name: '司龄1年模板',
          id: 2,
          nameLeft: 50,
          nameTop: 25,
          htmlStr: '<div>888</div>'
        }
      ];
    return content;
};