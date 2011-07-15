;(function(modules) {

    modules['titleSong'] = {
          'author': 'Marco Munizaga'
        , 'name': 'Song title changer'
        , 'description': 'Change the title of Grooveshark to your current song'
        , 'isEnabled': true
        , 'style': false
        , 'setup': false
        , 'construct': construct
        , 'destruct': destruct
    };

    function construct() { 
        $.subscribe("gs.player.playstatus", function(){$("head title").text(GS.player.currentSong.SongName + ' - ' + GS.player.currentSong.ArtistName)})
    }

    function destruct() {
    }

})(ges.modules.modules);
