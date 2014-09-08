    /*!
     * 抽奖小插件
     * @author echizen
     * @version 1.0 版本信息
     * @require webkit浏览器
     * 时间 2014-09-06 19:02:18
     */
    ;(function($){
    if(!window.localStorage){
        alert('This browser does NOT support localStorage');
    }
    //dataSource = '';
    var defaults = {
        awards: 'third',
        prize:{
            'first':{ 'nub':1 ,'prize_name':'最新款mac pro一台', 'prize_img':'img/mac_pro.jpg'},
            'second':{ 'nub':2 ,'prize_name':'iphone6 一台', 'prize_img':'img/iphone6.jpeg'},
            'third':{ 'nub':3 ,'prize_name':'ipad air 一台', 'prize_img':'img/ipad.jpg'},
            'grateful':{ 'nub':0 ,'prize_name':'', 'prize_img':''},
        },
        default_result: true,
        default_btn: true,
        avatar: false,
        title: '幸运之石砸中卿',
        keyevent: true,
        customData:false,
        dataLoad: function() {},
    }


    /*!
     *使用前请了解window.localStorage
     * config 奖项设置
     * localStorage 存储设置
     */

    $.fn.lottery = function(options){
        if(this.length == 0) return this;

        if(this.length > 1){
            this.each(function(){$(this).lottery(options)});
            return this;
        }

        // 变量定义
        lock = true;
        boot = '';
        settings = $.extend({},defaults,options);
        var el = this;

        var config = {
            'awards' : settings.awards,
            'keycode': {
                '49': { 'class': 'first',   'name': '一等奖', 'total': settings.prize.first.nub },
                '50': { 'class': 'second',  'name': '二等奖', 'total': settings.prize.second.nub },
                '51': { 'class': 'third',   'name': '三等奖', 'total': settings.prize.third.nub },
                '52': { 'class': 'grateful','name': '感恩奖', 'total': settings.prize.grateful.nub },
                '53': { 'class': 'zero',    'name': '操控面板','total':100},
            },

        //key为localStorage存储的数据数组的键值对的键值：dataSource、first、second、third
            get: function( key ) {
                return window.localStorage.getItem( key ) || ''
            },

            set: function( key, val) {
                window.localStorage.setItem( key, val );
            },

            /*
             *移除选定某项
             *去2个以上','  去前后','
             去掉删除的对象的前后的','，如果删除的人在首尾，则要去除首尾','
             */
            remove: function( key, val ) {
                var key = key || config.awards,
                    newval = config.get(key).replace(val, '').replace(/,{2,}/g, ',').replace(/(^,*)|(,*$)/g, '');

                config.set( key,  newval );
            },

            //获取当前中奖者在dataSource数组中的位置下标
            getCur: function() {
                return config.get( config.awards )
            },

            //新建获奖者：追加并去掉前后','
            setCur: function( val ) {
                var oldval = config.getCur(),
                    newval = [ oldval, val ].join(',').replace(/(^,*)|(,*$)/g, '');

                config.set( config.awards, newval);
            },

            //查询当前是否有中奖记录！
            query: function( val ) {
                for(var key in window.localStorage){
                    if( 'first|second|third'.indexOf(key) >= 0 ){
                        if(config.get( key ).indexOf(val) >= 0){
                            return true;
                        }
                    }
                }
                return false;
            },

            //清空设置
            clear: function() {
                window.localStorage.clear()
            },

            getLatest:function(key){
                _val_a = config.get(key).split(',');
                return dataSource[_val_a[_val_a.length-1]];
            },

            //读取本地中奖数据
            reading: function() {
                for(key in config.keycode){
                    var awards = config.keycode[key].class,//first\second\third
                        locals = config.get(awards);//中奖者的在window.localStorage的dataSourse里的键值。

                    if( locals ){//locals!='',即当前的key下有中奖者。
                        var nums = locals.split(',');//nums为数组形式                    
                        //展示中奖者 
                        for(var i = 1; i <= nums.length; i++){
                            config.awardsNub( awards);
                        }
                    }
                }
            },     
       

            //记录当前中奖人数，将其控制在指定人数之内
            awardsNub:function(awards){
                locals = config.get(awards);//中奖者的在window.localStorage的dataSourse里的键值。
                var num = 51;
                min = 0;
                if( locals ){//locals!='',即当前的key下有中奖者。
                    var nums = locals.split(',');//nums为数组形式
                    min = nums.length;
                }

                for(key in config.keycode){
                    if (config.keycode[key].class==awards){
                        num = key;
                        break;
                    }
                }

                max   = config.keycode[num].total;
                if( min >= max ){
                    var reg   = new RegExp('(\\d+,*){'+ max +'}');
                    //过滤超过max位(.replace(/(^,*)|(,*$)/g, '')去掉头尾句号)。存储中奖者的键值，结果如：28,3,19
                    //need-modify:后抽的取代先抽的
                    config.set(awards, reg.exec(config.get(awards))[0].replace(/(^,*)|(,*$)/g, '') )
                    return
                }
            }                      
        } 

        config['total'] = dataSource.length;                          
        /* 
         * 加载完毕后执行的事件
         */
        function loader() {
            $('#copyleft').fadeOut();
            $('#content, .trigger').addClass('active');
            $('#js_btn').addClass('active');


            //空格控制号码滚动条
            action = $( '.counter ul:not(.none) li' ).filter(function( i ){ return i > 0 });
            boot = Lucky( action );

            if(settings.keyevent){
                $( document ).on('keydown.lazyloader', function( e ){

                    if( e.keyCode == 32 ){//空格
                        switch_lottery();
                    }
                })
            }
                   
        }

        //感恩奖的每隔2500ms自动抽一次
        var taxis =function( i ) {
            var i = i || 0;

            setTimeout(function(){
                if( ++i < 5 ) {
                    boot.aStart();
                    boot.lottery();
                    taxis( i );
                }
            }, 2500)
        }


        var switch_lottery = function(){
            if( lock ){
                lock = boot.aStart();
            }else{
                lock = boot.lottery();
                if(settings.default_btn){
                    el.default_result();
                }


                //console.log( $('.grateful li:not(.none)').length )
                //感恩奖：当删除未领奖的时候，默认启用一次抽一次
                config.awards == 'grateful' && taxis( $('.grateful li:not(.none)').length % 5 );
            }
        }

        //args是滚动条的每个数字的li标签
        var  Lucky = function( args ){
            var args = args,
                timers = [],//???干嘛用的
                flicker = $('.flicker > img');//头像

            return {
                //开始滚动
                aStart: function(){
                    
                    this.avatar();
                    //数字转动
                    $.each(args, function( i, n ){
                        var single = $( n );

                        if( single.data( 'bingo' ) == undefined ){

                            single.data( 'bingo',  Bingo( single ) );

                        }
                        
                        timers[ i ] = setTimeout(function(){
                            
                            single.data( 'bingo' ).start();

                        }, i * 150)
                    });

                    return 0;
                },
               
                //结束滚动
                lottery: function() {
                    for( var x in timers ) {
                        try{
                            if( timers.length > ~~x + 1 ) { 
                                clearTimeout( timers[ x ] )
                            }
                        }catch(e){

                        }
                    }

                    var lucky = this.randit();//手机号
                        value = [];

                    for(var i = 0; i < lucky.length; i++){
                        ( i > 0 && i < 3 || i > 6 ) && value.push( lucky.charAt( i ) )
                    }
                    
                    $.each(args, function(i, n){
                        var single = $( n ),
                            bingo = single.data( 'bingo' );

                        bingo.endTo( ~~value[ i ], i * 200, !i )
                    })

                    return 1;
                },

                /*
                 * 随机抽取！数字滚动框停止的数字保证在原数据表中
                 */
                randit: function() {
                    //config.total：dataSource里的抽奖者人数,result随机生成的是抽奖者在dataSource里的序列号
                    var result = Math.round( Math.random() * config.total + .5 ) - 1;
                        tel = dataSource[ result ][ 'tel' ];

                    if( config.query(result) ){
                        return this.randit();
                    }

                    //html5存储序列号:新建当前获奖者
                    config.setCur( result );

                    setTimeout(function(){
                        //停止头像
                        clearTimeout( timers[ args.length ] );
                        config.awardsNub(config.awards);
                        
                        if(settings.flicker){
                            flicker.attr('src', dataSource[ result ][ 'url' ]);
                        }
                    }, 1000) 

                    return tel;
                },

                /*
                 * 头像变换！
                */
                avatar: function() {
                    var result = Math.round( Math.random() * config.total + .5 ) - 1;

                    if(settings.flicker){
                        url = dataSource[ result ][ 'url' ];
                        flicker.attr('src', url);
                    }

                    //setTimeout(arguments.callee, 100)100ms后再次执行此函数
                    timers[ args.length ] = setTimeout(arguments.callee, 100)
                }
            }
        }

        /*
         * 摇奖机Bingo:控制数字滚动
         * 从下至上循环摇动，控制backgroundPositionY
         * arg $对象
         */
        var Bingo = function( arg ) {
            var code = '3458', //网络识别号 [ 2 ]{ 3, 4, 5, 8 }
                               //RegExp( /^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|18[0-9]{9}$/ )手机号的正则  need-modify

                loop = 0,      //循环次数
                running = 0,   //0 - 9
                timer = null;  //控制摇动时间

            /*
             * 增加随机步数selfAuto
             * 保证每次跳跃次数不一致
             * 范围 Math.random() * 10   --  [ 0 - 9 ]
             */
            function selfAuto() {
                running += ~~( Math.random() * 10 );

                format();
            }

            /*
             * 格式化format
             * running 保持0-9区间
             */
            function format() {
                if( running >= 10 ){
                    loop ++;
                    running -= 10;
                }
            }

            return {

                //数字滚动框滚动的实现
                start: function() {
                    selfAuto();

                    arg.css({
                        'background-position-y': -120 * ( 10 * loop + running )
                    })

                    //[50, 100]
                    timer = setTimeout( arguments.callee, Math.random() * 50 + 50 )
                },

                stop: function(){
                    clearTimeout( timer )
                },

                endTo: function( num, timer ) {
                    this.stop();

                    timer = timer || 200;

                    //网络识别号 [ 2 ]{ 3, 4, 5, 8 }
                    if( arguments[2] != undefined && arguments[2] ) {
                        var to = code.indexOf( num ),
                            from = ( 10 * loop + running ) % 4;//4是最多4个li标签
                        
                        if( to >= from ) {
                            running += to - from;
                        } else {
                            running += 4 + to - from;
                        }
                        
                        format();
                    } else {
                        if( num < running ) {
                            loop ++;
                        }
                        running = num;
                    }
                    

                    arg.animate({
                        'background-position-y': -120 * ( 10 * loop + running  )
                    }, timer)
                }
            }
        }

        var btn_event_init = function(){
            //抽奖类型按钮
                // <div id="js_btn">
                //     <div class="circle_btn prize prize1" data-key=49 >
                //         <div class="btn_name" >一等奖</div>
                //     </div>

                //     <div class="circle_btn prize prize2" data-key=50 >
                //         <div class="btn_name" >二等奖</div>
                //     </div>

                //     <div class="circle_btn prize prize3" data-key=51 >
                //         <div class="btn_name">三等奖</div>
                //     </div>

                //     <div class="circle_btn stop" >
                //         <div class="btn_name">停止</div>
                //     </div>

                //     <div class="circle_btn prizer" >
                //         <a href="lottery_result.html"><div class="btn_name">获奖者</div></a>
                //     </div>
                // </div>
            $('#content').append('<div id="js_btn"> <div class="circle_btn prize prize1" data-key=49 > <div class="btn_name" >一等奖</div> </div> <div class="circle_btn prize prize2" data-key=50 > <div class="btn_name" >二等奖</div> </div> <div class="circle_btn prize prize3" data-key=51 > <div class="btn_name">三等奖</div> </div> <div class="circle_btn stop" > <div class="btn_name">停止</div> </div> <div class="circle_btn prizer" > <a href="lottery_result.html"><div class="btn_name">获奖者</div></a> </div> </div>');

            $('.prize').on('click',function(){
                var k = config.keycode[parseInt($(this).attr('data-key'))];
                config.awards = k.class;
                // 开始抽奖
                lock = boot.aStart();
            });

            $('.stop').on('click',function(){
                lock = boot.lottery();
                if(settings.default_result){
                    el.default_result();//抽奖结果蒙版显示
                }
            });
        }

        var flicker_resize_event = function(){
            $('#content').prepend(  '<div class="flicker">'+
                                            '<img src="img/truth.jpg" width="150"/>'+
                                        '</div>');
            $('.counter-container').css({'top':'24%'});
            $('#js_btn').css({'top':'40%'});
            $('.result').css({'top':'42%'});
        }

        var result_show_event = function(){
            //抽奖结果蒙版
            $('#content').append(
                '<div class="result" id="js_result">'+
                    '<div class="lucky_dog">'+
                        '恭喜<span id="user_name">XXX</span>先生/女士'+
                    '</div>'+
                '<!--<div class="company">'+
                        '(<sapn id="company">XXX科技有限公司</sapn>)'+     
                    '</div> -->'+
                    '<div class="prize_wrapper" >'+
                        '<div class="prize_img"><img src="" id="js_img"></div>'+
                        '<div class="lucky_prize">'+
                            '<div id="prize_type">'+
                               '抽中<span id="prize_rank"></span>'+
                            '</div>'+ 
                            '<div id="prize_name">'+
                            '</div>'+
                        '</div>'+
                    '</div>'+

                    '<div class="btn">'+
                        '<button type="button" id="close">关闭</button>'+
                        '<button type="button" id="lottery_again">重新抽取</button>'+
                    '</div>'+
                '</div>')
             //关闭抽奖结果蒙版
            $('#close').on('click',function(){
                $('#js_btn').addClass('active');
                $('#js_result').hide();
                
            })

            //重新抽取
            $('#lottery_again').on('click',function(){
                var  prizer= config.get(config.awards).split(','),
                    key = prizer[prizer.length-1];
                config.remove(config.awards,key);
                $('#js_btn').addClass('active');
                $('#js_result').hide();
            })
        }

        var keydown_event = function(){
            /*
             *更换壁纸、设置全局抽奖奖项
             *键盘操作[1: 一等奖, 2: 二等奖, 3: 三等奖, 4: 感恩奖，0: 全显]
             *CTRL + DEL 重置
             */
            $( document ).on('keydown', function( e ) {
                var k = config.keycode[ e.keyCode ];
                if( k ) {
                    config.awards = k.class;
                } else if (e.keyCode == 48){
                    config.awards = 'grateful';
                } else if (e.ctrlKey && e.keyCode == 46) {
                    config.clear();
                    window.location.reload();
                }
            })

        }

        var init = function(){
                // 异步ajax加载数据示例：数据结果为json形式
            // $.get(_base_url + "server/route.php?c=iphone&m=get_present_list&activity_code=first",function(data){
            //     if(data.rowCount > 0){
            //         dataSource = data.data;
            //         config['total'] = dataSource.length;
            //         config.set('dataSource',JSON.stringify(dataSource));
            //         config.reading();
            //     }else{
            //         alert('没有抽奖数据');
            //     }
            // },'json'); 

            if(settings.customData){
                settings.dataLoad();
            }

            if(settings.flicker){
                flicker_resize_event();
            }

            $('.favicon').text(settings.title);

            var per = $('#loader .inner');

            $("#loader").addClass("ready");

            per.css('width', '100%');
            setTimeout(function() {
                per.css('transform', 'scale(1, 1)')
            }, 550);

            setTimeout(function(){
                $("#loader").animate({'opacity': 0}, 'fast', function() { $(this).remove() });
                $('#copyleft').addClass('active');
            }, 750);

            // 抽奖件 加载延迟时间
            setTimeout(loader, 3000);

            //获取数据
            config.reading();

            // 按钮事件绑定
            if(settings.default_btn){
                btn_event_init(); 
            }

            //默认结果展示
            if(settings.default_result){
                result_show_event();
            }

            //绑定键盘按键事件
            if(settings.keyevent){
                keydown_event();
            }
               
        }

        el.query = function(tel){
            var query_tel = '',
                index = -1;
            for(key in dataSource){
                query_tel = dataSource[key].tel;
                if(query_tel == tel){
                    index = key;
                    break;
                } 
            }   
            return config.query(index);
        }

        el.latestLucky = function(){
            return config.getLatest(config.awards);
        }

        //返回json形式
        el.result = function(){
            var prizer = {
                'first': [{}],
                'second': [{}],
                'third': [{}],
                'grateful': [{}],
            };
            config.reading();
            for(key in config.keycode){
                var awards = config.keycode[key].class,//first\second\third
                    locals = config.get(awards);//中奖者的在window.localStorage的dataSourse里的键值。

                if( locals ){//locals!='',即当前的key下有中奖者。
                    var nums = locals.split(',');//nums为数组形式
                    for(var i = 0; i < nums.length; i++){
                        prizer[awards][i] = dataSource[nums[i]];
                    }
                }
            }

            return prizer ;
        }

        el.delete = function(tel){
            var query_tel = '',
                index = -1;
            for(key1 in dataSource){
                query_tel = dataSource[key1].tel;
                if(query_tel == tel){
                    index = key1;
                    break;
                } 
            }   

            for(var key2 in window.localStorage){
                if( 'first|second|third'.indexOf(key2) >= 0 ){
                    if(config.get( key2 ).indexOf(index) >= 0){
                        config.remove(key2, index);
                        break;
                    }
                }
            }
        }

        el.deleteLatest = function(){
            var prizer= config.get(config.awards).split(','),
            key = prizer[prizer.length-1];
            config.remove(config.awards,key);
        }

        el.clear = function(){
            window.localStorage.clear();
        }

        el.start = function(){
            boot.aStart();
        }

        el.stop = function(){
            boot.lottery();
        }

         /* echizen:停止后的弹出框 */

        el.default_result = function(){
            var user_info = config.getLatest(config.awards);
            var prize = [];

            if(config.awards == 'third'){
                prize = [settings.prize['third'].prize_name,settings.prize['third'].prize_img,'三等奖'];
            }else if(config.awards == 'second'){
                prize = [settings.prize['second'].prize_name,settings.prize['second'].prize_img,'二等奖'];
            }else if (config.awards == 'first'){
                prize = [settings.prize['first'].prize_name,settings.prize['first'].prize_img,'一等奖'];
            }else{}
            //$('#company').text(user_info['company']);
            $('#user_name').text(user_info['nick']);
            $('#prize_rank').text(prize[2]);
            $('#prize_name').text(prize[0]);
            $('#js_img').attr('src',prize[1]);
            $('#js_btn').removeClass('active');
            $('#js_result').fadeIn(4000);
        }

        init();
        return this;
    }
    //test = $.fn.lottery.clear();
})(jQuery);



