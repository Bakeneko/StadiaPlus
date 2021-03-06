const WebScraperRunnable = {
    fetchData(userid, gameid) {
        return new Promise((resolve, reject) => {
            fetch("https://stadia.google.com/profile/" + userid + "/detail/" + gameid)
            .then(response => response.text())
            .then(text => {
                const playData = text.match(new RegExp("\\[\\[\\[\"" + gameid + "\",.+\\n.+\\n,\\[([0-9]+)"));
                const achievementData = text.match(new RegExp("AF_initDataCallback\\(\\{ *key: *'ds:2'.*?data: *((.|\\n)*?), *sideChannel: *\\{\\}\\}\\)"));
                
                if(playData == null) return;
                
                const data = JSON.parse(achievementData[1])[0];
    
                const achievements = [];
                for(const e of data[5][0]) {
                    achievements.push({
                        name: e[0],
                        description: e[1],
                        value: e[3],
                        icon: e[8][0][0][1],
                        game: e[6],
                        id: e[7]
                    });
                }
    
                const user = {
                    name: data[5][3][0][0],
                    tag: data[5][3][0][1],
                    avatar: data[5][3][1][1]
                };
    
                resolve({
                    game: {
                        uuid: data[0][0],
                        name: data[0][1]
                    },
                    achievements,
                    user,
                    time: playData[1]
                });
            })
            .catch(reject);
        });
    },

    update(uuid) {
        if(uuid == null) return;
    
        const userId = document.querySelector('.ksZYgc.VGZcUb').getAttribute('data-player-id');
        WebScraperRunnable.fetchData(userId, uuid)
        .then(data => {
            const sandboxer = document.getElementById('web-scraper-sandboxer');
            sandboxer.setAttribute('data', JSON.stringify(data));
            sandboxer.click();
        })
        .catch(e => console.error(e));
    }
}