var ldb = {
    // 自定义的数据初始化
    //dataSource:JSON.parse(window.localStorage.getItem('dataSource')),

    get:function( key ) {
        return window.localStorage.getItem( key ) || ''
    },

    get_array:function(key){
        _res = this.get(key);
        if(_res != ''){
            return _res.split(',');
        }else{
            return false;
        }
        
    },

    // 清空本地数据库
    clear:function(){
        window.localStorage.clear();
    },


    // 展示获奖名单
    display:function(){
        _prize_type = ['first','second','third']; 

        _add_line = "<div class='col'><div class='col' style='width:50%'>{{$user}}</div><div class='col tel' style='width:50%'>{{$iphone}}</div></div>";

        for(var item in _prize_type){
            type = _prize_type[item];
            _prize_list = this.get_array(type);

            if(_prize_list){
                for(var item_a in _prize_list){
                    item_a = _prize_list[item_a];
                    _user_info = dataSource[item_a];
                    //_user_info = this.dataSource[item_a];
                    _output = _add_line.replace("{{$user}}",_user_info['nick']).replace("{{$iphone}}",_user_info['tel']);
                    $('.' + type).append(_output);
                }
            }

        }
    },

    
}

