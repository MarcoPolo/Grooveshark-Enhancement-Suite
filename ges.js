ges.events.ready(function () { 
    _.forEach(ges.styles.defaults, function(style, index) {
        ges.styles.load(style.css, style.getValues());
    });
    
    // setup interface
    createMenu('Grooveshark Enhancement Suite', menuContent());
    placeMenuButton(function() { ges.ui.openLightbox('ges'); });
    $.subscribe('gs.player.queue.change', ges.ui.restorePlayerButtons);

    // construct modules
    ges.modules.mapModules(function (module, key) { 
        module.isEnabled = ges.db.getIsEnabled(key);
        if (module.style) { ges.styles.load(module.style.css, module.style.getValues()); }
        if (module.setup) { ges.modules.doSetup(key); }
        if (module.isEnabled) { ges.modules.doConstruct(key); }
    });

    //load instacode from local storage
    loadInstaURL()
    loadInstaCode()

});

function placeMenuButton(onclick) {
    var html = $('<ul id="ges_nav"><li id="header_nav_ges"><a></a></li></ul>');
    var left = $('#nav').width() + parseInt($('#nav').css('left'));

    $('#header').append(html);
    $('a', '#header_nav_ges').click(onclick);
}

function createMenu(title, content) {
    var options = {
          'title': title
        , 'content': content
        , 'buttons': [
            { 
                  'label': 'Contribute Code'
                , 'link': 'http://github.com/theabraham/Grooveshark-Enhancement-Suite/'
                , 'pos': 'right'
            },
            { 
                  'label': 'Insta Code'
                , 'pos': 'right'
            }
        ]
        , 'onpopup': function() { 
            var container = '#lightbox_content';
            ges.modules.mapModules(function(module, key, modules) {
                if (!module.isEnabled) { return; }
                $('#mod_' + key, container).addClass('enabled'); 
            });
            $('.mod_link:last-child', container).addClass('mod_last');
            $('.mod_link', container).click(function() {  
                toggleModule.call(this);
            });

            //load insta code
            $("span:contains('Insta Code')").click(function(){console.log('lol');
                ges.ui.closeLightbox();
                openInstaCode();
            });
        }
    };

    ges.ui.createLightbox('ges', options);              
}

function openInstaCode(){
    ges.ui.openLightbox('instaCode');
}

function loadInstaCode(){
    var content = '<div class="lightbox_content_block" ><p>InstaCode will let you try out Grooveshark plugins quickly and easily. It is also helpful in developing as you can be sure your content script will load correctly.</p>';
    content += '<form id="instacode">';
    content += '   <label for="instaURL">Insert the url to the content script:</label>';
    content += '       <input type="text" name="instaURL" />';
    content += '</form>'
    content += '</div>'
    var options = {
        'title': 'instaCode'
      , 'content': content
      , 'buttons' : [
          {
                'label':'Submit'
              , 'pos' : 'right'
          }
      ]
      , 'onpopup' :function() {
            $("span:contains('Submit')").click(function(){
                console.log('lol');
                var instaurl = $('[name="instaURL"]').val()
                localStorage['instaurl'] = instaurl;
                loadInstaURL(instaurl);
                ges.ui.closeLightbox();
            });
      }
    };
    ges.ui.createLightbox('instaCode', options);
}

function loadInstaURL(instaurl){
    if (typeof instaURL == 'undefined'){
        instaurl = localStorage['instaurl'];
    }

    $.getScript(instaurl);
}

function menuContent() {
    var content = '';
    var moduleBlock;
    var moduleTemplate = $('<div><a class="mod_link"><div class="mod_content"><span class="mod_name"></span><span class="mod_desc"></span></div><span class="mod_icon"></span></a></div>');
    
    ges.modules.mapModules(function(module, key, modules) {
        moduleBlock = $(moduleTemplate).clone();
        $('.mod_link', moduleBlock).attr('id', 'mod_' + key);
        $('.mod_name', moduleBlock).html(module.name);
        $('.mod_desc', moduleBlock).html(module.description);
        $('input', moduleBlock).val(key);
        content += $(moduleBlock).html();
    }); 

    return content;
}

function toggleModule() { 
    var moduleName = $(this).attr('id').slice(4);
    var isEnabled = ges.modules.toggleModule(moduleName);
    $(this).toggleClass('enabled'); 
    ges.db.setIsEnabled(moduleName, isEnabled);
}
