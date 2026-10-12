const fs = require('fs');

async function fetchItemData() {
    try {
        const res = await fetch('https://steamcommunity.com/market/listings/730/G18182083013004');
        const content = await res.text();

        const match = content.match(/<(script|div)\b[^>]*\bid\s*=\s*["']valve-ssr-data["'][^>]*>([\s\S]*?)<\/\1\s*>/i);
        if (!match) {
            fs.writeFile(__dirname + '/item.txt', content, (err) => {
                if (err) throw err;
                console.log('-///////////// item HTML saved!');
            });
            throw new Error('Element id="valve-ssr-data" not found');
        }

        const [, tag, objData] = match;
        let d;
        try {
            d = JSON.parse(tag.toLowerCase() === 'div' ? decodeHtmlEntities(objData) : objData);
        } catch {
            throw new Error('Invalid JSON in #valve-ssr-data');
        }
        if (!d || typeof d !== 'object' || Array.isArray(d)) {
            throw new Error('Invalid SSR data structure');
        }
        if (d.renderContext == null) {
            throw new Error('renderContext is missing');
        }
        if (d.loaderData == null) {
            throw new Error('loaderData is missing');
        }

        if (typeof d.renderContext.queryData !== 'string' || !d.renderContext.queryData.trim()) {
            throw new Error('queryData is missing or not a string');
        }
        let data;
        try {
            data = JSON.parse(d.renderContext.queryData);
        } catch {
            throw new Error('Invalid JSON in queryData');
        }
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new Error('Invalid queryData structure');
        }
        if (!Array.isArray(data.queries)) {
            throw new Error('queryData.queries is missing or not an array');
        }

        fs.writeFile(__dirname + '/queryData.json', JSON.stringify(data), (err) => {
            if (err) throw err;
            console.log('-///////////// queryData saved!');
        });
        
        let grade = 0;
        for(let query = 0; query < data.queries.length; query++){
            console.log(data.queries[query]?.queryKey[0]);
            if(data.queries[query]?.queryKey[0] == "market_item_search"){
                console.log(data.queries[query]);
                const market_item = data.queries[query]?.state?.data;
                if(market_item?.pages?.[0]?.facets){
                    for(let fc = 0; fc < market_item.pages[0].facets.length; fc++){
                        if(market_item.pages[0].facets[fc].tag.category == "Rarity"){
                            //console.log('grade: '+market_item.pages[0].facets[fc].tag.localized_tag_name);
                            if(market_item.pages[0].facets[fc].tag.localized_tag_name == "Consumer Grade" || market_item.pages[0].facets[fc].tag.localized_tag_name == "Mil-Spec Grade"){
                                grade = 1;
                                //console.log('Bad grade: '+market_item.pages[0].facets[fc].tag.localized_tag_name);
                            }
                            break;
                        }
                    }
                }
                break;
            }
        }
        if(grade === 1){
            console.log('Bad grade: '+market_item.pages[0].facets[fc].tag.localized_tag_name);
        }

        const groupData = d.loaderData;
        //console.log('groupData 1 element')
        //console.log(groupData[0]);

    }catch (err) {
        console.error(err);
    }
}

fetchItemData();