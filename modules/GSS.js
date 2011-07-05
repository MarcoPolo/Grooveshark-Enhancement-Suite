;(function(modules) {

    modules['GSS'] = {
          'author': 'Marco Munizaga'
        , 'name': 'Grooveshark RSS'
        , 'description': 'Import RSS feeds into Grooveshark'
        , 'isEnabled': true
        , 'style': false
        , 'setup': false
        , 'construct': construct
        , 'destruct': destruct
    };

//var rssURL = 'http://feeds2.feedburner.com/PitchforkBestNewTracks' 

//if (typeof localStorage['GSSFeeds'] == 'undefined') {
//    localStorage['GSSFeeds'] == []
//}



//setTimeout(function () {injectMenu(); } , 2e3)

function construct(){
    
    if (typeof localStorage['GSSFeeds'] == 'undefined') {
        localStorage['GSSFeeds'] == []
    }

    injectMenu();
}

function destruct(){
    $('#GSS').remove();
    $('[title="RSSPlaylist"]').remove();
}


function checkExistingFeeds(){
    //gssfeeds is an array of RSS titles
    if (localStorage['GSSFeeds'] != '') {
        var GSSFeeds = localStorage['GSSFeeds'].split(',');
        for (var i=1; i < GSSFeeds.length; i++){
            var playlistID = localStorage[GSSFeeds[i]];
            injectRSSPlaylist(playlistID, GSSFeeds[i]);


        }
    }
}

function getRSS(rssURL){
    GSS = {}
    GSS.songs = []
    GSS.SongIDs = []
    $.getJSON('https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=100&key=ABQIAAAAuIlbOmUd3gJTNVDSvX8ZBBThVXKRlugNJ0FXtFSdeFPX98YKrhQMO67lQJHw2mO0gu2r-chAP3vHeg&q='+rssURL+'&callback=?', function(resp){
        //console.log(resp);
        RSS = resp.responseData.feed;
        GSS.title = RSS.title;

        buildSearchTerms(RSS);
    })
}

function makeComparable(name){
    name.replace('&amp','&');
    name = name.toLowerCase();

    return name;
}

function searchForTerms(searchTerms){
	searchTerms.map(function(term){
        searchTerm = (term[0]) + ' ' + term[1];
        GS.service.getSearchResultsEx(searchTerm, true, null, function(resp){
            //console.log(searchTerm);
            //console.log(resp.result);
            GSS.songs.push({'artist':makeComparable(term[0]), 'songname':term[1], 'results':resp.result, songInfo:''});

            checkLastResult();
        }, null)



	});

}

function buildSearchTerms(RSS){
	var a = RSS.entries.map(function(entry){
		searchTerms = [];
		//console.log(entry.title.replace('"',''));
		searchTerms.push(entry.title.replace(/"/g,'').split(' - '));

		searchForTerms(searchTerms);

	});

}


function checkLastResult(){
    var song = GSS.songs[GSS.songs.length-1];
    for (var resultIndex = 0; resultIndex<song.results.length; resultIndex++){
        var result = song.results[resultIndex]; 
        if((makeComparable(result.ArtistName) == makeComparable(song.artist)) && (makeComparable(result.SongName) == makeComparable(song.songname)) ){
            console.log('found the correct result and it is' + result.SongID);
            song.songInfo = result;
            GSS.SongIDs.push(result.SongID);
            break;
        }else{
            console.error('Did not find ', song.songname, ' by ' , song.artist);
        }
    }

    if(GSS.songs.length == RSS.entries.length){
        console.log('done');
        $('#GSSloading').remove();
        $('#gs_join input').val('');
        $('#gs_join input').show();
    }

}




function checkResults(){
    GSS.songs.map(function(song){
        if(typeof song.results[0] != 'undefined' ){
            song.results.map(function(result){
                if((makeComparable(result.ArtistName) == makeComparable(song.artist)) && (makeComparable(result.SongName) == makeComparable(song.songname)) ){
                    console.log('found the correct result and it is' + result);
                    song.songInfo = result;
                }else{
                    console.error('Did not find ', song.songname, ' by ' , song.artist);
                }
            });
        }
    });

    //GSS.songs.map(function(song) { GSS.SongIDs.push(song.songInfo.SongID) });
}

function addRSSToQueue(){
	GSS.songs.map(function(song){
            if (typeof song.songInfo.SongID != 'undefined'){
                console.log('adding ', song.songname, ' to queue');
                console.log('with song id', song.songInfo.SongID);
                GS.player.addSongsToQueueAt(song.songInfo.SongID,'0',false,'');
            }
    });
}

function createRSSPlaylist(){


    GS.service.createPlaylist(GSS.title, GSS.SongIDs, '', function(result, req){
        console.log('result',result, 'req',req);
        var playlistID=result;
        injectRSSPlaylist(playlistID, GSS.title);

        //use local storage
        
        //push the title of the RSS into the playlist
        if (typeof localStorage['GSSFeeds'] == 'undefined') {
            localStorage['GSSFeeds'] = GSS.title;
        }else{
            var GSSFeeds = localStorage['GSSFeeds'].split(',');
            GSSFeeds.push(GSS.title);
            localStorage['GSSFeeds'] = GSSFeeds;
        }
        localStorage[GSS.title]=playlistID;
    },null);
}

function injectRSSPlaylist(playlistID, title){
    console.log('playlist', playlistID);
    console.log('title', title);

    var playlistCSS =  '<li class="sidebar_link sidebar_playlist playlist sidebar_playlist_own" rel="' + playlistID + '" title="RSSPlaylist">'
    playlistCSS+=      '<a href="#/playlist/RSSPlaylist/' +  playlistID + '"><span class="icon remove">'
    playlistCSS+=      '</span><span class="icon"></span><span class="label ellipsis">' + title + '</span></a></li>';


    $('#sidebar_playlists').append(playlistCSS);

    //todo fix thix to be more dynamic
    $('[title="RSSPlaylist"] .icon').css('background-image', 'url("http://hypem.com/favicon.png")');
    $('[title="RSSPlaylist"] .icon').css('background-position', '0 0');

    $('[title="RSSPlaylist"] .remove').css('background-image', '');
    $('[title="RSSPlaylist"] .remove').css('background-position' , '');

    injectRemoveFeed(playlistID);
}



function injectMenu(){
    checkExistingFeeds();
    var style = document.createElement('style');
    style.innerText = '#gs_dropdown { display:none; background:#fff; color:#000; width:225px; padding:5px; -moz-border-radius:3px 0 3px 3px; -webkit-border-radius:3px 0 3px 3px; margin-top:-4px; border:1px solid rgba(0,0,0,.25); border-top:none; background-clip:padding-box; }';
    style.innerText += '#gs_gsync.active { margin:1px 1px 0 0 !important; }';
    style.innerText += '#gs_synced, #gs_unsynced { padding:10px; margin-bottom:10px; font-weight:bold; text-align:center; font-size:11px; -moz-border-radius:2px; -webkit-border-radius:2px; }';
    style.innerText += '#gs_synced { display:none; background:#d8ebf8; color:#3c7abe; } #gs_unsynced { display:block; background:#eee; } #gs_synced span { color:#306399; }';
    style.innerText += '#gs_leave { display:block; color:rgba(60, 122, 190, 0.5); text-align:center; font:normal 10px Arial, sans-serif; margin:6px 0 -2px 0; } #gs_leave:hover { color:rgb(60, 122, 190); text-decoration:underline; }';
    style.innerText += '#gs_join label { font-size:11px; } #gs_join input { width:215px; font-size:13px; border:1px solid #c2c1c1; border-top:1px solid #a8a8a8; padding:5px 4px; -moz-border-radius:2px; -moz-box-shadow:inset 0 1px 2px rgba(0,0,0,0.2); -webkit-border-radius:2px; -webkit-box-shadow:inset 0 1px 2px rgba(0,0,0,0.2); }';
    style.innerText += '#GSSloading { display:block; margin-right:auto; margin-left:auto; }';
    document.body.appendChild(style);

    var syncMenu;
    syncMenu =  '<li class="last">';
    syncMenu += '<div id="GSS" class="btn btn_style1"><span id="gs_label">GSS</span></div>';
    syncMenu += '<div id="gs_dropdown" class="dropdown right">';
    syncMenu += '   <div id="gs_synced">Synced with group <span id="gs_group"></span><a id="gs_leave">Leave group</a></div>';
    syncMenu += '   <form id="gs_join">';
    syncMenu += '       <label for="groupID">Add an RSS feed: </label><input type="text" name="groupID" />';
    syncMenu += '   </form>';
    syncMenu += '</div></li>';

    $('#userOptions').append(syncMenu);
     $('#GSS').click(function() {
         $('#gs_dropdown').toggle();
         $(this).toggleClass('active'); 
     });

    $('#gs_join').submit(function() {
        var rssURL  = $('input', this).val();
        getRSS(rssURL);
        setTimeout(function (){createRSSPlaylist();}, 2e3);
        $('input',this).hide();
        $('#gs_join').append('<img id="GSSloading" src="http://i.imgur.com/xRiVV.gif"/>');


        return false;
     });
     
}

function injectRemoveFeed(playlistID){
     $('[rel="'+playlistID+'"] .remove').click( function(){
         //find the title of the removed feed
         var titleToBeRemoved = $(this).parent().children('.label').text();

         //remove the title from the localStorage

         var GSSFeeds = localStorage['GSSFeeds'].split(',');
         indexOfTitleToBeRemoved = GSSFeeds.indexOf(titleToBeRemoved);

         if (indexOfTitleToBeRemoved != -1) {
             console.log('removing', titleToBeRemoved);
             GSSFeeds.splice(indexOfTitleToBeRemoved, 1);
             localStorage['GSSFeeds'] = GSSFeeds;
         } else {
             console.error('could not find the title in the local storage')
         }

         $(this).parent().remove();
     });
}


})(ges.modules.modules);
