;(function(modules) {

    modules['hideBar'] = {
          'author': 'Marco Munizaga'
        , 'name': 'Hide sidebar'
        , 'description': 'Hide the sidebar'
        , 'isEnabled': true
        , 'style': false
        , 'setup': false
        , 'construct': construct
        , 'destruct': destruct
    };


    function construct() { 
        startSlideBar();
    }

    function destruct() {
        ges.ui.removePlayerButton('#hideBar');
        endSlideBar();
    }

    function toggleBar() {
        if ( $('#sidebar').width != '39px' ){
            startSlideBar();
        }else{
            endSlideBar();
        }
    }

    function endSlideBar(){
        //to open
        $('#sidebar').animate(
            {width: '200px'},
            {step: 
                function(now, fx){
                    $('#page_wrapper').width($(window).width()-now);
                },
             complete:
                function(){
                    $('.container_inner_wrapper').css('overflow','')
                }
            }
        );
        $('#sidebar').unbind();
    }

    function startSlideBar(){
        $('#sidebar').animate(
            {width: '39px'},
            {step: 
                function(now, fx){
                    $(window).resize();
                    $('#page_wrapper').width($(window).width()-now);
                    $('.container_inner_wrapper').css('overflow','hidden')
                },
             complete:
                function(){
                    $('.container_inner_wrapper').css('overflow','hidden')
                    $(window).resize();
                }
            }
        );
        slideBar();

    }

    function slideBar() {
        $('#sidebar').hover(
            function(){
                //to open
                $('#sidebar').animate(
                    {width: '200px'},
                    {step: 
                        function(now, fx){
                            $('#page_wrapper').width($(window).width()-now);
                        },
                     complete:
                        function(){
                            $('.container_inner_wrapper').css('overflow','')
                        }
                    }
                )
            },
            function(){
                //to close
                $('#sidebar').animate(
                    {width: '39px'},
                    {step: 
                        function(now, fx){
                            $('#page_wrapper').width($(window).width()-now);
                            $('.container_inner_wrapper').css('overflow','hidden')
                        },
                     complete:
                        function(){
                            $('.container_inner_wrapper').css('overflow','hidden')
                            $(window).resize();
                        }
                    }
                )
            }
        )
    }



})(ges.modules.modules);
